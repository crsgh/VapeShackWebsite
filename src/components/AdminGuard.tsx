"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function AdminGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading } = useAuth();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    if (loading) return;

    if (!user) {
      const redirect = searchParams.get("redirect") || "/admin/orders";
      router.push(`/auth/login?redirect=${encodeURIComponent(redirect)}`);
      return;
    }

    if (user.role !== "admin") {
      router.push("/");
      return;
    }

    setAuthorized(true);
  }, [user, loading, router, searchParams]);

  if (!authorized) {
    return null;
  }

  return <>{children}</>;
}

