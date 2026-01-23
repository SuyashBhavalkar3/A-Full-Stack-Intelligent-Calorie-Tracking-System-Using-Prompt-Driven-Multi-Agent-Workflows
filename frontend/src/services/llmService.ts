import { llmAPI } from '@/lib/api';

export interface LLMLogData {
  input: string;
}

export interface LLMResponse {
  food_items?: Array<{
    name: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    quantity: string;
  }>;
  exercise_items?: Array<{
    name: string;
    duration: number;
    calories_burned: number;
  }>;
  type: 'food' | 'exercise' | 'unknown';
  confidence: number;
}

/**
 * LLM Service
 * Handles AI-powered logging (food and exercise tracking)
 */
export const llmService = {
  /**
   * Log food or exercise using natural language
   */
  async logInput(input: string): Promise<LLMResponse> {
    try {
      const response = await llmAPI.log(input);
      return response.data as LLMResponse;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Calculate total calories from food items
   */
  calculateFoodCalories(response: LLMResponse): number {
    if (!response.food_items) return 0;
    return response.food_items.reduce((sum, item) => sum + item.calories, 0);
  },

  /**
   * Calculate total macros from food items
   */
  calculateFoodMacros(response: LLMResponse) {
    if (!response.food_items) {
      return { protein: 0, carbs: 0, fat: 0 };
    }
    return response.food_items.reduce(
      (acc, item) => ({
        protein: acc.protein + item.protein,
        carbs: acc.carbs + item.carbs,
        fat: acc.fat + item.fat,
      }),
      { protein: 0, carbs: 0, fat: 0 }
    );
  },

  /**
   * Calculate total calories burned from exercises
   */
  calculateExerciseCalories(response: LLMResponse): number {
    if (!response.exercise_items) return 0;
    return response.exercise_items.reduce(
      (sum, item) => sum + item.calories_burned,
      0
    );
  },

  /**
   * Check if response is high confidence
   */
  isHighConfidence(response: LLMResponse): boolean {
    return response.confidence >= 0.7;
  },

  /**
   * Get response type label
   */
  getTypeLabel(type: string): string {
    const labels: Record<string, string> = {
      food: 'Food Entry',
      exercise: 'Exercise Entry',
      unknown: 'Unknown Entry',
    };
    return labels[type] || 'Unknown';
  },
};
