from .graph.workflow import build_graph
from datetime import datetime

_graph = None

def process_user_input(text: str, db=None, user_id=None):
    global _graph

    if _graph is None:
        _graph = build_graph()

    state = {
        "input": text,
        "intent": None,
        "parsed_data": None,
        "nutrition": None
    }

    result = _graph.invoke(state)
    
    # Transform the result into the format expected by the frontend
    foods = []
    exercises = []
    
    if result.get("intent") == "food" or result.get("intent") == "mixed":
        parsed_items = result.get("parsed_data", [])
        
        if isinstance(parsed_items, list):
            for item in parsed_items:
                if isinstance(item, dict):
                    # Handle both 'calories_kcal' and 'calories' field names
                    calories = item.get("calories_kcal") or item.get("calories") or 0
                    protein = item.get("protein_g") or item.get("protein") or 0
                    carbs = item.get("carbs_g") or item.get("carbs") or 0
                    fat = item.get("fat_g") or item.get("fat") or 0
                    
                    foods.append({
                        "name": item.get("name", "Unknown food"),
                        "calories": calories,
                        "protein": protein,
                        "carbs": carbs,
                        "fat": fat,
                    })
    
    if result.get("intent") == "exercise" or result.get("intent") == "mixed":
        parsed_items = result.get("parsed_data", [])
        
        if isinstance(parsed_items, list):
            for item in parsed_items:
                if isinstance(item, dict):
                    # Handle different calorie field names for exercise
                    calories = item.get("calories_estimate") or item.get("calories_kcal") or item.get("calories") or 0
                    
                    exercises.append({
                        "name": item.get("name", "Unknown exercise"),
                        "calories_burned": calories,
                    })
    
    # If no foods or exercises were found but we have intent, use the nutrition totals
    nutrition_total = result.get("nutrition", {})
    
    # If we got nutrition from the parser, use it to calculate totals
    if not foods and nutrition_total and (result.get("intent") == "food" or result.get("intent") == "mixed"):
        foods.append({
            "name": "Logged Food",
            "calories": nutrition_total.get("calories_kcal") or nutrition_total.get("calories") or 0,
            "protein": nutrition_total.get("protein_g") or nutrition_total.get("protein") or 0,
            "carbs": nutrition_total.get("carbs_g") or nutrition_total.get("carbs") or 0,
            "fat": nutrition_total.get("fat_g") or nutrition_total.get("fat") or 0,
        })
    
    return {
        "intent": result.get("intent"),
        "foods": foods,
        "exercises": exercises,
        "nutrition": nutrition_total,
    }