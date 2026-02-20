"use client";

import { SelectHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface FormSelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
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
  ...props
}: FormSelectProps) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-blue-100/80">
        {label}
      </label>
      <div className="relative">
        <select
          {...props}
          className={cn(
            "w-full px-4 py-3 bg-[#0F2E4E]/80 border border-cyan-400/30 rounded-lg",
            "text-white focus:outline-none focus:border-cyan-400",
            "focus:shadow-[0_0_15px_rgba(0,229,255,0.2)] transition-all duration-300",
            "disabled:opacity-50 disabled:cursor-not-allowed font-mono text-sm",
            "appearance-none cursor-pointer pr-10",
            "[&>option]:bg-[#0B1D3A] [&>option]:text-white [&>option]:border-0",
            "[&>option]:py-2 [&>option:checked]:bg-cyan-600 [&>option:checked]:text-white",
            error && "border-red-500 shadow-[0_0_10px_rgba(255,107,107,0.2)]",
            className
          )}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {/* Dropdown indicator icon */}
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
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
      {description && !error && (
        <div className="text-blue-200/50 text-xs font-mono">{description}</div>
      )}
      {error && (
        <div className="flex items-center gap-2 text-red-400 text-xs font-medium">
          <span className="text-red-500">▸</span>
          {error}
        </div>
      )}
    </div>
  );
}
