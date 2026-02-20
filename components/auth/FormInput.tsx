"use client";

import { InputHTMLAttributes, useState } from "react";
import { cn } from "@/lib/utils";

interface FormInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  helperText?: string;
}

export function FormInput({
  label,
  error,
  helperText,
  className,
  type,
  ...props
}: FormInputProps) {
  const isPasswordType = type === "password";
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-blue-100/80">
        {label}
      </label>
      <div className="relative">
        <input
          {...props}
          type={isPasswordType && showPassword ? "text" : type}
          className={cn(
            "w-full px-4 py-3 bg-[#0F2E4E]/80 border border-cyan-400/30 rounded-lg",
            "text-white placeholder:text-blue-300/30 focus:outline-none",
            "focus:border-cyan-400 focus:shadow-[0_0_15px_rgba(0,229,255,0.2)]",
            "transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed",
            "font-mono text-sm",
            isPasswordType && "pr-12",
            error && "border-red-500 shadow-[0_0_10px_rgba(255,107,107,0.2)]",
            className
          )}
        />
        {isPasswordType && (
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className={cn(
              "absolute right-3 top-1/2 -translate-y-1/2",
              "flex items-center justify-center w-6 h-6",
              "text-blue-300/40 hover:text-cyan-300 transition-colors duration-200",
              "focus:outline-none focus:text-cyan-300"
            )}
            tabIndex={-1}
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? (
              /* Eye Open — password is visible */
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.5}
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-5 h-5"
              >
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            ) : (
              /* Eye Closed — password is hidden (default) */
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.5}
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-5 h-5"
              >
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                <path d="M14.12 14.12a3 3 0 1 1-4.24-4.24" />
                <line x1="1" y1="1" x2="23" y2="23" />
              </svg>
            )}
          </button>
        )}
      </div>
      {error && (
        <div className="flex items-center gap-2 text-red-400 text-xs font-medium">
          <span className="text-red-500">▸</span>
          {error}
        </div>
      )}
      {helperText && !error && (
        <div className="text-blue-200/50 text-xs font-mono">{helperText}</div>
      )}
    </div>
  );
}
