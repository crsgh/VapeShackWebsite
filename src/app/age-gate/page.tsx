"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

const AGE_COOKIE_NAME = "ageVerified";

export default function AgeGatePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [dob, setDob] = useState("");
  const [error, setError] = useState("");

  const from = searchParams.get("from") || "/";

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    const date = new Date(dob);
    if (Number.isNaN(date.getTime())) {
      setError("Enter a valid date of birth");
      return;
    }

    const today = new Date();
    let age = today.getFullYear() - date.getFullYear();
    const monthDiff = today.getMonth() - date.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < date.getDate())) {
      age -= 1;
    }

    if (age < 18) {
      setError("You must be of legal age to enter this site");
      return;
    }

    document.cookie = `${AGE_COOKIE_NAME}=true; path=/; max-age=86400`;
    router.push(from);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 text-gray-900">
      <div className="w-full max-w-md bg-white border border-gray-200 rounded-xl p-8 space-y-6 shadow-sm">
        <h1 className="text-2xl font-semibold text-center">
          Adults Only Vape Store
        </h1>
        <p className="text-sm text-gray-600 text-center">
          You must be of legal smoking age in your jurisdiction to enter this
          site.
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="dob" className="text-sm font-medium text-gray-800">
              Date of birth
            </label>
            <input
              id="dob"
              type="date"
              value={dob}
              onChange={(e) => {
                setDob(e.target.value);
                setError("");
              }}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              required
            />
          </div>
          {error && (
            <p className="text-sm text-red-500" aria-live="polite">
              {error}
            </p>
          )}
          <button
            type="submit"
            className="w-full rounded-lg bg-[#10a37f] py-2.5 text-sm font-semibold text-white hover:bg-[#1a7f64] transition-colors"
          >
            Enter Store
          </button>
        </form>
        <p className="text-xs text-gray-500 text-center">
          By entering this site, you certify that you are of legal age to
          purchase vaping products in your jurisdiction.
        </p>
      </div>
    </div>
  );
}
