import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authAPI, profileAPI, goalsAPI } from '@/lib/api';
import { getToken, setTokens, clearTokens, isAuthenticated } from '@/lib/auth';

interface User {
  id: string;
  email: string;
  name: string;
}

interface Profile {
  age: number;
  height: number;
  weight: number;
  gender: string;
  activity_level: string;
}

interface Goals {
  target_weight: number;
  weekly_goal: number;
  daily_calories: number;
  protein: number;
  carbs: number;
  fat: number;
  target_date: string;
}

interface AuthContextType {
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

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [goals, setGoals] = useState<Goals | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = async () => {
    try {
      const response = await authAPI.getMe();
      setUser(response.data);
    } catch {
      setUser(null);
      clearTokens();
    }
  };

  const refreshProfile = async () => {
    try {
      const response = await profileAPI.getMe();
      setProfile(response.data);
    } catch {
      setProfile(null);
    }
  };

  const refreshGoals = async () => {
    try {
      const response = await goalsAPI.getMe();
      setGoals(response.data);
    } catch {
      setGoals(null);
    }
  };

  useEffect(() => {
    const initAuth = async () => {
      if (isAuthenticated()) {
        try {
          await Promise.all([refreshUser(), refreshProfile(), refreshGoals()]);
        } catch {
          clearTokens();
        }
      }
      setIsLoading(false);
    };

    initAuth();

    // Handle Google OAuth callback
    const urlParams = new URLSearchParams(window.location.search);
    const accessToken = urlParams.get('access_token');
    const refreshToken = urlParams.get('refresh_token');

    if (accessToken) {
      setTokens(accessToken, refreshToken || undefined);
      window.history.replaceState({}, document.title, window.location.pathname);
      initAuth();
    }
  }, []);

  const login = async (email: string, password: string) => {
    const response = await authAPI.login(email, password);
    const { access_token, refresh_token } = response.data;
    setTokens(access_token, refresh_token);
    await Promise.all([refreshUser(), refreshProfile(), refreshGoals()]);
  };

  const register = async (email: string, password: string, name: string, confirmPassword: string) => {
    const response = await authAPI.register(email, password, name, confirmPassword);
    const { access_token, refresh_token } = response.data;
    setTokens(access_token, refresh_token);
    await refreshUser();
  };

  const logout = async () => {
    try {
      await authAPI.logout();
    } catch {
      // Continue with logout even if API call fails
    }
    clearTokens();
    setUser(null);
    setProfile(null);
    setGoals(null);
  };

  const loginWithGoogle = () => {
    authAPI.googleLogin();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        goals,
        isLoading,
        isLoggedIn: !!user,
        hasProfile: !!profile,
        hasGoals: !!goals,
        login,
        register,
        logout,
        loginWithGoogle,
        refreshUser,
        refreshProfile,
        refreshGoals,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
