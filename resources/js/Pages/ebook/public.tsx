import { Head } from "@inertiajs/react";
import { 
  BookOpen, 
  Download, 
  Share2, 
  ShoppingBag, 
  CheckCircle2, 
  FileText, 
  Globe, 
  User
} from "lucide-react";
import { Button } from "@/components/ui/button";

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
};

type Props = {
  ebook: Ebook;
};

const formatHarga = (n: number) => {
  if (n === 0) return "Gratis";
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(n);
};

export default function EbookPublic({ ebook }: Props) {
  return (
    <div className="min-h-screen bg-white">
      <Head title={ebook.nama} />

      {/* NAVIGATION */}
      <nav className="border-b bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <BookOpen className="text-white h-5 w-5" />
            </div>
            <span className="font-bold text-xl tracking-tight text-gray-900 underline decoration-blue-500 decoration-2 underline-offset-4">Mayar Ebook</span>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" className="hidden sm:flex gap-2">
              <Share2 className="h-4 w-4" /> Bagikan
            </Button>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white rounded-full px-6">
              Beli Sekarang
            </Button>
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-12 gap-12 items-start">
          
          {/* LEFT: COVER */}
          <div className="lg:col-span-5 sticky top-28">
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
              <div className="relative aspect-[3/4] bg-gray-100 rounded-xl overflow-hidden shadow-2xl border border-gray-200">
                {ebook.cover ? (
                  <img 
                    src={ebook.cover.startsWith('http') ? ebook.cover : `/storage/${ebook.cover}`} 
                    alt={ebook.nama} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 p-12 text-center">
                    <BookOpen size={80} strokeWidth={1} />
                    <p className="mt-4 font-medium italic">No Cover Available</p>
                  </div>
                )}
                
                {/* Format Badge */}
                <div className="absolute top-4 right-4 bg-black/70 backdrop-blur-md text-white px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase border border-white/20">
                  {ebook.format || 'PDF'}
                </div>
              </div>
            </div>

            {/* QUICK STATS */}
            <div className="grid grid-cols-3 gap-4 mt-8">
              <div className="bg-blue-50 rounded-xl p-3 text-center border border-blue-100">
                <p className="text-[10px] text-blue-600 font-bold uppercase tracking-widest mb-1">Halaman</p>
                <p className="text-lg font-extrabold text-blue-900">{ebook.jumlah_halaman || '-'}</p>
              </div>
              <div className="bg-purple-50 rounded-xl p-3 text-center border border-purple-100">
                <p className="text-[10px] text-purple-600 font-bold uppercase tracking-widest mb-1">Bahasa</p>
                <p className="text-lg font-extrabold text-purple-900">{ebook.bahasa || 'ID'}</p>
              </div>
              <div className="bg-amber-50 rounded-xl p-3 text-center border border-amber-100">
                <p className="text-[10px] text-amber-600 font-bold uppercase tracking-widest mb-1">Rilis</p>
                <p className="text-sm font-extrabold text-amber-900 mt-1">{ebook.tanggal_publish ? new Date(ebook.tanggal_publish).getFullYear() : '-'}</p>
              </div>
            </div>
          </div>

          {/* RIGHT: INFO */}
          <div className="lg:col-span-7 space-y-8">
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-blue-600 font-bold text-sm tracking-widest uppercase">
                <ShoppingBag size={16} /> Digital Product
              </div>
              <h1 className="text-4xl lg:text-5xl font-black text-gray-900 leading-tight">
                {ebook.nama}
              </h1>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center border border-gray-200">
                  <User className="text-gray-500 h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium">Ditulis oleh</p>
                  <p className="text-sm font-bold text-gray-900">{ebook.author || 'Anonim'}</p>
                </div>
              </div>
            </div>

            {/* PRICE CARD */}
            <div className="bg-gradient-to-br from-slate-900 to-blue-950 rounded-2xl p-8 text-white shadow-xl shadow-blue-200/50 relative overflow-hidden">
               {/* Decorative Circles */}
               <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-2xl"></div>
               <div className="absolute bottom-0 left-0 w-24 h-24 bg-blue-500/10 rounded-full -ml-12 -mb-12 blur-xl"></div>

               <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                 <div>
                   <p className="text-blue-300 text-sm font-semibold mb-1">Dapatkan akses instan ke buku ini</p>
                   <div className="flex items-baseline gap-3">
                     <span className="text-4xl font-black">{formatHarga(ebook.harga)}</span>
                     {ebook.harga_coret && (
                       <span className="text-lg text-slate-400 line-through font-medium">{formatHarga(ebook.harga_coret)}</span>
                     )}
                   </div>
                 </div>
                 <Button className="bg-white text-blue-900 hover:bg-blue-50 font-black text-lg py-7 px-10 rounded-xl shadow-lg hover:scale-105 transition-all">
                    BELI SEKARANG
                 </Button>
               </div>
            </div>

            {/* DESKRIPSI */}
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <FileText className="text-blue-600" /> Deskripsi Buku
              </h3>
              <div className="prose prose-blue max-w-none text-gray-600 leading-relaxed">
                {ebook.deskripsi ? (
                  <p>{ebook.deskripsi}</p>
                ) : (
                  <p className="italic text-gray-400">Tidak ada deskripsi untuk buku ini.</p>
                )}
              </div>
            </div>

            {/* FEATURES/BENEFITS */}
            <div className="grid sm:grid-cols-2 gap-4 pt-4">
              {[
                "Akses Instan setelah pembayaran",
                "Format File " + (ebook.format || "Digital"),
                "Dapat dibaca di semua perangkat",
                "Akses Selamanya",
              ].map((benefit, idx) => (
                <div key={idx} className="flex items-center gap-3 p-4 border border-gray-100 rounded-xl bg-gray-50/50">
                  <CheckCircle2 className="text-green-500 h-5 w-5 flex-shrink-0" />
                  <span className="text-sm font-semibold text-gray-700">{benefit}</span>
                </div>
              ))}
            </div>

            {/* SPECS */}
            <div className="pt-8 border-t border-gray-100">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Spesifikasi Detail</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-8">
                <div>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-2">Penerbit</p>
                  <p className="text-sm font-bold text-gray-800">Mayar Digital</p>
                </div>
                <div>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-2">ISBN</p>
                  <p className="text-sm font-bold text-gray-800">{ebook.isbn || '-'}</p>
                </div>
                <div>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-2">Metode Pengiriman</p>
                  <div className="flex items-center gap-1.5 text-sm font-bold text-blue-600">
                    <Download size={14} /> Link Download
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </main>

      {/* FOOTER */}
      <footer className="border-t py-12 mt-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-4 opacity-50">
            <BookOpen className="h-5 w-5" />
            <span className="font-bold">Mayar Ebook</span>
          </div>
          <p className="text-sm text-gray-500">&copy; 2026 Mayar. Seluruh hak cipta dilindungi undang-undang.</p>
        </div>
      </footer>
    </div>
  );
}
