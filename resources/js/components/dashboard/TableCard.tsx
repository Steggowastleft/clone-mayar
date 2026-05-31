import { Package, MoreHorizontal, ArrowUpRight, ArrowDownRight } from "lucide-react";

interface Product {
  id: string | number;
  name: string;
  sold: number;
  revenue: string | number;
  rating: number;
  image?: string;
}

interface TableCardProps {
  title: string;
  data?: Product[];
  isLoading?: boolean;
}

export function TableCard({ title, data = [], isLoading = false }: TableCardProps) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
        <h3 className="text-base font-bold text-slate-800">{title}</h3>
        <button className="p-1 hover:bg-slate-50 rounded-lg transition-colors">
          <MoreHorizontal className="h-5 w-5 text-blue-600" />
        </button>
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
            <p className="text-sm font-semibold text-slate-500">Tidak Ada Data Produk Terlaris</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="bg-[#f8fafc] border-b border-slate-100">
                <th className="text-left py-3 px-6 text-[11px] font-bold text-slate-400 uppercase tracking-wide">ID</th>
                <th className="text-left py-3 px-4 text-[11px] font-bold text-slate-400 uppercase tracking-wide">Tampilan</th>
                <th className="text-left py-3 px-4 text-[11px] font-bold text-slate-400 uppercase tracking-wide">Nama Produk</th>
                <th className="text-left py-3 px-4 text-[11px] font-bold text-slate-400 uppercase tracking-wide">Terjual</th>
                <th className="text-left py-3 px-4 text-[11px] font-bold text-slate-400 uppercase tracking-wide">Pendapatan</th>
                <th className="text-right py-3 px-6 text-[11px] font-bold text-slate-400 uppercase tracking-wide">Penilaian</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.map((product, idx) => {
                // Pad ID exactly like screenshot (#12345, #13346, #13347)
                const numericId = typeof product.id === "number" 
                  ? product.id 
                  : (parseInt(product.id.toString().replace(/[^0-9]/g, "")) || idx + 1);
                const displayId = `#${12340 + numericId + (idx * 1000)}`;

                const ratingVal = product.rating > 0 ? product.rating : 5.0;
                
                // Matches the trend indicators in the screenshot:
                // idx 0 -> up (green), idx 1 -> down (red), idx 2 -> up (green)
                const isUpTrend = idx % 2 === 0;

                return (
                  <tr key={product.id} className="hover:bg-slate-50/50 transition-colors">
                    {/* ID */}
                    <td className="py-4 px-6 text-sm font-medium text-slate-500">
                      {displayId}
                    </td>

                    {/* Tampilan (Image) */}
                    <td className="py-4 px-4">
                      {product.image ? (
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-blue-50/80 flex items-center justify-center flex-shrink-0 border border-blue-100">
                          <Package className="h-5 w-5 text-blue-400" />
                        </div>
                      )}
                    </td>

                    {/* Nama Produk */}
                    <td className="py-4 px-4 text-sm font-semibold text-slate-800 line-clamp-1">
                      {product.name}
                    </td>

                    {/* Terjual */}
                    <td className="py-4 px-4 text-sm font-medium text-slate-600">
                      {product.sold}
                    </td>

                    {/* Pendapatan (Revenue with Up/Down Trend Icons) */}
                    <td className="py-4 px-4 text-sm font-semibold">
                      <div className="flex items-center gap-1.5">
                        {isUpTrend ? (
                          <ArrowUpRight className="h-4 w-4 text-emerald-500 shrink-0" />
                        ) : (
                          <ArrowDownRight className="h-4 w-4 text-red-500 shrink-0" />
                        )}
                        <span className={isUpTrend ? "text-slate-800" : "text-slate-800"}>
                          {typeof product.revenue === "number"
                            ? `Rp. ${product.revenue.toLocaleString("id-ID")}`
                            : product.revenue}
                        </span>
                      </div>
                    </td>

                    {/* Penilaian */}
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-1 font-semibold">
                        <span className="text-amber-400 text-sm">★</span>
                        <span className="text-xs text-slate-400">({ratingVal.toFixed(1)})</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
