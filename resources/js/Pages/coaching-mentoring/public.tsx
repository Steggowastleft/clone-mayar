import { Head } from "@inertiajs/react";
import { 
  Users, 
  Share2, 
  CheckCircle2, 
  Calendar, 
  DollarSign, 
  BookOpen,
  MessageSquare,
  UserCheck,
  Clock,
  Zap
} from "lucide-react";
import { Button } from "@/components/ui/button";

type CoachingMentoring = {
  id: number;
  nama: string;
  deskripsi: string | null;
  harga: number;
  harga_coret: number | null;
  cover: string | null;
  booking_url: string;
  tipe_pembayaran: string;
  total_penjualan: number;
  instruksi: string | null;
  syarat_ketentuan: string | null;
  status: string;
};

type Props = {
  coaching: CoachingMentoring;
};

const formatHarga = (n: number) => {
  if (n === 0) return "Gratis";
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(n);
};

export default function CoachingMentoringPublic({ coaching }: Props) {
  const handleBooking = () => {
    if (coaching.booking_url) {
      window.open(coaching.booking_url, "_blank");
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Head title={coaching.nama} />

      {/* NAVIGATION */}
      <nav className="border-b bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-teal-600 rounded-lg flex items-center justify-center">
              <UserCheck className="text-white h-5 w-5" />
            </div>
            <span className="font-bold text-xl tracking-tight text-gray-900 underline decoration-teal-500 decoration-2 underline-offset-4">Mayar Coaching</span>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" className="hidden sm:flex gap-2">
              <Share2 className="h-4 w-4" /> Bagikan
            </Button>
            <Button 
              onClick={handleBooking}
              className="bg-teal-600 hover:bg-teal-700 text-white rounded-full px-6"
            >
              Pesan Sekarang
            </Button>
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-12 gap-12 items-start">
          
          {/* LEFT: COVER */}
          <div className="lg:col-span-5 sticky top-28">
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-teal-600 to-cyan-600 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
              <div className="relative aspect-[3/4] bg-gradient-to-br from-teal-50 to-cyan-100 rounded-xl overflow-hidden shadow-2xl border border-gray-200 flex items-center justify-center p-8">
                {coaching.cover ? (
                  <img 
                    src={coaching.cover.startsWith('http') ? coaching.cover : `/storage/${coaching.cover}`} 
                    alt={coaching.nama} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-teal-400">
                    <UserCheck size={80} strokeWidth={1} />
                    <p className="mt-4 font-medium italic text-teal-600">Coaching & Mentoring</p>
                  </div>
                )}
                
                {/* Type Badge */}
                <div className="absolute top-4 right-4 bg-black/70 backdrop-blur-md text-white px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase border border-white/20">
                  {coaching.tipe_pembayaran === 'gratis' ? 'GRATIS' : 'BERBAYAR'}
                </div>
              </div>
            </div>

            {/* QUICK STATS */}
            <div className="grid grid-cols-2 gap-4 mt-8">
              <div className="bg-teal-50 rounded-xl p-4 text-center border border-teal-100">
                <p className="text-[10px] text-teal-600 font-bold uppercase tracking-widest mb-1">Peserta</p>
                <p className="text-2xl font-extrabold text-teal-900">{coaching.total_penjualan || 0}</p>
              </div>
              <div className="bg-cyan-50 rounded-xl p-4 text-center border border-cyan-100">
                <p className="text-[10px] text-cyan-600 font-bold uppercase tracking-widest mb-1">Tipe</p>
                <p className="text-sm font-extrabold text-cyan-900 mt-1 capitalize">{coaching.tipe_pembayaran}</p>
              </div>
            </div>
          </div>

          {/* RIGHT: INFO */}
          <div className="lg:col-span-7 space-y-8">
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-teal-600 font-bold text-sm tracking-widest uppercase">
                <UserCheck size={16} /> Coaching & Mentoring
              </div>
              <h1 className="text-4xl lg:text-5xl font-black text-gray-900 leading-tight">
                {coaching.nama}
              </h1>
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <span className="flex items-center gap-1.5">
                  <Users size={16} className="text-teal-600" />
                  {coaching.total_penjualan} peserta terdaftar
                </span>
                <span className="flex items-center gap-1.5">
                  <Zap size={16} className="text-yellow-500" />
                  Terpercaya & Berkualitas
                </span>
              </div>
            </div>

            {/* PRICE CARD */}
            <div className="bg-gradient-to-br from-slate-900 to-teal-950 rounded-2xl p-8 text-white shadow-xl shadow-teal-200/50 relative overflow-hidden">
               {/* Decorative Circles */}
               <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-2xl"></div>
               <div className="absolute bottom-0 left-0 w-24 h-24 bg-teal-500/10 rounded-full -ml-12 -mb-12 blur-xl"></div>

               <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                 <div>
                   <p className="text-teal-300 text-sm font-semibold mb-1">Mulai Coaching Anda Sekarang</p>
                   <div className="flex items-baseline gap-3">
                     <span className="text-4xl font-black">{formatHarga(coaching.harga)}</span>
                     {coaching.harga_coret && (
                       <span className="text-lg text-slate-400 line-through font-medium">{formatHarga(coaching.harga_coret)}</span>
                     )}
                   </div>
                 </div>
                 <Button 
                   onClick={handleBooking}
                   className="bg-white text-teal-900 hover:bg-teal-50 font-black text-lg py-7 px-10 rounded-xl shadow-lg hover:scale-105 transition-all"
                 >
                    PESAN SEKARANG
                 </Button>
               </div>
            </div>

            {/* DESKRIPSI */}
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <BookOpen className="text-teal-600" /> Tentang Coaching Ini
              </h3>
              <div className="prose prose-teal max-w-none text-gray-600 leading-relaxed">
                {coaching.deskripsi ? (
                  <p>{coaching.deskripsi}</p>
                ) : (
                  <p className="italic text-gray-400">Tidak ada deskripsi untuk coaching ini.</p>
                )}
              </div>
            </div>

            {/* FEATURES/BENEFITS */}
            <div className="grid sm:grid-cols-2 gap-4 pt-4">
              {[
                "Bimbingan Personal dari Expert",
                "Sesi Konsultasi Langsung",
                "Akses Materi Coaching",
                "Support Berkelanjutan",
              ].map((benefit, idx) => (
                <div key={idx} className="flex items-center gap-3 p-4 border border-gray-100 rounded-xl bg-gray-50/50">
                  <CheckCircle2 className="text-teal-500 h-5 w-5 flex-shrink-0" />
                  <span className="text-sm font-semibold text-gray-700">{benefit}</span>
                </div>
              ))}
            </div>

            {/* INSTRUKSI */}
            {coaching.instruksi && (
              <div className="pt-8 border-t border-gray-100">
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <MessageSquare className="text-teal-600" /> Instruksi Coaching
                </h3>
                <div className="bg-teal-50 border border-teal-200 rounded-xl p-6 text-gray-700 prose prose-teal max-w-none">
                  <p>{coaching.instruksi}</p>
                </div>
              </div>
            )}

            {/* SYARAT & KETENTUAN */}
            {coaching.syarat_ketentuan && (
              <div className="pt-8 border-t border-gray-100">
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Calendar className="text-teal-600" /> Syarat & Ketentuan
                </h3>
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 text-gray-700 prose prose-sm max-w-none text-sm">
                  <p>{coaching.syarat_ketentuan}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
