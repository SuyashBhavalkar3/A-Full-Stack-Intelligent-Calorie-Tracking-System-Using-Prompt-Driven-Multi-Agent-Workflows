import { useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { clearTokens, getToken, getRefreshToken } from '@/lib/auth';
import { useToast } from './use-toast';

/**
 * Hook for auth utilities
 */
export function useAuthUtils() {
  const { logout } = useAuth();
  const { toast } = useToast();

  /**
   * Check if user is authenticated
   */
  const isAuthenticated = useCallback(() => {
    const token = getToken();
    return !!token;
  }, []);

  /**
   * Get current access token
   */
  const getAccessToken = useCallback(() => {
    return getToken();
  }, []);

  /**
   * Get current refresh token
   */
  const getRefresh = useCallback(() => {
    return getRefreshToken();
  }, []);

  /**
   * Perform logout and show toast
   */
  const handleLogout = useCallback(async () => {
    try {
      await logout();
      toast({
        title: 'Logged out',
        description: 'You have been logged out successfully.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to log out. Please try again.',
        variant: 'destructive',
      });
    }
  }, [logout, toast]);

  /**
   * Clear authentication data
   */
  const clearAuth = useCallback(() => {
    clearTokens();
  }, []);

  return {
    isAuthenticated,
    getAccessToken,
    getRefresh,
    handleLogout,
    clearAuth,
  };
}
