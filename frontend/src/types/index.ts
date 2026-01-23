/**
 * Centralized TypeScript types for the frontend
 * Ensure consistency across all components and services
 */

// ============================================================================
// AUTH TYPES
// ============================================================================

export interface User {
  id: string;
  email: string;
  name: string;
  created_at?: string;
  updated_at?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
}

export interface AuthResponse {
  access_token: string;
  refresh_token?: string;
  user?: User;
}

export interface RefreshTokenRequest {
  refresh_token: string;
}

// ============================================================================
// PROFILE TYPES
// ============================================================================

export interface ProfileSetupRequest {
  age: number;
  height: number;
  weight: number;
  gender: string;
  activity_level: string;
}

export interface Profile extends ProfileSetupRequest {
  id?: string;
  user_id?: string;
  created_at?: string;
  updated_at?: string;
}

export type ActivityLevel =
  | 'sedentary'
  | 'lightly_active'
  | 'moderately_active'
  | 'very_active'
  | 'extra_active';

export type Gender = 'male' | 'female' | 'other';

// ============================================================================
// GOALS TYPES
// ============================================================================

export interface GoalsSetRequest {
  target_weight: number;
  weekly_goal: number;
}

export interface Goals extends GoalsSetRequest {
  id?: string;
  user_id?: string;
  daily_calories: number;
  protein: number;
  carbs: number;
  fat: number;
  target_date: string;
  created_at?: string;
  updated_at?: string;
}

// ============================================================================
// WATER TRACKING TYPES
// ============================================================================

export interface WaterGoalRequest {
  liters: number;
}

export interface WaterData {
  id?: string;
  user_id?: string;
  goal: number;
  glasses: number;
  percentage_consumed: number;
  timestamp?: string;
}

// ============================================================================
// WEIGHT TRACKING TYPES
// ============================================================================

export interface WeightLogRequest {
  weight: number;
  date: string;
  time: string;
}

export interface WeightEntry extends WeightLogRequest {
  id?: string;
  user_id?: string;
  created_at?: string;
}

// ============================================================================
// LLM SERVICE TYPES
// ============================================================================

export interface LLMLogRequest {
  input: string;
}

export interface FoodItem {
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  quantity: string;
}

export interface ExerciseItem {
  name: string;
  duration: number; // in minutes
  calories_burned: number;
}

export type LogType = 'food' | 'exercise' | 'unknown';

export interface LLMResponse {
  type: LogType;
  confidence: number;
  food_items?: FoodItem[];
  exercise_items?: ExerciseItem[];
  raw_input?: string;
  timestamp?: string;
}

// ============================================================================
// API ERROR TYPES
// ============================================================================

export interface ApiErrorResponse {
  detail?: string;
  message?: string;
  status?: number;
  errors?: Record<string, string>;
}

export class ApiError extends Error {
  constructor(
    public status: number,
    public data?: unknown,
    message?: string
  ) {
    super(message || 'API request failed');
    this.name = 'ApiError';
  }
}

// ============================================================================
// PAGINATION TYPES
// ============================================================================

export interface PaginatedRequest {
  page: number;
  page_size: number;
  sort?: string;
  order?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

// ============================================================================
// CONTEXT TYPES
// ============================================================================

export interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  goals: Goals | null;
  isLoading: boolean;
  isLoggedIn: boolean;
  hasProfile: boolean;
  hasGoals: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  loginWithGoogle: () => void;
  refreshUser: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  refreshGoals: () => Promise<void>;
}

// ============================================================================
// COMPONENT PROP TYPES
// ============================================================================

export interface LoadingProps {
  isLoading: boolean;
  message?: string;
}

export interface ErrorProps {
  error: ApiError | null;
  onRetry?: () => void;
}

export interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  isLoading?: boolean;
}
