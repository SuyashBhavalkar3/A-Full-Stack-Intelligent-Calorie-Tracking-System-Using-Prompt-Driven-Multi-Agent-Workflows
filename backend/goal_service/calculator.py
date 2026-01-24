from datetime import date, timedelta
import math

ACTIVITY_FACTORS = {
    "sedentary": 1.2,
    "light": 1.375,
    "moderate": 1.55,
    "active": 1.725
}

def calculate_bmr(weight, height, age, gender):
    if gender.lower() == "male":
        return 10*weight + 6.25*height - 5*age + 5
    else:
        return 10*weight + 6.25*height - 5*age - 161


def calculate_goal(profile, target_weight, weekly_goal_kg, target_calories=None):
    """
    Calculate goal with macros based on target calories.
    
    Args:
        profile: User profile with health metrics
        target_weight: Target weight in kg
        weekly_goal_kg: Weekly weight loss goal in kg
        target_calories: User's target daily calories (if None, calculated from profile)
    """
    
    # If no target_calories provided, calculate from profile
    if target_calories is None:
        bmr = calculate_bmr(
            profile.weight_kg,
            profile.height_cm,
            profile.age,
            profile.gender
        )
        tdee = bmr * ACTIVITY_FACTORS.get(profile.activity_level, 1.2)
        deficit = 500 if weekly_goal_kg == 0.5 else 1000
        daily_calories = int(tdee - deficit)
    else:
        # Use provided target_calories as source of truth
        daily_calories = target_calories

    # Macro split based on target calories
    # Protein: 30%, Carbs: 40%, Fat: 30%
    protein_g = int(daily_calories * 0.30 / 4)
    carbs_g   = int(daily_calories * 0.40 / 4)
    fat_g     = int(daily_calories * 0.30 / 9)

    weeks = abs(profile.weight_kg - target_weight) / weekly_goal_kg
    days = math.ceil(weeks * 7)

    target_date = date.today() + timedelta(days=days)

    return {
        "daily_calories": daily_calories,
        "protein_g": protein_g,
        "carbs_g": carbs_g,
        "fat_g": fat_g,
        "target_date": target_date
    }