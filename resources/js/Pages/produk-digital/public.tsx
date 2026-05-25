import { Head } from "@inertiajs/react";
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

const KATEGORI_LABEL: Record<string, string> = {
  "e-book": "E-Book",
  "novel": "Novel",
  "komik": "Komik",
  "template": "Template",
  "tulisan": "Tulisan",
  "video": "Video",
};

export default function ProdukDigitalPublic({ produk }: Props) {
  const getFileIcon = () => {
    if (produk.kategori === "video") return "🎬";
    if (produk.kategori === "komik") return "📚";
    if (produk.kategori === "template") return "📄";
    return "📖";
  };

  return (
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

        {/* Deskripsi */}
        <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-100 shadow-sm space-y-4">
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <FileText className="text-violet-600" /> Deskripsi Produk
          </h3>
          <div className="prose prose-slate max-w-none text-slate-600 leading-relaxed whitespace-pre-wrap">
            {produk.deskripsi || <p className="italic text-slate-400">Tidak ada deskripsi untuk produk ini.</p>}
          </div>
        </div>

        {/* Info Grid */}
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

        {/* Benefits List */}
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

        {/* File Preview */}
        {produk.file_url && (
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
  );
}
