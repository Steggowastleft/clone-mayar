import { Head, usePage } from "@inertiajs/react";
import { useState, useEffect } from "react";
import UnifiedCheckoutDialog from "@/components/public/UnifiedCheckoutDialog";
import { 
  ShoppingBag, 
  CheckCircle2, 
  Download,
  ExternalLink,
  FileText,
  Clock,
  Tag
} from "lucide-react";
import PublicProductLayout from "@/components/public/PublicProductLayout";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

type ProdukDigital = {
  id: number;
  nama: string;
  deskripsi: string | null;
  kategori?: "e-book" | "novel" | "komik" | "template" | "tulisan" | "video";
  harga: number;
  harga_coret: number | null;
  cover_url: string | null;
  file_url: string | null;
  redirect_url: string | null;
  tipe_pembayaran: "berbayar" | "gratis";
  sumber_file: string;
  waktu_mulai_jual: string | null;
  tanggal_kadaluarsa: string | null;
  user_id?: number | null;
};

type Props = {
  produk: ProdukDigital;
  hasAccess?: boolean;
};

const KATEGORI_LABEL: Record<string, string> = {
  "e-book": "E-Book",
  "novel": "Novel",
  "komik": "Komik",
  "template": "Template",
  "tulisan": "Tulisan / Artikel",
  "video": "Video / Podcast",
};

