import { Head } from "@inertiajs/react";
import { 
  BookOpen, 
  Download, 
  ShoppingBag, 
  CheckCircle2, 
  FileText, 
  User
} from "lucide-react";
import PublicProductLayout from "@/components/public/PublicProductLayout";

type Ebook = {
  id: number;
  nama: string;
  deskripsi: string | null;
  harga: number;
  harga_coret: number | null;
  cover: string | null;
  author: string | null;
  isbn: string | null;
  format: string | null;
  bahasa: string | null;
  jumlah_halaman: number | null;
  tanggal_publish: string | null;
  sumber_file: string;
  redirect_url?: string | null;
};

type Props = {
  ebook: Ebook;
};

export default function EbookPublic({ ebook }: Props) {
  return (
    <PublicProductLayout
      productId={`ebook:${ebook.id}`}
      title={ebook.nama}
      harga={ebook.harga}
      hargaCoret={ebook.harga_coret}
      redirectUrl={ebook.redirect_url}
      themeColorClass="bg-emerald-600 hover:bg-emerald-700"
      textColorClass="text-emerald-600"
      badgeText="E-Book"
      navTitle="Mayar Ebook"
      navIcon={<BookOpen className="text-white h-5 w-5" />}
    >
      <div className="space-y-8">
        
        {/* Cover and Quick Stats */}
        <div className="grid md:grid-cols-12 gap-8 items-start">
          <div className="md:col-span-5">
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-3xl blur opacity-20 group-hover:opacity-30 transition duration-1000 group-hover:duration-200"></div>
              <div className="relative aspect-[3/4] bg-slate-100 rounded-2xl overflow-hidden shadow-xl border border-slate-200/60">
                {ebook.cover ? (
                  <img 
                    src={ebook.cover.startsWith('http') ? ebook.cover : `/storage/${ebook.cover}`} 
                    alt={ebook.nama} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 p-8 text-center bg-slate-50">
                    <BookOpen size={64} className="stroke-1 text-slate-300 mb-2" />
                    <p className="font-medium italic text-sm">Cover Tidak Tersedia</p>
                  </div>
                )}
                
                {/* Format Badge */}
                <div className="absolute top-4 right-4 bg-slate-900/90 backdrop-blur-md text-white px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase border border-slate-700">
                  {ebook.format || 'PDF'}
                </div>
              </div>
            </div>
          </div>

          <div className="md:col-span-7 space-y-6">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-100">
                <ShoppingBag size={12} /> Digital E-Book
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-950 tracking-tight leading-tight">
                {ebook.nama}
              </h1>
              <div className="flex items-center gap-3 pt-2">
                <div className="w-9 h-9 bg-slate-100 rounded-full flex items-center justify-center border border-slate-200">
                  <User className="text-slate-500 h-4.5 w-4.5" />
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Ditulis oleh</p>
                  <p className="text-sm font-bold text-slate-800">{ebook.author || 'Anonim'}</p>
                </div>
              </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-white rounded-2xl p-4 text-center border border-slate-100 shadow-sm">
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Halaman</p>
                <p className="text-base font-extrabold text-slate-800">{ebook.jumlah_halaman || '-'}</p>
              </div>
              <div className="bg-white rounded-2xl p-4 text-center border border-slate-100 shadow-sm">
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Bahasa</p>
                <p className="text-base font-extrabold text-slate-800">{ebook.bahasa || 'ID'}</p>
              </div>
              <div className="bg-white rounded-2xl p-4 text-center border border-slate-100 shadow-sm">
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Rilis</p>
                <p className="text-base font-extrabold text-slate-800">{ebook.tanggal_publish ? new Date(ebook.tanggal_publish).getFullYear() : '-'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Deskripsi */}
        <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-100 shadow-sm space-y-4">
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <FileText className="text-emerald-600" /> Deskripsi Buku
          </h3>
          <div className="prose prose-slate max-w-none text-slate-600 leading-relaxed whitespace-pre-wrap">
            {ebook.deskripsi || <p className="italic text-slate-400">Tidak ada deskripsi untuk buku ini.</p>}
          </div>
        </div>

        {/* Benefits Grid */}
        <div className="grid sm:grid-cols-2 gap-4">
          {[
            "Akses Instan setelah pembayaran",
            "Format File " + (ebook.format || "PDF / EPUB"),
            "Dapat dibaca di semua perangkat",
            "Akses Selamanya",
          ].map((benefit, idx) => (
            <div key={idx} className="flex items-center gap-3 p-4 border border-slate-100 rounded-2xl bg-white shadow-sm">
              <CheckCircle2 className="text-emerald-500 h-5 w-5 flex-shrink-0" />
              <span className="text-sm font-semibold text-slate-700">{benefit}</span>
            </div>
          ))}
        </div>

        {/* Specifications */}
        <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-100 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 mb-6">Spesifikasi Detail</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
            <div>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1.5">Penerbit</p>
              <p className="text-sm font-bold text-slate-800">Mayar Digital</p>
            </div>
            <div>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1.5">ISBN</p>
              <p className="text-sm font-bold text-slate-800">{ebook.isbn || '-'}</p>
            </div>
            <div>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1.5">Metode Pengiriman</p>
              <div className="flex items-center gap-1.5 text-sm font-bold text-emerald-600">
                <Download size={14} /> Link Download Instan
              </div>
            </div>
          </div>
        </div>

      </div>
    </PublicProductLayout>
  );
}
