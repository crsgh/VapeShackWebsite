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
      className={`w-full py-3 px-6 rounded-md font-semibold text-white transition-colors ${
        success
          ? "bg-green-600 hover:bg-green-700"
          : "bg-orange-600 hover:bg-orange-700"
      }`}
    >
      {success ? "Added to Cart!" : "Add to Cart"}
    </button>
  );
}
