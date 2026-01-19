"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import type { CartItem } from "./CartContext";
import CheckoutModal from "@/components/CheckoutModal";

type CheckoutContextType = {
  openCheckout: (item: CartItem) => void;
  closeCheckout: () => void;
};

const CheckoutContext = createContext<CheckoutContextType | undefined>(undefined);

export function CheckoutProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [item, setItem] = useState<CartItem | null>(null);

  const openCheckout = (it: CartItem) => {
    setItem(it);
    setOpen(true);
  };

  const closeCheckout = () => {
    setOpen(false);
    setItem(null);
  };

  return (
    <CheckoutContext.Provider value={{ openCheckout, closeCheckout }}>
      {children}
      {open && item && <CheckoutModal item={item} onClose={closeCheckout} />}
    </CheckoutContext.Provider>
  );
}

export function useCheckout() {
  const ctx = useContext(CheckoutContext);
  if (!ctx) throw new Error("useCheckout must be used within CheckoutProvider");
  return ctx;
}

export default CheckoutContext;
