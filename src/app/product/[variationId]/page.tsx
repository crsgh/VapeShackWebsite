import { fetchProductByVariationId } from "@/lib/square/inventory";
import AddToCartButton from "@/components/AddToCartButton";
import Link from "next/link";
import { notFound } from "next/navigation";

type Params = {
  params: Promise<{
    variationId: string;
  }>;
};

// Cache product pages for 30 minutes
export const revalidate = 1800;

export default async function ProductPage({ params }: Params) {
  const { variationId } = await params;
  // Decode the ID in case it was encoded
  const decodedId = decodeURIComponent(variationId);
  
  const item = await fetchProductByVariationId(decodedId);

  if (!item) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Link href="/" className="text-sm text-gray-500 hover:text-orange-600 mb-6 inline-block">
        ← Back to products
      </Link>
      
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="p-8 max-w-2xl">
          {/* Details Section - Removed Image */}
          <div className="flex flex-col space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{item.name}</h1>
              {item.sku && (
                <p className="text-sm text-gray-500 mt-1">SKU: {item.sku}</p>
              )}
            </div>

            <div className="flex items-baseline space-x-2">
              <span className="text-3xl font-bold text-orange-600">
                ₱{(Number(item.priceMoney.amount) / 100).toFixed(2)}
              </span>
            </div>

            <div className="border-t border-b py-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Availability:</span>
                <span className={`font-medium ${item.availableQuantity > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {item.availableQuantity > 0 ? `${item.availableQuantity} in stock` : 'Out of Stock'}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Category:</span>
                <span className="font-medium text-gray-900">{item.categoryName || 'General'}</span>
              </div>
            </div>

            <div className="pt-4">
              {item.availableQuantity > 0 ? (
                <AddToCartButton 
                  item={{
                    variationId: item.variationId,
                    name: item.name,
                    price: Number(item.priceMoney.amount),
                    quantity: 1,
                    image: item.imageUrl || undefined
                  }} 
                />
              ) : (
                <button disabled className="w-full py-3 px-6 rounded-md font-semibold text-white bg-gray-400 cursor-not-allowed">
                  Out of Stock
                </button>
              )}
            </div>

            <div className="bg-orange-50 border border-orange-100 rounded-lg p-4 mt-6">
              <h3 className="text-sm font-semibold text-orange-800 mb-2">Important Note</h3>
              <p className="text-xs text-orange-700">
                Vape products contain nicotine. Nicotine is an addictive chemical. 
                Products are intended for adults of legal smoking age only. 
                Age verification will be required at checkout.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

