import { Star, Package } from "lucide-react";

interface Product {
  id: string | number;
  name: string;
  sold: number;
  revenue: string | number;
  rating: number;
  image?: string;
  penjual?: string;
}

interface TableCardProps {
  title: string;
  data?: Product[];
  isLoading?: boolean;
}

const RANK_COLORS = [
  "bg-amber-400 text-white",
  "bg-slate-400 text-white",
  "bg-orange-400 text-white",
];

export function TableCard({ title, data = [], isLoading = false }: TableCardProps) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-slate-800">{title}</h3>
          <p className="text-xs text-slate-400 mt-0.5">Berdasarkan jumlah terjual</p>
        </div>
        <span className="text-xs text-slate-400 bg-slate-50 border border-slate-200 px-2 py-1 rounded-lg">
          Top {data.length}
        </span>
      </div>

      <div className="overflow-x-auto">
        {isLoading ? (
          <div className="space-y-3 p-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-12 bg-slate-100 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : data.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-14 text-center px-6">
            <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center mb-3">
              <Package className="h-6 w-6 text-slate-300" />
            </div>
            <p className="text-sm font-semibold text-slate-500">Belum Ada Produk Terlaris</p>
            <p className="text-xs text-slate-400 mt-1">Data akan muncul setelah ada penjualan</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="text-left py-3 px-6 text-[11px] font-semibold text-slate-400 uppercase tracking-wide w-10">#</th>
                <th className="text-left py-3 px-4 text-[11px] font-semibold text-slate-400 uppercase tracking-wide">Produk</th>
                <th className="text-left py-3 px-4 text-[11px] font-semibold text-slate-400 uppercase tracking-wide">Penjual</th>
                <th className="text-right py-3 px-4 text-[11px] font-semibold text-slate-400 uppercase tracking-wide">Terjual</th>
                <th className="text-right py-3 px-4 text-[11px] font-semibold text-slate-400 uppercase tracking-wide">Pendapatan</th>
                <th className="text-right py-3 px-6 text-[11px] font-semibold text-slate-400 uppercase tracking-wide">Rating</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {data.map((product, idx) => (
                <tr
                  key={product.id}
                  className="hover:bg-slate-50/80 transition-colors"
                >
                  <td className="py-4 px-6">
                    <span className={`w-6 h-6 rounded-lg text-[11px] font-bold flex items-center justify-center ${RANK_COLORS[idx] ?? "bg-slate-100 text-slate-500"}`}>
                      {idx + 1}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      {product.image ? (
                        <img src={product.image} alt={product.name} className="w-9 h-9 rounded-lg object-cover flex-shrink-0" />
                      ) : (
                        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center flex-shrink-0">
                          <Package className="h-4 w-4 text-blue-400" />
                        </div>
                      )}
                      <span className="text-sm font-medium text-slate-800 line-clamp-1">{product.name}</span>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-left">
                    <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                      {product.penjual ?? "Admin"}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-right">
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-full">
                      {product.sold}x
                    </span>
                  </td>
                  <td className="py-4 px-4 text-right text-sm font-semibold text-slate-800">
                    {typeof product.revenue === "number"
                      ? `Rp ${product.revenue.toLocaleString("id-ID")}`
                      : product.revenue}
                  </td>
                  <td className="py-4 px-6 text-right">
                    {product.rating > 0 ? (
                      <div className="flex items-center justify-end gap-1">
                        <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                        <span className="text-xs font-semibold text-slate-700">{product.rating.toFixed(1)}</span>
                      </div>
                    ) : (
                      <span className="text-xs text-slate-300">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
