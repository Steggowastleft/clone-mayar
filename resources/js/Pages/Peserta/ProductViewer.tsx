import { Head, router, Link } from "@inertiajs/react";
import { useState, useRef } from "react";
import {
  BookOpen,
  Clock,
  User,
  ChevronRight,
  ChevronLeft,
  Play,
  Package,
  Settings,
  LogOut,
  Menu,
  X,
  Download,
  AlertCircle,
  Calendar,
  MapPin,
  ExternalLink,
  BookMarked,
  Info,
  Users,
  Moon,
  Sun,
  Eye,
  Type
} from "lucide-react";

type Peserta = {
  id: number;
  nama: string;
  email: string;
  no_hp?: string;
  foto_url?: string;
};

type Product = {
  id: number;
  nama: string;
  cover?: string;
  deskripsi: string | null;
  created_at: string;
  file_url?: string | null;
  author?: string;
  isbn?: string | null;
  format?: string;
  bahasa?: string;
  jumlah_halaman?: number | null;
  bisa_didownload?: boolean;
  tipe_tulisan?: string;
  genre?: string;
  reading_time?: number;
  link_zoom?: string | null;
  tanggal_mulai?: string | null;
  tanggal_selesai?: string | null;
  instruksi?: string | null;
  syarat_ketentuan?: string | null;
  timezone?: string;
  pembicaras?: Array<{ nama: string; pekerjaan: string; profil: string; foto: string | null }>;
  lokasi?: string;
  tanggal_event?: string | null;
  redirect_url?: string | null;
  booking_url?: string | null;
  pesan_setelah_bayar?: string | null;
  bundle_items?: Array<{ id: number; name: string; type: string; url: string }>;
};

type Registration = {
  id: number;
  tanggal_aktif: string;
  status: string;
  order_id?: string | null;
};

type Props = {
  peserta: Peserta;
  product: Product;
  productType: string;
  registration: Registration;
};

type ReadingTheme = "light" | "sepia" | "dark";
type FontSize = "sm" | "base" | "lg" | "xl" | "2xl";

const getFileType = (url: string) => {
  const cleanUrl = url.split("?")[0].toLowerCase();
  if (cleanUrl.endsWith(".pdf")) return "pdf";
  if (cleanUrl.endsWith(".png") || cleanUrl.endsWith(".jpg") || cleanUrl.endsWith(".jpeg") || cleanUrl.endsWith(".webp") || cleanUrl.endsWith(".gif") || cleanUrl.endsWith(".svg")) return "image";
  if (cleanUrl.endsWith(".mp4") || cleanUrl.endsWith(".webm") || cleanUrl.endsWith(".ogg")) return "video";
  if (cleanUrl.endsWith(".mp3") || cleanUrl.endsWith(".wav") || cleanUrl.endsWith(".m4a")) return "audio";
  return "other";
};