export default function ProdukDigitalPublic({ produk, hasAccess: backendHasAccess = false }: Props) {
  const { auth } = usePage().props as any;
  const isLoggedIn = !!auth?.user || !!auth?.peserta;
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [checkoutPrice, setCheckoutPrice] = useState(produk.harga);
  const [couponCode, setCouponCode] = useState("");

  // Parse file URLs if it is komik or has multiple files
  let fileUrls: string[] = [];
  if (produk.file_url) {
    try {
      const cleanUrl = produk.file_url.trim();
      if (cleanUrl.startsWith("[")) {
        fileUrls = JSON.parse(cleanUrl);
      } else {
        fileUrls = [produk.file_url];
      }
    } catch (e) {
      fileUrls = [produk.file_url];
    }
  }

  // simulated purchase flag in localStorage
  const [hasPurchased, setHasPurchased] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem(`purchased_produk_${produk.id}`) === "true";
    }
    return false;
  });

  const isFree = produk.tipe_pembayaran === "gratis";
  const hasAccess = (isLoggedIn && isFree) || (isLoggedIn && hasPurchased) || backendHasAccess;

  // Initialize lock state from localStorage to persist lock state on refresh
  const [isLocked, setIsLocked] = useState(() => {
    if (typeof window !== "undefined" && (produk.kategori === "tulisan" || produk.kategori === "komik") && !hasAccess) {
      return localStorage.getItem(`locked_produk_${produk.id}`) === "true";
    }
    return false;
  });

  // Automatically unlock if user has access (e.g. logged in on a free product or purchased)
  useEffect(() => {
    if (hasAccess) {
      setIsLocked(false);
    }
  }, [hasAccess]);

  // 120 seconds (2 minutes) if logged in, 10 seconds if not logged in
  const initialTime = isLoggedIn ? 120 : 10;
  const [timeLeft, setTimeLeft] = useState(initialTime);

  // Reset lock state when guest logs in, giving them the 2-minute member preview
  useEffect(() => {
    if (isLoggedIn && auth?.user?.id) {
      const wasLocked = localStorage.getItem(`locked_produk_${produk.id}`) === "true";
      if (wasLocked && !hasAccess) {
        const hasResetLock = localStorage.getItem(`reset_lock_${produk.id}_${auth.user.id}`) === "true";
        if (!hasResetLock) {
          localStorage.removeItem(`locked_produk_${produk.id}`);
          setIsLocked(false);
          setTimeLeft(120);
          localStorage.setItem(`reset_lock_${produk.id}_${auth.user.id}`, "true");
        }
      }
    }
  }, [isLoggedIn, auth?.user?.id, hasAccess]);

  useEffect(() => {
    if ((produk.kategori !== "tulisan" && produk.kategori !== "komik") || hasAccess || isLocked) {
      return;
    }

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setIsLocked(true);
          localStorage.setItem(`locked_produk_${produk.id}`, "true");
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [hasAccess, produk.kategori, isLocked]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  const getFileIcon = () => {
    if (produk.kategori === "video") return "🎬";
    if (produk.kategori === "komik") return "📚";
    if (produk.kategori === "template") return "📄";
    return "📖";
  };

  const handleRealCheckout = (finalPrice?: number, coupon?: string) => {
    if (typeof finalPrice === "number") {
      setCheckoutPrice(finalPrice);
    }
    setCouponCode(coupon || "");
    setCheckoutOpen(true);
  };

  // Sub-component for Info Grid
  const InfoGrid = () => (
    <div className="grid sm:grid-cols-2 gap-4">
      {produk.waktu_mulai_jual && (
        <div className="flex items-start gap-3 p-4 bg-white rounded-2xl border border-slate-100 shadow-sm">
          <Clock className="h-5 w-5 text-violet-600 mt-0.5" />
          <div>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Mulai Dijual</p>
            <p className="text-sm font-semibold text-slate-800">{produk.waktu_mulai_jual}</p>
          </div>
        </div>
      )}
      
      {produk.tanggal_kadaluarsa && (
        <div className="flex items-start gap-3 p-4 bg-white rounded-2xl border border-slate-100 shadow-sm">
          <Clock className="h-5 w-5 text-violet-600 mt-0.5" />
          <div>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Kadaluarsa</p>
            <p className="text-sm font-semibold text-slate-800">{produk.tanggal_kadaluarsa}</p>
          </div>
        </div>
      )}
      
      <div className="flex items-start gap-3 p-4 bg-white rounded-2xl border border-slate-100 shadow-sm">
        <Download className="h-5 w-5 text-violet-600 mt-0.5" />
        <div>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">File</p>
          <p className="text-sm font-semibold text-slate-800 capitalize">{produk.sumber_file === "upload" ? "Download" : "Link"}</p>
        </div>
      </div>
      
      <div className="flex items-start gap-3 p-4 bg-white rounded-2xl border border-slate-100 shadow-sm">
        <CheckCircle2 className="h-5 w-5 text-violet-600 mt-0.5" />
        <div>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Akses</p>
          <p className="text-sm font-semibold text-slate-800">Selamanya</p>
        </div>
      </div>
    </div>
  );

  // Sub-component for Benefits List
  const Benefits = () => (
    <div className="flex flex-wrap gap-3">
      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-700 rounded-full text-xs font-semibold border border-green-200">
        <CheckCircle2 className="h-3.5 w-3.5" />
        Akses Instan
      </span>
      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full text-xs font-semibold border border-blue-200">
        <CheckCircle2 className="h-3.5 w-3.5" />
        Pembayaran Aman
      </span>
      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-violet-50 text-violet-700 rounded-full text-xs font-semibold border border-violet-200">
        <CheckCircle2 className="h-3.5 w-3.5" />
        Support 24/7
      </span>
    </div>
  );

  return (
    <>
      <PublicProductLayout
        productId={`produk-digital:${produk.id}`}
      title={produk.nama}
      harga={produk.harga}
      hargaCoret={produk.harga_coret}
      redirectUrl={produk.redirect_url}
      themeColorClass="bg-violet-600 hover:bg-violet-700"
      textColorClass="text-violet-600"
      badgeText="Produk Digital"
      navTitle="Mayar Digital"
      navIcon={<ShoppingBag className="text-white h-5 w-5" />}
      onCheckout={handleRealCheckout}
      creatorId={produk.user_id}
    >
      <div className="space-y-8">
        
        {/* Cover and Info */}
        <div className="grid md:grid-cols-12 gap-8 items-start">
          <div className="md:col-span-5">
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-violet-600 to-purple-600 rounded-3xl blur opacity-20 group-hover:opacity-30 transition duration-1000 group-hover:duration-200"></div>
              <div className="relative aspect-[3/4] bg-slate-100 rounded-2xl overflow-hidden shadow-xl border border-slate-200/60 flex items-center justify-center p-6 bg-gradient-to-br from-violet-50 to-purple-100">
                {produk.cover_url ? (
                  <img 
                    src={produk.cover_url.startsWith('http') ? produk.cover_url : `/storage/${produk.cover_url}`} 
                    alt={produk.nama} 
                    className="w-full h-full object-cover rounded-xl"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-violet-400 text-center">
                    <span className="text-5xl mb-2">{getFileIcon()}</span>
                    <p className="font-bold text-sm tracking-wider text-violet-600 capitalize">
                      {produk.kategori ? KATEGORI_LABEL[produk.kategori] : 'Produk Digital'}
                    </p>
                  </div>
                )}
                
                {/* Badge */}
                {produk.kategori && (
                  <div className="absolute top-4 right-4 bg-slate-900/90 backdrop-blur-md text-white px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase border border-slate-700">
                    {KATEGORI_LABEL[produk.kategori]}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="md:col-span-7 space-y-6">
            <div className="space-y-3">
              {produk.kategori && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-violet-50 text-violet-700 border border-violet-100">
                  <Tag size={12} /> {KATEGORI_LABEL[produk.kategori]}
                </div>
              )}
              <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-950 tracking-tight leading-tight">
                {produk.nama}
              </h1>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white rounded-2xl p-4 text-center border border-slate-100 shadow-sm">
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Tipe Pembayaran</p>
                <p className="text-sm font-extrabold text-slate-800 capitalize">{produk.tipe_pembayaran}</p>
              </div>
              <div className="bg-white rounded-2xl p-4 text-center border border-slate-100 shadow-sm">
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Format File</p>
                <p className="text-sm font-extrabold text-slate-800 uppercase">{produk.kategori || 'Digital'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* FOR TULISAN/KOMIK: Show InfoGrid and Benefits ABOVE the main content block */}
        {(produk.kategori === "tulisan" || produk.kategori === "komik") && (
          <div className="space-y-4">
            <InfoGrid />
            <Benefits />
          </div>
        )}

        {/* Writing/Description/Comic Block */}
        <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-100 shadow-sm space-y-6 relative overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-50 pb-4">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <FileText className="text-violet-600" /> 
              {produk.kategori === "tulisan" ? "Isi Tulisan" : (produk.kategori === "komik" ? "Halaman Komik" : "Deskripsi Produk")}
            </h3>

            {(produk.kategori === "tulisan" || produk.kategori === "komik") && !hasAccess && !isLocked && (
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-700 rounded-full text-xs font-semibold animate-pulse border border-amber-100 shadow-sm">
                ⏱️ Akses gratis sisa: {formatTime(timeLeft)}
              </div>
            )}
          </div>

          <div className={cn(
            "prose prose-slate max-w-none text-slate-600 leading-relaxed transition-all duration-700",
            isLocked && "blur-md select-none pointer-events-none max-h-[400px] overflow-hidden"
          )}>
            {/* Description (Rich Text) */}
            {produk.deskripsi && (
              <div dangerouslySetInnerHTML={{ __html: produk.deskripsi }} />
            )}

            {/* Comic Images Viewer */}
            {produk.kategori === "komik" && fileUrls.length > 0 && (
              <div className="mt-6 flex flex-col items-center w-full">
                <div className="w-full max-w-2xl border border-slate-200 rounded-2xl overflow-hidden shadow-lg bg-slate-950 flex flex-col gap-0">
                  {fileUrls.slice(0, 2).map((url, idx) => (
                    <div key={idx} className="w-full relative group leading-none">
                      <img 
                        src={url.startsWith('http') || url.startsWith('/') ? url : `/storage/${url}`} 
                        alt={`Halaman ${idx + 1}`} 
                        className="w-full h-auto object-contain block m-0 p-0"
                      />
                      {idx === 1 && (
                        <div className="absolute bottom-4 right-4 bg-slate-900/85 backdrop-blur-sm text-white py-1.5 px-3 rounded-full text-[10px] font-bold border border-white/10 shadow-sm">
                          Halaman 2 · Akhir Preview
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {!produk.deskripsi && produk.kategori !== "komik" && (
              <p className="italic text-slate-400">Tidak ada isi tulisan untuk produk ini.</p>
            )}
          </div>

          {/* Paywall Overlay */}
          {isLocked && (
            <div className="absolute inset-0 bg-slate-900/10 backdrop-blur-sm flex items-center justify-center p-6 z-10 transition-all duration-300">
              <div className="bg-white rounded-3xl p-6 md:p-8 max-w-md text-center shadow-2xl border border-slate-100/80 flex flex-col items-center space-y-4">
                <div className="w-12 h-12 bg-red-50 text-red-600 rounded-full flex items-center justify-center text-lg shadow-inner">
                  🔒
                </div>
                <h4 className="text-lg font-extrabold text-slate-950">Konten Terkunci</h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Akses gratis membaca telah berakhir. Silakan login atau beli produk ini untuk melanjutkan membaca seluruh isi tulisan/komik.
                </p>
                <div className="flex flex-col sm:flex-row gap-2.5 w-full pt-2">
                  <button
                    onClick={() => handleRealCheckout()}
                    className="flex-1 py-2.5 px-4 bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold rounded-xl shadow-md transition-all hover:scale-[1.02]"
                  >
                    Beli Sekarang
                  </button>
                  {!isLoggedIn && (
                    <a
                      href="/peserta/login"
                      className="flex-1 py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl border border-slate-200 text-center transition-all hover:scale-[1.02]"
                    >
                      Login Akun
                    </a>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* FOR OTHER CATEGORIES: Show InfoGrid and Benefits BELOW the description block */}
        {produk.kategori !== "tulisan" && produk.kategori !== "komik" && (
          <>
            <InfoGrid />
            <Benefits />
          </>
        )}

        {/* File Preview (For non-comic categories only, since comics show embedded previews) */}
        {produk.file_url && produk.kategori !== "komik" && (
          <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-100 shadow-sm space-y-4">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <ExternalLink className="h-5 w-5 text-violet-600" /> File Produk
            </h3>
            <a 
              href={produk.file_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-violet-600 hover:text-violet-700 font-semibold"
            >
              <Download className="h-4 w-4" />
              Lihat / Download File
            </a>
          </div>
        )}

      </div>
    </PublicProductLayout>
      <UnifiedCheckoutDialog
        open={checkoutOpen}
        onOpenChange={setCheckoutOpen}
        productType="produk-digital"
        productId={produk.id}
        productName={produk.nama}
        harga={checkoutPrice}
        couponCode={couponCode}
      />
    </>
  );
}
