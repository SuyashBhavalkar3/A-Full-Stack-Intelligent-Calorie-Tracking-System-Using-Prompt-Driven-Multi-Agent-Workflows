import json
from llm_service.llm_client import get_llm
from llm_service.prompts.classifier import CLASSIFIER_PROMPT
from llm_service.prompts.food_parser import FOOD_PARSER_PROMPT
from llm_service.prompts.exercise_parser import EXERCISE_PARSER_PROMPT

llm = get_llm()

# ---------- Classifier Agent ----------
def classify_node(state):
    response = llm.invoke(
        CLASSIFIER_PROMPT.format(input=state["input"])
    )
    state["intent"] = json.loads(response.content)["type"]
    return state


# ---------- Food Parser Agent ----------
def food_parser_node(state):
    response = llm.invoke(
        FOOD_PARSER_PROMPT.format(input=state["input"])
    )

    raw = response.content.strip()

    if raw.startswith("```"):
        raw = raw.replace("```json", "").replace("```", "").strip()

    try:
        parsed = json.loads(raw)
        state["parsed_data"] = parsed.get("items", [])
        
        # Safe nutrition extraction - handle None and invalid values
        nutrition = parsed.get("total", {})
        # Ensure calories_kcal is a valid number
        cal = nutrition.get("calories_kcal")
        if not isinstance(cal, (int, float)) or cal is None:
            nutrition["calories_kcal"] = 0
        
        state["nutrition"] = nutrition
    except json.JSONDecodeError:
        print("❌ Food parser returned invalid JSON:")
        print(raw)
        state["parsed_data"] = []
        state["nutrition"] = default_nutrition()

    return state


# ---------- Exercise Parser Agent ----------
def exercise_parser_node(state):
    response = llm.invoke(
        EXERCISE_PARSER_PROMPT.format(input=state["input"])
    )

    raw = response.content.strip()

    if raw.startswith("```"):
        raw = raw.replace("```json", "").replace("```", "").strip()

    try:
        parsed = json.loads(raw)

        items = parsed.get("items", [])

        # Safe calorie summation - handle None and invalid values
        total_calories = 0
        for ex in items:
            cal = ex.get("calories_estimate")
            # Treat None, missing, or non-numeric values as 0
            safe_cal = cal if isinstance(cal, (int, float)) and cal is not None else 0
            total_calories += safe_cal

        state["parsed_data"] = items
        state["nutrition"] = {
            "calories_kcal": total_calories
        }

    except json.JSONDecodeError:
        print("❌ Exercise parser returned invalid JSON:")
        print(raw)
        state["parsed_data"] = []
        state["nutrition"] = {"calories_kcal": 0}

    return state


# ---------- Calculator / Finalizer ----------
def calculator_node(state):
    if state.get("nutrition") is None:
        state["nutrition"] = {"calories_kcal": 0}
    return state


def default_nutrition():
    return {
        "calories_kcal": 0,
        "protein_g": 0,
        "carbs_g": 0,
        "fat_g": 0,
        "fiber_g": 0
    }