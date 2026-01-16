"use client";

import { useEffect, useState } from "react";
import AdminGuard from "@/components/AdminGuard";

type OrderItem = {
  catalogObjectId: string;
  variationId: string;
  name: string;
  sku: string | null;
  unitPrice: number;
  currency: string;
  quantity: number;
};

type Order = {
  _id: string;
  userId: string;
  items: OrderItem[];
  totalAmount: number;
  currency: string;
  status: string;
  paymentMethod?: string;
  createdAt: string;
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Not authenticated");
      }

      const res = await fetch("/api/admin/orders", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to load orders");
      }

      setOrders(data.orders || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleComplete = async (orderId: string) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Not authenticated");
      }

      setUpdatingId(orderId);
      const res = await fetch(`/api/admin/orders/${orderId}/complete`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to complete order");
      }

      setOrders((prev) =>
        prev.map((o) => (o._id === orderId ? { ...o, status: data.order.status } : o))
      );
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to complete order");
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <AdminGuard>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Admin Orders</h1>
        {error && <div className="text-red-600 text-sm mb-4">{error}</div>}
        {loading ? (
          <div className="text-gray-500 text-sm">Loading orders...</div>
        ) : orders.length === 0 ? (
          <div className="text-gray-500 text-sm">No orders found.</div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Order ID
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Items
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Payment
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-2" />
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {orders.map((order) => (
                  <tr key={order._id}>
                    <td className="px-4 py-2 text-sm text-gray-900">
                      <div className="font-mono text-xs truncate max-w-[160px]">
                        {order._id}
                      </div>
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-500">
                      {new Date(order.createdAt).toLocaleString()}
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-700">
                      <div className="space-y-1">
                        {order.items.map((item, idx) => (
                          <div key={idx} className="flex justify-between gap-2">
                            <span className="truncate max-w-[160px]">{item.name}</span>
                            <span className="text-gray-500">x{item.quantity}</span>
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-900">
                      ₱{(order.totalAmount / 100).toFixed(2)}
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-500">
                      {order.paymentMethod || "-"}
                    </td>
                    <td className="px-4 py-2 text-sm">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        {order.status}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-right">
                      {order.status === "pending" && (
                        <button
                          onClick={() => handleComplete(order._id)}
                          disabled={updatingId === order._id}
                          className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium bg-[#10a37f] text-white hover:bg-[#1a7f64] disabled:opacity-50"
                        >
                          {updatingId === order._id ? "Completing..." : "Mark Complete"}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminGuard>
  );
}
