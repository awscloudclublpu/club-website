"use client";

import {
  SelectHTMLAttributes,
  useId,
} from "react";
import { cn } from "@/lib/utils";

interface FormSelectProps
  extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  error?: string;
  options: Array<{ value: string; label: string }>;
  placeholder?: string;
  description?: string;
}

export function FormSelect({
  label,
  error,
  options,
  placeholder,
  description,
  className,
  id,
  required,
  ...props
}: FormSelectProps) {
  const generatedId = useId();
  const selectId = id ?? generatedId;

  const errorId = `${selectId}-error`;
  const descriptionId = `${selectId}-description`;

  const describedBy =
    error ? errorId : description ? descriptionId : undefined;

  return (
    <div className="space-y-2">
      {/* Accessible Label */}
      <label
        htmlFor={selectId}
        className="block text-sm font-medium text-blue-100/80"
      >
        {label}
        {required && (
          <span className="ml-1 text-red-400">*</span>
        )}
      </label>

      <div className="relative">
        <select
          {...props}
          id={selectId}
          required={required}
          aria-invalid={!!error}
          aria-describedby={describedBy}
          value={props.value ?? ""}
          className={cn(
            "w-full px-4 py-3 bg-[#0F2E4E]/80 border border-cyan-400/30 rounded-lg",
            "text-white focus:outline-none focus:border-cyan-400",
            "focus:shadow-[0_0_15px_rgba(0,229,255,0.2)] transition-all duration-300",
            "disabled:opacity-50 disabled:cursor-not-allowed font-mono text-sm",
            "appearance-none cursor-pointer pr-10",
            "[&>option]:bg-[#0B1D3A] [&>option]:text-white [&>option]:border-0",
            "[&>option]:py-2 [&>option:checked]:bg-cyan-600 [&>option:checked]:text-white",
            error &&
              "border-red-500 shadow-[0_0_10px_rgba(255,107,107,0.2)]",
            className
          )}
        >
          {placeholder && (
            <option
              value=""
              disabled
              hidden
            >
              {placeholder}
            </option>
          )}

          {options.map((option) => (
            <option
              key={option.value}
              value={option.value}
            >
              {option.label}
            </option>
          ))}
        </select>

        {/* Dropdown indicator icon */}
        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
          <svg
            className="w-5 h-5 text-cyan-400/60"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 14l-7 7m0 0l-7-7m7 7V3"
            />
          </svg>
        </div>
      </div>

      {/* Description */}
      {description && !error && (
        <div
          id={descriptionId}
          className="text-blue-200/50 text-xs font-mono"
        >
          {description}
        </div>
      )}

      {/* Error */}
      {error && (
        <div
          id={errorId}
          className="flex items-center gap-2 text-red-400 text-xs font-medium"
        >
          <span className="text-red-500">▸</span>
          {error}
        </div>
      )}
    </div>
  );
}