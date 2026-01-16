"use client";

import { useState } from "react";
import { useCart, CartItem } from "@/context/CartContext";

export default function AddToCartButton({ item }: { item: CartItem }) {
  const { addToCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleAddToCart = () => {
    setLoading(true);
    // Simulate network delay if needed, or just add
    addToCart(item);
    setLoading(false);
    setSuccess(true);
    setTimeout(() => setSuccess(false), 2000);
  };

  return (
    <button
      onClick={handleAddToCart}
      disabled={loading}
      className={`w-full py-3 px-6 rounded-lg font-medium text-white transition-colors disabled:opacity-50 ${
        success
          ? "bg-[#10a37f] hover:bg-[#1a7f64]"
          : "bg-[#10a37f] hover:bg-[#1a7f64]"
      }`}
    >
      {success ? "Added to Cart!" : "Add to Cart"}
    </button>
  );
}
