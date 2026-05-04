import { Head } from "@inertiajs/react";
import { 
  ShoppingBag, 
  Share2, 
  CheckCircle2, 
  Download,
  ExternalLink,
  FileText,
  Clock,
  Copy,
  Tag
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

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
};

type Props = {
  produk: ProdukDigital;
};

const formatHarga = (n: number) => {
  if (n === 0) return "Gratis";
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(n);
};

const KATEGORI_LABEL: Record<string, string> = {
  "e-book": "E-Book",
  "novel": "Novel",
  "komik": "Komik",
  "template": "Template",
  "tulisan": "Tulisan",
  "video": "Video",
};

export default function ProdukDigitalPublic({ produk }: Props) {
  const [copied, setCopied] = useState(false);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleBuy = () => {
    if (produk.redirect_url) {
      window.location.href = produk.redirect_url;
    } else {
      // Redirect to payment page
      window.location.href = `/p/${produk.id}/digital`;
    }
  };

  const getFileIcon = () => {
    if (produk.kategori === "video") return "🎬";
    if (produk.kategori === "komik") return "📚";
    if (produk.kategori === "template") return "📄";
    return "📖";
  };

  return (
    <div className="min-h-screen bg-white">
      <Head title={produk.nama} />

      {/* NAVIGATION */}
      <nav className="border-b bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-violet-600 rounded-lg flex items-center justify-center">
              <ShoppingBag className="text-white h-5 w-5" />
            </div>
            <span className="font-bold text-xl tracking-tight text-gray-900 underline decoration-violet-500 decoration-2 underline-offset-4">Mayar Digital</span>
          </div>
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleCopyLink}
              className="hidden sm:flex gap-2"
            >
              <Copy className="h-4 w-4" />
              {copied ? "Tersalin!" : "Salin Link"}
            </Button>
            <Button 
              onClick={handleBuy}
              className="bg-violet-600 hover:bg-violet-700 text-white rounded-full px-6"
            >
              {produk.tipe_pembayaran === "gratis" ? "Download Gratis" : "Beli Sekarang"}
            </Button>
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-12 gap-12 items-start">
          
          {/* LEFT: COVER/IMAGE */}
          <div className="lg:col-span-5 sticky top-28">
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-violet-600 to-purple-600 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
              <div className="relative aspect-[3/4] bg-gradient-to-br from-violet-50 to-purple-100 rounded-xl overflow-hidden shadow-2xl border border-gray-200 flex items-center justify-center p-8">
                {produk.cover_url ? (
                  <img 
                    src={produk.cover_url.startsWith('http') ? produk.cover_url : `/storage/${produk.cover_url}`} 
                    alt={produk.nama} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 p-12 text-center">
                    <span className="text-6xl mb-4">{getFileIcon()}</span>
                    <p className="mt-2 font-medium">{produk.kategori ? KATEGORI_LABEL[produk.kategori] : 'Produk Digital'}</p>
                  </div>
                )}
                
                {/* Kategori Badge */}
                {produk.kategori && (
                  <div className="absolute top-4 right-4 bg-black/70 backdrop-blur-md text-white px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase border border-white/20">
                    {KATEGORI_LABEL[produk.kategori]}
                  </div>
                )}
              </div>
            </div>

            {/* QUICK STATS */}
            <div className="grid grid-cols-2 gap-4 mt-8">
              <div className="bg-violet-50 rounded-xl p-4 text-center border border-violet-100">
                <p className="text-[10px] text-violet-600 font-bold uppercase tracking-widest mb-1">Tipe</p>
                <p className="text-lg font-extrabold text-violet-900 capitalize">{produk.tipe_pembayaran}</p>
              </div>
              <div className="bg-violet-50 rounded-xl p-4 text-center border border-violet-100">
                <p className="text-[10px] text-violet-600 font-bold uppercase tracking-widest mb-1">Format</p>
                <p className="text-lg font-extrabold text-violet-900 uppercase">{produk.kategori || 'Digital'}</p>
              </div>
            </div>
          </div>

          {/* RIGHT: DETAILS */}
          <div className="lg:col-span-7 space-y-8">
            
            {/* HEADER INFO */}
            <div>
              {produk.kategori && (
                <div className="flex items-center gap-2 mb-3">
                  <Tag className="h-4 w-4 text-violet-600" />
                  <span className="text-sm font-medium text-violet-600 uppercase tracking-wider">
                    {KATEGORI_LABEL[produk.kategori]}
                  </span>
                </div>
              )}
              
              <h1 className="text-3xl sm:text-4xl font-black text-gray-900 leading-tight mb-4">
                {produk.nama}
              </h1>
              
              {/* PRICE */}
              <div className="flex items-baseline gap-3 mb-6">
                <span className="text-4xl font-black text-violet-600">
                  {formatHarga(produk.harga)}
                </span>
                {produk.harga_coret && produk.harga_coret > produk.harga && (
                  <span className="text-xl text-gray-400 line-through">
                    {formatHarga(produk.harga_coret)}
                  </span>
                )}
              </div>
            </div>

            {/* CTA BUTTONS - Mobile */}
            <div className="lg:hidden">
              <Button 
                onClick={handleBuy}
                className="w-full bg-violet-600 hover:bg-violet-700 text-white py-6 text-lg font-bold rounded-xl"
              >
                {produk.tipe_pembayaran === "gratis" ? "Download Gratis" : "Beli Sekarang"}
              </Button>
            </div>

            {/* DESCRIPTION */}
            <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <FileText className="h-5 w-5 text-violet-600" />
                Deskripsi Produk
              </h2>
              <div className="text-gray-600 leading-relaxed whitespace-pre-wrap">
                {produk.deskripsi || "Tidak ada deskripsi."}
              </div>
            </div>

            {/* INFO GRID */}
            <div className="grid sm:grid-cols-2 gap-4">
              {produk.waktu_mulai_jual && (
                <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl border border-gray-100">
                  <Clock className="h-5 w-5 text-violet-600 mt-0.5" />
                  <div>
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Mulai Dijual</p>
                    <p className="text-sm font-semibold text-gray-900">{produk.waktu_mulai_jual}</p>
                  </div>
                </div>
              )}
              
              {produk.tanggal_kadaluarsa && (
                <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl border border-gray-100">
                  <Clock className="h-5 w-5 text-violet-600 mt-0.5" />
                  <div>
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Kadaluarsa</p>
                    <p className="text-sm font-semibold text-gray-900">{produk.tanggal_kadaluarsa}</p>
                  </div>
                </div>
              )}
              
              <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl border border-gray-100">
                <Download className="h-5 w-5 text-violet-600 mt-0.5" />
                <div>
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">File</p>
                  <p className="text-sm font-semibold text-gray-900 capitalize">{produk.sumber_file === "upload" ? "Download" : "Link"}</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl border border-gray-100">
                <CheckCircle2 className="h-5 w-5 text-violet-600 mt-0.5" />
                <div>
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Akses</p>
                  <p className="text-sm font-semibold text-gray-900">Selamanya</p>
                </div>
              </div>
            </div>

            {/* TRUST BADGES */}
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

            {/* FILE PREVIEW */}
            {produk.file_url && (
              <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <ExternalLink className="h-5 w-5 text-violet-600" />
                  File Produk
                </h2>
                <a 
                  href={produk.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-violet-600 hover:text-violet-700 font-medium"
                >
                  <Download className="h-4 w-4" />
                  Lihat / Download File
                </a>
              </div>
            )}

            {/* SHARE */}
            <div className="border-t pt-6">
              <p className="text-sm font-medium text-gray-500 mb-3">Bagikan produk ini</p>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleCopyLink}
                  className="gap-2"
                >
                  <Copy className="h-4 w-4" />
                  {copied ? "Tersalin!" : "Salin Link"}
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    const url = encodeURIComponent(window.location.href);
                    const text = encodeURIComponent(`Cek produk digital ini: ${produk.nama}`);
                    window.open(`https://wa.me/?text=${text}%20${url}`, '_blank');
                  }}
                  className="gap-2"
                >
                  <Share2 className="h-4 w-4" />
                  WhatsApp
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
