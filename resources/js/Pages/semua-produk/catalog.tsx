import { Head, router } from "@inertiajs/react";
import { useState, useMemo } from "react";
import {
  Users, DollarSign, ArrowRight, Search, SlidersHorizontal,
  Megaphone, Calendar, ShoppingBag, Link,
  Heart, PenLine, GraduationCap, UserCheck,
  Book, Mic, Music, Layout, Sparkles,
  CreditCard, Package, Boxes, Image as ImageIcon, Clock
} from "lucide-react";

type Produk = {
  id: string;
  product_id: number;
  type: string;
  nama: string;
  harga: number;
  status?: string;
  tanggal: string;
  terjual: number;
  kategori: string;
  cover_url?: string | null;
};

type Props = {
  produk: Produk[];
};

type TypeConfig = {
  Icon: React.ElementType;
  color: string;
  gradient: string;
  badgeBg: string;
  badgeText: string;
};

const TYPE_CONFIG: Record<string, TypeConfig> = {
  webinar: {
    Icon: Megaphone,
    color: "text-orange-600",
    gradient: "from-orange-500 to-red-600",
    badgeBg: "bg-orange-50 border-orange-100",
    badgeText: "text-orange-700",
  },
  event: {
    Icon: Calendar,
    color: "text-pink-600",
    gradient: "from-pink-500 to-rose-600",
    badgeBg: "bg-pink-50 border-pink-100",
    badgeText: "text-pink-700",
  },
  bootcamp: {
    Icon: GraduationCap,
    color: "text-blue-600",
    gradient: "from-blue-500 to-indigo-600",
    badgeBg: "bg-blue-50 border-blue-100",
    badgeText: "text-blue-700",
  },
  "coaching-mentoring": {
    Icon: UserCheck,
    color: "text-teal-600",
    gradient: "from-teal-500 to-cyan-600",
    badgeBg: "bg-teal-50 border-teal-100",
    badgeText: "text-teal-700",
  },
  "produk-digital": {
    Icon: ShoppingBag,
    color: "text-violet-600",
    gradient: "from-violet-500 to-purple-600",
    badgeBg: "bg-violet-50 border-violet-100",
    badgeText: "text-violet-700",
  },
  "payment-link": {
    Icon: Link,
    color: "text-sky-600",
    gradient: "from-sky-500 to-blue-600",
    badgeBg: "bg-sky-50 border-sky-100",
    badgeText: "text-sky-700",
  },
  "penggalangan-dana": {
    Icon: Heart,
    color: "text-red-600",
    gradient: "from-red-500 to-pink-600",
    badgeBg: "bg-red-50 border-red-100",
    badgeText: "text-red-700",
  },
  tulisan: {
    Icon: PenLine,
    color: "text-amber-600",
    gradient: "from-amber-500 to-yellow-600",
    badgeBg: "bg-amber-50 border-amber-100",
    badgeText: "text-amber-700",
  },
  ebook: {
    Icon: Book,
    color: "text-emerald-600",
    gradient: "from-emerald-500 to-teal-600",
    badgeBg: "bg-emerald-50 border-emerald-100",
    badgeText: "text-emerald-700",
  },
  podcast: {
    Icon: Mic,
    color: "text-indigo-600",
    gradient: "from-indigo-500 to-purple-600",
    badgeBg: "bg-indigo-50 border-indigo-100",
    badgeText: "text-indigo-700",
  },
  "audio-book": {
    Icon: Music,
    color: "text-rose-600",
    gradient: "from-rose-500 to-red-600",
    badgeBg: "bg-rose-50 border-rose-100",
    badgeText: "text-rose-700",
  },
  "web-komik": {
    Icon: ImageIcon,
    color: "text-cyan-600",
    gradient: "from-cyan-500 to-blue-600",
    badgeBg: "bg-cyan-50 border-cyan-100",
    badgeText: "text-cyan-700",
  },
  "membership-saas": {
    Icon: Layout,
    color: "text-slate-600",
    gradient: "from-slate-500 to-gray-600",
    badgeBg: "bg-slate-50 border-slate-100",
    badgeText: "text-slate-700",
  },
  "creator-support-page": {
    Icon: Heart,
    color: "text-rose-500",
    gradient: "from-rose-400 to-pink-500",
    badgeBg: "bg-rose-50 border-rose-100",
    badgeText: "text-rose-700",
  },
  "paket-berlangganan": {
    Icon: CreditCard,
    color: "text-blue-500",
    gradient: "from-blue-400 to-indigo-500",
    badgeBg: "bg-blue-50 border-blue-100",
    badgeText: "text-blue-700",
  },
  "produk-fisik": {
    Icon: Package,
    color: "text-orange-700",
    gradient: "from-orange-600 to-amber-700",
    badgeBg: "bg-orange-50 border-orange-100",
    badgeText: "text-orange-800",
  },
  bundle: {
    Icon: Boxes,
    color: "text-indigo-700",
    gradient: "from-indigo-600 to-purple-800",
    badgeBg: "bg-indigo-50 border-indigo-100",
    badgeText: "text-indigo-800",
  },
  "kelas-online": {
    Icon: GraduationCap,
    color: "text-purple-600",
    gradient: "from-purple-500 to-indigo-600",
    badgeBg: "bg-purple-50 border-purple-100",
    badgeText: "text-purple-700",
  },
};

