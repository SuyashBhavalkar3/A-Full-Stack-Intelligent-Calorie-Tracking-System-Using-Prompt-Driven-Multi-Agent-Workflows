import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { getToken, setTokens, clearTokens, getRefreshToken } from './auth';

// Base API URL from environment variables
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

// Custom error class for better error handling
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

// Create axios instance
const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle token refresh and errors
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Handle 401 Unauthorized - attempt token refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = getRefreshToken();
        if (refreshToken) {
          const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
            refresh_token: refreshToken,
          });

          const { access_token, refresh_token: newRefreshToken } = response.data;
          setTokens(access_token, newRefreshToken);

          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${access_token}`;
          }

          return api(originalRequest);
        }
      } catch (refreshError) {
        clearTokens();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    // Extract error message from response
    const errorMessage = 
      (error.response?.data as any)?.detail ||
      (error.response?.data as any)?.message ||
      error.message ||
      'An error occurred';

    return Promise.reject(
      new ApiError(
        error.response?.status || 500,
        error.response?.data,
        errorMessage
      )
    );
  }
);

/**
 * Auth API - Handles authentication operations
 */
export const authAPI = {
  register: (email: string, password: string, name: string) =>
    api.post('/auth/register', { email, password, name }),

  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),

  logout: () => api.post('/auth/logout'),

  refresh: (refreshToken: string) =>
    api.post('/auth/refresh', { refresh_token: refreshToken }),

  getMe: () => api.get('/auth/me'),

  googleLogin: () => {
    window.location.href = `${API_BASE_URL}/auth/google/login`;
  },

  googleCallback: (code: string) =>
    api.post('/auth/google/callback', { code }),
};

/**
 * Profile API - Manages user profile setup and retrieval
 */
export const profileAPI = {
  setup: (data: {
    age: number;
    height: number;
    weight: number;
    gender: string;
    activity_level: string;
  }) => api.post('/profile/setup', data),

  getMe: () => api.get('/profile/me'),
};

/**
 * Goals API - Manages fitness goals
 */
export const goalsAPI = {
  set: (data: {
    target_weight: number;
    weekly_goal: number;
  }) => api.post('/goals/set', data),

  getMe: () => api.get('/goals/me'),
};

/**
 * LLM API - AI-powered food and exercise logging
 */
export const llmAPI = {
  log: (input: string) =>
    api.post('/llm/log', { text: input }),
};

/**
 * Water Tracker API - Water intake tracking
 */
export const waterAPI = {
  setGoal: (liters: number) =>
    api.post('/water/goal', { target_liters: liters }),

  addGlass: () =>
    api.post('/water/add-glass'),

  getToday: () =>
    api.get('/water/today'),
};

/**
 * Weight Tracker API - Weight tracking history
 */
export const weightAPI = {
  log: (data: { weight: number; date: string; time: string }) =>
    api.post('/weight/log', { 
      weight_kg: data.weight,
      logged_at: `${data.date}T${data.time}:00`
    }),

  getHistory: () =>
    api.get('/weight/history'),
};

export default api;
