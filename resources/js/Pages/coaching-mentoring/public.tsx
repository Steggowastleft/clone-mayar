import { Head } from "@inertiajs/react";
import { useState } from "react";
import UnifiedCheckoutDialog from "@/components/public/UnifiedCheckoutDialog";
import { 
  Users, 
  CheckCircle2, 
  Calendar, 
  BookOpen,
  MessageSquare,
  UserCheck,
  Zap
} from "lucide-react";
import PublicProductLayout from "@/components/public/PublicProductLayout";

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
  user_id?: number | null;
};

type Props = {
  coaching: CoachingMentoring;
};

export default function CoachingMentoringPublic({ coaching }: Props) {
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  return (
    <>
      <PublicProductLayout
        productId={`coaching-mentoring:${coaching.id}`}
        title={coaching.nama}
        harga={coaching.harga}
        hargaCoret={coaching.harga_coret}
        redirectUrl={coaching.booking_url}
        themeColorClass="bg-teal-600 hover:bg-teal-700"
        textColorClass="text-teal-600"
        badgeText="Coaching & Mentoring"
        navTitle="Mayar Coaching"
        navIcon={<UserCheck className="text-white h-5 w-5" />}
        onCheckout={() => setCheckoutOpen(true)}
        creatorId={coaching.user_id}
      >
        <div className="space-y-8">
        
        {/* Cover and Top Info */}
        <div className="grid md:grid-cols-12 gap-8 items-start">
          <div className="md:col-span-5">
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-teal-600 to-cyan-600 rounded-3xl blur opacity-20 group-hover:opacity-30 transition duration-1000 group-hover:duration-200"></div>
              <div className="relative aspect-[3/4] bg-slate-100 rounded-2xl overflow-hidden shadow-xl border border-slate-200/60 flex items-center justify-center p-6 bg-gradient-to-br from-teal-50 to-cyan-100">
                {coaching.cover ? (
                  <img 
                    src={coaching.cover.startsWith('http') ? coaching.cover : `/storage/${coaching.cover}`} 
                    alt={coaching.nama} 
                    className="w-full h-full object-cover rounded-xl"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-teal-400 text-center">
                    <UserCheck size={64} className="stroke-1 text-teal-300 mb-2" />
                    <p className="font-bold text-sm tracking-wider text-teal-600 uppercase">Coaching & Mentoring</p>
                  </div>
                )}
                
                {/* Type Badge */}
                <div className="absolute top-4 right-4 bg-slate-900/90 backdrop-blur-md text-white px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase border border-slate-700">
                  {coaching.tipe_pembayaran === 'gratis' ? 'GRATIS' : 'BERBAYAR'}
                </div>
              </div>
            </div>
          </div>

          <div className="md:col-span-7 space-y-6">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-teal-50 text-teal-700 border border-teal-100">
                <UserCheck size={12} /> Coaching & Mentoring
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-950 tracking-tight leading-tight">
                {coaching.nama}
              </h1>
              <div className="flex flex-wrap gap-4 text-xs font-semibold text-slate-500 pt-2">
                <span className="flex items-center gap-1.5">
                  <Users size={14} className="text-teal-600" />
                  {coaching.total_penjualan} peserta terdaftar
                </span>
                <span className="flex items-center gap-1.5">
                  <Zap size={14} className="text-yellow-500" />
                  Sesi Terpercaya &amp; Interaktif
                </span>
              </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white rounded-2xl p-4 text-center border border-slate-100 shadow-sm">
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Peserta</p>
                <p className="text-base font-extrabold text-slate-800">{coaching.total_penjualan || 0}</p>
              </div>
              <div className="bg-white rounded-2xl p-4 text-center border border-slate-100 shadow-sm">
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Tipe Pembayaran</p>
                <p className="text-base font-extrabold text-slate-800 capitalize">{coaching.tipe_pembayaran}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tentang Coaching */}
        <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-100 shadow-sm space-y-4">
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <BookOpen className="text-teal-600" /> Tentang Coaching Ini
          </h3>
          <div className="prose prose-slate max-w-none text-slate-600 leading-relaxed whitespace-pre-wrap">
            {coaching.deskripsi || <p className="italic text-slate-400">Tidak ada deskripsi untuk coaching ini.</p>}
          </div>
        </div>

        {/* Benefits Grid */}
        <div className="grid sm:grid-cols-2 gap-4">
          {[
            "Bimbingan Personal dari Expert",
            "Sesi Konsultasi Langsung",
            "Akses Materi Coaching Lengkap",
            "Support Berkelanjutan",
          ].map((benefit, idx) => (
            <div key={idx} className="flex items-center gap-3 p-4 border border-slate-100 rounded-2xl bg-white shadow-sm">
              <CheckCircle2 className="text-teal-500 h-5 w-5 flex-shrink-0" />
              <span className="text-sm font-semibold text-slate-700">{benefit}</span>
            </div>
          ))}
        </div>

        {/* Instruksi */}
        {coaching.instruksi && (
          <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-100 shadow-sm space-y-4">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <MessageSquare className="text-teal-600" /> Instruksi & Cara Memulai
            </h3>
            <div className="bg-teal-50/50 border border-teal-100 rounded-2xl p-6 text-slate-700 text-sm leading-relaxed whitespace-pre-wrap">
              {coaching.instruksi}
            </div>
          </div>
        )}

        {/* Syarat & Ketentuan */}
        {coaching.syarat_ketentuan && (
          <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-100 shadow-sm space-y-4">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Calendar className="text-teal-600" /> Syarat & Ketentuan Sesi
            </h3>
            <div className="text-xs text-slate-500 leading-relaxed whitespace-pre-wrap">
              {coaching.syarat_ketentuan}
            </div>
          </div>
        )}

      </div>
    </PublicProductLayout>
      <UnifiedCheckoutDialog
        open={checkoutOpen}
        onOpenChange={setCheckoutOpen}
        productType="coaching-mentoring"
        productId={coaching.id}
        productName={coaching.nama}
        harga={coaching.harga}
      />
    </>
  );
}
