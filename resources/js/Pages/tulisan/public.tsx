import { Head } from "@inertiajs/react";
import { 
  PenLine, 
  Share2, 
  ShoppingBag, 
  CheckCircle2, 
  FileText, 
  User,
  Clock,
  BookOpen,
  Eye,
  MessageSquare
} from "lucide-react";
import { Button } from "@/components/ui/button";

type Tulisan = {
  id: number;
  nama: string;
  deskripsi: string | null;
  harga: number;
  cover: string | null;
  author: string | null;
  tipe_tulisan: "one_shot" | "chapter";
  genre: string | null;
  bahasa: string | null;
  created_at: string;
};

type Props = {
  tulisan: Tulisan;
};

const formatHarga = (n: number) => {
  if (n === 0) return "Gratis";
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(n);
};

export default function TulisanPublic({ tulisan }: Props) {
  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <Head title={tulisan.nama} />

      {/* NAVIGATION */}
      <nav className="border-b bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-amber-500 rounded flex items-center justify-center">
              <PenLine className="text-white h-5 w-5" />
            </div>
            <span className="font-bold text-lg text-gray-900 tracking-tight">Karya Tulisan</span>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="rounded-full">
              <Share2 className="h-4 w-4" />
            </Button>
            <Button className="bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg px-6">
              Baca Sekarang
            </Button>
          </div>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-12 gap-12">
          
          {/* LEFT: INFO */}
          <div className="lg:col-span-8 space-y-10">
            
            {/* HERO SECTION */}
            <div className="space-y-6">
              <div className="flex flex-wrap items-center gap-2">
                <span className="bg-amber-100 text-amber-700 text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded">
                  {tulisan.tipe_tulisan === 'one_shot' ? 'Short Story' : 'Series / Chapter'}
                </span>
                <span className="bg-blue-100 text-blue-700 text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded">
                  {tulisan.genre || 'General'}
                </span>
              </div>
              
              <h1 className="text-4xl lg:text-5xl font-black text-gray-900 leading-tight">
                {tulisan.nama}
              </h1>

              <div className="flex flex-wrap items-center gap-6 py-2 border-y border-gray-100">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                    <User className="h-4 w-4 text-gray-500" />
                  </div>
                  <span className="text-sm font-bold text-gray-700">{tulisan.author || 'Anonim'}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-500 text-sm">
                  <Clock size={16} />
                  <span>{new Date(tulisan.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-500 text-sm">
                  <Eye size={16} />
                  <span>1.2k views</span>
                </div>
              </div>
            </div>

            {/* CONTENT PREVIEW / DESKRIPSI */}
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 space-y-6">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <FileText className="text-amber-500" /> Sinopsis & Deskripsi
              </h2>
              <div className="prose prose-amber max-w-none text-gray-700 leading-relaxed text-lg italic font-serif">
                {tulisan.deskripsi ? (
                   <p className="whitespace-pre-line">{tulisan.deskripsi}</p>
                ) : (
                  <p className="italic text-gray-400">Belum ada deskripsi untuk karya ini.</p>
                )}
              </div>
              
              {/* Fake Chapter List for visual premium feel */}
              {tulisan.tipe_tulisan === 'chapter' && (
                <div className="pt-8 border-t border-gray-50 space-y-4">
                  <h3 className="font-bold text-gray-800">Daftar Bab:</h3>
                  <div className="space-y-2">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 border border-gray-100 opacity-60">
                        <span className="text-sm font-medium">Bab {i}: Judul Bab Menyusul...</span>
                        <ShoppingBag size={14} className="text-gray-400" />
                      </div>
                    ))}
                    <p className="text-center text-xs text-gray-400 py-2">Beli akses penuh untuk melihat semua bab</p>
                  </div>
                </div>
              )}
            </div>

            {/* INFO GRID */}
            <div className="grid sm:grid-cols-3 gap-6">
               <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 text-center">
                 <BookOpen className="mx-auto text-amber-500 mb-3" size={24} />
                 <p className="text-xs text-gray-400 font-bold uppercase mb-1">Format</p>
                 <p className="font-bold text-gray-800">Online Reader</p>
               </div>
               <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 text-center">
                 <Globe className="mx-auto text-blue-500 mb-3" size={24} />
                 <p className="text-xs text-gray-400 font-bold uppercase mb-1">Bahasa</p>
                 <p className="font-bold text-gray-800">{tulisan.bahasa || 'Indonesia'}</p>
               </div>
               <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 text-center">
                 <MessageSquare className="mx-auto text-purple-500 mb-3" size={24} />
                 <p className="text-xs text-gray-400 font-bold uppercase mb-1">Diskusi</p>
                 <p className="font-bold text-gray-800">Aktif</p>
               </div>
            </div>
          </div>

          {/* RIGHT: PURCHASE CARD */}
          <div className="lg:col-span-4">
            <div className="bg-white rounded-3xl p-6 shadow-xl shadow-gray-200/50 border border-gray-100 sticky top-28 space-y-6">
              <div className="aspect-[3/4] bg-gray-100 rounded-2xl overflow-hidden shadow-inner border border-gray-100">
                 {tulisan.cover ? (
                   <img src={tulisan.cover.startsWith('http') ? tulisan.cover : `/storage/${tulisan.cover}`} className="w-full h-full object-cover" />
                 ) : (
                   <div className="w-full h-full flex flex-col items-center justify-center text-gray-300">
                     <PenLine size={64} strokeWidth={1} />
                     <p className="text-sm font-bold mt-2">NO COVER</p>
                   </div>
                 )}
              </div>

              <div className="space-y-4">
                <div className="text-center">
                  <p className="text-sm text-gray-500 font-medium mb-1">Mulai membaca hanya dengan</p>
                  <p className="text-4xl font-black text-amber-600">{formatHarga(tulisan.harga)}</p>
                </div>

                <Button className="w-full bg-amber-600 hover:bg-amber-700 text-white font-black py-7 text-lg rounded-2xl shadow-lg hover:scale-[1.02] transition-all">
                  BELI AKSES SEKARANG
                </Button>

                <div className="space-y-3 pt-2">
                  {[
                    "Baca kapanpun & dimanapun",
                    "Dukung langsung penulis",
                    "Akses selamanya",
                    "Tanpa iklan yang mengganggu"
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs font-bold text-gray-600">
                      <CheckCircle2 size={14} className="text-green-500" />
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

        </div>
      </main>

      <footer className="border-t py-20 bg-white">
        <div className="max-w-5xl mx-auto px-4 flex flex-col items-center gap-6">
           <div className="flex items-center gap-2 opacity-50">
             <PenLine className="h-5 w-5" />
             <span className="font-bold uppercase tracking-widest text-xs">Karya Tulisan &copy; 2026</span>
           </div>
           <p className="text-center text-sm text-gray-400 max-w-md">
             Platform publishing digital untuk penulis kreatif. Bagikan ceritamu, raih pembacamu.
           </p>
        </div>
      </footer>
    </div>
  );
}
