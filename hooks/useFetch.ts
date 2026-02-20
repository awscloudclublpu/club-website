"use client";

import { useCallback, useRef, useEffect, useState } from "react";

interface FetchOptions extends RequestInit {
  timeout?: number;
}

interface FetchState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

export function useFetch<T = any>() {
  const abortControllerRef = useRef<AbortController | null>(null);
  const timeoutIdRef = useRef<NodeJS.Timeout | null>(null);
  const [state, setState] = useState<FetchState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort();
      if (timeoutIdRef.current) {
        clearTimeout(timeoutIdRef.current);
      }
    };
  }, []);

  const fetchData = useCallback(
    async (
      url: string,
      options: FetchOptions = {}
    ): Promise<{ success: boolean; data: T | null; error: string | null }> => {
      const { timeout = 30000, ...fetchOptions } = options;

      setState({ data: null, loading: true, error: null });
      abortControllerRef.current?.abort();
      abortControllerRef.current = new AbortController();

      try {
        const fetchPromise = fetch(url, {
          ...fetchOptions,
          signal: abortControllerRef.current.signal,
        });

        let response = await Promise.race([
          fetchPromise,
          new Promise<Response>((_, reject) =>
            (timeoutIdRef.current = setTimeout(() => {
              abortControllerRef.current?.abort();
              reject(new Error("Request timeout"));
            }, timeout))
          ),
        ]);

        if (timeoutIdRef.current) {
          clearTimeout(timeoutIdRef.current);
        }

        const data = await response.json();

        if (!response.ok) {
          const error = data.message || "An error occurred";
          setState({ data: null, loading: false, error });
          return { success: false, data: null, error };
        }

        setState({ data, loading: false, error: null });
        return { success: true, data, error: null };
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") {
          return { success: false, data: null, error: null };
        }

        const errorMessage =
          error instanceof Error ? error.message : "Network error occurred";
        setState({ data: null, loading: false, error: errorMessage });
        return { success: false, data: null, error: errorMessage };
      }
    },
    []
  );

  return { ...state, fetchData };
}
