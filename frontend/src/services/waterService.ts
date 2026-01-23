import { waterAPI } from '@/lib/api';

export interface WaterGoalData {
  liters: number;
}

export interface WaterData {
  goal: number;
  glasses: number;
  percentage_consumed: number;
  timestamp?: string;
}

/**
 * Water Service
 * Handles water intake tracking
 */
export const waterService = {
  /**
   * Set daily water goal
   */
  async setWaterGoal(liters: number): Promise<WaterData> {
    try {
      const response = await waterAPI.setGoal(liters);
      return response.data as WaterData;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Add a glass of water
   */
  async addWaterGlass(): Promise<WaterData> {
    try {
      const response = await waterAPI.addGlass();
      return response.data as WaterData;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get today's water data
   */
  async getTodayWaterData(): Promise<WaterData | null> {
    try {
      const response = await waterAPI.getToday();
      return response.data as WaterData;
    } catch {
      return null;
    }
  },

  /**
   * Calculate water consumption percentage
   */
  calculatePercentage(glasses: number, goal: number): number {
    if (goal === 0) return 0;
    return Math.min(100, (glasses / goal) * 100);
  },

  /**
   * Check if daily water goal is met
   */
  isGoalMet(glasses: number, goal: number): boolean {
    return glasses >= goal;
  },

  /**
   * Get remaining glasses needed
   */
  getRemainingGlasses(glasses: number, goal: number): number {
    return Math.max(0, goal - glasses);
  },

  /**
   * Convert liters to glasses (assuming 1 glass = 250ml = 0.25L)
   */
  litersToGlasses(liters: number): number {
    return Math.round(liters / 0.25);
  },

  /**
   * Convert glasses to liters
   */
  glassesToLiters(glasses: number): number {
    return glasses * 0.25;
  },
};
