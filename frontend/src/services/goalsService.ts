import { goalsAPI } from '@/lib/api';

export interface GoalsSetData {
  target_weight: number;
  weekly_goal: number;
}

export interface Goals extends GoalsSetData {
  daily_calories: number;
  protein: number;
  carbs: number;
  fat: number;
  target_date: string;
  created_at?: string;
  updated_at?: string;
}

/**
 * Goals Service
 * Handles fitness goals management
 */
export const goalsService = {
  /**
   * Set fitness goals
   */
  async setGoals(data: GoalsSetData): Promise<Goals> {
    try {
      const response = await goalsAPI.set(data);
      return response.data as Goals;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get user's fitness goals
   */
  async getGoals(): Promise<Goals | null> {
    try {
      const response = await goalsAPI.getMe();
      return response.data as Goals;
    } catch {
      return null;
    }
  },

  /**
   * Check if goals are set
   */
  areGoalsSet(goals: Goals | null): boolean {
    return !!(
      goals &&
      goals.target_weight &&
      goals.weekly_goal &&
      goals.daily_calories
    );
  },

  /**
   * Calculate remaining calories for the day
   */
  calculateRemainingCalories(
    goals: Goals,
    consumedCalories: number
  ): number {
    return Math.max(0, goals.daily_calories - consumedCalories);
  },

  /**
   * Check if daily calorie goal is met
   */
  isDailyGoalMet(goals: Goals, consumedCalories: number): boolean {
    return consumedCalories >= goals.daily_calories;
  },
};
