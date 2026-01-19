"use client";

import { CartProvider } from "@/context/CartContext";
import { AuthProvider } from "@/context/AuthContext";
import { CheckoutProvider } from "@/context/CheckoutContext";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <CartProvider>
        <CheckoutProvider>{children}</CheckoutProvider>
      </CartProvider>
    </AuthProvider>
  );
}
