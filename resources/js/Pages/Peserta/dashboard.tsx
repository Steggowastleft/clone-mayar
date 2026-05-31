import { router, Head, useForm } from "@inertiajs/react";
import { useState, useRef } from "react";
import { 
  BookOpen, 
  Clock, 
  Award, 
  User, 
  ChevronRight, 
  Play, 
  Star, 
  LayoutDashboard, 
  Package, 
  Settings, 
  LogOut, 
  Menu, 
  X, 
  Upload, 
  FileText, 
  Download, 
  CheckCircle2, 
  AlertCircle,
  Loader2
} from "lucide-react";
import RatingDialog from "./ratingdialog";
import PesertaLayout from "@/layouts/PesertaLayout";

type PurchasedProductItem = {
  id: number;
  name: string;
  cover_url?: string;
  kategori: string;
  type: string;
  status: string;
  tanggal_aktif: string;
  rating?: number | null;
  download_url?: string;
  owner_name?: string;
  batch?: string;
};

type Peserta = {
  id: number;
  nama: string;
  email: string;
  no_hp?: string;
  foto_url?: string;
};

type Props = {
  peserta: Peserta;
  purchasedProducts: PurchasedProductItem[];
};

export default function PesertaDashboard({
  peserta,
  purchasedProducts = []
}: Props) {
  const [activeTab, setActiveTab] = useState<"overview" | "products" | "settings">("overview");
  const [productFilter, setProductFilter] = useState<"all" | "bootcamp" | "kelas" | "digital">("all");
  const [ratingTarget, setRatingTarget] = useState<PurchasedProductItem | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(peserta.foto_url || null);

  // Form for account settings
  const { data, setData, post, processing, errors } = useForm({
    nama: peserta.nama || "",
    email: peserta.email || "",
    no_hp: peserta.no_hp || "",
    password: "",
    foto: null as File | null,
    _method: "POST"
  });

  const [productsList, setProductsList] = useState<PurchasedProductItem[]>(purchasedProducts);

  const totalProducts = productsList.length;
  const kelasOnlines = productsList.filter((p) => p.type === "kelas-online");
  const bootcamps = productsList.filter((p) => p.type === "bootcamp");
  const otherProducts = productsList.filter((p) => p.type !== "kelas-online" && p.type !== "bootcamp");

  const kelasOnlinesCount = kelasOnlines.length;
  const bootcampsCount = bootcamps.length;
  const otherProductsCount = otherProducts.length;

  const handleLogout = () => {
    router.post("/peserta/logout");
  };

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg("");
    setErrorMsg("");

    post("/peserta/profile/update", {
      onSuccess: () => {
        setSuccessMsg("Profil berhasil diperbarui!");
        setData("password", "");
      },
      onError: (err) => {
        setErrorMsg("Gagal memperbarui profil. Periksa kembali isian Anda.");
      }
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setData("foto", file);
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <>
      <Head title="Dashboard Member — BiinsCart" />
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cabinet+Grotesk:wght@400;500;700;800;900&family=Instrument+Serif:ital@0;1&display=swap');
        .font-cabinet  { font-family: 'Cabinet Grotesk', sans-serif; }
        .font-serif-in { font-family: 'Instrument Serif', serif; }
      `}</style>

      <div className="min-h-screen bg-slate-50 font-cabinet flex flex-col md:flex-row">
        {/* MOBILE HEADER */}
        <div className="md:hidden bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between sticky top-0 z-30 shadow-sm">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-md">
              <Package className="h-4 w-4 text-white" />
            </div>
            <span className="font-black text-slate-800 text-sm tracking-tight">BiinsCart Member</span>
          </div>
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)} 
            className="p-1 text-slate-500 hover:text-blue-600 transition"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* SIDEBAR */}
        <div className={`
          fixed inset-y-0 left-0 w-64 bg-white border-r border-slate-200 z-40 transform transition-transform duration-300 ease-in-out flex flex-col justify-between
          md:relative md:translate-x-0 md:z-0
          ${mobileMenuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
        `}>
          <div className="p-6">
            {/* Logo */}
            <div className="hidden md:flex items-center gap-2.5 mb-8">
              <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center shadow-md shadow-blue-200">
                <Package className="h-5 w-5 text-white" />
              </div>
              <span className="font-black text-slate-850 text-base tracking-tight">BiinsCart Member</span>
            </div>

            {/* Profile Summary */}
            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl mb-6 border border-slate-100">
              {avatarPreview ? (
                <img src={avatarPreview} alt={peserta.nama} className="w-10 h-10 rounded-full object-cover ring-2 ring-blue-100" />
              ) : (
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center border border-blue-200 text-blue-600 font-bold shrink-0">
                  {peserta.nama ? peserta.nama.charAt(0).toUpperCase() : <User className="h-5 w-5" />}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-slate-800 truncate">{peserta.nama}</p>
                <p className="text-[10px] text-slate-400 truncate">{peserta.email}</p>
              </div>
            </div>

            {/* Navigation Menu */}
            <nav className="space-y-1">
              <button
                onClick={() => { setActiveTab("overview"); setMobileMenuOpen(false); }}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  activeTab === "overview"
                    ? "bg-blue-600 text-white shadow-md shadow-blue-100"
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
                }`}
              >
                <LayoutDashboard className="h-4 w-4" />
                Beranda
              </button>

              <button
                onClick={() => { setActiveTab("products"); setMobileMenuOpen(false); }}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  activeTab === "products"
                    ? "bg-blue-600 text-white shadow-md shadow-blue-100"
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
                }`}
              >
                <Package className="h-4 w-4" />
                Produk yang Dibeli
              </button>
            </nav>
          </div>

          {/* Bottom Settings & Logout */}
          <div className="p-6 border-t border-slate-100 space-y-1">
            <button
              onClick={() => { setActiveTab("settings"); setMobileMenuOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === "settings"
                  ? "bg-blue-600 text-white shadow-md shadow-blue-100"
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
              }`}
            >
              <Settings className="h-4 w-4" />
              Setting Akun
            </button>

            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold text-red-500 hover:bg-red-50 transition-colors"
            >
              <LogOut className="h-4 w-4" />
              Keluar Akun
            </button>
          </div>
        </div>

        {/* MAIN CONTENT AREA */}
        <div className="flex-1 min-w-0 overflow-y-auto p-4 sm:p-8">
          
          {/* TAB 1: OVERVIEW */}
          {activeTab === "overview" && (
            <div className="max-w-4xl mx-auto space-y-6">
              {/* Gradient Hero */}
              <div 
                className="rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-lg shadow-blue-100"
                style={{ background: "linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)" }}
              >
                <div className="relative z-10 max-w-lg">
                  <span className="text-[10px] font-black uppercase tracking-widest bg-blue-500/35 border border-blue-400/40 px-3 py-1 rounded-full">
                    MEMBER PORTAL
                  </span>
                  <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight leading-tight mt-3">
                    Halo, {peserta.nama.split(" ")[0]}! 👋
                  </h1>
                  <p className="text-blue-100 text-xs sm:text-sm mt-2 leading-relaxed font-medium">
                    Akses kembali semua file digital, tulisan/artikel terkunci, video panduan, dan kelas online yang telah kamu beli di satu tempat yang aman.
                  </p>
                  <button 
                    onClick={() => setActiveTab("products")}
                    className="mt-5 px-5 py-2.5 bg-white text-blue-600 text-xs font-bold rounded-xl shadow-md hover:bg-blue-50 transition"
                  >
                    Buka Produk Saya
                  </button>
                </div>
                {/* Subtle background glow */}
                <div className="absolute right-0 bottom-0 w-64 h-64 bg-blue-400/20 rounded-full blur-[80px]" />
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  {
                    icon: <Package className="h-5 w-5 text-blue-600" />,
                    label: "Semua Produk",
                    value: totalProducts,
                    bg: "bg-blue-50",
                    border: "border-blue-100"
                  },
                  {
                    icon: <Play className="h-5 w-5 text-indigo-600" />,
                    label: "Kelas Online",
                    value: kelasOnlinesCount,
                    bg: "bg-indigo-50",
                    border: "border-indigo-100"
                  },
                  {
                    icon: <BookOpen className="h-5 w-5 text-emerald-600" />,
                    label: "Bootcamp",
                    value: bootcampsCount,
                    bg: "bg-emerald-50",
                    border: "border-emerald-100"
                  },
                ].map((stat, i) => (
                  <div key={i} className={`bg-white border ${stat.border} rounded-2xl p-5 flex items-center gap-4 shadow-sm hover:shadow-md transition-all duration-300`}>
                    <div className={`w-12 h-12 rounded-xl ${stat.bg} flex items-center justify-center shrink-0`}>
                      {stat.icon}
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{stat.label}</p>
                      <p className="text-xl font-black text-slate-900 mt-0.5">{stat.value}</p>
                    </div>
                  </div>
                ))}
              </div>
 
              {/* Recent Active Products */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
                  <h3 className="text-sm font-bold text-slate-800">Akses Terakhir</h3>
                  <button 
                    onClick={() => setActiveTab("products")}
                    className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1"
                  >
                    Lihat Semua <ChevronRight className="h-3 w-3" />
                  </button>
                </div>
 
                {totalProducts === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-6">Belum ada produk yang aktif.</p>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {purchasedProducts.slice(0, 4).map((p) => {
                      const isKelas = p.type === "kelas-online";
                      const isBootcamp = p.type === "bootcamp";
                      const iconBg = isKelas 
                        ? "bg-indigo-50 border-indigo-100 text-indigo-600" 
                        : isBootcamp 
                        ? "bg-emerald-50 border-emerald-100 text-emerald-600" 
                        : "bg-blue-50 border-blue-100 text-blue-600";
                      const targetUrl = p.download_url;

                      return (
                        <div 
                          key={`${p.type}-${p.id}`} 
                          onClick={() => targetUrl && router.visit(targetUrl)}
                          className="flex items-center justify-between py-3 cursor-pointer group hover:bg-slate-50 px-2 rounded-xl transition"
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 border rounded-lg flex items-center justify-center font-bold shrink-0 ${iconBg}`}>
                              {isKelas ? <Play className="h-4 w-4" /> : isBootcamp ? <BookOpen className="h-4 w-4" /> : <Package className="h-4 w-4" />}
                            </div>
                            <div>
                              <p className="text-xs font-bold text-slate-850 group-hover:text-blue-600 transition">{p.name}</p>
                              <p className="text-[10px] text-slate-400">
                                {p.kategori} {p.owner_name ? `· ${p.owner_name}` : p.batch ? `· ${p.batch}` : ""}
                              </p>
                            </div>
                          </div>
                          <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-blue-600 transition" />
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: PRODUCTS */}
          {activeTab === "products" && (
            <div className="max-w-4xl mx-auto space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
                    Produk yang Dibeli
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Berikut semua materi pembelajaran & konten digital milikmu
                  </p>
                </div>

                {/* Sub filters */}
                <div className="flex bg-slate-200/60 p-1 rounded-xl text-[10px] font-bold text-slate-500 self-start">
                  <button 
                    onClick={() => setProductFilter("all")}
                    className={`px-3 py-1.5 rounded-lg transition ${productFilter === "all" ? "bg-white text-slate-800 shadow-sm" : ""}`}
                  >
                    Semua ({totalProducts})
                  </button>
                  <button 
                    onClick={() => setProductFilter("kelas")}
                    className={`px-3 py-1.5 rounded-lg transition ${productFilter === "kelas" ? "bg-white text-slate-800 shadow-sm" : ""}`}
                  >
                    Kelas Online ({kelasOnlines.length})
                  </button>
                  <button 
                    onClick={() => setProductFilter("bootcamp")}
                    className={`px-3 py-1.5 rounded-lg transition ${productFilter === "bootcamp" ? "bg-white text-slate-800 shadow-sm" : ""}`}
                  >
                    Bootcamp ({bootcamps.length})
                  </button>
                  <button 
                    onClick={() => setProductFilter("digital")}
                    className={`px-3 py-1.5 rounded-lg transition ${productFilter === "digital" ? "bg-white text-slate-800 shadow-sm" : ""}`}
                  >
                    Produk Lain ({otherProducts.length})
                  </button>
                </div>
              </div>

              {/* Grid content */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                
                {/* ── Kelas Online Cards ── */}
                {(productFilter === "all" || productFilter === "kelas") && (
                  kelasOnlines.map((ko) => (
                    <div
                      key={ko.id}
                      onClick={() => router.visit(`/peserta/kelas-online/${ko.id}`)}
                      className="bg-white border border-slate-200 rounded-2xl overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer group flex flex-col h-full shadow-sm"
                    >
                      <div className="relative aspect-video overflow-hidden bg-indigo-100">
                        {ko.cover_url ? (
                          <img src={ko.cover_url} alt={ko.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
                            <Play className="h-12 w-12 text-white opacity-40 group-hover:opacity-100 transition-opacity" />
                          </div>
                        )}
                        <div className="absolute top-3 right-3">
                          <span className="bg-white/90 backdrop-blur px-2 py-1 rounded-lg text-[9px] font-black text-indigo-600 shadow-sm border border-indigo-50">
                            KELAS ONLINE
                          </span>
                        </div>
                      </div>

                      <div className="p-5 flex flex-col flex-1">
                        <div className="flex-1">
                          <h3 className="text-xs font-extrabold text-slate-850 line-clamp-2 leading-snug group-hover:text-blue-600 transition-colors">
                            {ko.name}
                          </h3>
                          <div className="flex items-center gap-2 mt-2">
                            <div className="w-5 h-5 rounded-full bg-slate-50 flex items-center justify-center shrink-0">
                              <User className="h-3 w-3 text-slate-400" />
                            </div>
                            <p className="text-[10px] text-slate-500 font-medium truncate">{ko.owner_name}</p>
                          </div>
                        </div>

                        <div className="mt-5 flex items-center justify-between">
                          <div className="flex items-center gap-1 text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1.5 rounded-xl transition-colors group-hover:bg-indigo-100">
                            <Play className="h-3 w-3" />
                            MASUK KELAS
                          </div>
                          <p className="text-[9px] font-bold text-slate-300 uppercase tracking-tighter">
                            Akses: {ko.tanggal_aktif}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                )}

                {/* ── Bootcamp Cards ── */}
                {(productFilter === "all" || productFilter === "bootcamp") && (
                  bootcamps.map((b) => (
                    <div
                      key={b.id}
                      className="bg-white border border-slate-200 rounded-2xl overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col h-full group shadow-sm"
                    >
                      <div className="relative aspect-video overflow-hidden cursor-pointer" onClick={() => router.visit(`/peserta/kelas/${b.id}`)}>
                        {b.cover_url ? (
                          <img src={b.cover_url} alt={b.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                            <BookOpen className="h-12 w-12 text-white opacity-40 group-hover:opacity-100 transition-opacity" />
                          </div>
                        )}
                        <div className="absolute top-3 right-3">
                          <span className={`px-2 py-1 rounded-lg text-[9px] font-black shadow-sm border border-white/20 backdrop-blur-md ${
                            b.status === "active"
                              ? "bg-emerald-500/90 text-white"
                              : b.status === "completed"
                              ? "bg-blue-600/90 text-white"
                              : "bg-yellow-500/90 text-white"
                          }`}>
                            {b.status === "completed" ? "SELESAI" : b.status === "active" ? "AKTIF" : "PENDING"}
                          </span>
                        </div>
                      </div>

                      <div className="p-5 flex flex-col flex-1">
                        <div className="flex-1 cursor-pointer" onClick={() => router.visit(`/peserta/kelas/${b.id}`)}>
                          {b.kategori && (
                            <p className="text-[9px] font-black text-blue-600 mb-1 uppercase tracking-widest">{b.kategori}</p>
                          )}
                          <h3 className="text-xs font-extrabold text-slate-850 line-clamp-2 leading-snug group-hover:text-blue-600 transition-colors">
                            {b.name}
                          </h3>
                          <div className="flex items-center gap-1.5 mt-1.5">
                            <Clock className="h-3 w-3 text-slate-400" />
                            <p className="text-[10px] text-slate-500 font-medium truncate">{b.batch}</p>
                          </div>
                        </div>

                        <div className="mt-4 pt-4 border-t border-slate-50 space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1" onClick={() => router.visit(`/peserta/kelas/${b.id}`)}>
                              <p className="text-[10px] font-bold text-blue-600 hover:underline cursor-pointer flex items-center gap-0.5">
                                Belajar <ChevronRight className="h-3 w-3" />
                              </p>
                            </div>
                            {b.rating ? (
                              <div className="flex items-center gap-0.5">
                                <Star className="h-2.5 w-2.5 text-yellow-400 fill-yellow-400" />
                                <span className="text-[9px] font-bold text-slate-500">{b.rating}</span>
                              </div>
                            ) : null}
                          </div>

                          {b.status === "completed" && (
                            <button
                              onClick={() => router.visit(`/peserta/bootcamp/${b.id}/sertifikat`)}
                              className="w-full flex items-center justify-center gap-1.5 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-[10px] font-extrabold rounded-xl shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all"
                            >
                              <Award className="h-3.5 w-3.5" /> AMBIL SERTIFIKAT
                            </button>
                          )}

                          <button
                            onClick={() => setRatingTarget(b)}
                            className={`w-full py-1.5 text-[10px] font-bold rounded-xl border transition-all ${
                              b.rating
                                ? "border-slate-250 text-slate-500 hover:bg-slate-50"
                                : "border-yellow-200 text-yellow-600 bg-yellow-50 hover:bg-yellow-100"
                            }`}
                          >
                            {b.rating ? "EDIT ULASAN" : "BERI ULASAN"}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}

                {/* ── Other Products (Ebook, Webinar, etc.) Cards ── */}
                {(productFilter === "all" || productFilter === "digital") && (
                  otherProducts.map((p) => (
                    <div
                      key={`${p.type}-${p.id}`}
                      className="bg-white border border-slate-200 rounded-2xl overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col h-full group shadow-sm"
                    >
                      <div className="relative aspect-video overflow-hidden bg-slate-100 flex items-center justify-center p-4">
                        {p.cover_url ? (
                          <img src={p.cover_url} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 rounded-lg shadow-sm" />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-indigo-50 to-slate-200 flex flex-col items-center justify-center text-slate-400">
                            <BookOpen className="h-10 w-10 text-slate-300 mb-1" />
                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wide">{p.kategori}</span>
                          </div>
                        )}
                        <div className="absolute top-3 right-3">
                          <span className="bg-slate-900/90 text-white px-2 py-1 rounded-lg text-[9px] font-black tracking-wide border border-slate-700">
                            {p.kategori.toUpperCase()}
                          </span>
                        </div>
                      </div>

                      <div className="p-5 flex flex-col flex-1">
                        <div className="flex-1">
                          <h3 className="text-xs font-extrabold text-slate-850 line-clamp-2 leading-snug group-hover:text-blue-600 transition-colors">
                            {p.name}
                          </h3>
                          <p className="text-[10px] text-slate-400 mt-1">Status: <span className="text-emerald-600 font-bold uppercase">{p.status}</span></p>
                        </div>

                        <div className="mt-5 flex items-center justify-between gap-2">
                          {p.download_url ? (
                            <button
                              onClick={() => p.download_url && router.visit(p.download_url)}
                              className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-extrabold rounded-xl shadow-md transition-all text-center"
                            >
                              {p.type === 'ebook' ? (
                                <>
                                  <BookOpen className="h-3.5 w-3.5" /> BACA EBOOK
                                </>
                              ) : p.type === 'tulisan' ? (
                                <>
                                  <BookOpen className="h-3.5 w-3.5" /> BACA TULISAN
                                </>
                              ) : p.type === 'webinar' ? (
                                <>
                                  <Play className="h-3.5 w-3.5" /> IKUTI WEBINAR
                                </>
                              ) : p.type === 'event' ? (
                                <>
                                  <Play className="h-3.5 w-3.5" /> DETAIL EVENT
                                </>
                              ) : p.type === 'coaching-mentoring' ? (
                                <>
                                  <Clock className="h-3.5 w-3.5" /> DETAIL COACHING
                                </>
                              ) : p.type === 'bundling' ? (
                                <>
                                  <Package className="h-3.5 w-3.5" /> LIHAT BUNDLE
                                </>
                              ) : (
                                <>
                                  <BookOpen className="h-3.5 w-3.5" /> BUKA PRODUK
                                </>
                              )}
                            </button>
                          ) : (
                            <span className="text-[10px] font-bold text-slate-400 italic">
                              Tidak ada tautan akses
                            </span>
                          )}
                          <p className="text-[9px] font-bold text-slate-300 uppercase shrink-0">
                            {p.tanggal_aktif}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {totalProducts === 0 && (
                <div className="bg-white border-2 border-dashed border-slate-200 rounded-3xl p-12 text-center">
                  <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
                    <Package className="h-8 w-8 text-slate-300" />
                  </div>
                  <p className="text-sm font-semibold text-slate-500">Kamu belum membeli produk apa pun</p>
                  <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">Jelajahi berbagai file digital, produk, dan kelas online di toko kami sekarang.</p>
                  <button
                    onClick={() => router.visit("/")}
                    className="mt-4 px-5 py-2.5 bg-blue-600 text-white text-xs font-bold rounded-xl shadow-lg shadow-blue-200 hover:bg-blue-700 transition"
                  >
                    Kembali ke Beranda Toko
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: ACCOUNT SETTINGS */}
          {activeTab === "settings" && (
            <div className="max-w-xl mx-auto">
              <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm">
                
                <div className="mb-6">
                  <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
                    Pengaturan Profil
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Kelola informasi dasar akun member kamu
                  </p>
                </div>

                {successMsg && (
                  <div className="mb-6 p-4 bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-xl flex items-start gap-2.5 text-xs font-medium">
                    <CheckCircle2 className="h-4.5 w-4.5 text-emerald-500 shrink-0 mt-0.5" />
                    <p>{successMsg}</p>
                  </div>
                )}

                {errorMsg && (
                  <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-700 rounded-xl flex items-start gap-2.5 text-xs font-medium">
                    <AlertCircle className="h-4.5 w-4.5 text-red-500 shrink-0 mt-0.5" />
                    <p>{errorMsg}</p>
                  </div>
                )}

                <form onSubmit={handleProfileSubmit} className="space-y-5">
                  {/* Photo Uploader */}
                  <div className="flex flex-col items-center gap-3 pb-4 border-b border-slate-100">
                    <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                      {avatarPreview ? (
                        <img src={avatarPreview} alt={peserta.nama} className="w-20 h-20 rounded-full object-cover ring-4 ring-blue-50" />
                      ) : (
                        <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center border border-blue-200 text-blue-600 font-bold text-2xl">
                          {data.nama ? data.nama.charAt(0).toUpperCase() : <User className="h-10 w-10" />}
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Upload className="h-5 w-5 text-white" />
                      </div>
                    </div>
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      className="hidden" 
                      accept="image/*" 
                      onChange={handleFileChange} 
                    />
                    <button 
                      type="button" 
                      onClick={() => fileInputRef.current?.click()}
                      className="text-xs font-bold text-blue-600 hover:text-blue-700"
                    >
                      Unggah Foto Baru
                    </button>
                    {errors.foto && <p className="text-red-400 text-xs">{errors.foto}</p>}
                  </div>

                  {/* Form fields */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Nama Lengkap</label>
                    <input 
                      type="text" 
                      className={`w-full border border-slate-200 bg-slate-50/50 rounded-xl px-4 py-2.5 text-xs text-slate-800 outline-none focus:border-blue-600 focus:bg-white transition ${errors.nama ? "border-red-300" : ""}`}
                      value={data.nama} 
                      onChange={(e) => setData("nama", e.target.value)} 
                      placeholder="Nama Lengkap Anda" 
                    />
                    {errors.nama && <p className="text-red-400 text-xs">{errors.nama}</p>}
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Email</label>
                    <input 
                      type="email" 
                      className={`w-full border border-slate-200 bg-slate-50/50 rounded-xl px-4 py-2.5 text-xs text-slate-800 outline-none focus:border-blue-600 focus:bg-white transition ${errors.email ? "border-red-300" : ""}`}
                      value={data.email} 
                      onChange={(e) => setData("email", e.target.value)} 
                      placeholder="email@anda.com" 
                    />
                    {errors.email && <p className="text-red-400 text-xs">{errors.email}</p>}
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">No. WhatsApp</label>
                    <input 
                      type="text" 
                      className={`w-full border border-slate-200 bg-slate-50/50 rounded-xl px-4 py-2.5 text-xs text-slate-800 outline-none focus:border-blue-600 focus:bg-white transition ${errors.no_hp ? "border-red-300" : ""}`}
                      value={data.no_hp} 
                      onChange={(e) => setData("no_hp", e.target.value)} 
                      placeholder="Contoh: 08123456789" 
                    />
                    {errors.no_hp && <p className="text-red-400 text-xs">{errors.no_hp}</p>}
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Ganti Password (Opsional)</label>
                    <input 
                      type="password" 
                      className={`w-full border border-slate-200 bg-slate-50/50 rounded-xl px-4 py-2.5 text-xs text-slate-800 outline-none focus:border-blue-600 focus:bg-white transition ${errors.password ? "border-red-300" : ""}`}
                      value={data.password} 
                      onChange={(e) => setData("password", e.target.value)} 
                      placeholder="Kosongkan jika tidak ingin mengubah" 
                    />
                    {errors.password && <p className="text-red-400 text-xs">{errors.password}</p>}
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={processing}
                      className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-black text-xs py-3 rounded-xl transition-all shadow-md shadow-blue-100 flex items-center justify-center gap-2"
                    >
                      {processing ? <Loader2 className="h-4.5 w-4.5 animate-spin" /> : "Simpan Perubahan"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>

        {/* Rating Dialog */}
        {ratingTarget && (
          <RatingDialog
            open={!!ratingTarget}
            onOpenChange={(v) => { if (!v) setRatingTarget(null); }}
            bootcampId={ratingTarget.id}
            bootcampName={ratingTarget.name}
            existingRating={ratingTarget.rating ? { id: 0, bintang: ratingTarget.rating, tampil_anonim: false } : null}
            onSuccess={(r) => {
              setProductsList((prev) => prev.map((item) => item.id === ratingTarget.id && item.type === "bootcamp" ? { ...item, rating: r.bintang } : item));
              setRatingTarget(null);
            }}
          />
        )}
      </div>
    </>
  );
}