"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormInput } from "@/components/auth/FormInput";
import { FormSelect } from "@/components/auth/FormSelect";
import { cn } from "@/lib/utils";
import {
  validateEmail,
  validatePassword,
  validatePhoneNumber,
  validateUrl,
  formatPhoneNumber,
  parseAuthError,
  getFieldErrors,
  getUserFriendlyErrorMessage,
  parseHttpError,
  type AuthResponse,
} from "@/lib/auth";

interface SignupFormData {
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  university_name: string;
  custom_college_name: string;
  university_uid: string;
  graduation_year: string;
  degree_program: string;
  gender: string;
  role: string;
  hostel: string;
  profile_picture_url: string;
  password: string;
  confirm_password: string;
}

interface SignupErrors {
  first_name?: string;
  last_name?: string;
  email?: string;
  phone_number?: string;
  university_name?: string;
  custom_college_name?: string;
  university_uid?: string;
  graduation_year?: string;
  degree_program?: string;
  gender?: string;
  role?: string;
  hostel?: string;
  profile_picture_url?: string;
  password?: string;
  confirm_password?: string;
  general?: string;
}

const GRADUATION_YEARS = [
  { value: "2026", label: "2026" },
  { value: "2027", label: "2027" },
  { value: "2028", label: "2028" },
  { value: "2029", label: "2029" },
];

const UNIVERSITY_OPTIONS = [
  { value: "lpu", label: "LPU" },
  { value: "others", label: "Others" },
];

const GENDER_OPTIONS = [
  { value: "Male", label: "Male" },
  { value: "Female", label: "Female" },
  { value: "Prefer not to say", label: "Prefer not to say" },
];

const ROLE_OPTIONS = [
  { value: "attendee", label: "Attendee" },
  { value: "manager", label: "Manager" },
  { value: "core", label: "Core" },
];

const initialFormData: SignupFormData = {
  first_name: "",
  last_name: "",
  email: "",
  phone_number: "",
  university_name: "",
  custom_college_name: "",
  university_uid: "",
  graduation_year: "",
  degree_program: "",
  gender: "",
  role: "attendee", // Default role
  hostel: "",
  profile_picture_url: "",
  password: "",
  confirm_password: "",
};

