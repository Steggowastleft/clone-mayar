import { useState } from "react";
import { Star, MessageSquare, User, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────
export type RatingItem = {
  id: number;
  bintang: number;
  ulasan?: string;
  tampil_anonim: boolean;
  foto_url?: string;
  nama_peserta: string;
  created_at: string; // ISO string
};

type Props = {
  ratings: RatingItem[];
};

// ─────────────────────────────────────────────
// Star display
// ─────────────────────────────────────────────
function StarDisplay({ value, size = "sm" }: { value: number; size?: "sm" | "lg" }) {
  const sz = size === "lg" ? "h-5 w-5" : "h-3.5 w-3.5";
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          className={`${sz} ${s <= value ? "text-yellow-400 fill-yellow-400" : "text-gray-200 fill-gray-200"}`}
        />
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────
// Rating Card
// ─────────────────────────────────────────────
function RatingCard({ rating }: { rating: RatingItem }) {
  const nama = rating.tampil_anonim ? "Anonim" : rating.nama_peserta;
  const initial = nama.charAt(0).toUpperCase();

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-3">
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <div className="shrink-0">
          {rating.foto_url ? (
            <img
              src={rating.foto_url}
              alt={nama}
              className="w-10 h-10 rounded-full object-cover border border-gray-100"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
              <span className="text-blue-600 font-bold text-sm">{initial}</span>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-semibold text-gray-800">{nama}</p>
            <span className="text-xs text-gray-400 shrink-0">
              {format(new Date(rating.created_at), "d MMM yyyy", { locale: idLocale })}
            </span>
          </div>
          <StarDisplay value={rating.bintang} />
        </div>
      </div>

      {rating.ulasan && (
        <p className="text-sm text-gray-600 leading-relaxed pl-13 border-t border-gray-50 pt-3">
          {rating.ulasan}
        </p>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// Main Tab
// ─────────────────────────────────────────────
export default function TabRating({ ratings }: Props) {
  const [search,      setSearch]      = useState("");
  const [filterBintang, setFilterBintang] = useState<number | null>(null);

  // ── Stats ──
  const total     = ratings.length;
  const rataRata  = total > 0
    ? (ratings.reduce((s, r) => s + r.bintang, 0) / total).toFixed(1)
    : "0.0";
  const dist = [5, 4, 3, 2, 1].map((b) => ({
    bintang: b,
    count:   ratings.filter((r) => r.bintang === b).length,
    pct:     total > 0 ? Math.round((ratings.filter((r) => r.bintang === b).length / total) * 100) : 0,
  }));

  // ── Filter ──
  const filtered = ratings.filter((r) => {
    const matchBintang = filterBintang === null || r.bintang === filterBintang;
    const nama = r.tampil_anonim ? "anonim" : r.nama_peserta.toLowerCase();
    const matchSearch = !search || nama.includes(search.toLowerCase()) || (r.ulasan || "").toLowerCase().includes(search.toLowerCase());
    return matchBintang && matchSearch;
  });

  return (
    <div className="p-6 space-y-5">

      {/* Summary */}
      <div className="bg-white border border-gray-200 rounded-xl p-5">
        <div className="flex items-start gap-8">

          {/* Rata-rata */}
          <div className="text-center shrink-0">
            <p className="text-5xl font-black text-gray-900">{rataRata}</p>
            <StarDisplay value={Math.round(Number(rataRata))} size="lg" />
            <p className="text-xs text-gray-400 mt-1">{total} ulasan</p>
          </div>

          {/* Distribusi */}
          <div className="flex-1 space-y-1.5">
            {dist.map((d) => (
              <button
                key={d.bintang}
                onClick={() => setFilterBintang(filterBintang === d.bintang ? null : d.bintang)}
                className={`w-full flex items-center gap-2 group rounded-lg px-2 py-1 transition ${
                  filterBintang === d.bintang ? "bg-yellow-50" : "hover:bg-gray-50"
                }`}
              >
                <span className="text-xs font-semibold text-gray-500 w-3">{d.bintang}</span>
                <Star className="h-3 w-3 text-yellow-400 fill-yellow-400 shrink-0" />
                <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-yellow-400 rounded-full transition-all"
                    style={{ width: `${d.pct}%` }}
                  />
                </div>
                <span className="text-xs text-gray-400 w-8 text-right">{d.count}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* List */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm">
        {/* Header */}
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4 text-gray-400" />
            <h3 className="font-semibold text-gray-700 text-sm">Semua Ulasan</h3>
            <span className="bg-blue-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">
              {filtered.length}
            </span>
            {filterBintang !== null && (
              <button
                onClick={() => setFilterBintang(null)}
                className="text-xs text-blue-600 hover:underline"
              >
                ✕ Filter {filterBintang}★
              </button>
            )}
          </div>
          <div className="relative w-56">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-gray-400" />
            <Input
              placeholder="Cari ulasan..."
              className="pl-8 h-8 text-xs"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Cards */}
        <div className="p-4 space-y-3">
          {filtered.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <Star className="h-10 w-10 mx-auto mb-3 text-gray-200" />
              <p className="text-sm">
                {total === 0 ? "Belum ada ulasan untuk kelas ini" : "Tidak ada ulasan yang sesuai filter"}
              </p>
            </div>
          ) : (
            filtered.map((r) => <RatingCard key={r.id} rating={r} />)
          )}
        </div>
      </div>
    </div>
  );
}