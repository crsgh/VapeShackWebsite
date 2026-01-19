"use client";

import { useState, useEffect } from "react";
import { CartItem } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";

export default function CheckoutModal({
  item,
  onClose,
}: {
  item: CartItem;
  onClose: () => void;
}) {
  const { user } = useAuth();
  const [fullName, setFullName] = useState("");
  const [line1, setLine1] = useState("");
  const [city, setCity] = useState("");
  const [stateVal, setStateVal] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [country, setCountry] = useState("Philippines");
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (user?.name) setFullName(user.name);
  }, [user]);

  const handleSubmit = async () => {
    // basic validation
    if (!fullName || !line1 || !city || !country) {
      setMessage("Please fill in the required fields.");
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        // send user to login (close modal first)
        window.location.href = "/auth/login?redirect=" + encodeURIComponent(window.location.pathname);
        return;
      }

      const res = await fetch("/api/orders/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          items: [
            {
              variationId: item.variationId,
              quantity: item.quantity,
              name: item.name,
              unitPrice: item.price,
              currency: "PHP",
              catalogObjectId: item.variationId,
            },
          ],
          shippingAddress: {
            fullName,
            line1,
            city,
            state: stateVal,
            postalCode,
            country,
          },
          paymentMethod,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Checkout failed");
      }

      setMessage("Order placed! Order ID: " + data.orderId);
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err: unknown) {
      setMessage(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      <div className="relative w-full md:w-3/5 bg-white rounded-t-xl md:rounded-xl p-4 md:p-6 shadow-lg">
        <div className="flex items-start justify-between">
          <h3 className="text-lg font-bold">Checkout — {item.name}</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800">Close</button>
        </div>

        <div className="mt-4 space-y-3">
          <input
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Full name"
            className="w-full px-3 py-2 border rounded-md"
          />
          <input
            value={line1}
            onChange={(e) => setLine1(e.target.value)}
            placeholder="Street address"
            className="w-full px-3 py-2 border rounded-md"
          />
          <div className="grid grid-cols-2 gap-2">
            <input value={city} onChange={(e) => setCity(e.target.value)} placeholder="City" className="px-3 py-2 border rounded-md" />
            <input value={stateVal} onChange={(e) => setStateVal(e.target.value)} placeholder="State/Province" className="px-3 py-2 border rounded-md" />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <input value={postalCode} onChange={(e) => setPostalCode(e.target.value)} placeholder="Postal code" className="px-3 py-2 border rounded-md" />
            <input value={country} onChange={(e) => setCountry(e.target.value)} placeholder="Country" className="px-3 py-2 border rounded-md" />
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-2">
              <input type="radio" checked={paymentMethod === "cod"} onChange={() => setPaymentMethod("cod")} />
              Cash on Delivery
            </label>
            <label className="flex items-center gap-2">
              <input type="radio" checked={paymentMethod === "gcash"} onChange={() => setPaymentMethod("gcash")} />
              GCash
            </label>
            <label className="flex items-center gap-2">
              <input type="radio" checked={paymentMethod === "card"} onChange={() => setPaymentMethod("card")} />
              Card
            </label>
          </div>

          {message && <div className="text-sm text-center text-gray-700">{message}</div>}

          <div className="flex items-center justify-end gap-3 mt-2">
            <button onClick={onClose} className="px-4 py-2 rounded-md border">Cancel</button>
            <button onClick={handleSubmit} disabled={loading} className="px-4 py-2 rounded-md bg-orange-600 text-white disabled:opacity-50">
              {loading ? "Processing..." : `Pay ₱${(item.price / 100).toFixed(2)}`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
