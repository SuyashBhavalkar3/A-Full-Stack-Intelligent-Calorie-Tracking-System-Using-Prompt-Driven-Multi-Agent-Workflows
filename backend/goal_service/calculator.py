from datetime import date, timedelta
import math

ACTIVITY_FACTORS = {
    "sedentary": 1.2,
    "light": 1.375,
    "moderate": 1.55,
    "active": 1.725,
    "very_active": 1.9
}

def calculate_bmr(weight, height, age, gender):
    if gender.lower() == "male":
        return 10*weight + 6.25*height - 5*age + 5
    else:
        return 10*weight + 6.25*height - 5*age - 161


def calculate_adjusted_calories(bmr, activity_level, goal_type, weekly_rate):
    """
    Calculate TDEE with adjustment based on goal type and weekly rate.
    
    Args:
        bmr: Basal Metabolic Rate
        activity_level: User's activity level string
        goal_type: "lose", "gain", or "maintain"
        weekly_rate: Weekly weight change rate (kg/week)
    
    Returns:
        Adjusted daily calorie target (int)
    """
    # Energy equivalent: 1 kg ≈ 7700 kcal
    base_tdee = bmr * ACTIVITY_FACTORS.get(activity_level, 1.2)
    
    if goal_type == "maintain":
        return int(round(base_tdee))
    
    # Daily calorie adjustment: (weeklyRate * 7700) / 7
    daily_adjustment = (weekly_rate * 7700) / 7
    
    if goal_type == "lose":
        adjusted = base_tdee - daily_adjustment
    elif goal_type == "gain":
        adjusted = base_tdee + daily_adjustment
    else:
        adjusted = base_tdee
    
    # Ensure minimum of 1000 kcal/day to prevent dangerously low intake
    return max(1000, int(round(adjusted)))


def calculate_estimated_date(current_weight, target_weight, weekly_rate):
    """
    Calculate estimated date to reach target weight.
    
    Args:
        current_weight: Current weight in kg
        target_weight: Target weight in kg
        weekly_rate: Weekly weight change rate (kg/week)
    
    Returns:
        Estimated completion date
    """
    if weekly_rate == 0:
        return None
    
    weight_difference = abs(current_weight - target_weight)
    weeks_required = math.ceil(weight_difference / weekly_rate)
    days_required = weeks_required * 7
    
    return date.today() + timedelta(days=days_required)


def calculate_goal(profile, target_weight, weekly_goal_kg, target_calories=None, goal_type="lose"):
    """
    Calculate goal with macros based on target calories and goal type.
    
    Args:
        profile: User profile with health metrics
        target_weight: Target weight in kg
        weekly_goal_kg: Weekly weight loss/gain goal in kg
        target_calories: User's target daily calories (if None, calculated from profile)
        goal_type: "lose", "gain", or "maintain"
    """
    
    # Calculate BMR once
    bmr = calculate_bmr(
        profile.weight_kg,
        profile.height_cm,
        profile.age,
        profile.gender
    )
    
    # If no target_calories provided, calculate from profile with adjustment
    if target_calories is None:
        daily_calories = calculate_adjusted_calories(
            bmr, 
            profile.activity_level, 
            goal_type, 
            weekly_goal_kg
        )
    else:
        # Use provided target_calories as source of truth
        daily_calories = target_calories

    # Macro split based on target calories
    # Protein: 30%, Carbs: 40%, Fat: 30%
    protein_g = int(daily_calories * 0.30 / 4)
    carbs_g   = int(daily_calories * 0.40 / 4)
    fat_g     = int(daily_calories * 0.30 / 9)

    # Calculate estimated date
    target_date = calculate_estimated_date(profile.weight_kg, target_weight, weekly_goal_kg)
    if target_date is None:
        target_date = date.today()

    return {
        "daily_calories": daily_calories,
        "protein_g": protein_g,
        "carbs_g": carbs_g,
        "fat_g": fat_g,
        "target_date": target_date
    }