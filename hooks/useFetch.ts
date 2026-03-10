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

function extractErrorMessage(data: any): string {
  if (!data) return "An error occurred";

  // FastAPI validation errors
  if (Array.isArray(data.detail) && data.detail[0]?.msg) {
    return data.detail[0].msg;
  }

  if (typeof data.detail === "string") {
    return data.detail;
  }

  if (typeof data.message === "string") {
    return data.message;
  }

  return "An error occurred";
}

export function useFetch<T = unknown>() {
  const abortControllerRef = useRef<AbortController | null>(null);
  const timeoutIdRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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
    ): Promise<{
      success: boolean;
      data: T | null;
      error: string | null;
    }> => {
      const { timeout = 30000, ...fetchOptions } = options;

      setState({ data: null, loading: true, error: null });

      abortControllerRef.current?.abort();
      abortControllerRef.current = new AbortController();

      try {
        const fetchPromise = fetch(url, {
          ...fetchOptions,
          signal: abortControllerRef.current.signal,
        });

        const response = await Promise.race([
          fetchPromise,
          new Promise<Response>((_, reject) => {
            timeoutIdRef.current = setTimeout(() => {
              abortControllerRef.current?.abort();
              reject(new Error("Request timeout"));
            }, timeout);
          }),
        ]);

        if (timeoutIdRef.current) {
          clearTimeout(timeoutIdRef.current);
          timeoutIdRef.current = null;
        }

        //JSON parsing
        let data: any = null;
        const contentType = response.headers.get("content-type") ?? "";

        if (contentType.includes("application/json")) {
          try {
            data = await response.json();
          } catch {
            data = null;
          }
        }

        if (!response.ok) {
          const errorMessage = extractErrorMessage(data);

          setState({
            data: null,
            loading: false,
            error: errorMessage,
          });

          return {
            success: false,
            data: null,
            error: errorMessage,
          };
        }

        setState({
          data,
          loading: false,
          error: null,
        });

        return {
          success: true,
          data,
          error: null,
        };
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") {
          return { success: false, data: null, error: null };
        }

        const errorMessage =
          err instanceof Error
            ? err.message
            : "Network error occurred";

        setState({
          data: null,
          loading: false,
          error: errorMessage,
        });

        return {
          success: false,
          data: null,
          error: errorMessage,
        };
      }
    },
    []
  );

  return { ...state, fetchData };
}