function FilePreview({ url, name }: { url: string; name: string }) {
  const type = getFileType(url);

  if (type === "pdf") {
    return (
      <div className="space-y-3 bg-white border border-slate-200 rounded-3xl p-4 shadow-sm">
        <div className="flex justify-between items-center px-2">
          <p className="text-xs font-bold text-slate-700 flex items-center gap-2">
            <Eye size={14} className="text-blue-500" /> Pratinjau Dokumen PDF
          </p>
          <p className="text-[10px] text-slate-400 font-semibold">Sembunyikan sidebar untuk ruang baca maksimal</p>
        </div>
        <div className="relative aspect-[3/4] sm:h-[800px] w-full rounded-2xl overflow-hidden border border-slate-100 bg-slate-50 shadow-inner">
          <embed
            src={`${url}#toolbar=0&navpanes=0`}
            type="application/pdf"
            className="w-full h-full"
          />
        </div>
      </div>
    );
  }

  if (type === "image") {
    return (
      <div className="space-y-3 bg-white border border-slate-200 rounded-3xl p-4 shadow-sm flex flex-col items-center">
        <p className="text-xs font-bold text-slate-700 self-start px-2 flex items-center gap-2">
          <Eye size={14} className="text-blue-500" /> Pratinjau Gambar
        </p>
        <div className="max-w-full rounded-2xl overflow-hidden border border-slate-100 bg-slate-50 p-2 shadow-inner">
          <img src={url} alt={name} className="max-w-full h-auto max-h-[650px] rounded-xl object-contain" />
        </div>
      </div>
    );
  }

  if (type === "video") {
    return (
      <div className="space-y-3 bg-white border border-slate-200 rounded-3xl p-4 shadow-sm">
        <p className="text-xs font-bold text-slate-700 px-2 flex items-center gap-2">
          <Play size={14} className="text-blue-500" /> Putar Video
        </p>
        <div className="aspect-video w-full rounded-2xl overflow-hidden border border-slate-100 bg-black shadow-lg">
          <video src={url} controls className="w-full h-full" />
        </div>
      </div>
    );
  }

  if (type === "audio") {
    return (
      <div className="space-y-3 bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
        <p className="text-xs font-bold text-slate-700 flex items-center gap-2">
          <Play size={14} className="text-blue-500" /> Putar Audio
        </p>
        <div className="w-full bg-slate-50 border border-slate-150 p-4 rounded-2xl shadow-inner">
          <audio src={url} controls className="w-full" />
        </div>
      </div>
    );
  }

  return null;
}

