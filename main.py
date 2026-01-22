from fastapi import Depends, FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.sessions import SessionMiddleware
from dotenv import load_dotenv
import os

from auth_service.api import router as auth_router
from auth_service.dependencies import get_current_user
from database.database import SessionLocal, engine, Base
from llm_service.api import router as llm_router
from fastapi import Depends

load_dotenv()

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Calorie Tracking API",
    description="Full-stack intelligent calorie tracking system with JWT auth and Google OAuth"
)

# Session middleware - MUST be added first before other middleware
app.add_middleware(
    SessionMiddleware,
    secret_key=os.getenv("SESSION_SECRET_KEY", "dev-secret-key-change-in-prod"),
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=os.getenv("CORS_ORIGINS", "*").split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# HTTP middleware for DB session injection
@app.middleware("http")
async def add_db_session(request: Request, call_next):
    db = SessionLocal()
    try:
        request.state.db = db
        response = await call_next(request)
        return response
    finally:
        db.close()

# Include authentication routes
app.include_router(auth_router, prefix="/auth", tags=["auth"])
app.include_router(llm_router, prefix="/llm", tags=["llm"],
                    dependencies=[Depends(get_current_user)])

@app.get("/")
def read_root():
    return {"message": "Welcome to the App"}