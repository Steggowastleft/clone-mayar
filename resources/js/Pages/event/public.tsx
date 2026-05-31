import { Head } from "@inertiajs/react";
import { useState } from "react";
import UnifiedCheckoutDialog from "@/components/public/UnifiedCheckoutDialog";
import { 
  Calendar, 
  MapPin, 
  Clock, 
  Users, 
  Mic2, 
  Ticket, 
  BookOpen, 
  FileText, 
  CheckCircle2 
} from "lucide-react";
import PublicProductLayout from "@/components/public/PublicProductLayout";

type EventData = {
  id: number;
  name: string;
  status: string;
  date: string;
  tipe: "online" | "offline";
  lokasi?: string;
  lokasi_map?: string;
  deskripsi?: string;
  instruksi?: string;
  syarat_ketentuan?: string;
  cover_url?: string;
  waktu_mulai?: string;
  waktu_selesai?: string;
  waktu_mulai_jual?: string;
  tanggal_tutup_daftar?: string;
  harga: number;
  redirect_url?: string;
  user_id?: number | null;
};

type PembicaraItem = {
  id: number;
  nama: string;
  pekerjaan: string;
  profil: string;
  foto?: string;
};

type TiketItem = {
  id: number;
  nama: string;
  harga: number;
  kuota: number;
  deskripsi?: string;
};

type Props = {
  event: EventData;
  tiketList?: TiketItem[];
  pembicaraList?: PembicaraItem[];
};

const formatHarga = (n: number) => {
  if (n === 0) return "Gratis";
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(n);
};

export default function EventPublic({ event, tiketList = [], pembicaraList = [] }: Props) {
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  return (
    <>
      <PublicProductLayout
        productId={`event:${event.id}`}
        title={event.name}
        harga={event.harga}
        hargaCoret={null}
        redirectUrl={event.redirect_url}
        themeColorClass="bg-pink-600 hover:bg-pink-700"
        textColorClass="text-pink-600"
        badgeText="Event"
        navTitle="Mayar Event"
        navIcon={<Calendar className="text-white h-5 w-5" />}
        onCheckout={() => setCheckoutOpen(true)}
        creatorId={event.user_id}
      >
        <div className="space-y-8">
        
        {/* Cover and Top Details */}
        <div className="grid md:grid-cols-12 gap-8 items-start">
          <div className="md:col-span-5">
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-pink-600 to-rose-600 rounded-3xl blur opacity-20 group-hover:opacity-30 transition duration-1000 group-hover:duration-200"></div>
              <div className="relative aspect-[3/4] bg-slate-100 rounded-2xl overflow-hidden shadow-xl border border-slate-200/60">
                {event.cover_url ? (
                  <img 
                    src={event.cover_url.startsWith('http') ? event.cover_url : `/storage/${event.cover_url}`} 
                    alt={event.name} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 p-8 text-center bg-slate-50">
                    <Calendar size={64} className="stroke-1 text-slate-300 mb-2" />
                    <p className="font-medium italic text-sm">Cover Event Tidak Tersedia</p>
                  </div>
                )}
                
                {/* Event Type Badge */}
                <div className="absolute top-4 right-4 bg-slate-900/90 backdrop-blur-md text-white px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase border border-slate-700">
                  {event.tipe}
                </div>
              </div>
            </div>
          </div>

          <div className="md:col-span-7 space-y-6">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-pink-50 text-pink-700 border border-pink-100">
                <Ticket size={12} /> Event & Acara
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-950 tracking-tight leading-tight">
                {event.name}
              </h1>
            </div>

            {/* Quick Stats Grid */}
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-slate-600 text-sm font-semibold">
                <Clock className="h-5 w-5 text-pink-500 shrink-0" />
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Waktu Pelaksanaan</p>
                  <p className="text-slate-800">{event.waktu_mulai || "Segera Diumumkan"}</p>
                </div>
              </div>

              {event.lokasi && (
                <div className="flex items-center gap-3 text-slate-600 text-sm font-semibold">
                  <MapPin className="h-5 w-5 text-pink-500 shrink-0" />
                  <div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Lokasi / Tempat</p>
                    <p className="text-slate-800">{event.lokasi}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Deskripsi */}
        <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-100 shadow-sm space-y-4">
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <FileText className="text-pink-600" /> Deskripsi Acara
          </h3>
          <div className="prose prose-slate max-w-none text-slate-600 leading-relaxed whitespace-pre-wrap">
            {event.deskripsi || <p className="italic text-slate-400">Tidak ada deskripsi untuk acara ini.</p>}
          </div>
        </div>

        {/* Tiket List */}
        {tiketList.length > 0 && (
          <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-100 shadow-sm space-y-6">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Ticket className="text-pink-600" /> Tiket yang Tersedia
            </h3>
            <div className="space-y-4">
              {tiketList.map((tiket) => (
                <div key={tiket.id} className="flex justify-between items-center p-4 border border-slate-100 rounded-2xl bg-[#FFFBFB] hover:border-pink-200 transition-colors">
                  <div className="space-y-1">
                    <p className="font-bold text-slate-800 text-base">{tiket.nama}</p>
                    {tiket.deskripsi && (
                      <p className="text-xs text-slate-500">{tiket.deskripsi}</p>
                    )}
                    <p className="text-[10px] text-slate-400 font-semibold">Kuota: {tiket.kuota} tiket tersisa</p>
                  </div>
                  <div className="text-right">
                    <p className="font-extrabold text-pink-600 text-lg">{formatHarga(tiket.harga)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Speakers List */}
        {pembicaraList.length > 0 && (
          <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-100 shadow-sm space-y-6">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Mic2 className="text-pink-600" /> Pembicara Utama
            </h3>
            <div className="grid sm:grid-cols-2 gap-6">
              {pembicaraList.map((pembicara) => (
                <div key={pembicara.id} className="flex gap-4 items-center bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
                  <div className="w-16 h-16 rounded-full overflow-hidden shrink-0 bg-slate-200 border border-slate-100">
                    {pembicara.foto ? (
                      <img src={`/storage/${pembicara.foto}`} alt={pembicara.nama} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-400">
                        <Users size={24} />
                      </div>
                    )}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 text-sm">{pembicara.nama}</h4>
                    <p className="text-xs text-pink-600 font-semibold">{pembicara.pekerjaan}</p>
                    <p className="text-[10px] text-slate-400 mt-1 line-clamp-2">{pembicara.profil}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Syarat & Ketentuan */}
        {event.syarat_ketentuan && (
          <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-100 shadow-sm space-y-4">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <CheckCircle2 className="text-pink-600" /> Syarat & Ketentuan
            </h3>
            <div className="text-xs text-slate-500 leading-relaxed whitespace-pre-wrap">
              {event.syarat_ketentuan}
            </div>
          </div>
        )}

      </div>
    </PublicProductLayout>
      <UnifiedCheckoutDialog
        open={checkoutOpen}
        onOpenChange={setCheckoutOpen}
        productType="event"
        productId={event.id}
        productName={event.name}
        harga={event.harga}
      />
    </>
  );
}
