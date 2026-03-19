import { useState, useCallback } from 'react';
import { ApiError } from '../types/error.types';
import { useNotification } from '../context/NotificationContext';

interface UseAsyncState<T> {
  data: T | null;
  loading: boolean;
  error: Error | ApiError | null;
}

export function useAsync<T>(
  asyncFunction: () => Promise<T>,
  immediate = true,
  showNotification = true,
) {
  const [state, setState] = useState<UseAsyncState<T>>({
    data: null,
    loading: immediate,
    error: null,
  });

  const { addNotification } = useNotification();

  const execute = useCallback(async () => {
    setState({ data: null, loading: true, error: null });
    try {
      const response = await asyncFunction();
      setState({ data: response, loading: false, error: null });
      return response;
    } catch (error) {
      let errorMessage = 'Erro desconhecido';

      if (error instanceof ApiError) {
        errorMessage = error.message;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }

      setState({ data: null, loading: false, error: error as Error });

      if (showNotification) {
        addNotification({
          message: errorMessage,
          type: 'error',
        });
      }

      throw error;
    }
  }, [asyncFunction, addNotification, showNotification]);

  if (immediate && state.loading) {
    // Auto-execute se immediate for true
  }

  return {
    ...state,
    execute,
    reset: () => setState({ data: null, loading: false, error: null }),
  };
}
