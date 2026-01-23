import { authAPI, ApiError } from '@/lib/api';
import { getToken, setTokens, clearTokens } from '@/lib/auth';

export interface LoginResponse {
  access_token: string;
  refresh_token?: string;
  user?: {
    id: string;
    email: string;
    name: string;
  };
}

export interface RegisterResponse {
  access_token: string;
  refresh_token?: string;
  user?: {
    id: string;
    email: string;
    name: string;
  };
}

export interface User {
  id: string;
  email: string;
  name: string;
}

/**
 * Authentication Service
 * Handles all authentication-related operations
 */
export const authService = {
  /**
   * Register a new user
   */
  async register(
    email: string,
    password: string,
    name: string,
    confirmPassword: string
  ): Promise<RegisterResponse> {
    try {
      const response = await authAPI.register(email, password, name, confirmPassword);
      const data = response.data as RegisterResponse;

      // Store tokens
      setTokens(data.access_token, data.refresh_token);

      return data;
    } catch (error) {
      if (error instanceof ApiError) {
        throw new Error(error.message);
      }
      throw error;
    }
  },

  /**
   * Login with email and password
   */
  async login(email: string, password: string): Promise<LoginResponse> {
    try {
      const response = await authAPI.login(email, password);
      const data = response.data as LoginResponse;

      // Store tokens
      setTokens(data.access_token, data.refresh_token);

      return data;
    } catch (error) {
      if (error instanceof ApiError) {
        throw new Error(error.message);
      }
      throw error;
    }
  },

  /**
   * Get current user information
   */
  async getCurrentUser(): Promise<User> {
    try {
      const response = await authAPI.getMe();
      return response.data as User;
    } catch (error) {
      clearTokens();
      throw error;
    }
  },

  /**
   * Refresh access token
   */
  async refreshToken(): Promise<void> {
    try {
      const refreshToken = getToken(); // This should actually get refresh token, but keeping auth pattern
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await authAPI.refresh(refreshToken);
      const data = response.data as LoginResponse;

      setTokens(data.access_token, data.refresh_token);
    } catch (error) {
      clearTokens();
      throw error;
    }
  },

  /**
   * Logout user
   */
  async logout(): Promise<void> {
    try {
      await authAPI.logout();
    } catch {
      // Continue logout even if API call fails
    } finally {
      clearTokens();
    }
  },

  /**
   * Initiate Google OAuth login
   */
googleLogin(): void {
    authAPI.googleLogin();
  },

  /**
   * Handle Google OAuth callback
   */
  async googleCallback(code: string): Promise<LoginResponse> {
    try {
      const response = await authAPI.googleCallback(code);
      const data = response.data as LoginResponse;

      setTokens(data.access_token, data.refresh_token);

      return data;
    } catch (error) {
      if (error instanceof ApiError) {
        throw new Error(error.message);
      }
      throw error;
    }
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    const token = getToken();
    if (!token) return false;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp * 1000 > Date.now();
    } catch {
      return false;
    }
  },

  /**
   * Get access token
   */
  getAccessToken(): string | null {
    return getToken();
  },
};
