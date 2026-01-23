"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import NoScroll from "@/components/NoScroll";

type PasswordStrength = "weak" | "fair" | "good" | "strong";

const PASSWORD_REQUIREMENTS = {
  minLength: 8,
  hasUppercase: /[A-Z]/,
  hasLowercase: /[a-z]/,
  hasNumber: /[0-9]/,
  hasSpecial: /[!@#$%^&*()_+\-=\[\]{};:'"<>,.?/]/,
};

function calculatePasswordStrength(password: string): PasswordStrength {
  if (password.length < PASSWORD_REQUIREMENTS.minLength) return "weak";
  
  let strength = 0;
  if (PASSWORD_REQUIREMENTS.hasUppercase.test(password)) strength++;
  if (PASSWORD_REQUIREMENTS.hasLowercase.test(password)) strength++;
  if (PASSWORD_REQUIREMENTS.hasNumber.test(password)) strength++;
  if (PASSWORD_REQUIREMENTS.hasSpecial.test(password)) strength++;
  if (password.length >= 12) strength++;
  
  if (strength <= 1) return "weak";
  if (strength <= 2) return "fair";
  if (strength <= 3) return "good";
  return "strong";
}

function validatePassword(password: string): { isValid: boolean; messages: string[] } {
  const messages: string[] = [];
  
  if (password.length < PASSWORD_REQUIREMENTS.minLength) {
    messages.push(`At least ${PASSWORD_REQUIREMENTS.minLength} characters`);
  }
  if (!PASSWORD_REQUIREMENTS.hasUppercase.test(password)) {
    messages.push("One uppercase letter");
  }
  if (!PASSWORD_REQUIREMENTS.hasLowercase.test(password)) {
    messages.push("One lowercase letter");
  }
  if (!PASSWORD_REQUIREMENTS.hasNumber.test(password)) {
    messages.push("One number");
  }
  if (!PASSWORD_REQUIREMENTS.hasSpecial.test(password)) {
    messages.push("One special character (!@#$%^&*)");
  }
  
  return {
    isValid: messages.length === 0,
    messages,
  };
}

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [dob, setDob] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const validateAge = (dateString: string) => {
    const today = new Date();
    const birthDate = new Date(dateString);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age >= 18; // Or 21 depending on config, sticking to 18 for now as per generic rule, configurable later
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!validateAge(dob)) {
      setError("You must be at least 18 years old to register.");
      return;
    }

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      setError(`Password must include: ${passwordValidation.messages.join(", ")}`);
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, dob }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Registration failed");
      }

      // Auto login or redirect to login
      router.push("/auth/login?registered=true");
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unknown error occurred");
      }
    } finally {
      setLoading(false);
    }
  };

  const passwordStrength = calculatePasswordStrength(password);
  const passwordValidation = validatePassword(password);
  const passwordsMatch = password && confirmPassword && password === confirmPassword;

  return (
    <NoScroll>
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
        <h2 className="text-2xl font-bold text-center text-gray-900 mb-8">
          Create Account
        </h2>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-md mb-6 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Full Name
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date of Birth
            </label>
            <input
              type="date"
              required
              value={dob}
              onChange={(e) => setDob(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              You must be of legal smoking age to register.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 8 characters with mixed case, numbers & symbols"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
            
            {password && (
              <div className="mt-3 space-y-2">
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all ${
                        passwordStrength === "weak"
                          ? "w-1/4 bg-red-500"
                          : passwordStrength === "fair"
                          ? "w-1/2 bg-yellow-500"
                          : passwordStrength === "good"
                          ? "w-3/4 bg-blue-500"
                          : "w-full bg-green-500"
                      }`}
                    />
                  </div>
                  <span className="text-xs font-medium capitalize text-gray-600">
                    {passwordStrength}
                  </span>
                </div>
                
                <div className="space-y-1">
                  {passwordValidation.messages.length > 0 ? (
                    <div className="text-xs text-gray-600">
                      <p className="font-medium mb-1">Password must include:</p>
                      <ul className="space-y-0.5 pl-4">
                        {passwordValidation.messages.map((msg) => (
                          <li key={msg} className="list-disc">{msg}</li>
                        ))}
                      </ul>
                    </div>
                  ) : (
                    <p className="text-xs text-green-600 font-medium">✓ Password meets requirements</p>
                  )}
                </div>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Confirm Password
            </label>
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter your password"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
            {confirmPassword && (
              <p className={`text-xs mt-1 ${
                passwordsMatch ? "text-green-600" : "text-red-600"
              }`}>
                {passwordsMatch ? "✓ Passwords match" : "✗ Passwords do not match"}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#10a37f] text-white py-3 rounded-lg font-medium hover:bg-[#1a7f64] transition-colors disabled:opacity-50"
          >
            {loading ? "Creating Account..." : "Sign Up"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600">
          Already have an account?{" "}
          <Link
            href="/auth/login"
            className="text-[#10a37f] hover:underline font-medium"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
    </NoScroll>
  );
}
