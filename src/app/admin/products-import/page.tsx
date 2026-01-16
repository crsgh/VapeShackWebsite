"use client";

import { useCallback, useEffect, useState } from "react";
import AdminGuard from "@/components/AdminGuard";

export default function AdminProductsImportPage() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0] || null;
    setFile(selected);
    setMessage(null);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError("Please select a CSV file to import.");
      return;
    }
    try {
      setLoading(true);
      setMessage(null);
      setError(null);

      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Not authenticated");
      }

      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/admin/products/import", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Import failed");
      }

      setMessage(
        `Import successful. Processed ${data.totalProcessed} rows, upserted ${data.upserted} products.`
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Import failed");
    } finally {
      setLoading(false);
    }
  };

  const handleSyncFromSquare = useCallback(async () => {
    try {
      setSyncing(true);
      setMessage(null);
      setError(null);

      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Not authenticated");
      }

      const res = await fetch("/api/admin/products/sync-square", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Sync failed");
      }

      setMessage(
        `Sync successful. Synced ${data.synced} items, zeroed ${data.zeroed} missing items.`
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sync failed");
    } finally {
      setSyncing(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      handleSyncFromSquare();
    }, 60000);
    return () => clearTimeout(timer);
  }, [handleSyncFromSquare]);

  return (
    <AdminGuard>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Import Products from CSV
        </h1>
        <p className="text-sm text-gray-600 mb-4">
          Upload a CSV file exported from Square or Excel. Expected columns:
          variationId, name, sku, price, availableQuantity, categoryName,
          imageUrl. Extra columns are ignored.
        </p>
        <div className="space-y-6 max-w-md">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                CSV file
              </label>
              <input
                type="file"
                accept=".csv,text/csv"
                onChange={handleFileChange}
                className="block w-full text-sm text-gray-900 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100"
              />
            </div>
            <button
              type="submit"
              disabled={loading || !file}
              className="inline-flex items-center px-4 py-2 rounded-md bg-orange-600 text-white text-sm font-medium hover:bg-orange-700 disabled:opacity-50"
            >
              {loading ? "Importing..." : "Import"}
            </button>
          </form>

          <div className="border-t border-gray-200 pt-4">
            <p className="text-sm text-gray-600 mb-2">
              Or sync directly from Square using the API.
            </p>
            <button
              type="button"
              onClick={handleSyncFromSquare}
              disabled={syncing}
              className="inline-flex items-center px-4 py-2 rounded-md bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 disabled:opacity-50"
            >
              {syncing ? "Syncing from Square..." : "Sync from Square"}
            </button>
          </div>
        </div>
        {message && (
          <div className="mt-4 text-sm text-green-600">
            {message}
          </div>
        )}
        {error && (
          <div className="mt-4 text-sm text-red-600">
            {error}
          </div>
        )}
      </div>
    </AdminGuard>
  );
}
