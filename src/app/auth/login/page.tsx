"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();
  const redirect = searchParams.get("redirect") || "/";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Login failed");
      }

      if (!data.tokens || !data.tokens.accessToken || !data.tokens.refreshToken) {
        throw new Error("Invalid login response");
      }

      login(data.user, {
        accessToken: data.tokens.accessToken,
        refreshToken: data.tokens.refreshToken,
      });
      
      router.push(redirect);
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

  useEffect(() => {
    const prevHtmlOverflow = document.documentElement.style.overflow;
    const prevBodyOverflow = document.body.style.overflow;
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    return () => {
      document.documentElement.style.overflow = prevHtmlOverflow || "";
      document.body.style.overflow = prevBodyOverflow || "";
    };
  }, []);

  return (
    <div className="h-screen flex items-start justify-center bg-white px-4 overflow-hidden pt-20 md:pt-28">
      <div className="max-w-[320px] w-full">
        <img src="/vslogo.png" alt="VS logo" className="mx-auto w-36 md:w-53 h-auto mb-2 -mt-15"/>
        <h2 className="text-2xl font-thin text-center text-gray-900 mb-2">
          Vape Shack Bulacan
        </h2>
        
        {error && (
          <div className="text-red-600 text-center mb-4 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="email"
              placeholder="Email address"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-gray-900 placeholder:text-gray-500 transition-colors"
            />
          </div>

          <div>
            <input
              type="password"
              placeholder="Password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-gray-900 placeholder:text-gray-500 transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#10a37f] text-white py-3 rounded-lg font-medium hover:bg-[#1a7f64] transition-colors disabled:opacity-50"
          >
            {loading ? "Signing in..." : "Continue"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600">
          Don&apos;t have an account?{" "}
          <Link
            href="/auth/register"
            className="text-[#10a37f] hover:underline"
          >
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
