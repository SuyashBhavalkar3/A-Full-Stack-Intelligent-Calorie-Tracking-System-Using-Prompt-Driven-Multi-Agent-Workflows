# BeFit - Full-Stack AI-Powered Fitness Tracking Platform

## Project Overview

BeFit is a comprehensive fitness tracking platform that combines artificial intelligence with intuitive user interfaces to help users achieve their fitness goals. The platform provides natural language processing for food and exercise logging, personalized calorie and macro tracking, water intake management, and weight monitoring. Users can authenticate securely using JWT tokens or Google OAuth and access a modern dashboard to visualize their fitness progress.

## Folder Structure

```
BeFit/
├── backend/
│   ├── auth_service/
│   ├── profile_service/
│   ├── goal_service/
│   ├── llm_service/
│   ├── food_or_workout_log_service/
│   ├── water_service/
│   ├── weight_service/
│   ├── database/
│   ├── main.py
│   ├── database.py
│   └── requirements.txt
├── frontend/
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── vite.config.ts
└── tests/
```

## Backend Overview

The backend is built with FastAPI, a modern Python web framework for building APIs. It uses SQLAlchemy as the ORM and PostgreSQL as the database. The architecture follows a service-based modular pattern, where each feature is encapsulated in its own service with dedicated API routes, data models, and business logic.

### Core Components

- FastAPI Application: Main application entry point
- Database Layer: SQLAlchemy ORM models and database configuration
- Service Layer: Modular services for specific business domains
- Authentication: JWT and OAuth2 security mechanisms

## Services

### Auth Service

Handles user authentication and authorization.

Features:
- User registration with email and password
- Login with JWT token generation
- Token refresh mechanism
- Logout functionality
- Google OAuth integration for third-party authentication
- Password hashing and security best practices

### Profile Service

Manages user profile information and physical attributes.

Features:
- User profile setup with initial data
- Store and retrieve age, height, weight, gender, and activity level
- Support profile updates for goal recalculation

### Goal Service

Calculates and manages fitness goals based on user profile.

Features:
- Calculate Basal Metabolic Rate (BMR) using user profile data
- Calculate Total Daily Energy Expenditure (TDEE) based on activity level
- Set personalized daily calorie and macronutrient targets
- Support goal adjustments based on target date and deficit/surplus

### LLM Service

Core artificial intelligence component using LangGraph and Groq LLM.

Features:
- Multi-agent workflow for intelligent logging
- Classifier Agent: Determines if user input is food or exercise-related
- Food Parser Agent: Extracts calorie and macronutrient information
- Exercise Parser Agent: Calculates calories burned from exercise description
- Natural language processing for user-friendly logging

### Food or Workout Log Service

Persists and manages logged food and exercise data.

Features:
- Store food logs with calorie and macro information
- Store exercise logs with calorie burn information
- Update user's daily calorie and macro consumption
- Exercise logs increase calorie deficit only, macros remain unchanged
- Food logs decrease available calories and macros
- Prevent exceeding daily macro and calorie targets

### Water Service

Tracks daily water intake.

Features:
- Set daily water consumption goals
- Log individual glasses or amounts of water
- Track daily water intake progress
- Retrieve daily water statistics

### Weight Service

Monitors weight changes over time.

Features:
- Log weight entries with timestamp
- Retrieve weight history for analysis and trending
- Support weight tracking for goal progress

## API Routes

All routes except authentication endpoints require JWT authentication.

### Authentication Routes
- POST /auth/register - User registration
- POST /auth/login - User login
- POST /auth/refresh - Refresh JWT token
- POST /auth/logout - User logout
- POST /auth/google - Google OAuth authentication

### Profile Routes
- POST /profile/setup - Initial profile setup
- GET /profile/me - Get current user profile

### Goal Routes
- POST /goals/set - Set personalized fitness goals
- GET /goals/me - Get current user goals

### LLM Routes
- POST /llm/log - Log food or exercise using natural language

### Food Routes
- GET /food/today - Get today's food logs

### Water Routes
- POST /water/goal - Set daily water goal
- POST /water/add-glass - Log water consumption
- GET /water/today - Get today's water statistics

### Weight Routes
- POST /weight/log - Log weight entry
- GET /weight/history - Get weight history

## API Security

