import { useCallback } from 'react';
import { useApi, useApiMutation } from './use-api';
import {
  authAPI,
  profileAPI,
  goalsAPI,
  waterAPI,
  weightAPI,
  llmAPI,
} from '@/lib/api';

/**
 * Hook for profile operations
 */
export function useProfile(autoFetch = true) {
  const profileCall = useCallback(() => profileAPI.getMe(), []);
  return useApi(profileCall, { autoFetch, showErrorToast: false });
}

export function useProfileSetup() {
  return useApiMutation((data: { age: number; height: number; weight: number; gender: string; activity_level: string }) => profileAPI.setup(data));
}

/**
 * Hook for goals operations
 */
export function useGoals(autoFetch = true) {
  const goalsCall = useCallback(() => goalsAPI.getMe(), []);
  return useApi(goalsCall, { autoFetch, showErrorToast: false });
}

export function useGoalsSet() {
  return useApiMutation((data: { target_weight: number; weekly_goal: number }) => goalsAPI.set(data));
}

/**
 * Hook for water tracking operations
 */
export function useWaterToday(autoFetch = true) {
  const waterCall = useCallback(() => waterAPI.getToday(), []);
  return useApi(waterCall, { autoFetch, showErrorToast: false });
}

export function useWaterGoal() {
  return useApiMutation((liters: number) => waterAPI.setGoal(liters));
}

export function useAddWaterGlass() {
  return useApiMutation(() => waterAPI.addGlass());
}

/**
 * Hook for weight tracking operations
 */
export function useWeightHistory(autoFetch = true) {
  const weightCall = useCallback(() => weightAPI.getHistory(), []);
  return useApi(weightCall, { autoFetch, showErrorToast: true });
}

export function useWeightLog() {
  return useApiMutation((data: { weight: number; date: string; time: string }) =>
    weightAPI.log(data)
  );
}

/**
 * Hook for LLM operations
 */
export function useLLMLog() {
  return useApiMutation((input: string) => llmAPI.log(input));
}
