def liters_to_glasses(liters: float, glass_size_ml: int = 250) -> int:
    return int((liters * 1000) / glass_size_ml)