import Link from "next/link";

type ProductCardProps = {
  id: string; // variationId or itemId
  name: string;
  price: number;
  variationId: string;
  quantity?: number;
};

export default function ProductCard({
  name,
  price,
  variationId,
  quantity,
}: ProductCardProps) {
  return (
    <Link href={`/product/${variationId}`} className="group">
      <div className="border border-gray-200 bg-white text-gray-900 rounded-xl p-4 shadow-sm hover:shadow-md transition-all">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <h3 className="text-sm font-semibold leading-tight">{name}</h3>
            <div className="text-xs text-gray-500">Qty: {quantity ?? "-"}</div>
          </div>
          <div className="text-right text-base font-semibold text-gray-900">
            ₱{(price / 100).toFixed(2)}
          </div>
        </div>
        <div className="mt-3 text-xs text-gray-500">View details</div>
      </div>
    </Link>
  );
}