export default function SignupPage() {
  const router = useRouter();
  const abortControllerRef = useRef<AbortController | null>(null);
  const [formData, setFormData] = useState<SignupFormData>(initialFormData);
  const [errors, setErrors] = useState<SignupErrors>({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [generalError, setGeneralError] = useState("");
  const [errorSuggestion, setErrorSuggestion] = useState("");
  const [step, setStep] = useState<"basic" | "academic" | "security">("basic");
  const [isRateLimited, setIsRateLimited] = useState(false);
  const [retryAfter, setRetryAfter] = useState<number | null>(null);
  const [submitAttempts, setSubmitAttempts] = useState(0);

  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort();
    };
  }, []);

  // Handle retry timer countdown
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

  const validateStep = useCallback((currentStep: string): boolean => {
    const newErrors: SignupErrors = {};

    if (currentStep === "basic") {
      if (!formData.first_name.trim() || formData.first_name.trim().length < 2) {
        newErrors.first_name = "First name must be at least 2 characters";
      }
      if (!formData.last_name.trim() || formData.last_name.trim().length < 2) {
        newErrors.last_name = "Last name must be at least 2 characters";
      }
      if (!formData.email.trim()) {
        newErrors.email = "Email is required";
      } else if (!validateEmail(formData.email)) {
        newErrors.email = "Invalid email format";
      }
      if (!formData.phone_number.trim()) {
        newErrors.phone_number = "Phone number is required";
      } else if (!validatePhoneNumber(formData.phone_number)) {
        newErrors.phone_number = "Phone number must be 10 digits";
      }
    }

    if (currentStep === "academic") {
      if (!formData.university_name) {
        newErrors.university_name = "University selection is required";
      }

      // Conditional validation based on university selection
      if (formData.university_name === "others") {
        if (!formData.custom_college_name.trim() || formData.custom_college_name.trim().length < 3) {
          newErrors.custom_college_name = "College name must be at least 3 characters";
        }
      } else if (formData.university_name === "lpu") {
        if (!formData.hostel.trim() || formData.hostel.trim().length < 3) {
          newErrors.hostel = "Hostel/Residence is required";
        }
      }

      if (!formData.university_uid.trim() || formData.university_uid.trim().length < 3) {
        newErrors.university_uid = "University ID must be at least 3 characters";
      }
      if (!formData.graduation_year) {
        newErrors.graduation_year = "Graduation year is required";
      }
      if (!formData.degree_program.trim() || formData.degree_program.trim().length < 2) {
        newErrors.degree_program = "Degree program is required";
      }
      if (!formData.gender) {
        newErrors.gender = "Gender is required";
      }
      if (formData.profile_picture_url.trim() && !validateUrl(formData.profile_picture_url)) {
        newErrors.profile_picture_url = "Invalid URL format";
      }
    }

    if (currentStep === "security") {
      if (!formData.password) {
        newErrors.password = "Password is required";
      } else if (!validatePassword(formData.password)) {
        newErrors.password = "Password must be at least 8 characters";
      }
      if (!formData.confirm_password) {
        newErrors.confirm_password = "Please confirm your password";
      } else if (formData.password !== formData.confirm_password) {
        newErrors.confirm_password = "Passwords do not match";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const handleInputChange = useCallback(
    (field: keyof SignupFormData, value: string) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
      if (errors[field]) {
        setErrors((prev) => ({ ...prev, [field]: undefined }));
      }
    },
    [errors]
  );

  const handleStepChange = useCallback(
    (direction: "next" | "prev") => {
      const steps: Array<"basic" | "academic" | "security"> = [
        "basic",
        "academic",
        "security",
      ];
      const currentIndex = steps.indexOf(step);

      if (direction === "next") {
        if (validateStep(step)) {
          const nextIndex = currentIndex + 1;
          if (nextIndex < steps.length) {
            setStep(steps[nextIndex]);
          }
        }
      } else if (direction === "prev" && currentIndex > 0) {
        setStep(steps[currentIndex - 1]);
      }
    },
    [step, validateStep]
  );

  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();

      // Prevent submission if rate limited
      if (isRateLimited) {
        setGeneralError(
          `Too many requests. Please wait ${retryAfter} second${retryAfter !== 1 ? "s" : ""} before trying again.`
        );
        return;
      }

      // Prevent multiple rapid submissions
      setSubmitAttempts((prev) => prev + 1);

      setGeneralError("");
      setErrorSuggestion("");
      setSuccess(false);

      if (!validateStep(step)) {
        return;
      }

      setLoading(true);
      abortControllerRef.current = new AbortController();

      try {
        const { confirm_password, custom_college_name, ...submitData } = formData;

        let finalUniversityName = formData.university_name;
        let finalHostel = formData.hostel.trim() || null;

        if (formData.university_name === "lpu") {
          finalUniversityName = "Lovely Professional University";
        } else if (formData.university_name === "others") {
          finalUniversityName = formData.custom_college_name.trim();
          finalHostel = null; // Don't send hostel for others
        }

        const payloadData = {
          ...submitData,
          university_name: finalUniversityName,
          graduation_year: Number(formData.graduation_year),
          email_verified: false,
          hostel: finalHostel,
          profile_picture_url: formData.profile_picture_url.trim() || null,
        };

        const response = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payloadData),
          signal: abortControllerRef.current.signal,
        });

        const data: AuthResponse = await response.json();

        if (!response.ok) {
          // Handle rate limiting specifically
          if (response.status === 429) {
            setIsRateLimited(true);
            const parsedError = parseHttpError(response.status, data);
            setRetryAfter(parsedError.retryAfter || 60);
            setGeneralError(parsedError.message);
            setErrorSuggestion(`Please wait ${parsedError.retryAfter || 60} seconds before trying again.`);
          } else {
            // Handle other HTTP errors
            const errorInfo = getUserFriendlyErrorMessage(response.status, data);

            // Try to extract field-specific errors for 400 Bad Request
            if (response.status === 400) {
              const fieldErrors = getFieldErrors(data);
              if (Object.keys(fieldErrors).length > 0) {
                setErrors((prev) => ({ ...prev, ...fieldErrors }));
              }
            }

            setGeneralError(errorInfo.message);
            setErrorSuggestion(errorInfo.suggestion || "");
          }

          setLoading(false);
          return;
        }

        setSuccess(true);
        setFormData(initialFormData);
        setErrors({});
        setStep("basic");
        setGeneralError("");
        setErrorSuggestion("");

        const token = data?.data?.token || data?.data?.access_token;
        if (token) {
          localStorage.setItem("authToken", token);
        }

        setTimeout(() => {
          router.push("/auth/login");
        }, 1500);
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") {
          return;
        }

        // Handle network errors
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
    [step, formData, validateStep, router, isRateLimited, retryAfter]
  );

  return (
    <div className="relative min-h-screen overflow-hidden pt-20 pb-12" style={{ background: 'linear-gradient(135deg, #0B1D3A 0%, #132E59 50%, #0B1D3A 100%)' }}>
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
        <div className="w-full max-w-2xl">
          <div className="animate-fade-in-up">
            <div className="mb-8 text-center">
              <div className="control-badge mb-4 inline-block">
                [REGISTRATION]
              </div>
              <h1 className="text-4xl font-black text-white mb-2">
                <span className="text-cyan-300">▸</span> CREATE_ACCOUNT
              </h1>
              <p className="text-blue-200/60 text-sm font-mono">
                Step {step === "basic" ? "1" : step === "academic" ? "2" : "3"} of
                3: {step === "basic" ? "BASIC INFO" : step === "academic" ? "ACADEMIC INFO" : "SECURITY"}
              </p>
            </div>

            <div className="mb-6 flex gap-2 justify-center">
              {(["basic", "academic", "security"] as const).map((s) => (
                <div
                  key={s}
                  className={cn(
                    "w-2 h-2 rounded-full transition-all duration-300",
                    step === s
                      ? "bg-cyan-400 shadow-[0_0_10px_rgba(0,229,255,0.8)]"
                      : s === "basic"
                        ? "bg-cyan-400/50"
                        : step === "academic" && s === "security"
                          ? "bg-cyan-400/20"
                          : "bg-cyan-400/50"
                  )}
                />
              ))}
            </div>

            <form onSubmit={handleSubmit} className="space-y-5 mb-6">
              {step === "basic" && (
                <div className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormInput
                      label="First Name"
                      type="text"
                      placeholder="John"
                      value={formData.first_name}
                      onChange={(e) => handleInputChange("first_name", e.target.value)}
                      error={errors.first_name}
                      disabled={loading}
                      required
                    />
                    <FormInput
                      label="Last Name"
                      type="text"
                      placeholder="Doe"
                      value={formData.last_name}
                      onChange={(e) => handleInputChange("last_name", e.target.value)}
                      error={errors.last_name}
                      disabled={loading}
                      required
                    />
                  </div>

                  <FormInput
                    label="Email Address"
                    type="email"
                    placeholder="john@example.com"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    error={errors.email}
                    disabled={loading}
                    required
                  />

                  <FormInput
                    label="Phone Number"
                    type="tel"
                    placeholder="9876543210"
                    value={formData.phone_number}
                    onChange={(e) =>
                      handleInputChange("phone_number", formatPhoneNumber(e.target.value))
                    }
                    error={errors.phone_number}
                    disabled={loading}
                    required
                  />
                </div>
              )}

              {step === "academic" && (
                <div className="space-y-5">
                  <FormSelect
                    label="University Name"
                    options={UNIVERSITY_OPTIONS}
                    placeholder="Select university"
                    value={formData.university_name}
                    onChange={(e) => {
                      handleInputChange("university_name", e.target.value);
                      // Clear conditional fields when university changes
                      handleInputChange("custom_college_name", "");
                      handleInputChange("hostel", "");
                    }}
                    error={errors.university_name}
                    disabled={loading}
                    required
                  />

                  {formData.university_name === "others" && (
                    <FormInput
                      label="College Name"
                      type="text"
                      placeholder="Enter your college name"
                      value={formData.custom_college_name}
                      onChange={(e) => handleInputChange("custom_college_name", e.target.value)}
                      error={errors.custom_college_name}
                      disabled={loading}
                      required
                    />
                  )}

                  {formData.university_name === "lpu" && (
                    <FormInput
                      label="Hostel/Residence"
                      type="text"
                      placeholder="Block A, Room 201"
                      value={formData.hostel}
                      onChange={(e) => handleInputChange("hostel", e.target.value)}
                      error={errors.hostel}
                      disabled={loading}
                      required
                    />
                  )}

                  <FormInput
                    label="University ID"
                    type="text"
                    placeholder="CD123456"
                    value={formData.university_uid}
                    onChange={(e) => handleInputChange("university_uid", e.target.value)}
                    error={errors.university_uid}
                    disabled={loading}
                    required
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormSelect
                      label="Graduation Year"
                      options={GRADUATION_YEARS}
                      placeholder="Select year"
                      value={formData.graduation_year}
                      onChange={(e) => handleInputChange("graduation_year", e.target.value)}
                      error={errors.graduation_year}
                      disabled={loading}
                      required
                    />

                    <FormSelect
                      label="Gender"
                      options={GENDER_OPTIONS}
                      placeholder="Select gender"
                      value={formData.gender}
                      onChange={(e) => handleInputChange("gender", e.target.value)}
                      error={errors.gender}
                      disabled={loading}
                      required
                    />
                  </div>

                  <FormInput
                    label="Degree Program"
                    type="text"
                    placeholder="B.Tech Computer Science"
                    value={formData.degree_program}
                    onChange={(e) => handleInputChange("degree_program", e.target.value)}
                    error={errors.degree_program}
                    disabled={loading}
                    required
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormSelect
                      label="Role"
                      options={ROLE_OPTIONS}
                      value={formData.role}
                      onChange={(e) => handleInputChange("role", e.target.value)}
                      error={errors.role}
                      disabled={loading}
                    />
                  </div>

                  <FormInput
                    label="Profile Picture URL"
                    type="url"
                    placeholder="https://example.com/photo.jpg"
                    value={formData.profile_picture_url}
                    onChange={(e) => handleInputChange("profile_picture_url", e.target.value)}
                    error={errors.profile_picture_url}
                    disabled={loading}
                    helperText="Optional — must be a valid URL if provided"
                  />
                </div>
              )}

              {step === "security" && (
                <div className="space-y-5">
                  <FormInput
                    label="Password"
                    type="password"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => handleInputChange("password", e.target.value)}
                    error={errors.password}
                    disabled={loading}
                    helperText="Minimum 8 characters"
                    required
                  />

                  <FormInput
                    label="Confirm Password"
                    type="password"
                    placeholder="••••••••"
                    value={formData.confirm_password}
                    onChange={(e) => handleInputChange("confirm_password", e.target.value)}
                    error={errors.confirm_password}
                    disabled={loading}
                    required
                  />
                </div>
              )}

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
                    Registration successful! Redirecting...
                  </span>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                {step !== "basic" && (
                  <button
                    type="button"
                    onClick={() => handleStepChange("prev")}
                    disabled={loading || success}
                    className="px-6 py-3 bg-transparent border-3 border-cyan-400 text-cyan-300 font-bold rounded-none hover:bg-cyan-400/10 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-sm comic-border uppercase tracking-wider"
                  >
                    &lt; PREVIOUS
                  </button>
                )}

                {step !== "security" ? (
                  <button
                    type="button"
                    onClick={() => handleStepChange("next")}
                    disabled={loading || success}
                    className="flex-1 relative group overflow-hidden font-bold py-3 rounded-none text-white border-3 border-cyan-300 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed bg-blue-900/60 hover:bg-blue-800/80 shadow-[0_0_20px_rgba(0,229,255,0.2)] hover:shadow-[0_0_40px_rgba(0,229,255,0.4)] comic-border uppercase tracking-wider"
                  >
                    <span className="relative z-10">▸ NEXT_STEP</span>
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={loading || success || isRateLimited}
                    className={cn(
                      "flex-1 relative group overflow-hidden font-bold py-3 rounded-none text-white",
                      "border-3 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed comic-border uppercase tracking-wider",
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
                        <>✓ SIGNUP_SUCCESSFUL</>
                      ) : isRateLimited ? (
                        <>⏱ WAIT_{retryAfter}s</>
                      ) : (
                        <>▸ CREATE_ACCOUNT</>
                      )}
                    </span>
                  </button>
                )}
              </div>
            </form>

            <div className="text-center">
              <p className="text-blue-200/60 text-sm font-mono mb-4">
                Already have an account?
              </p>
              <Link
                href="/auth/login"
                className="inline-block px-8 py-2.5 bg-transparent border-3 border-cyan-400 text-cyan-300 font-bold rounded-none hover:bg-cyan-400/10 transition-all duration-300 text-sm comic-border uppercase tracking-wider"
              >
                ▸ LOGIN_HERE
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
