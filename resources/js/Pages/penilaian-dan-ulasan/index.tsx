import { useState, useMemo } from "react";
import DashboardLayout from "@/components/dashboard/dashboardlayout";
import { Head } from "@inertiajs/react";
import { MessageSquare, User, Search, Filter, ShoppingBag, Star } from "lucide-react";
import { Input } from "@/components/ui/input";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────
type RatingItem = {
  id: number;
  rateable_id: number;
  rateable_type: string;
  product_nama: string;
  bintang: number;
  ulasan?: string;
  tampil_anonim: boolean;
  foto_url?: string;
  nama_peserta: string;
  created_at: string; 
};

type Product = {
  id: string; // "type:id"
  product_id: number;
  type: string;
  nama: string;
};

type Props = {
  products: Product[];
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

// Helper for human-readable product types
const getProductTypeLabel = (typeStr?: string) => {
  if (!typeStr) return "Produk";
  const lower = typeStr.toLowerCase();
  if (lower.includes("bootcamp")) return "Bootcamp";
  if (lower.includes("kelasonline")) return "Kelas Online";
  if (lower.includes("ebook")) return "Ebook";
  if (lower.includes("webinar")) return "Webinar";
  if (lower.includes("event")) return "Event";
  if (lower.includes("produkdigital")) return "Produk Digital";
  if (lower.includes("coaching")) return "Coaching & Mentoring";
  if (lower.includes("tulisan")) return "Artikel/Tulisan";
  if (lower.includes("bundling")) return "Bundling";
  return "Lainnya";
};

// ─────────────────────────────────────────────
// Review Card
// ─────────────────────────────────────────────
function ReviewCard({ rating }: { rating: RatingItem }) {
  const nama = rating.tampil_anonim ? "Anonim" : rating.nama_peserta;
  const initial = nama.charAt(0).toUpperCase();
  const productType = getProductTypeLabel(rating.rateable_type);

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-4 shadow-sm hover:shadow-md transition duration-200">
      <div className="flex items-start gap-4">
        {/* Avatar */}
        <div className="shrink-0">
          {rating.foto_url ? (
            <img
              src={rating.foto_url}
              alt={nama}
              className="w-11 h-11 rounded-full object-cover border border-gray-150"
            />
          ) : (
            <div className="w-11 h-11 rounded-full bg-blue-50 flex items-center justify-center border border-blue-100">
              <span className="text-blue-600 font-bold text-base">{initial}</span>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 flex-wrap sm:flex-nowrap">
            <div>
              <p className="text-sm font-bold text-slate-800">{nama}</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-[10px] bg-slate-100 text-slate-600 font-black px-1.5 py-0.5 rounded border uppercase">
                  {productType}
                </span>
                <span className="text-xs font-semibold text-slate-500 truncate max-w-xs md:max-w-md">
                  {rating.product_nama}
                </span>
              </div>
            </div>
            <div className="flex flex-col items-end gap-1 shrink-0">
              <span className="text-xs text-gray-400">
                {rating.created_at
                  ? format(new Date(rating.created_at), "dd MMM yyyy", { locale: idLocale })
                  : "-"}
              </span>
              <StarDisplay value={rating.bintang} />
            </div>
          </div>
        </div>
      </div>

      {rating.ulasan && (
        <div className="bg-slate-50/55 rounded-xl p-4 border border-slate-100 italic text-slate-600 text-sm pl-11 relative">
          <MessageSquare className="h-4 w-4 text-slate-300 absolute left-4 top-4" />
          "{rating.ulasan}"
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// Main Page
// ─────────────────────────────────────────────
export default function PenilaianUlasanIndex({ products = [], ratings = [] }: Props) {
  const [search, setSearch] = useState("");
  const [filterProductType, setFilterProductType] = useState<string>("all");
  const [filterProductId, setFilterProductId] = useState<string>("all");
  const [filterBintang, setFilterBintang] = useState<number | null>(null);

  // Filter products dropdown options dynamically based on selected product type
  const filteredProductsDropdown = useMemo(() => {
    if (filterProductType === "all") return products;
    return products.filter((p) => {
      const pType = p.type.toLowerCase().replace("-", "");
      const targetType = filterProductType.toLowerCase().replace("-", "");
      return pType.includes(targetType) || targetType.includes(pType);
    });
  }, [products, filterProductType]);

  // Handle resetting product ID if it is no longer in the filtered list
  const handleProductTypeChange = (val: string) => {
    setFilterProductType(val);
    setFilterProductId("all"); // reset specific product filter on type change
  };

  // Stats (calculated based on selected type and specific product filters, BEFORE star filter)
  const statsList = useMemo(() => {
    return ratings.filter((r) => {
      // 1. Type filter
      let matchType = true;
      if (filterProductType !== "all") {
        const typeLabel = getProductTypeLabel(r.rateable_type).toLowerCase().replace(/\s+/g, "");
        matchType = typeLabel.includes(filterProductType.toLowerCase().replace("-", ""));
      }
      
      // 2. Specific product filter
      let matchProduct = true;
      if (filterProductId !== "all") {
        const [type, pid] = filterProductId.split(":");
        matchProduct = r.rateable_id.toString() === pid && r.rateable_type.toLowerCase().includes(type.replace("-", ""));
      }

      return matchType && matchProduct;
    });
  }, [ratings, filterProductType, filterProductId]);

  const total = statsList.length;
  const rataRata = useMemo(() => {
    if (total === 0) return "0.0";
    return (statsList.reduce((s, r) => s + r.bintang, 0) / total).toFixed(1);
  }, [statsList, total]);

  const dist = useMemo(() => {
    return [5, 4, 3, 2, 1].map((b) => {
      const count = statsList.filter((r) => r.bintang === b).length;
      const pct = total > 0 ? Math.round((count / total) * 100) : 0;
      return { bintang: b, count, pct };
    });
  }, [statsList, total]);

  // ── Filtered Ratings list (fully filtered including stars & search) ──
  const filtered = useMemo(() => {
    return ratings.filter((r) => {
      // 1. Star filter
      const matchBintang = filterBintang === null || r.bintang === filterBintang;
      
      // 2. Type filter
      let matchType = true;
      if (filterProductType !== "all") {
        const typeLabel = getProductTypeLabel(r.rateable_type).toLowerCase().replace(/\s+/g, "");
        matchType = typeLabel.includes(filterProductType.toLowerCase().replace("-", ""));
      }
      
      // 3. Specific product filter
      let matchProduct = true;
      if (filterProductId !== "all") {
        const [type, pid] = filterProductId.split(":");
        matchProduct = r.rateable_id.toString() === pid && r.rateable_type.toLowerCase().includes(type.replace("-", ""));
      }

      // 4. Search query
      const nama = r.tampil_anonim ? "anonim" : r.nama_peserta.toLowerCase();
      const matchSearch = !search || 
        nama.includes(search.toLowerCase()) || 
        (r.ulasan || "").toLowerCase().includes(search.toLowerCase()) ||
        r.product_nama.toLowerCase().includes(search.toLowerCase());

      return matchBintang && matchType && matchProduct && matchSearch;
    });
  }, [ratings, filterBintang, filterProductType, filterProductId, search]);

  const handleResetFilters = () => {
    setFilterProductType("all");
    setFilterProductId("all");
    setFilterBintang(null);
    setSearch("");
  };

  return (
    <DashboardLayout title="Penilaian dan Ulasan">
      <Head title="Penilaian dan Ulasan" />
      
      <div className="p-8 max-w-5xl mx-auto space-y-6">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Penilaian dan Ulasan</h1>
            <p className="text-sm text-slate-500 mt-1">Lihat dan analisis ulasan dari peserta untuk seluruh produk Anda.</p>
          </div>
          
          <div className="shrink-0 flex items-center gap-3">
            <div className="bg-white border border-slate-200 px-4 py-2.5 rounded-xl flex items-center gap-2 shadow-sm font-bold text-slate-700 text-xs">
              <MessageSquare className="h-4 w-4 text-blue-600" />
              <span>{ratings.length} TOTAL ULASAN</span>
            </div>
          </div>
        </div>

        {/* Filters Top Card */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* Filter Tipe Produk */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Tipe Produk</label>
              <Select value={filterProductType} onValueChange={handleProductTypeChange}>
                <SelectTrigger className="bg-slate-50 border-slate-200 h-10 text-xs font-semibold text-slate-700">
                  <SelectValue placeholder="Semua Tipe" />
                </SelectTrigger>
                <SelectContent className="z-[200]">
                  <SelectItem value="all">Semua Tipe</SelectItem>
                  <SelectItem value="bootcamp">Bootcamp</SelectItem>
                  <SelectItem value="kelas-online">Kelas Online</SelectItem>
                  <SelectItem value="ebook">Ebook</SelectItem>
                  <SelectItem value="webinar">Webinar</SelectItem>
                  <SelectItem value="event">Event</SelectItem>
                  <SelectItem value="produk-digital">Produk Digital</SelectItem>
                  <SelectItem value="coaching-mentoring">Coaching & Mentoring</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Filter Judul Produk */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Judul Produk</label>
              <Select value={filterProductId} onValueChange={setFilterProductId}>
                <SelectTrigger className="bg-slate-50 border-slate-200 h-10 text-xs font-semibold text-slate-700">
                  <SelectValue placeholder="Pilih Produk..." />
                </SelectTrigger>
                <SelectContent className="z-[200] max-h-72">
                  <SelectItem value="all">Semua Judul Produk</SelectItem>
                  {filteredProductsDropdown.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      <span className="text-[9px] bg-slate-200 border text-slate-600 px-1 py-0.5 rounded mr-1.5 font-bold uppercase">
                        {p.type}
                      </span>
                      {p.nama}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Search Input */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Cari Ulasan</label>
              <div className="relative">
                <Search className="absolute left-3 top-3.5 h-3.5 w-3.5 text-gray-400" />
                <Input
                  placeholder="Cari nama atau isi ulasan..."
                  className="pl-9 bg-slate-50 border-slate-200 h-10 text-xs font-medium"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>

          </div>
        </div>

        {/* Summary Stats (Webinar Style) */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <div className="flex flex-col md:flex-row items-center gap-10">
            
            {/* Left Big Rata-Rata */}
            <div className="text-center shrink-0 border-b md:border-b-0 md:border-r border-slate-100 pb-6 md:pb-0 md:pr-10">
              <p className="text-6xl font-black text-slate-800 tracking-tighter leading-none">{rataRata}</p>
              <div className="flex justify-center mt-2.5">
                <StarDisplay value={Math.round(Number(rataRata))} size="lg" />
              </div>
              <p className="text-xs text-slate-400 mt-2 font-bold uppercase tracking-wider">{total} ULASAN TERPILIH</p>
            </div>

            {/* Right Distribution Bars */}
            <div className="flex-1 w-full space-y-2">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Distribusi Penilaian</p>
              {dist.map((d) => (
                <button
                  key={d.bintang}
                  onClick={() => setFilterBintang(filterBintang === d.bintang ? null : d.bintang)}
                  className={`w-full flex items-center gap-3 group rounded-xl px-3 py-1.5 transition ${
                    filterBintang === d.bintang ? "bg-yellow-50/70 border border-yellow-200" : "hover:bg-slate-50/50 border border-transparent"
                  }`}
                >
                  <span className="text-xs font-bold text-slate-600 w-3 text-right">{d.bintang}</span>
                  <Star className="h-3.5 w-3.5 text-yellow-400 fill-yellow-400 shrink-0" />
                  <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-yellow-400 rounded-full transition-all duration-300"
                      style={{ width: `${d.pct}%` }}
                    />
                  </div>
                  <span className="text-xs font-bold text-slate-400 w-12 text-right">{d.pct}%</span>
                  <span className="text-[10px] font-bold text-slate-300 bg-slate-50 border rounded px-1.5 py-0.2 shrink-0">{d.count} ulasan</span>
                </button>
              ))}
            </div>

          </div>
        </div>

        {/* List Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-800 flex items-center gap-2 text-sm uppercase tracking-wide">
              <Filter className="h-4 w-4 text-slate-400" />
              Hasil Penelusuran
              <span className="bg-blue-100 text-blue-600 text-xs font-bold px-2.5 py-0.5 rounded-full">
                {filtered.length}
              </span>
              {filterBintang !== null && (
                <span className="text-xs text-yellow-650 bg-yellow-50 border border-yellow-150 px-2 py-0.5 rounded font-semibold flex items-center gap-1">
                  ✕ Filter {filterBintang} Bintang
                </span>
              )}
            </h3>
            
            {(filterProductType !== "all" || filterProductId !== "all" || filterBintang !== null || search) && (
              <button 
                onClick={handleResetFilters}
                className="text-xs text-blue-600 hover:underline font-bold uppercase tracking-wider"
              >
                Reset Semua Filter
              </button>
            )}
          </div>

          <div className="grid gap-4">
            {filtered.length === 0 ? (
              <div className="bg-white border border-dashed border-slate-300 rounded-2xl py-20 text-center shadow-sm">
                <ShoppingBag className="h-14 w-14 mx-auto mb-4 text-slate-200" />
                <p className="text-slate-500 font-bold text-sm">Tidak ada ulasan yang sesuai kriteria.</p>
                <button 
                  onClick={handleResetFilters}
                  className="mt-2 text-blue-600 text-xs font-black uppercase tracking-wider hover:underline"
                >
                  Tampilkan semua ulasan
                </button>
              </div>
            ) : (
              filtered.map((r) => <ReviewCard key={r.id} rating={r} />)
            )}
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
}
