import { Head } from "@inertiajs/react";
import { useState } from "react";
import { 
  Calendar, Users, AlertCircle, Check, Award, Play, 
  CheckCircle2, Clock
} from "lucide-react";
import PublicProductLayout from "@/components/public/PublicProductLayout";
import UnifiedCheckoutDialog from "@/components/public/UnifiedCheckoutDialog";

type Webinar = {
  id: number;
  nama: string;
  deskripsi?: string;
  harga: number;
  harga_coret?: number;
  is_free: boolean;
  cover?: string;
  peserta_count?: number;
  max_peserta?: number;
  tanggal_mulai?: string;
  tanggal_selesai?: string;
  instruksi?: string;
  syarat_ketentuan?: string;
  user_id?: number | null;
  pembicaras?: Array<{
    id: number;
    nama: string;
    pekerjaan?: string;
    profil?: string;
    foto_url?: string;
  }>;
};

type Props = {
  webinar: Webinar;
};

declare global {
  interface Window {
    snap: any;
  }
}

function ContentCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-sm">
      <div className="px-6 py-4 border-b border-slate-50">
        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">{title}</h3>
      </div>
      <div className="px-6 py-5">{children}</div>
    </div>
  );
}

export default function CheckoutWebinar({ webinar }: Props) {
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [checkoutPrice, setCheckoutPrice] = useState(webinar.harga ?? 0);
  const [couponCode, setCouponCode] = useState("");

  const handleCheckout = (finalPrice?: number, coupon?: string) => {
    if (typeof finalPrice === "number") {
      setCheckoutPrice(finalPrice);
    }
    setCouponCode(coupon || "");
    setCheckoutOpen(true);
  };

  const formatTanggal = (str?: string) => {
    if (!str) return "";
    return new Date(str).toLocaleDateString("id-ID", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  return (
    <PublicProductLayout
      productId={`webinar:${webinar.id}`}
      title={webinar.nama}
      harga={webinar.harga ?? 0}
      hargaCoret={webinar.harga_coret}
      redirectUrl={null}
      themeColorClass="bg-purple-600 hover:bg-purple-700"
      textColorClass="text-purple-600"
      badgeText="Webinar"
      navTitle="Mayar Webinar"
      navIcon={<Award className="text-white h-5 w-5" />}
      creatorId={webinar.user_id}
      onCheckout={handleCheckout}
      hideCoupon={false}
    >
      <div className="space-y-8">
        
        {/* Cover and Quick Details */}
        <div className="grid md:grid-cols-12 gap-8 items-start">
          <div className="md:col-span-5">
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-3xl blur opacity-20 group-hover:opacity-30 transition duration-1000 group-hover:duration-200"></div>
              <div className="relative aspect-[4/3] bg-slate-100 rounded-2xl overflow-hidden shadow-xl border border-slate-200/60">
                {webinar.cover ? (
                  <img src={webinar.cover} alt={webinar.nama} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-purple-500 to-indigo-600 flex flex-col items-center justify-center p-8 text-center text-white">
                    <Play size={64} className="opacity-80 mb-2" />
                    <p className="font-bold text-sm">Interactive Webinar</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="md:col-span-7 space-y-6">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-purple-50 text-purple-700 border border-purple-100 uppercase tracking-wider">
                Webinar
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-950 tracking-tight leading-tight">
                {webinar.nama}
              </h1>
              <div className="flex items-center gap-3 pt-2">
                <div className="w-9 h-9 bg-slate-100 rounded-full flex items-center justify-center border border-slate-200">
                  <Users className="text-slate-500 h-4.5 w-4.5" />
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Instruktur / Pembicara</p>
                  <p className="text-sm font-bold text-slate-800">
                    {webinar.pembicaras && webinar.pembicaras.length > 0 
                      ? webinar.pembicaras.map(p => p.nama).join(', ') 
                      : 'Anonim'}
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="bg-white rounded-2xl p-4 text-center border border-slate-100 shadow-sm">
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Peserta Terdaftar</p>
                <p className="text-base font-extrabold text-slate-800">{webinar.peserta_count ?? 0}</p>
              </div>
              {webinar.max_peserta && (
                <div className="bg-white rounded-2xl p-4 text-center border border-slate-100 shadow-sm">
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Max Kuota</p>
                  <p className="text-base font-extrabold text-slate-800">{webinar.max_peserta} Orang</p>
                </div>
              )}
              {webinar.tanggal_mulai && (
                <div className="bg-white rounded-2xl p-4 text-center border border-slate-100 shadow-sm col-span-2 sm:col-span-1">
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Waktu</p>
                  <p className="text-[11px] font-extrabold text-slate-800 truncate" title={formatTanggal(webinar.tanggal_mulai)}>
                    {formatTanggal(webinar.tanggal_mulai)}
                  </p>
                </div>
              )}
            </div>
            
            <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
              <Clock className="h-4 w-4 text-purple-500" />
              <span>Jadwal Mulai: {formatTanggal(webinar.tanggal_mulai) || "-"}</span>
            </div>
          </div>
        </div>

        {/* Deskripsi */}
        {webinar.deskripsi && (
          <div>
            <ContentCard title="Deskripsi Webinar">
              <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                {webinar.deskripsi}
              </p>
            </ContentCard>
          </div>
        )}

        {/* Pembicara / Instruktur */}
        {webinar.pembicaras && webinar.pembicaras.length > 0 && (
          <div>
            <ContentCard title="Instruktur / Pembicara">
              <div className="grid gap-6 sm:grid-cols-2">
                {webinar.pembicaras.map((ins) => (
                  <div key={ins.id} className="flex gap-4 items-start p-4 bg-slate-50/50 rounded-2xl border border-slate-100">
                    <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center overflow-hidden shrink-0 border border-slate-200">
                      {ins.foto_url ? (
                        <img src={ins.foto_url} alt={ins.nama} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-purple-600 font-bold text-lg">{ins.nama.charAt(0).toUpperCase()}</span>
                      )}
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-sm font-bold text-slate-800">{ins.nama}</h4>
                      {ins.pekerjaan && <p className="text-xs font-semibold text-purple-600">{ins.pekerjaan}</p>}
                      {ins.profil && <p className="text-xs text-slate-500 leading-relaxed mt-1">{ins.profil}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </ContentCard>
          </div>
        )}

        {/* Syarat & Ketentuan */}
        {webinar.syarat_ketentuan && (
          <div>
            <ContentCard title="Syarat & Ketentuan">
              <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                {webinar.syarat_ketentuan}
              </p>
            </ContentCard>
          </div>
        )}

        {/* Fasilitas */}
        <div className="grid sm:grid-cols-3 gap-3">
          {[
            { title: "Akses Rekaman", desc: "Tonton kapan saja setelah live selesai" },
            { title: "Sertifikat Elektronik", desc: "Dapatkan sertifikat penyelesaian resmi" },
            { title: "Materi Lengkap", desc: "Akses ke slide presentasi & referensi tambahan" }
          ].map((item, idx) => (
            <div key={idx} className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm space-y-1">
              <div className="flex items-center gap-2 text-purple-600 font-bold text-sm">
                <CheckCircle2 size={16} className="text-purple-600" />
                <span>{item.title}</span>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>

      </div>

      {/* Checkout Dialog */}
      <UnifiedCheckoutDialog
        open={checkoutOpen}
        onOpenChange={setCheckoutOpen}
        productType="webinar"
        productId={webinar.id}
        productName={webinar.nama}
        harga={checkoutPrice}
        couponCode={couponCode}
      />
    </PublicProductLayout>
  );
}

