"use client";

import { useEffect } from "react";

type Props = {
  children: React.ReactNode;
};

export default function NoScroll({ children }: Props) {
  useEffect(() => {
    const prevHtml = document.documentElement.style.overflow;
    const prevBody = document.body.style.overflow;
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    return () => {
      document.documentElement.style.overflow = prevHtml || "";
      document.body.style.overflow = prevBody || "";
    };
  }, []);

  return <>{children}</>;
}
