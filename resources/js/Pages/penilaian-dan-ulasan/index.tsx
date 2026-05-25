import { useState } from "react";
import DashboardLayout from "@/components/dashboard/dashboardlayout";
import { Head } from "@inertiajs/react";
import { MessageSquare, User, Search, Filter, ShoppingBag } from "lucide-react";
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
}

type Props = {
  products: Product[];
  ratings: RatingItem[];
};

// ─────────────────────────────────────────────
// Review Card
// ─────────────────────────────────────────────
function ReviewCard({ rating }: { rating: RatingItem }) {
  const nama = rating.tampil_anonim ? "Anonim" : rating.nama_peserta;
  const initial = nama.charAt(0).toUpperCase();

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-3 shadow-sm hover:shadow-md transition-shadow">
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
            <div>
                <p className="text-sm font-semibold text-gray-800">{nama}</p>
                <p className="text-[10px] text-blue-600 font-medium uppercase tracking-tight">{rating.product_nama}</p>
            </div>
            <span className="text-xs text-gray-400 shrink-0">
              {rating.created_at
                ? format(new Date(rating.created_at), "d MMM yyyy", { locale: idLocale })
                : "-"}
            </span>
          </div>
        </div>
      </div>

      {rating.ulasan && (
        <p className="text-sm text-gray-600 leading-relaxed pl-12 border-t border-gray-50 pt-3 italic">
          "{rating.ulasan}"
        </p>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// Main Page
// ─────────────────────────────────────────────
export default function PenilaianUlasanIndex({ products, ratings }: Props) {
  const [search, setSearch] = useState("");
  const [filterProduct, setFilterProduct] = useState<string>("all");

  // ── Filter ──
  const filtered = ratings.filter((r) => {
    // filterProduct is "type:id"
    let matchProduct = true;
    if (filterProduct !== "all") {
        const [type, pid] = filterProduct.split(":");
        // Note: rateable_type is the full PHP class name
        const isMatch = r.rateable_id.toString() === pid && r.rateable_type.toLowerCase().includes(type.replace("-", ""));
        matchProduct = isMatch;
    }

    const nama = r.tampil_anonim ? "anonim" : r.nama_peserta.toLowerCase();
    const matchSearch = !search || 
        nama.includes(search.toLowerCase()) || 
        (r.ulasan || "").toLowerCase().includes(search.toLowerCase()) ||
        r.product_nama.toLowerCase().includes(search.toLowerCase());
    
    return matchProduct && matchSearch;
  });

  return (
    <DashboardLayout title="Penilaian dan Ulasan">
      <Head title="Penilaian dan Ulasan" />
      
      <div className="p-8 max-w-5xl mx-auto space-y-6">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Penilaian dan Ulasan</h1>
                <p className="text-sm text-gray-500">Lihat apa yang peserta katakan tentang semua produk Anda.</p>
            </div>
            
            <div className="flex items-center gap-3">
                <div className="bg-white border border-gray-200 px-4 py-2 rounded-lg flex items-center gap-2 shadow-sm">
                    <MessageSquare className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-semibold text-gray-700">{ratings.length} Total Ulasan</span>
                </div>
            </div>
        </div>

        {/* Filters Section */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-4">
            <div className="flex flex-col md:flex-row gap-4">
                {/* Product Select */}
                <div className="flex-1 space-y-1.5">
                    <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider px-1">Filter Produk</label>
                    <Select value={filterProduct} onValueChange={setFilterProduct}>
                        <SelectTrigger className="bg-gray-50 border-gray-200 h-10">
                            <SelectValue placeholder="Semua Produk" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Semua Produk</SelectItem>
                            {products.map((p) => (
                                <SelectItem key={p.id} value={p.id}>
                                    <span className="text-[10px] bg-gray-200 px-1.5 py-0.5 rounded mr-2 text-gray-600 font-bold uppercase">{p.type}</span>
                                    {p.nama}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* Search Input */}
                <div className="flex-1 space-y-1.5">
                    <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider px-1">Cari Ulasan</label>
                    <div className="relative">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                            placeholder="Cari nama peserta atau isi ulasan..."
                            className="pl-9 bg-gray-50 border-gray-200 h-10"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </div>
            </div>
        </div>

        {/* List Section */}
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="font-bold text-gray-800 flex items-center gap-2">
                    <Filter className="h-4 w-4 text-gray-400" />
                    Hasil Filter
                    <span className="bg-blue-100 text-blue-600 text-xs font-bold px-2 py-0.5 rounded-full">
                        {filtered.length}
                    </span>
                </h3>
                { (filterProduct !== "all" || search) && (
                    <button 
                        onClick={() => { setFilterProduct("all"); setSearch(""); }}
                        className="text-xs text-blue-600 hover:underline font-medium"
                    >
                        Reset Filter
                    </button>
                )}
            </div>

            <div className="grid gap-4">
                {filtered.length === 0 ? (
                    <div className="bg-white border border-dashed border-gray-300 rounded-2xl py-16 text-center">
                        <ShoppingBag className="h-12 w-12 mx-auto mb-4 text-gray-200" />
                        <p className="text-gray-400 text-sm">Tidak ada ulasan yang ditemukan.</p>
                        <button 
                            onClick={() => { setFilterProduct("all"); setSearch(""); }}
                            className="mt-2 text-blue-600 text-xs font-semibold hover:underline"
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