function formatHarga(n?: number) {
  if (!n || n === 0) return "Gratis";
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(n);
}

const getProductPublicUrl = (p: Produk) => {
  switch (p.type) {
    case "webinar":
      return `/p/${p.product_id}/webinar`;
    case "kelas-online":
      return `/p/${p.product_id}/kelas-online`;
    case "bootcamp":
      return `/p/${p.product_id}/bootcamp`;
    case "bundle":
    case "bundling":
      return `/p/${p.product_id}/bundling`;
    case "ebook":
      return `/ebook/${p.product_id}/p`;
    case "produk-digital":
      return `/produk-digital/${p.product_id}/p`;
    case "coaching-mentoring":
      return `/coaching-mentoring/${p.product_id}/p`;
    case "payment-link":
      return `/payment-link/${p.product_id}/p`;
    case "tulisan":
      return `/tulisan/${p.product_id}/p`;
    case "penggalangan-dana":
      return `/penggalangan-dana/${p.product_id}/p`;
    case "event":
      return `/event/${p.product_id}/p`;
    default:
      return `/catalog`;
  }
};

export default function Katalog({ produk }: Props) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");

  const list = produk ?? [];

  // Filter Categories Option List based on what actually exists in products
  const categoryFilters = useMemo(() => {
    const types = new Set(list.map((p) => p.type));
    return [
      { id: "all", label: "Semua Produk" },
      ...Array.from(types).map((type) => {
        const item = list.find((p) => p.type === type);
        return {
          id: type,
          label: item ? item.kategori : type,
        };
      }),
    ];
  }, [list]);

  // Filtered Products
  const filteredProducts = useMemo(() => {
    return list.filter((p) => {
      const matchesSearch = p.nama.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = activeCategory === "all" || p.type === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [list, searchQuery, activeCategory]);

  return (
    <>
      <Head title="Katalog Produk" />

      <div className="min-h-screen bg-slate-50/50 text-slate-800 antialiased selection:bg-indigo-500 selection:text-white relative overflow-hidden font-sans pb-24">
        
        {/* Futuristic Background Gradients */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-400/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-purple-400/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-10 left-10 w-80 h-80 bg-blue-400/10 rounded-full blur-3xl pointer-events-none"></div>

        {/* HERO / HEADER SECTION */}
        <div className="relative pt-16 pb-20 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white overflow-hidden shadow-2xl">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.25),rgba(255,255,255,0))]"></div>
          <div className="max-w-6xl mx-auto px-4 relative z-10 text-center space-y-6">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-white/10 text-indigo-200 border border-white/5 uppercase tracking-widest backdrop-blur-md">
              <Sparkles size={12} className="text-indigo-400" /> Catalog Platform
            </div>
            <h1 className="text-4xl sm:text-5xl font-black tracking-tight bg-gradient-to-r from-white via-indigo-100 to-slate-100 bg-clip-text text-transparent leading-none">
              Jelajahi Karya & Produk Terbaik
            </h1>
            <p className="text-slate-300 text-sm max-w-xl mx-auto leading-relaxed font-medium">
              Temukan berbagai kelas online, webinar interaktif, produk digital premium, dan program pembelajaran terbaik kami yang siap membantumu berkembang.
            </p>
          </div>
        </div>

        {/* MAIN INTERACTIVE CONTROLS */}
        <div className="max-w-6xl mx-auto px-4 -mt-8 relative z-20">
          <div className="bg-white rounded-3xl p-6 shadow-xl border border-slate-100 space-y-6">
            {/* Search Input */}
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl blur opacity-10 group-hover:opacity-20 transition duration-300"></div>
              <div className="relative flex items-center bg-slate-50 border border-slate-200/80 rounded-xl overflow-hidden focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500 transition-all">
                <Search className="ml-4 h-5 w-5 text-slate-400 shrink-0" />
                <input
                  type="text"
                  placeholder="Cari kelas, ebook, webinar, atau link pembayaran..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-4 bg-transparent outline-none border-none text-sm text-slate-800 placeholder-slate-400 font-semibold"
                />
              </div>
            </div>

            {/* Category Tags */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs font-extrabold text-slate-400 uppercase tracking-widest pl-1">
                <SlidersHorizontal size={14} className="text-slate-400" /> Kategori Produk
              </div>
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
                {categoryFilters.map((cat) => {
                  const isActive = activeCategory === cat.id;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => setActiveCategory(cat.id)}
                      className={`whitespace-nowrap px-4 py-2.5 rounded-xl text-xs font-bold border transition-all duration-200 ${
                        isActive
                          ? "bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-600/10 scale-95"
                          : "bg-white hover:bg-slate-50 text-slate-600 border-slate-200/80 hover:text-slate-900"
                      }`}
                    >
                      {cat.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* CATALOG LIST GRID */}
        <div className="max-w-6xl mx-auto px-4 py-12">
          {filteredProducts.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-3xl border border-slate-100 shadow-sm space-y-3">
              <div className="text-4xl">🔍</div>
              <p className="text-slate-500 font-bold text-sm">Produk tidak ditemukan</p>
              <p className="text-slate-400 text-xs">Coba cari dengan kata kunci lain atau pilih kategori yang berbeda.</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredProducts.map((p) => {
                const cfg = TYPE_CONFIG[p.type];
                const gradient = cfg?.gradient ?? "from-slate-400 to-slate-600";
                const Icon = cfg?.Icon ?? ShoppingBag;
                const badgeBg = cfg?.badgeBg ?? "bg-slate-50 border-slate-100";
                const badgeText = cfg?.badgeText ?? "text-slate-700";

                return (
                  <div
                    key={p.id}
                    className="group bg-white rounded-3xl border border-slate-100 hover:border-slate-200/80 shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 overflow-hidden flex flex-col justify-between"
                  >
                    {/* Upper cover section */}
                    <div className="relative aspect-[16/10] overflow-hidden bg-slate-100 border-b border-slate-50 shrink-0">
                      {p.cover_url ? (
                        <img 
                          src={p.cover_url} 
                          alt={p.nama} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                        />
                      ) : (
                        <div className={`w-full h-full bg-gradient-to-br ${gradient} flex flex-col items-center justify-center p-6 text-white text-center`}>
                          <Icon size={44} className="opacity-80 mb-2 stroke-1" />
                          <p className="font-bold text-xs tracking-wider opacity-90 uppercase">{p.kategori}</p>
                        </div>
                      )}
                      
                      {/* Floating Category Badge */}
                      <div className={`absolute top-4 left-4 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold border ${badgeBg} ${badgeText} uppercase tracking-wider backdrop-blur-md shadow-sm bg-white/95`}>
                        <Icon size={10} />
                        <span>{p.kategori}</span>
                      </div>
                    </div>

                    {/* Content Section */}
                    <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                      <div className="space-y-2">
                        <h2 className="font-extrabold text-slate-900 leading-snug tracking-tight group-hover:text-indigo-600 transition-colors line-clamp-2" title={p.nama}>
                          {p.nama}
                        </h2>
                        
                        {/* Stats Info */}
                        <div className="flex flex-wrap items-center gap-3 text-xs font-bold text-slate-400">
                          {p.terjual > 0 && (
                            <span className="flex items-center gap-1">
                              <Users className="h-3.5 w-3.5 text-blue-500" />
                              {p.terjual} pendaftar
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5 text-indigo-500" />
                            {p.tanggal.split(" ")[0] || "-"}
                          </span>
                        </div>
                      </div>

                      {/* Pricing + Action CTA */}
                      <div className="flex items-center justify-between pt-4 border-t border-slate-50 shrink-0">
                        <span className="text-xl font-black text-slate-900 tracking-tight">
                          {formatHarga(p.harga)}
                        </span>

                        <button
                          onClick={() => router.visit(getProductPublicUrl(p))}
                          className="px-4 py-2.5 bg-indigo-50 hover:bg-indigo-600 text-indigo-700 hover:text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all duration-300 shadow-sm border border-indigo-100/50 hover:border-indigo-600"
                        >
                          Detail <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
}