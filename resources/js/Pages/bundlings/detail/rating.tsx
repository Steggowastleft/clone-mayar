import { useState } from "react";
import { Star, MessageSquare, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";

export type RatingItem = {
  id: number;
  bintang: number;
  ulasan?: string;
  nama_peserta: string;
  created_at: string;
};

type Props = {
  bundlingId: number;
  ratings?: RatingItem[];
};

function StarDisplay({ value, size = "sm" }: { value: number; size?: "sm" | "lg" }) {
  const sz = size === "lg" ? "h-5 w-5" : "h-3.5 w-3.5";
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`${sz} ${
            i < value ? "fill-yellow-400 text-yellow-400" : "text-gray-200 fill-gray-200"
          }`}
        />
      ))}
    </div>
  );
}

export default function TabRating({ bundlingId, ratings = [] }: Props) {
  const [search, setSearch] = useState("");
  const [filterBintang, setFilterBintang] = useState<number | null>(null);

  const total = ratings.length;
  const avgRating = total > 0
    ? (ratings.reduce((sum, r) => sum + r.bintang, 0) / total).toFixed(1)
    : "0.0";

  const distribution = [5, 4, 3, 2, 1].map((b) => ({
    bintang: b,
    count: ratings.filter((r) => r.bintang === b).length,
    pct: total > 0 ? Math.round((ratings.filter((r) => r.bintang === b).length / total) * 100) : 0,
  }));

  const filtered = ratings.filter((r) => {
    const matchBintang = filterBintang === null || r.bintang === filterBintang;
    const matchSearch = !search || 
      r.nama_peserta.toLowerCase().includes(search.toLowerCase()) || 
      (r.ulasan || "").toLowerCase().includes(search.toLowerCase());
    return matchBintang && matchSearch;
  });

  return (
    <div className="space-y-6">
      {/* SUMMARY CARD */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Left: Big Score */}
          <div className="flex flex-col items-center justify-center text-center shrink-0 border-r-0 md:border-r pr-0 md:pr-8 border-gray-100">
            <p className="text-6xl font-black text-gray-900 leading-none">{avgRating}</p>
            <div className="mt-4">
              <StarDisplay value={Math.round(parseFloat(avgRating))} size="lg" />
            </div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-2">
              {total} ULASAN PESERTA
            </p>
          </div>

          {/* Right: Distribution */}
          <div className="flex-1 space-y-2">
            {distribution.map((d) => (
              <button
                key={d.bintang}
                onClick={() => setFilterBintang(filterBintang === d.bintang ? null : d.bintang)}
                className={`w-full flex items-center gap-3 group px-2 py-1 rounded-lg transition-colors ${
                  filterBintang === d.bintang ? "bg-yellow-50 border border-yellow-100" : "hover:bg-gray-50"
                }`}
              >
                <div className="flex items-center gap-1 w-8">
                  <span className="text-xs font-black text-gray-600">{d.bintang}</span>
                  <Star className="h-3 w-3 text-yellow-400 fill-yellow-400" />
                </div>
                <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-yellow-400 rounded-full transition-all duration-500" 
                    style={{ width: `${d.pct}%` }} 
                  />
                </div>
                <span className="text-[10px] font-bold text-gray-400 w-8 text-right">{d.count}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* FILTER & LIST */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gray-50/30">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4 text-gray-400" />
            <h3 className="font-bold text-gray-800 text-sm">SEMUA ULASAN</h3>
            {filterBintang !== null && (
              <Badge variant="secondary" className="bg-yellow-100 text-yellow-700 text-[10px] font-bold">
                {filterBintang} BINTANG
              </Badge>
            )}
          </div>
          <div className="relative w-full md:w-64">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-gray-400" />
            <Input
              placeholder="Cari ulasan..."
              className="pl-8 h-8 text-[10px] font-bold border-gray-200"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="divide-y divide-gray-50 p-4 space-y-4">
          {filtered.length === 0 ? (
            <div className="text-center py-12 text-gray-400 text-xs italic">
              Belum ada ulasan yang sesuai
            </div>
          ) : (
            filtered.map((rating) => (
              <div key={rating.id} className="pt-4 first:pt-0">
                <div className="flex items-start justify-between">
                  <div className="flex gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center border border-blue-100 text-blue-600 font-bold text-sm uppercase">
                      {rating.nama_peserta.charAt(0)}
                    </div>
                    <div>
                      <p className="font-bold text-gray-800 text-sm">{rating.nama_peserta}</p>
                      <div className="mt-0.5">
                        <StarDisplay value={rating.bintang} />
                      </div>
                    </div>
                  </div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">
                    {format(new Date(rating.created_at), "dd MMM yyyy", { locale: idLocale })}
                  </p>
                </div>
                {rating.ulasan && (
                  <p className="text-sm text-gray-600 mt-3 pl-13 leading-relaxed">
                    "{rating.ulasan}"
                  </p>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}