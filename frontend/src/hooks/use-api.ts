import { useState, useCallback, useEffect, useRef } from 'react';
import { ApiError } from '@/lib/api';
import { useToast } from './use-toast';

interface UseApiOptions {
  autoFetch?: boolean;
  showErrorToast?: boolean;
  cacheTime?: number;
}

interface UseApiState<T> {
  data: T | null;
  isLoading: boolean;
  error: ApiError | null;
  refetch: () => Promise<void>;
}

/**
 * Hook for making API calls with automatic loading and error handling
 */
export function useApi<T>(
  apiCall: () => Promise<{ data: T }>,
  options: UseApiOptions = {}
): UseApiState<T> {
  const { autoFetch = true, showErrorToast = false } = options;
  const { toast } = useToast();
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(autoFetch);
  const [error, setError] = useState<ApiError | null>(null);
  const apiCallRef = useRef(apiCall);

  // Update the ref when apiCall changes, but don't include it in fetch dependency
  useEffect(() => {
    apiCallRef.current = apiCall;
  }, [apiCall]);

  const fetch = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await apiCallRef.current();
      setData(response.data);
    } catch (err) {
      const apiError = err instanceof ApiError ? err : new ApiError(500, err, String(err));
      setError(apiError);
      
      if (showErrorToast) {
        toast({
          title: 'Error',
          description: apiError.message,
          variant: 'destructive',
        });
      }
    } finally {
      setIsLoading(false);
    }
  }, [showErrorToast, toast]);

  useEffect(() => {
    if (autoFetch) {
      fetch();
    }
  }, [autoFetch, fetch]);

  return { data, isLoading, error, refetch: fetch };
}

/**
 * Hook for making API mutations (POST, PUT, DELETE) with automatic error handling
 */
export function useApiMutation<TData = unknown, TResponse = unknown>(
  apiCall: (data: TData) => Promise<{ data: TResponse }>,
  options: UseApiOptions = {}
) {
  const { showErrorToast = true } = options;
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);

  const mutate = useCallback(
    async (data: TData) => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await apiCall(data);
        
        return response.data;
      } catch (err) {
        const apiError = err instanceof ApiError ? err : new ApiError(500, err, String(err));
        setError(apiError);
        
        if (showErrorToast) {
          toast({
            title: 'Error',
            description: apiError.message,
            variant: 'destructive',
          });
        }
        
        throw apiError;
      } finally {
        setIsLoading(false);
      }
    },
    [apiCall, showErrorToast, toast]
  );

  return { mutate, isLoading, error };
}

/**
 * Hook for polling API data at regular intervals
 */
export function useApiPolling<T>(
  apiCall: () => Promise<{ data: T }>,
  intervalMs: number = 30000,
  options: UseApiOptions = {}
): UseApiState<T> {
  const apiState = useApi(apiCall, { ...options, autoFetch: true });

  useEffect(() => {
    if (intervalMs <= 0) return;

    const interval = setInterval(() => {
      apiState.refetch();
    }, intervalMs);

    return () => clearInterval(interval);
  }, [intervalMs, apiState]);

  return apiState;
}
