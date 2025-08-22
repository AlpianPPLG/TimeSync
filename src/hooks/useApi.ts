/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useCallback } from 'react';
import { fetchWithAuth, handleApiResponse } from '@/lib/api';

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

interface UseApiOptions<T> {
  onSuccess?: (data: T) => void;
  onError?: (error: string) => void;
}

export function useApi<T = any>(
  endpoint: string,
  method: HttpMethod = 'GET',
  options: UseApiOptions<T> = {}
) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const execute = useCallback(
    async (body?: any, customEndpoint?: string) => {
      setLoading(true);
      setError(null);

      try {
        const url = customEndpoint || endpoint;
        const response = await fetchWithAuth(url, {
          method,
          headers: {
            'Content-Type': 'application/json',
          },
          body: body ? JSON.stringify(body) : undefined,
        });

        const { data: responseData, error: responseError } = await handleApiResponse<T>(
          response
        );

        if (responseError) {
          throw new Error(responseError);
        }

        // Type assertion to handle the case where responseData might be undefined
        const typedData = responseData as T;
        setData(typedData);
        if (options.onSuccess && typedData) {
          options.onSuccess(typedData);
        }
        return responseData;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
        setError(errorMessage);
        if (options.onError) {
          options.onError(errorMessage);
        }
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [endpoint, method, options]
  );

  return { data, error, loading, execute };
}
