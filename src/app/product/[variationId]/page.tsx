import { getInventoryAndCategories } from "@/lib/cache";
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
  
  const { items } = await getInventoryAndCategories();
  const item = items.find((i) => i.variationId === decodedId);

  if (!item) notFound();

  return (
    <div className="container mx-auto px-4 py-6">
      <Link href="/" className="text-sm text-gray-500 hover:text-orange-600 mb-4 inline-block">
        ← Back to products
      </Link>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 md:p-8 max-w-5xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-start md:gap-8">
            {/* Left: image / placeholder */}
            <div className="md:w-1/2 w-full">
              <div className="w-full h-64 md:h-80 bg-gray-100 rounded-lg flex items-center justify-center">
                {item.imageUrl ? (
                  // If imageUrl exists, we could swap to Next/Image; keep simple fallback
                  <img src={item.imageUrl} alt={item.name} className="object-cover w-full h-full" />
                ) : (
                  <svg className="w-20 h-20 text-gray-300" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="1.5" />
                    <path d="M7 14l3-3 4 4 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </div>
            </div>

            {/* Right: details */}
            <div className="md:w-1/2 w-full mt-4 md:mt-0">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{item.name}</h1>
                {item.sku && (
                  <p className="text-sm text-gray-500 mt-1">SKU: {item.sku}</p>
                )}
              </div>

              <div className="mt-4">
                <div className="flex items-center gap-4">
                  <span className="text-2xl md:text-3xl font-bold text-orange-600">
                    ₱{(Number(item.priceMoney.amount) / 100).toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="border-t border-b py-3 mt-4 space-y-2">
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
                  <div className="hidden md:block">
                    <AddToCartButton 
                      item={{
                        variationId: item.variationId,
                        name: item.name,
                        price: Number(item.priceMoney.amount),
                        quantity: 1,
                        image: item.imageUrl || undefined
                      }} 
                    />
                  </div>
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

      {/* Mobile fixed add-to-cart bar */}
      {item.availableQuantity > 0 && (
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-3">
          <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
            <div>
              <div className="text-sm text-gray-600">{item.name}</div>
              <div className="text-lg font-semibold text-orange-600">₱{(Number(item.priceMoney.amount) / 100).toFixed(2)}</div>
            </div>
            <div className="w-1/2">
              <AddToCartButton 
                item={{
                  variationId: item.variationId,
                  name: item.name,
                  price: Number(item.priceMoney.amount),
                  quantity: 1,
                  image: item.imageUrl || undefined
                }} 
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

