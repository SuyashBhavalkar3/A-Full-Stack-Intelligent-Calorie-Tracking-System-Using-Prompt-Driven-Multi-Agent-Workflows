import { weightAPI } from '@/lib/api';

export interface WeightLogData {
  weight: number;
  date: string;
  time: string;
}

export interface WeightEntry extends WeightLogData {
  id?: string;
  created_at?: string;
}

/**
 * Weight Service
 * Handles weight tracking
 */
export const weightService = {
  /**
   * Log weight entry
   */
  async logWeight(data: WeightLogData): Promise<WeightEntry> {
    try {
      const response = await weightAPI.log(data);
      return response.data as WeightEntry;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get weight history
   */
  async getWeightHistory(): Promise<WeightEntry[]> {
    try {
      const response = await weightAPI.getHistory();
      return (response.data as WeightEntry[]) || [];
    } catch {
      return [];
    }
  },

  /**
   * Get latest weight entry
   */
  getLatestWeight(history: WeightEntry[]): WeightEntry | null {
    if (history.length === 0) return null;
    return history[0]; // Assuming latest is first
  },

  /**
   * Get weight progress
   */
  getWeightProgress(history: WeightEntry[]): number {
    if (history.length < 2) return 0;
    const latestWeight = history[0];
    const oldestWeight = history[history.length - 1];
    return latestWeight.weight - oldestWeight.weight;
  },

  /**
   * Get average weight
   */
  getAverageWeight(history: WeightEntry[]): number {
    if (history.length === 0) return 0;
    const sum = history.reduce((acc, entry) => acc + entry.weight, 0);
    return sum / history.length;
  },

  /**
   * Check if weight is progressing towards goal
   */
  isProgressingTowardGoal(
    history: WeightEntry[],
    targetWeight: number,
    currentWeight: number
  ): boolean {
    if (history.length < 2) return true;
    const previousWeight = history[1].weight; // Second most recent
    return Math.abs(currentWeight - targetWeight) <
      Math.abs(previousWeight - targetWeight)
      ? true
      : false;
  },
};
