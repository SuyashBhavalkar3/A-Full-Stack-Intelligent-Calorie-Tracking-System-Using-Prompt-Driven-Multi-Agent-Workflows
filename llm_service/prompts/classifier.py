CLASSIFIER_PROMPT = """
You are a strict JSON API.

Classify the user input into:
- food
- exercise
- mixed

Return ONLY valid JSON:
{{ "type": "food" | "exercise" | "mixed" }}

Input: {input}
"""