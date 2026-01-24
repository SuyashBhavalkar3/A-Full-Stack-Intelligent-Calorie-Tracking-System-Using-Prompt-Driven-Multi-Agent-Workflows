from fastapi import Depends, FastAPI, Request, dependencies
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.sessions import SessionMiddleware
from dotenv import load_dotenv
import os

from auth_service.api import router as auth_router
from auth_service.dependencies import get_current_user
from database.database import SessionLocal, engine, Base
from llm_service.api import router as llm_router
from profile_service.api import router as profile_router
from goal_service.api import router as goal_router
from weight_service.api import router as weight_router
from water_service.api import router as water_router
from food_or_workout_log_service.api import router as food_or_workout_router
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
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization"],
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
app.include_router(profile_router,
                    dependencies=[Depends(get_current_user)])
app.include_router(goal_router,
                    dependencies=[Depends(get_current_user)])
app.include_router(weight_router,
                    dependencies=[Depends(get_current_user)])
app.include_router(water_router,
                    dependencies=[Depends(get_current_user)])
app.include_router(food_or_workout_router,
                    dependencies=[Depends(get_current_user)])

@app.on_event("startup")
async def startup_event():
    print("Starting up the Calorie Tracking API...")
    for router in app.router.routes:
        print(f"Registered route: {router.path}")
@app.get("/")
def read_root():
    return {"message": "Welcome to the App"}