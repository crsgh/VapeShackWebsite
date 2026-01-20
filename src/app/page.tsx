import Link from "next/link";
import AuthGuard from "@/components/AuthGuard";

export default function Home() {
  return (
    <AuthGuard>
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-white to-gray-100">
        <div className="container mx-auto px-6 py-24 text-center">
          <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 mb-6">Welcome to Vape Shack</h1>
          <p className="text-lg md:text-xl text-gray-700 max-w-2xl mx-auto mb-8">
            Discover curated products selected just for you. Fast checkout, great prices, and reliable shipping.
          </p>
          <Link href="/products" className="inline-block bg-white hover:bg-gray-100 text-gray-900 font-semibold px-6 py-3 rounded-md shadow">
            Shop Now
          </Link>
        </div>
      </div>
    </AuthGuard>
  );
}
