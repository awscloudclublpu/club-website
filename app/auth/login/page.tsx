"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormInput } from "@/components/auth/FormInput";
import { cn } from "@/lib/utils";
import {
  validateEmail,
  validatePassword,
  parseAuthError,
  getFieldErrors,
  getUserFriendlyErrorMessage,
  parseHttpError,
  type AuthResponse,
} from "@/lib/auth";
import { getUserRole } from "@/lib/jwt";

interface LoginError {
  email?: string;
  password?: string;
  general?: string;
}

export default function Login() {
  const router = useRouter();
  const abortControllerRef = useRef<AbortController | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<LoginError>({});
  const [success, setSuccess] = useState(false);
  const [generalError, setGeneralError] = useState("");
  const [errorSuggestion, setErrorSuggestion] = useState("");
  const [isRateLimited, setIsRateLimited] = useState(false);
  const [retryAfter, setRetryAfter] = useState<number | null>(null);
  const [submitAttempts, setSubmitAttempts] = useState(0);

  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort();
    };
  }, []);

  // Handle retry timer countdown for rate limiting
  useEffect(() => {
    if (!isRateLimited || !retryAfter) return;

    const interval = setInterval(() => {
      setRetryAfter((prev) => {
        if (prev === null || prev <= 1) {
          setIsRateLimited(false);
          return null;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isRateLimited, retryAfter]);

  const validateForm = useCallback((): boolean => {
    const newErrors: LoginError = {};

    if (!email.trim()) {
      newErrors.email = "Email is required";
    } else if (!validateEmail(email)) {
      newErrors.email = "Invalid email format";
    }

    if (!password) {
      newErrors.password = "Password is required";
    } else if (!validatePassword(password)) {
      newErrors.password = "Password must be at least 8 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [email, password]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      setGeneralError("");
      setErrorSuggestion("");
      setSuccess(false);

      // Prevent submission if rate limited
      if (isRateLimited) {
        setGeneralError(
          `Too many requests. Please wait ${retryAfter ?? 60} second${(retryAfter ?? 60) !== 1 ? "s" : ""
          } before trying again.`
        );
        return;
      }

      if (!validateForm()) {
        return;
      }

      setLoading(true);
      setSubmitAttempts((prev) => prev + 1);
      abortControllerRef.current = new AbortController();

      try {
        const response = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
          signal: abortControllerRef.current.signal,
        });

        const data: AuthResponse = await response.json();

        if (!response.ok) {
          // Rate limit handling
          if (response.status === 429) {
            setIsRateLimited(true);
            const parsed = parseHttpError(response.status, data);
            setRetryAfter(parsed.retryAfter || 60);
            setGeneralError(parsed.message);
            setErrorSuggestion(parsed.retryAfter ? `Please wait ${parsed.retryAfter} seconds before retrying.` : `Please wait a moment before retrying.`);
            setLoading(false);
            return;
          }

          // Unauthorized - invalid credentials
          if (response.status === 401) {
            setGeneralError("Invalid email or password.");
            setLoading(false);
            return;
          }

          // Validation errors
          if (response.status === 400) {
            const fieldErrors = getFieldErrors(data);
            if (Object.keys(fieldErrors).length > 0) {
              setErrors((prev) => ({ ...prev, ...fieldErrors }));
            }
          }

          const info = getUserFriendlyErrorMessage(response.status, data);
          setGeneralError(info.message);
          setErrorSuggestion(info.suggestion || "");
          setLoading(false);
          return;
        }

        setSuccess(true);
        setEmail("");
        setPassword("");
        setErrors({});

        const token = data?.data?.token || data?.data?.access_token;
        if (token) {
          localStorage.setItem("authToken", token);
          const role = getUserRole(token);
          localStorage.setItem("userRole", role);
        }

        setTimeout(() => {
          router.push("/dashboard");
        }, 800);
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") {
          return;
        }

        if (error instanceof TypeError && error.message.includes("fetch")) {
          setGeneralError("Network error. Please check your internet connection and try again.");
          setErrorSuggestion("If the problem persists, please try again in a few moments.");
        } else {
          setGeneralError(parseAuthError(error));
          setErrorSuggestion("Please try again later or contact support if the problem persists.");
        }
      } finally {
        setLoading(false);
      }
    },
    [validateForm, router, isRateLimited, retryAfter]
  );

  return (
    <div className="relative min-h-screen overflow-hidden pt-20" style={{ background: 'linear-gradient(135deg, #0B1D3A 0%, #132E59 50%, #0B1D3A 100%)' }}>
      <video
        className="absolute inset-0 w-full h-full object-cover z-0 opacity-20"
        src="/video/background.mp4"
        autoPlay
        loop
        muted
        playsInline
      />
      <div className="absolute inset-0 z-10 pointer-events-none bg-linear-to-b from-transparent via-blue-950/30 to-blue-950" />

      <div className="relative z-20 flex items-center justify-center px-4 py-12 min-h-[calc(100vh-5rem)]">
        <div className="w-full max-w-md">
          <div className="animate-fade-in-up">
            <div className="mb-8 text-center">
              <div className="control-badge mb-4 inline-block">
                [AUTH_SYSTEM]
              </div>
              <h1 className="text-4xl font-black text-white mb-2">
                <span className="text-cyan-300">▸</span> LOGIN
              </h1>
              <p className="text-blue-200/60 text-sm font-mono">
                Enter your credentials to access the system
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5 mb-6">
              <FormInput
                label="Email Address"
                type="email"
                placeholder="user@example.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errors.email) setErrors({ ...errors, email: undefined });
                }}
                error={errors.email}
                disabled={loading}
                required
              />

              <FormInput
                label="Password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errors.password)
                    setErrors({ ...errors, password: undefined });
                }}
                error={errors.password}
                disabled={loading}
                required
              />

              {generalError && (
                <div
                  className={cn(
                    "p-4 rounded-lg flex items-start gap-3 border",
                    isRateLimited
                      ? "bg-amber-950/50 border-amber-500/50"
                      : "bg-red-950/40 border-red-500/40"
                  )}
                >
                  <span
                    className={cn(
                      "font-bold text-lg shrink-0",
                      isRateLimited ? "text-amber-500" : "text-red-400"
                    )}
                  >
                    {isRateLimited ? "⏱" : "⚠"}
                  </span>
                  <div className="flex-1">
                    <p
                      className={cn(
                        "text-sm font-medium",
                        isRateLimited ? "text-amber-300" : "text-red-300"
                      )}
                    >
                      {generalError}
                    </p>
                    {errorSuggestion && (
                      <p className="text-xs mt-2 opacity-80 text-blue-200/60">
                        {errorSuggestion}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {success && (
                <div className="p-3 bg-emerald-950/40 border border-emerald-500/40 rounded-lg flex items-start gap-3">
                  <span className="text-emerald-400 font-bold text-lg">✓</span>
                  <span className="text-emerald-300 text-sm font-medium">
                    Login successful! Redirecting...
                  </span>
                </div>
              )}

              <button
                type="submit"
                disabled={loading || success || isRateLimited}
                className={cn(
                  "w-full relative group overflow-hidden font-bold py-3.5 rounded-none text-white",
                  "border-3 transition-all duration-300 uppercase tracking-wider",
                  "disabled:opacity-50 disabled:cursor-not-allowed comic-border",
                  success
                    ? "bg-emerald-600 border-emerald-400 shadow-[0_0_30px_rgba(16,185,129,0.4)]"
                    : isRateLimited
                      ? "bg-amber-600 border-amber-400 shadow-[0_0_30px_rgba(245,158,11,0.4)]"
                      : "bg-blue-900/60 border-cyan-300 hover:bg-blue-800/80 shadow-[0_0_20px_rgba(0,229,255,0.2)] hover:shadow-[0_0_40px_rgba(0,229,255,0.4)]"
                )}
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  {loading ? (
                    <>
                      <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      PROCESSING...
                    </>
                  ) : success ? (
                    <>✓ LOGIN_SUCCESSFUL</>
                  ) : isRateLimited ? (
                    <>
                      ⏱ WAIT_{retryAfter ?? 60}s
                    </>
                  ) : (
                    <>▸ INITIATE_LOGIN</>
                  )}
                </span>
              </button>
            </form>

            <div className="text-center">
              <p className="text-blue-200/60 text-sm font-mono mb-4">
                Don't have an account?
              </p>
              <Link
                href="/auth/register"
                className="inline-block px-8 py-2.5 bg-transparent border-3 border-cyan-400 text-cyan-300 font-bold rounded-none hover:bg-cyan-400/10 transition-all duration-300 text-sm comic-border uppercase tracking-wider"
              >
                &lt;/&gt; CREATE_ACCOUNT
              </Link>
            </div>

            <div className="mt-8 pt-6 border-t border-cyan-400/20">
              <Link
                href="/"
                className="flex items-center justify-center gap-2 text-blue-200/50 hover:text-cyan-300 transition-colors text-sm font-mono"
              >
                <span>&lt;</span>BACK_HOME<span>&gt;</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}