All API endpoints except authentication are protected with JWT bearer token authentication. JWT tokens are issued upon successful login or registration and must be included in the Authorization header of subsequent requests.

Security mechanisms:
- JWT token-based authentication for stateless requests
- Refresh token rotation for extended sessions
- OAuth2 integration for secure third-party authentication
- Password hashing using bcrypt or similar algorithms
- CORS configuration for cross-origin requests
- Database connection security and parameterized queries

## Frontend Overview

The frontend is a modern, responsive web application built with React or Next.js. It provides a user-friendly dashboard for accessing all platform features.

Features:
- User authentication interface with login and registration
- Profile setup and management pages
- Dashboard displaying current goals and progress
- Food logging interface with natural language input
- Exercise logging interface
- Water intake tracking
- Weight tracking and history visualization
- Goal progress visualization and statistics

## Tech Stack

### Backend
- FastAPI: Modern Python web framework
- SQLAlchemy: SQL toolkit and ORM
- PostgreSQL: Relational database
- JWT: JSON Web Token authentication
- OAuth2: Third-party authentication with Google
- LangGraph: Agent workflow framework
- Groq: LLM provider for natural language processing
- Bcrypt: Password hashing library
- Pydantic: Data validation using Python type annotations

### Frontend
- React or Next.js: JavaScript/TypeScript UI framework
- Vite: Build tool and dev server
- Tailwind CSS: Utility-first CSS framework
- TypeScript: Type-safe JavaScript

## Setup Instructions

### Prerequisites

- Python 3.11 or higher
- PostgreSQL 12 or higher
- Node.js 18 or higher
- Bun or npm package manager

### Backend Setup

1. Navigate to the backend directory:
   cd backend

2. Create and activate a virtual environment:
   python -m venv cal_env
   source cal_env/bin/activate  # On Windows: cal_env\Scripts\activate

3. Install dependencies:
   pip install -r requirements.txt

4. Configure environment variables:
   - Create a .env file with database connection string
   - Add Google OAuth credentials from client-secret.json
   - Add Groq API key for LLM access

5. Initialize the database:
   python -m backend.database

6. Run the FastAPI server:
   python -m backend.main

The API will be available at http://localhost:8000

### Frontend Setup

1. Navigate to the frontend directory:
   cd frontend

2. Install dependencies:
   bun install
   # or
   npm install

3. Configure environment variables:
   - Create a .env.local file with backend API URL
   - Add Google OAuth client ID

4. Run the development server:
   bun run dev
   # or
   npm run dev

The application will be available at http://localhost:5173

## LLM Logging Flow

The LLM service implements a multi-agent workflow for intelligent food and exercise logging:

1. User Input: User submits natural language description of food or exercise
2. Classification: Classifier agent determines input type (food or exercise)
3. If Food:
   - Food Parser Agent: Extracts food items and quantities
   - Extracts calorie and macronutrient information
   - Returns structured food data
4. If Exercise:
   - Exercise Parser Agent: Analyzes exercise description
   - Calculates estimated calories burned
   - Returns exercise data with calorie deficit
5. Persistence: Food or Workout Log Service stores the extracted data
6. Goal Update: User's daily calorie and macro targets are updated
7. Response: API returns confirmation and updated goal status

## Database Models

- User: User account information and authentication
- UserProfile: Physical attributes and activity level
- UserGoal: Daily calorie and macro targets
- FoodLog: Food consumption records with nutrition data
- ExerciseLog: Exercise records with calorie burn information
- WaterLog: Water consumption tracking
- WeightLog: Weight entry records with timestamps

## Future Improvements

- Barcode scanning for food logging
- Integration with wearable devices for activity tracking
- Meal planning recommendations based on goals
- Nutritionist consultation through AI
- Social features for community challenges
- Mobile application for iOS and Android
- Advanced analytics and reporting
- Dietary restriction and allergy management
- Recipe suggestions based on macros and preferences
- Workout plan generation and progression tracking
- Integration with popular fitness apps
- Voice-based logging for hands-free operation
- Meal timing optimization for fitness goals
- Supplement tracking and recommendations

## Development

To run tests:
cd tests
pytest test_api_health.py

## Contributing

Contributions are welcome. Please follow standard Git workflow with feature branches and pull requests.

## License

This project is provided as-is for educational and commercial purposes.
