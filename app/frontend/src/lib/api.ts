import axios, { AxiosError } from 'axios';

// Base API configuration with fallback
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Flag to prevent multiple refresh token requests
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: any) => void;
}> = [];

const processQueue = (error: any, token?: string) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else if (token) {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for token refresh
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as any;
    
    // Handle 401 Unauthorized
    if (error.response?.status === 401 && !originalRequest._retry) {
      // Prevent infinite loop on refresh endpoint itself
      if (originalRequest.url?.includes('/auth/refresh')) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/login';
        return Promise.reject(error);
      }

      if (isRefreshing) {
        // Queue the request while refresh is in progress
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token: string) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        }).catch((err) => {
          return Promise.reject(err);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = localStorage.getItem('refresh_token');
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
          refresh_token: refreshToken,
        });

        const { access_token, refresh_token: newRefreshToken } = response.data;
        
        localStorage.setItem('access_token', access_token);
        if (newRefreshToken) {
          localStorage.setItem('refresh_token', newRefreshToken);
        }

        api.defaults.headers.common.Authorization = `Bearer ${access_token}`;
        originalRequest.headers.Authorization = `Bearer ${access_token}`;
        
        processQueue(null, access_token);
        
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh failed - clear tokens and redirect to login
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        processQueue(refreshError, undefined);
        window.location.href = '/login';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

// Auth endpoints
export const authApi = {
  register: (data: { email: string; password: string; full_name: string; confirm_password: string }) =>
    api.post('/auth/register', data),
  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),
  logout: () => {
    const refreshToken = localStorage.getItem('refresh_token');
    return api.post('/auth/logout', { refresh_token: refreshToken });
  },
  me: () => api.get('/auth/me'),
  googleLogin: () => `${API_BASE_URL}/auth/google/login`,
};

// Profile endpoints
export const profileApi = {
  setup: (data: ProfileData) => api.post('/profile/setup', {
    age: data.age,
    gender: data.gender,
    height_cm: data.height,
    weight_kg: data.weight,
    activity_level: data.activity_level,
  }),
  me: () => api.get('/profile/me'),
};

export interface ProfileData {
  age: number;
  gender: string;
  height: number;
  weight: number;
  activity_level: string;
}

// Goals endpoints
export interface GoalsData {
  target_calories: number;
  protein_goal: number;
  carbs_goal: number;
  fat_goal: number;
  weight_goal: number;
  weekly_goal_kg: number;
  goal_type?: string;
}

export const goalsApi = {
  set: (data: GoalsData) => {
    // Frontend sends user-entered target_calories as source of truth
    // Backend will calculate macros based on this calorie target
    return api.post('/goals/set', {
      target_weight: data.weight_goal,
      weekly_goal_kg: data.weekly_goal_kg,
      target_calories: data.target_calories,  // Calories are primary input
      goal_type: data.goal_type || "lose",
    });
  },
  me: () => {
    return api.get('/goals/me');
  },
};

// Food/Workout logging
export const loggingApi = {
  log: (input: string) => {
    // For now, just send the input
    // The backend will handle LLM processing
    return api.post('/food-or-workout/log', { input });
  },
  today: () => api.get('/food-or-workout/today'),
  logs: () => api.get('/food-or-workout/logs/today'),  // Fetch all logs for today
};

// Speech-to-Text API
export const speechToTextApi = {
  transcribe: (audioBlob: Blob, language?: string) => {
    const formData = new FormData();
    formData.append('file', audioBlob, 'audio.wav');
    if (language) {
      formData.append('language', language);
    }
    return api.post('/api/speech-to-text/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  healthCheck: () => api.get('/api/speech-to-text/health'),
};

// Water tracking
export const waterApi = {
  setGoal: (glasses: number) => {
    // Convert glasses (250ml each) to liters: glasses * 0.25
    const target_liters = glasses * 0.25;
    return api.post('/water/goal', { target_liters });
  },
  addGlass: () => api.post('/water/add-glass'),
  today: () => api.get('/water/today'),
};

// Weight tracking
export const weightApi = {
  log: (weight_kg: number) => api.post('/weight/log', { weight_kg }),
  history: () => api.get('/weight/history'),
};

// LLM logging (admin)
export const llmApi = {
  log: (data: { prompt: string; response: string; tokens: number }) =>
    api.post('/llm/log', data),
};

export default api;
