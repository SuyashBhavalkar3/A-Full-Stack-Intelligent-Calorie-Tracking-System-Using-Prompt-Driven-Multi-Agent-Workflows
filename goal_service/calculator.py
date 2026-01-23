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


def calculate_goal(profile, target_weight, weekly_goal_kg):

    bmr = calculate_bmr(
        profile.weight_kg,
        profile.height_cm,
        profile.age,
        profile.gender
    )

    tdee = bmr * ACTIVITY_FACTORS.get(profile.activity_level, 1.2)

    deficit = 500 if weekly_goal_kg == 0.5 else 1000

    daily_calories = int(tdee - deficit)

    # Macro split (weight loss)
    protein_g = int(daily_calories * 0.40 / 4)
    carbs_g   = int(daily_calories * 0.35 / 4)
    fat_g     = int(daily_calories * 0.25 / 9)

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