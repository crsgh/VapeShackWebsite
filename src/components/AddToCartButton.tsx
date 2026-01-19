"use client";

import { useState } from "react";
import { CartItem } from "@/context/CartContext";
import { useCheckout } from "@/context/CheckoutContext";

export default function AddToCartButton({ item }: { item: CartItem }) {
  const { openCheckout } = useCheckout();
  const [loading, setLoading] = useState(false);

  const handleBuyNow = () => {
    setLoading(true);
    try {
      openCheckout(item);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button
        onClick={handleBuyNow}
        disabled={loading}
        className="w-full py-3 px-6 rounded-lg font-medium text-white bg-[#10a37f] hover:bg-[#1a7f64] transition-colors disabled:opacity-50"
      >
        {loading ? "Processing..." : "I want"}
      </button>
    </div>
  );
}
