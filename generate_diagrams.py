import urllib.request
import os
import zlib
import base64

diagrams = {
    "1_system_architecture": """graph TD
    Client["Frontend Client<br/>(React / Vite)"]
    subgraph BeFit Backend Infrastructure
        API["FastAPI Application Server"]
    end
    subgraph External Services
        Google["Google OAuth API"]
        Groq["Groq LLM API"]
    end
    subgraph Data Persistence
        PG[("PostgreSQL Database")]
    end
    Client <-->|REST API / HTTPS| API
    API <-->|Auth Tokens| Google
    API <-->|Prompt & Response| Groq
    API <-->|SQLAlchemy ORM| PG""",
    
    "2_llm_sequence_workflow": """sequenceDiagram
    actor User
    participant UI as React Frontend
    participant API as FastAPI Backend
    participant LLM as LangGraph Service
    participant Groq as Groq LLM API
    participant DB as PostgreSQL
    User->>UI: Types "I ate 2 eggs and ran for 20 mins"
    UI->>API: POST /llm/log {prompt}
    API->>LLM: initialize_workflow(prompt)
    LLM->>Groq: Classifier Agent: Analyze Intent
    Groq-->>LLM: Response: "Mixed Input (Food & Exercise)"
    par Food Parsing
        LLM->>Groq: Food Parser Agent ("I ate 2 eggs")
        Groq-->>LLM: JSON: {food: "eggs", qty: 2, calories: 156}
    and Exercise Parsing
        LLM->>Groq: Exercise Parser Agent ("ran for 20 mins")
        Groq-->>LLM: JSON: {exercise: "running", calories_burned: 220}
    end
    LLM-->>API: Aggregated Structured Data
    API->>DB: Save FoodLog & ExerciseLog
    API->>DB: Recalculate User Daily Targets
    DB-->>API: Success
    API-->>UI: HTTP 200 OK (Updated Targets & Logged Items)
    UI-->>User: Show Success Toast & Refresh Dashboard""",
    
    "3_entity_relationship_diagram": """erDiagram
    USER ||--o| USER_PROFILE : "has"
    USER ||--o| USER_GOAL : "maintains"
    USER ||--o{ FOOD_LOG : "creates"
    USER ||--o{ EXERCISE_LOG : "creates"
    USER ||--o{ WATER_LOG : "records"
    USER ||--o{ WEIGHT_LOG : "tracks"
    USER {
        int id PK
        string email
        string password_hash
        string google_id
    }
    USER_PROFILE {
        int id PK
        int user_id FK
        int age
        float height
        float weight
        string gender
        string activity_level
    }
    USER_GOAL {
        int id PK
        int user_id FK
        float base_tdee
        float target_calories
        float target_protein
        float target_carbs
    }
    FOOD_LOG {
        int id PK
        int user_id FK
        string food_name
        float calories
        float protein
        datetime logged_at
    }
    EXERCISE_LOG {
        int id PK
        int user_id FK
        string exercise_name
        float calories_burned
        datetime logged_at
    }""",

    "4_backend_components": """graph TD
    Router["Main FastAPI Router (main.py)"]
    subgraph Service Modules
        AuthSvc["Auth Service (JWT / OAuth)"]
        ProfileSvc["Profile Service (BMR / TDEE Math)"]
        GoalSvc["Goal Service (Macro Targets)"]
        LLMSvc["LLM Service (LangGraph Agents)"]
        LogSvc["Log Services (Food/Exercise/Water)"]
    end
    DB_Layer[("Database Layer (SQLAlchemy / database.py)")]
    Router --> AuthSvc
    Router --> ProfileSvc
    Router --> GoalSvc
    Router --> LLMSvc
    Router --> LogSvc
    AuthSvc -.-> DB_Layer
    ProfileSvc -.-> DB_Layer
    GoalSvc -.-> DB_Layer
    LogSvc -.-> DB_Layer
    LLMSvc -.->|Updates limits via| LogSvc""",

    "5_use_case": """flowchart LR
    User([User Actor])
    subgraph BeFit Application Boundaries
        Auth(Register / Secure Login)
        Profile(Set up Physical Profile)
        Goals(View Dynamic Goals & Macros)
        LogNL(Log Data via Natural Language Prompt)
        Voice(Log Data via Voice/Speech-to-Text)
        Water(Track Water Intake)
        Weight(Track Weight Trends)
    end
    User --> Auth
    User --> Profile
    User --> Goals
    User --> LogNL
    User --> Voice
    User --> Water
    User --> Weight""",

    "6_activity_goal_calculation": """flowchart TD
    Start([User Inputs Profile Data]) --> A(Get Age, Weight, Height, Gender)
    A --> B{Calculate BMR}
    B -- Male --> M[BMR = 10*W + 6.25*H - 5*A + 5]
    B -- Female --> F[BMR = 10*W + 6.25*H - 5*A - 161]
    M --> C[Apply Activity Level Multiplier]
    F --> C
    C --> D[Calculate TDEE]
    D --> E{Determine User Goal}
    E -- Weight Loss --> L[Deficit: TDEE - 500 kcal]
    E -- Maintain --> Main[TDEE = Target]
    E -- Muscle Gain --> G[Surplus: TDEE + 500 kcal]
    L --> CalcMacros[Calculate Macronutrients splits]
    Main --> CalcMacros
    G --> CalcMacros
    CalcMacros --> Save[(Save to UserGoal DB)]
    Save --> End([End])"""
}

# Create diagrams directory
os.makedirs("diagrams", exist_ok=True)

for name, diagram_text in diagrams.items():
    print(f"Generating {name}.png...")
    # Base64 encode the diagram text for Kroki API
    compressed = zlib.compress(diagram_text.encode('utf-8'), 9)
    encoded = base64.urlsafe_b64encode(compressed).decode('utf-8')
    url = f"https://kroki.io/mermaid/png/{encoded}"
    
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req) as response:
            with open(f"diagrams/{name}.png", "wb") as f:
                f.write(response.read())
        print(f"Successfully saved diagrams/{name}.png")
    except Exception as e:
        print(f"Failed to generate {name}: {e}")

print("\nSuccess! All diagrams have been downloaded to the 'diagrams' folder in your project.")