export default function ProductViewer({
  peserta,
  product,
  productType,
  registration
}: Props) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Tulisan Reader Settings
  const [theme, setTheme] = useState<ReadingTheme>("sepia");
  const [fontSize, setFontSize] = useState<FontSize>("lg");

  const handleLogout = () => {
    router.post("/peserta/logout");
  };

  // Font size mapping for Tulisan Reader
  const fontSizeClasses: Record<FontSize, string> = {
    sm: "text-sm leading-relaxed",
    base: "text-base leading-relaxed",
    lg: "text-lg md:text-xl leading-loose",
    xl: "text-xl md:text-2xl leading-loose",
    "2xl": "text-2xl md:text-3xl leading-loose",
  };

  // Theme color mapping for Tulisan Reader
  const themeClasses: Record<ReadingTheme, string> = {
    light: "bg-slate-50 text-slate-800 border-slate-200/60",
    sepia: "bg-[#F9F6EE] text-[#433422] border-[#E8DFC8]",
    dark: "bg-zinc-900 text-zinc-100 border-zinc-800",
  };

  const getThemeBg = () => {
    if (theme === "sepia") return "bg-[#FCFBF7]";
    if (theme === "dark") return "bg-zinc-950";
    return "bg-white";
  };

  return (
    <>
      <Head title={`${product.nama} — Member Portal`} />
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cabinet+Grotesk:wght@400;500;700;800;900&family=Lora:ital,wght@0,400;0,500;0,600;0,700;1,400;1,700&family=Plus+Jakarta+Sans:wght@300;400;500;600;700;850&display=swap');
        .font-cabinet  { font-family: 'Cabinet Grotesk', sans-serif; }
        .font-lora { font-family: 'Lora', Georgia, serif; }
        .font-sans-custom { font-family: 'Plus Jakarta Sans', sans-serif; }
      `}</style>

      <div className={`min-h-screen ${productType === 'tulisan' ? getThemeBg() : 'bg-slate-50'} font-sans-custom flex flex-col md:flex-row transition-colors duration-300 relative`}>
        {/* Mobile Menu Dark Overlay */}
        {mobileMenuOpen && (
          <div
            onClick={() => setMobileMenuOpen(false)}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-35 md:hidden"
          />
        )}

        {/* MOBILE HEADER */}
        <div className="md:hidden bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between sticky top-0 z-30 shadow-sm w-full">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-md">
              <Package className="h-4 w-4 text-white" />
            </div>
            <span className="font-extrabold text-slate-800 text-sm tracking-tight">Member Portal</span>
          </div>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1 text-slate-500 hover:text-blue-600 transition"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* SIDEBAR */}
        <div
          className={`
            fixed inset-y-0 left-0 w-64 bg-white border-r border-slate-250 z-40 transform transition-all duration-300 ease-in-out flex flex-col justify-between
            ${mobileMenuOpen ? "translate-x-0" : "-translate-x-full"}
            md:relative
            ${sidebarCollapsed ? "md:-translate-x-full md:w-0 md:opacity-0 md:border-r-0 md:pointer-events-none" : "md:translate-x-0 md:w-64"}
          `}
        >
          <div className="p-6 flex-1 flex flex-col min-h-0">
            {/* Logo */}
            <div className="flex items-center justify-between mb-8">
              <Link href="/peserta/dashboard" className="flex items-center gap-2.5">
                <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center shadow-md shadow-blue-200">
                  <Package className="h-5 w-5 text-white" />
                </div>
                <span className="font-black text-slate-850 text-base tracking-tight">BiinsCart Member</span>
              </Link>
              <button
                onClick={() => {
                  if (window.innerWidth < 768) {
                    setMobileMenuOpen(false);
                  } else {
                    setSidebarCollapsed(true);
                  }
                }}
                className="flex p-1.5 text-slate-400 hover:text-slate-650 rounded-lg hover:bg-slate-100 transition border border-slate-200/50 shadow-sm"
                title="Tutup Menu"
              >
                <ChevronLeft size={16} />
              </button>
            </div>

            {/* Profile Summary */}
            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl mb-6 border border-slate-100">
              {peserta.foto_url ? (
                <img src={peserta.foto_url} alt={peserta.nama} className="w-10 h-10 rounded-full object-cover ring-2 ring-blue-100" />
              ) : (
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center border border-blue-200 text-blue-600 font-bold shrink-0">
                  {peserta.nama ? peserta.nama.charAt(0).toUpperCase() : <User className="h-5 w-5" />}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-slate-850 truncate">{peserta.nama}</p>
                <p className="text-[10px] text-slate-450 truncate">{peserta.email}</p>
              </div>
            </div>

            {/* Back Button */}
            <nav className="space-y-1">
              <Link
                href="/peserta/dashboard"
                className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-all border border-transparent"
              >
                <ChevronLeft className="h-4 w-4 text-slate-550" />
                Kembali ke Beranda
              </Link>
            </nav>

            {/* Product Quick Info Card */}
            <div className="mt-8 p-4 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100/50 space-y-3">
              <span className="text-[9px] font-black uppercase tracking-wider text-blue-600 px-2 py-0.5 bg-white rounded-md border border-blue-100">
                Akses Aktif
              </span>
              <p className="text-xs font-extrabold text-slate-800 line-clamp-2 mt-1 leading-snug">{product.nama}</p>
              <div className="text-[10px] text-slate-500 font-semibold space-y-1">
                <p>Aktif: {registration.tanggal_aktif}</p>
                {registration.order_id && <p>Order ID: {registration.order_id}</p>}
              </div>
            </div>
          </div>

          {/* Bottom Settings & Logout */}
          <div className="p-6 border-t border-slate-100 space-y-1 bg-white">
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
        <div className="flex-1 min-w-0 flex flex-col">
          {/* TOP NAV BAR (With Sidebar Collapsible Toggle) */}
          <div className={`px-4 sm:px-8 py-3.5 flex items-center justify-between border-b ${productType === 'tulisan' ? 'border-slate-200/50' : 'bg-white border-slate-200'} sticky top-0 z-20`}>
            <div className="flex items-center gap-3">
              {sidebarCollapsed && (
                <button
                  onClick={() => setSidebarCollapsed(false)}
                  className="hidden md:flex items-center justify-center w-8 h-8 rounded-xl bg-white border border-slate-200 text-slate-500 hover:text-slate-800 hover:border-slate-300 shadow-sm transition"
                  title="Tampilkan Sidebar"
                >
                  <ChevronRight size={18} />
                </button>
              )}
              <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                <span>Portal Member</span>
                <ChevronRight size={10} />
                <span className="text-slate-700 font-bold lowercase italic">{productType}</span>
              </h2>
            </div>

            <div className="flex items-center gap-4">
              <span className="text-[10px] font-bold text-slate-400 bg-slate-100 rounded-full px-3 py-1.5 hidden sm:inline-block">
                Member ID: #{peserta.id}
              </span>
            </div>
          </div>

          {/* DYNAMIC VIEWER PANEL */}
          <div className="flex-1 p-4 sm:p-8 overflow-y-auto">
            <div className="max-w-4xl mx-auto">
              
              {/* 1. EBOOK VIEWER */}
              {productType === "ebook" && (
                <div className="space-y-6">
                  <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col md:flex-row gap-8 items-start">
                    <div className="w-full md:w-1/3 max-w-[200px] shrink-0 mx-auto md:mx-0">
                      <div className="aspect-[3/4] bg-slate-50 rounded-2xl overflow-hidden shadow-lg border border-slate-200">
                        {product.cover ? (
                          <img src={product.cover} alt={product.nama} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 p-4 text-center">
                            <BookOpen size={48} className="text-slate-350 mb-1" />
                            <p className="text-xs italic">No Cover</p>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex-1 space-y-4">
                      <div className="space-y-2">
                        <span className="bg-blue-100 text-blue-800 text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full">
                          E-BOOK
                        </span>
                        <h1 className="text-xl sm:text-2xl font-black text-slate-900 leading-tight">{product.nama}</h1>
                        <p className="text-xs font-semibold text-slate-500">Karya: <span className="text-slate-800">{product.author}</span></p>
                      </div>

                      {product.deskripsi && (
                        <div className="prose prose-slate max-w-none text-xs text-slate-500 leading-relaxed font-medium">
                          {product.deskripsi}
                        </div>
                      )}

                      {/* Ebook spec grid */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                        <div>
                          <p className="text-[9px] text-slate-400 font-bold uppercase">Format</p>
                          <p className="text-xs font-black text-slate-800 mt-0.5">{product.format}</p>
                        </div>
                        <div>
                          <p className="text-[9px] text-slate-400 font-bold uppercase">Halaman</p>
                          <p className="text-xs font-black text-slate-800 mt-0.5">{product.jumlah_halaman ?? '-'}</p>
                        </div>
                        <div>
                          <p className="text-[9px] text-slate-400 font-bold uppercase">Bahasa</p>
                          <p className="text-xs font-black text-slate-800 mt-0.5">{product.bahasa}</p>
                        </div>
                        <div>
                          <p className="text-[9px] text-slate-400 font-bold uppercase">ISBN</p>
                          <p className="text-xs font-black text-slate-800 mt-0.5">{product.isbn ?? '-'}</p>
                        </div>
                      </div>

                      {product.bisa_didownload && product.file_url && (
                        <a
                          href={product.file_url}
                          download
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white text-xs font-extrabold rounded-xl shadow-md transition"
                        >
                          <Download size={14} /> UNDUH E-BOOK LENGKAP
                        </a>
                      )}
                    </div>
                  </div>

                  {product.file_url && (
                    <FilePreview url={product.file_url} name={product.nama} />
                  )}
                </div>
              )}

              {/* 2. TULISAN / ARTIKEL READER */}
              {productType === "tulisan" && (
                <div className="space-y-6">
                  {/* Reading settings panel */}
                  <div className="bg-white/80 backdrop-blur border border-slate-200 rounded-3xl p-4 sm:p-5 flex flex-wrap justify-between items-center gap-4 shadow-sm">
                    <div className="flex items-center gap-3">
                      <BookMarked className="text-amber-500" size={20} />
                      <div>
                        <h1 className="text-sm font-extrabold text-slate-800 line-clamp-1">{product.nama}</h1>
                        <p className="text-[10px] text-slate-450 font-bold uppercase tracking-wider mt-0.5">
                          {product.genre || 'General'} · {product.reading_time || 5} menit baca
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      {/* Theme selection */}
                      <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200/50">
                        {(["light", "sepia", "dark"] as ReadingTheme[]).map((t) => (
                          <button
                            key={t}
                            onClick={() => setTheme(t)}
                            className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition ${
                              theme === t
                                ? "bg-white text-slate-800 shadow-sm"
                                : "text-slate-400 hover:text-slate-600"
                            }`}
                          >
                            {t}
                          </button>
                        ))}
                      </div>

                      {/* Font size adjustments */}
                      <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl border border-slate-200/50">
                        <button
                          onClick={() => setFontSize(fontSize === "2xl" ? "xl" : fontSize === "xl" ? "lg" : fontSize === "lg" ? "base" : "sm")}
                          disabled={fontSize === "sm"}
                          className="w-8 h-8 flex items-center justify-center text-slate-500 hover:text-slate-800 disabled:opacity-30 transition font-bold"
                          title="Perkecil Font"
                        >
                          A-
                        </button>
                        <span className="w-0.5 h-4 bg-slate-250 inline-block" />
                        <button
                          onClick={() => setFontSize(fontSize === "sm" ? "base" : fontSize === "base" ? "lg" : fontSize === "lg" ? "xl" : "2xl")}
                          disabled={fontSize === "2xl"}
                          className="w-8 h-8 flex items-center justify-center text-slate-500 hover:text-slate-800 disabled:opacity-30 transition font-bold"
                          title="Perbesar Font"
                        >
                          A+
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Clean, distraction-free reading content */}
                  <div className={`rounded-3xl p-6 sm:p-12 md:p-16 border shadow-sm transition-all duration-300 ${themeClasses[theme]}`}>
                    <div className="max-w-2xl mx-auto space-y-8 font-lora">
                      <div className="text-center space-y-3 font-sans-custom pb-6 border-b border-dashed border-slate-300/30">
                        <h2 className="text-2xl sm:text-3xl font-black tracking-tight leading-tight">
                          {product.nama}
                        </h2>
                        <div className="flex items-center justify-center gap-2 text-xs font-semibold opacity-70">
                          <span>Oleh: {product.author}</span>
                          <span>·</span>
                          <span>{product.bahasa}</span>
                          <span>·</span>
                          <span>Diterbitkan {product.created_at}</span>
                        </div>
                      </div>

                      <div className={`${fontSizeClasses[fontSize]} whitespace-pre-wrap leading-loose tracking-wide font-medium`}>
                        {product.deskripsi || (
                          <div className="text-center py-12 italic opacity-60">
                            Isi tulisan belum diunggah oleh penulis.
                          </div>
                        )}
                      </div>

                      {/* End of content marker */}
                      <div className="pt-10 flex flex-col items-center justify-center text-center opacity-60 border-t border-dashed border-slate-300/30 font-sans-custom space-y-2">
                        <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                        <p className="text-[10px] font-bold tracking-widest uppercase mt-1">Selesai Membaca</p>
                        <p className="text-[9px]">Terima kasih telah membaca karya ini secara legal.</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* 3. WEBINAR PANEL */}
              {productType === "webinar" && (
                <div className="space-y-6">
                  {/* Hero card */}
                  <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
                    <div className="aspect-video relative bg-slate-100">
                      {product.cover ? (
                        <img src={product.cover} alt={product.nama} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center">
                          <Play className="h-16 w-16 text-white opacity-40" />
                        </div>
                      )}
                      <div className="absolute top-4 right-4">
                        <span className="bg-white/90 backdrop-blur px-3 py-1 rounded-xl text-[10px] font-black text-indigo-600 shadow-sm">
                          WEBINAR
                        </span>
                      </div>
                    </div>

                    <div className="p-6 sm:p-8 space-y-5">
                      <div className="space-y-2">
                        <h1 className="text-xl sm:text-2xl font-black text-slate-850 leading-tight">{product.nama}</h1>
                        <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-500">
                          <div className="flex items-center gap-1.5 text-indigo-600">
                            <Calendar size={14} />
                            <span>Mulai: {product.tanggal_mulai ?? '-'}</span>
                          </div>
                          <span>·</span>
                          <div className="flex items-center gap-1.5">
                            <Clock size={14} />
                            <span>Timezone: {product.timezone}</span>
                          </div>
                        </div>
                      </div>

                      {product.link_zoom ? (
                        <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                          <div>
                            <p className="text-xs font-bold text-emerald-800">Tautan Webinar Tersedia</p>
                            <p className="text-[10px] text-emerald-600 font-semibold mt-0.5">Silakan bergabung pada waktu yang ditentukan.</p>
                          </div>
                          <a
                            href={product.link_zoom}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 justify-center shrink-0 transition"
                          >
                            <ExternalLink size={14} /> GABUNG WEBINAR
                          </a>
                        </div>
                      ) : (
                        <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl">
                          <p className="text-xs font-bold text-slate-700">Tautan belum tersedia</p>
                          <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Link webinar akan dikirimkan/diperbarui sebelum jadwal dimulai.</p>
                        </div>
                      )}

                      {product.deskripsi && (
                        <div className="space-y-2 pt-2 border-t border-slate-50">
                          <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wide">Tentang Webinar</h4>
                          <p className="text-xs text-slate-550 leading-relaxed whitespace-pre-wrap">{product.deskripsi}</p>
                        </div>
                      )}

                      {product.instruksi && (
                        <div className="p-4 bg-blue-50 border border-blue-100/50 rounded-2xl space-y-1.5">
                          <h4 className="text-xs font-bold text-blue-800 flex items-center gap-1.5">
                            <Info size={14} /> Instruksi Peserta
                          </h4>
                          <p className="text-xs text-blue-700/90 leading-relaxed whitespace-pre-wrap">{product.instruksi}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Speakers section */}
                  {product.pembicaras && product.pembicaras.length > 0 && (
                    <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
                      <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
                        <Users size={16} className="text-indigo-500" /> Narasumber / Pembicara
                      </h3>
                      <div className="grid sm:grid-cols-2 gap-6">
                        {product.pembicaras.map((pem, idx) => (
                          <div key={idx} className="flex gap-4 items-start p-3 bg-slate-50 rounded-2xl border border-slate-100">
                            {pem.foto ? (
                              <img src={pem.foto} alt={pem.nama} className="w-12 h-12 rounded-full object-cover shrink-0 border border-slate-200" />
                            ) : (
                              <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center border border-indigo-200 text-indigo-600 font-bold shrink-0">
                                {pem.nama.charAt(0)}
                              </div>
                            )}
                            <div>
                              <p className="text-xs font-extrabold text-slate-800">{pem.nama}</p>
                              <p className="text-[10px] text-slate-400 font-bold">{pem.pekerjaan}</p>
                              <p className="text-[10px] text-slate-500 mt-1.5 leading-relaxed">{pem.profil}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* 4. EVENT PANEL */}
              {productType === "event" && (
                <div className="space-y-6">
                  <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
                    <div className="aspect-video relative bg-slate-100">
                      {product.cover ? (
                        <img src={product.cover} alt={product.nama} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
                          <Calendar className="h-16 w-16 text-white opacity-45" />
                        </div>
                      )}
                      <div className="absolute top-4 right-4">
                        <span className="bg-white/90 backdrop-blur px-3 py-1 rounded-xl text-[10px] font-black text-amber-600 shadow-sm border border-amber-50">
                          EVENT
                        </span>
                      </div>
                    </div>

                    <div className="p-6 sm:p-8 space-y-6">
                      <div className="space-y-2">
                        <h1 className="text-xl sm:text-2xl font-black text-slate-850 leading-tight">{product.nama}</h1>
                        <div className="flex flex-wrap gap-4 text-xs font-semibold text-slate-500">
                          <div className="flex items-center gap-1.5 text-amber-600">
                            <Calendar size={14} />
                            <span>Waktu: {product.tanggal_event ?? '-'}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <MapPin size={14} />
                            <span>Lokasi: {product.lokasi}</span>
                          </div>
                        </div>
                      </div>

                      {product.redirect_url && (
                        <div className="p-4 bg-amber-50 border border-amber-100 rounded-2xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                          <div>
                            <p className="text-xs font-bold text-amber-800">Tautan Akses Tiket / Event</p>
                            <p className="text-[10px] text-amber-600 font-semibold mt-0.5">Akses portal event eksternal atau tiket elektronik Anda.</p>
                          </div>
                          <a
                            href={product.redirect_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 justify-center shrink-0 shadow transition"
                          >
                            <ExternalLink size={14} /> BUKA PORTAL EVENT
                          </a>
                        </div>
                      )}

                      {product.deskripsi && (
                        <div className="space-y-2 pt-2 border-t border-slate-55">
                          <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wide">Detail Acara</h4>
                          <p className="text-xs text-slate-550 leading-relaxed whitespace-pre-wrap">{product.deskripsi}</p>
                        </div>
                      )}

                      {product.instruksi && (
                        <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl space-y-1.5">
                          <h4 className="text-xs font-bold text-slate-755 flex items-center gap-1.5">
                            <Info size={14} /> Petunjuk Masuk & Konfirmasi
                          </h4>
                          <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-wrap">{product.instruksi}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* 5. COACHING & MENTORING PANEL */}
              {productType === "coaching-mentoring" && (
                <div className="space-y-6">
                  <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
                    <div className="space-y-2">
                      <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border border-emerald-100">
                        COACHING & MENTORING
                      </span>
                      <h1 className="text-xl sm:text-2xl font-black text-slate-850 mt-2">{product.nama}</h1>
                    </div>

                    <div className="flex flex-col md:flex-row gap-6 items-start">
                      {product.cover && (
                        <img src={product.cover} alt={product.nama} className="w-full md:w-1/3 rounded-2xl object-cover border border-slate-100 shadow-sm" />
                      )}
                      <div className="flex-1 space-y-4">
                        {product.booking_url ? (
                          <div className="p-5 bg-emerald-50/70 border border-emerald-100 rounded-2xl space-y-3">
                            <div>
                              <p className="text-xs font-bold text-emerald-800">Booking Sesi Mentoring</p>
                              <p className="text-[10px] text-emerald-600 font-semibold mt-0.5">Silakan atur tanggal & waktu pertemuan tatap muka online dengan mentor Anda.</p>
                            </div>
                            <a
                              href={product.booking_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold rounded-xl shadow transition"
                            >
                              <Calendar size={14} /> BOOKING JADWAL ONLINE
                            </a>
                          </div>
                        ) : (
                          <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl">
                            <p className="text-xs font-bold text-slate-700">Tautan Booking Belum Siap</p>
                            <p className="text-[10px] text-slate-450 font-semibold mt-0.5">Hubungi admin/mentor jika link penjadwalan belum tersedia.</p>
                          </div>
                        )}

                        {product.deskripsi && (
                          <div className="space-y-1">
                            <h4 className="text-xs font-bold text-slate-655 uppercase tracking-wide">Rencana Sesi / Deskripsi</h4>
                            <p className="text-xs text-slate-500 leading-relaxed whitespace-pre-wrap">{product.deskripsi}</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {product.instruksi && (
                      <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl space-y-1.5">
                        <h4 className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                          <Info size={14} /> Catatan Tambahan Mentor
                        </h4>
                        <p className="text-xs text-slate-550 leading-relaxed whitespace-pre-wrap">{product.instruksi}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* 6. PRODUK DIGITAL PANEL */}
              {productType === "produk-digital" && (
                <div className="space-y-6">
                  <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
                    <div className="space-y-2">
                      <span className="bg-blue-100 text-blue-800 text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border border-blue-100">
                        PRODUK DIGITAL
                      </span>
                      <h1 className="text-xl sm:text-2xl font-black text-slate-850 mt-2">{product.nama}</h1>
                    </div>

                    <div className="flex flex-col md:flex-row gap-8 items-start">
                      {product.cover && (
                        <img src={product.cover} alt={product.nama} className="w-full md:w-1/3 rounded-2xl object-cover border border-slate-100 shadow-sm" />
                      )}
                      <div className="flex-1 space-y-4">
                        {product.file_url ? (
                          <div className="p-5 bg-blue-50/50 border border-blue-100 rounded-2xl space-y-3">
                            <div>
                              <p className="text-xs font-bold text-blue-800">Unduhan File Produk</p>
                              <p className="text-[10px] text-blue-600 font-semibold mt-0.5">Berkas digital milik Anda siap untuk diunduh secara instan.</p>
                            </div>
                            <a
                              href={product.file_url}
                              download
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-extrabold rounded-xl shadow transition"
                            >
                              <Download size={14} /> UNDUH SEKARANG
                            </a>
                          </div>
                        ) : (
                          <div className="p-4 bg-slate-50 border border-slate-150 rounded-2xl text-center py-6 text-slate-400">
                            <AlertCircle className="mx-auto text-slate-300 mb-1" size={24} />
                            <p className="text-xs font-bold">File tidak tersedia</p>
                            <p className="text-[10px] mt-0.5">Silakan hubungi administrator terkait penyediaan file produk.</p>
                          </div>
                        )}

                        {product.deskripsi && (
                          <div className="space-y-1">
                            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wide">Deskripsi Produk</h4>
                            <p className="text-xs text-slate-500 leading-relaxed whitespace-pre-wrap">{product.deskripsi}</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {product.instruksi && (
                      <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl space-y-1.5">
                        <h4 className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                          <Info size={14} /> Petunjuk Instalasi / Pemakaian
                        </h4>
                        <p className="text-xs text-slate-550 leading-relaxed whitespace-pre-wrap">{product.instruksi}</p>
                      </div>
                    )}
                  </div>

                  {/* Render File Preview directly inline if supported format */}
                  {product.file_url && (
                    <FilePreview url={product.file_url} name={product.nama} />
                  )}
                </div>
              )}

              {/* 7. BUNDLING PANEL */}
              {productType === "bundling" && (
                <div className="space-y-6">
                  <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
                    <div className="space-y-2">
                      <span className="bg-purple-100 text-purple-800 text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border border-purple-100">
                        PAKET BUNDLING
                      </span>
                      <h1 className="text-xl sm:text-2xl font-black text-slate-850 mt-2">{product.nama}</h1>
                    </div>

                    {product.deskripsi && (
                      <p className="text-xs text-slate-500 leading-relaxed">{product.deskripsi}</p>
                    )}

                    {product.pesan_setelah_bayar && (
                      <div className="p-4 bg-purple-50 border border-purple-100 rounded-2xl">
                        <p className="text-xs font-bold text-purple-800 flex items-center gap-1.5">
                          <Info size={14} /> Pesan Pengembang
                        </p>
                        <p className="text-xs text-purple-700 leading-relaxed mt-1 whitespace-pre-wrap">{product.pesan_setelah_bayar}</p>
                      </div>
                    )}

                    {/* Bundle item list */}
                    <div className="space-y-3">
                      <h3 className="text-xs font-black text-slate-850 uppercase tracking-widest">
                        Item yang Termasuk Dalam Bundling ini:
                      </h3>
                      {product.bundle_items && product.bundle_items.length > 0 ? (
                        <div className="grid sm:grid-cols-2 gap-4">
                          {product.bundle_items.map((item) => (
                            <div
                              key={`${item.type}-${item.id}`}
                              onClick={() => router.visit(item.url)}
                              className="p-4 bg-slate-50 hover:bg-slate-100 border border-slate-200/60 rounded-2xl flex items-center justify-between cursor-pointer group transition"
                            >
                              <div>
                                <span className="text-[8px] font-black uppercase tracking-wider text-slate-400 bg-slate-200/50 rounded px-1.5 py-0.5">
                                  {item.type}
                                </span>
                                <h4 className="text-xs font-extrabold text-slate-800 mt-1 line-clamp-1 group-hover:text-blue-600 transition">
                                  {item.name}
                                </h4>
                              </div>
                              <ChevronRight size={16} className="text-slate-350 group-hover:text-blue-600 transition" />
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-slate-400 italic">Tidak ada item terdaftar dalam bundling ini.</p>
                      )}
                    </div>
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      </div>
    </>
  );
}
