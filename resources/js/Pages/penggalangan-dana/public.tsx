import { Head } from "@inertiajs/react";
import { 
  Heart, 
  Share2, 
  Target, 
  Users, 
  Calendar,
  Clock,
  ArrowRight,
  CheckCircle2,
  Info,
  Newspaper
} from "lucide-react";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

type PenggalanganDana = {
  id: number;
  tipe: "donasi" | "qurban" | "wakaf";
  nama: string;
  deskripsi: string | null;
  harga: number;
  terkumpul: number;
  pembeli: number;
  tanggal_mulai_jual: string | null;
  tanggal_tutup: string | null;
  cover: string | null;
  tampilkan_target: boolean;
  kategori: string | null;
  jenis_hewan: string | null;
  progress_percent: number;
  kabars?: {
    id: number;
    judul: string;
    deskripsi: string;
    created_at: string;
  }[];
};

type Props = {
  penggalangan_dana: PenggalanganDana;
};

const formatHarga = (n: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(n);
};

export default function PenggalanganDanaPublic({ penggalangan_dana: p }: Props) {
  const isQurban = p.tipe === 'qurban';
  
  return (
    <div className="min-h-screen bg-gray-50/50 pb-20">
      <Head title={p.nama} />

      {/* NAV */}
      <nav className="bg-white/80 backdrop-blur-md border-b sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center">
              <Heart className="text-white h-5 w-5" />
            </div>
            <span className="font-bold text-gray-900 tracking-tight">Donasi & Kebaikan</span>
          </div>
          <Button variant="ghost" size="icon" className="rounded-full">
            <Share2 className="h-4 w-4" />
          </Button>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-12 gap-8">
          
          {/* LEFT: COVER & CONTENT */}
          <div className="lg:col-span-8 space-y-6">
            <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100">
               <div className="aspect-video bg-gray-100 relative">
                  {p.cover ? (
                    <img src={p.cover.startsWith('http') ? p.cover : `/storage/${p.cover}`} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-gray-300 bg-gradient-to-br from-red-50 to-pink-50">
                      <Heart size={64} strokeWidth={1} className="text-red-200" />
                      <p className="text-xs font-bold mt-2 text-red-300">KEBAIKAN DIMULAI DARI SINI</p>
                    </div>
                  )}
                  <div className="absolute top-4 left-4">
                    <span className="bg-red-600 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full shadow-lg">
                      {p.tipe}
                    </span>
                  </div>
               </div>
               
               <div className="p-6 lg:p-8 space-y-6">
                 <h1 className="text-2xl lg:text-3xl font-black text-gray-900 leading-tight">
                    {p.nama}
                 </h1>

                 {/* Progress Bar for Non-Qurban or if Tampilkan Target is true */}
                 {(p.tipe !== 'qurban' || p.tampilkan_target) && (
                   <div className="space-y-3">
                     <div className="flex justify-between items-end">
                       <div>
                         <p className="text-2xl font-black text-red-600">{formatHarga(p.terkumpul)}</p>
                         <p className="text-xs text-gray-500 font-medium">terkumpul dari target {formatHarga(p.harga)}</p>
                       </div>
                       <p className="text-lg font-bold text-gray-700">{Math.round(p.progress_percent)}%</p>
                     </div>
                     <Progress value={p.progress_percent} className="h-3 bg-red-100 [&>div]:bg-red-600 rounded-full" />
                     <div className="flex justify-between text-xs font-bold text-gray-500">
                        <span className="flex items-center gap-1"><Users size={14} className="text-blue-500" /> {p.pembeli} Donatur</span>
                        <span className="flex items-center gap-1"><Clock size={14} className="text-orange-500" /> {p.tanggal_tutup ? "Batas waktu segera" : "Terus Berlanjut"}</span>
                     </div>
                   </div>
                 )}

                 <div className="pt-4 border-t border-gray-100">
                    <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <Info className="text-red-500" size={20} /> Cerita Penggalangan Dana
                    </h2>
                    <div className="prose prose-red max-w-none text-gray-600 leading-relaxed">
                       <p className="whitespace-pre-line">{p.deskripsi || "Belum ada deskripsi lengkap untuk penggalangan dana ini."}</p>
                    </div>
                 </div>
               </div>
            </div>

            {/* Kabar Terbaru Section */}
            {p.kabars && p.kabars.length > 0 && (
              <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100 p-6 lg:p-8">
                <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <Newspaper className="text-blue-500" size={24} /> Kabar Terbaru
                </h2>
                
                <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-300 before:to-transparent">
                  {p.kabars.map((kabar, i) => (
                    <div key={kabar.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                      <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white bg-blue-100 group-[.is-active]:bg-blue-600 text-blue-600 group-[.is-active]:text-blue-50 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                        <Newspaper size={18} />
                      </div>
                      <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                        <div className="flex items-center justify-between space-x-2 mb-2">
                          <h3 className="font-bold text-gray-900 text-base">{kabar.judul}</h3>
                        </div>
                        <p className="text-xs text-blue-600 font-semibold mb-3">
                          {format(new Date(kabar.created_at), "dd MMMM yyyy, HH:mm", { locale: idLocale })}
                        </p>
                        <div className="text-sm text-gray-600 whitespace-pre-line leading-relaxed">
                          {kabar.deskripsi}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* RIGHT: ACTION CARD */}
          <div className="lg:col-span-4">
            <div className="bg-white rounded-3xl p-6 shadow-xl shadow-gray-200/50 border border-gray-100 sticky top-24 space-y-6">
               <div className="text-center">
                 <p className="text-sm text-gray-500 font-medium mb-1">
                   {isQurban ? "Harga per ekor mulai dari" : "Pilih nominal donasi"}
                 </p>
                 <p className="text-3xl font-black text-gray-900">
                   {isQurban ? formatHarga(p.harga) : "Bebas Nominal"}
                 </p>
               </div>

               <Button className="w-full bg-red-600 hover:bg-red-700 text-white font-black py-7 text-lg rounded-2xl shadow-lg shadow-red-200 hover:scale-[1.02] transition-all">
                 {isQurban ? "TUNAIKAN QURBAN" : "DONASI SEKARANG"}
               </Button>

               <div className="space-y-4 pt-2">
                 <div className="bg-blue-50 rounded-xl p-4 flex gap-3 border border-blue-100">
                   <CheckCircle2 className="text-blue-500 shrink-0" size={18} />
                   <p className="text-xs text-blue-800 leading-snug">
                     Donasi Anda akan disalurkan secara aman dan transparan melalui platform kami.
                   </p>
                 </div>
                 
                 <div className="space-y-3">
                   {[
                     "Pembayaran Instan & Aman",
                     "Dapatkan Update Penyaluran",
                     "Terverifikasi Platform"
                   ].map((item, i) => (
                     <div key={i} className="flex items-center gap-2 text-xs font-bold text-gray-600">
                       <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                       {item}
                     </div>
                   ))}
                 </div>
               </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
