import { Head } from "@inertiajs/react";
import { useState } from "react";
import UnifiedCheckoutDialog from "@/components/public/UnifiedCheckoutDialog";
import { 
  PenLine, 
  ShoppingBag, 
  CheckCircle2, 
  FileText, 
  User,
  Clock,
  BookOpen,
  Eye,
  MessageSquare,
  Globe
} from "lucide-react";
import PublicProductLayout from "@/components/public/PublicProductLayout";

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
  redirect_url?: string | null;
  user_id?: number | null;
};

type Props = {
  tulisan: Tulisan;
};

export default function TulisanPublic({ tulisan }: Props) {
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [checkoutPrice, setCheckoutPrice] = useState(tulisan.harga);
  const [couponCode, setCouponCode] = useState("");

  return (
    <>
      <PublicProductLayout
        productId={`tulisan:${tulisan.id}`}
        title={tulisan.nama}
        harga={tulisan.harga}
        hargaCoret={null}
        redirectUrl={tulisan.redirect_url}
        themeColorClass="bg-amber-600 hover:bg-amber-700"
        textColorClass="text-amber-600"
        badgeText="Tulisan"
        navTitle="Mayar Tulisan"
        navIcon={<PenLine className="text-white h-5 w-5" />}
        onCheckout={(finalPrice?: number, coupon?: string) => {
          if (typeof finalPrice === "number") {
            setCheckoutPrice(finalPrice);
          }
          setCouponCode(coupon || "");
          setCheckoutOpen(true);
        }}
        creatorId={tulisan.user_id}
      >
        <div className="space-y-8">
        
        {/* Cover and Top Info */}
        <div className="grid md:grid-cols-12 gap-8 items-start">
          <div className="md:col-span-5">
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-amber-600 to-yellow-600 rounded-3xl blur opacity-20 group-hover:opacity-30 transition duration-1000 group-hover:duration-200"></div>
              <div className="relative aspect-[3/4] bg-slate-100 rounded-2xl overflow-hidden shadow-xl border border-slate-200/60">
                {tulisan.cover ? (
                  <img 
                    src={tulisan.cover.startsWith('http') ? tulisan.cover : `/storage/${tulisan.cover}`} 
                    alt={tulisan.nama} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 p-8 text-center bg-slate-50">
                    <PenLine size={64} className="stroke-1 text-slate-300 mb-2" />
                    <p className="font-medium italic text-sm">Cover Tidak Tersedia</p>
                  </div>
                )}
                
                {/* Format Badge */}
                <div className="absolute top-4 right-4 bg-slate-900/90 backdrop-blur-md text-white px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase border border-slate-700">
                  {tulisan.tipe_tulisan === 'one_shot' ? 'Short Story' : 'Series'}
                </div>
              </div>
            </div>
          </div>

          <div className="md:col-span-7 space-y-6">
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="bg-amber-100 text-amber-700 text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full">
                  {tulisan.tipe_tulisan === 'one_shot' ? 'Short Story' : 'Chapter Series'}
                </span>
                <span className="bg-blue-100 text-blue-700 text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full">
                  {tulisan.genre || 'General'}
                </span>
              </div>
              
              <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-950 tracking-tight leading-tight">
                {tulisan.nama}
              </h1>

              <div className="flex flex-wrap items-center gap-6 py-3 border-y border-slate-100 text-slate-500 text-xs font-semibold">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 bg-slate-100 rounded-full flex items-center justify-center border border-slate-200">
                    <User className="h-4 w-4 text-slate-500" />
                  </div>
                  <span className="font-bold text-slate-800">{tulisan.author || 'Anonim'}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock size={15} className="text-amber-500" />
                  <span>{new Date(tulisan.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Eye size={15} className="text-blue-500" />
                  <span>1.2k pembaca</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sinopsis & Deskripsi */}
        <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-100 shadow-sm space-y-4 font-serif">
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2 font-sans">
            <FileText className="text-amber-500" /> Sinopsis & Deskripsi
          </h3>
          <div className="prose prose-slate max-w-none text-slate-600 leading-relaxed text-base italic whitespace-pre-wrap">
            {tulisan.deskripsi || <p className="italic text-slate-400">Belum ada deskripsi untuk karya ini.</p>}
          </div>

          {/* Fake Chapter List */}
          {tulisan.tipe_tulisan === 'chapter' && (
            <div className="pt-6 border-t border-slate-100 space-y-4 font-sans">
              <h4 className="font-bold text-slate-800 text-sm">Daftar Chapter:</h4>
              <div className="space-y-2">
                {[1, 2, 3].map(i => (
                  <div key={i} className="flex items-center justify-between p-3.5 rounded-2xl bg-[#FFFBFB] border border-slate-100 opacity-60">
                    <span className="text-xs font-semibold text-slate-700">Chapter {i}: Judul Chapter Menyusul...</span>
                    <ShoppingBag size={14} className="text-slate-400" />
                  </div>
                ))}
                <p className="text-center text-[10px] font-bold text-amber-600 py-1 uppercase tracking-wider">Beli akses untuk membaca semua chapter</p>
              </div>
            </div>
          )}
        </div>

        {/* Info Grid */}
        <div className="grid sm:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 text-center space-y-1">
            <BookOpen className="mx-auto text-amber-500" size={20} />
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Format</p>
            <p className="text-xs font-extrabold text-slate-800">Online Reader</p>
          </div>
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 text-center space-y-1">
            <Globe className="mx-auto text-blue-500" size={20} />
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Bahasa</p>
            <p className="text-xs font-extrabold text-slate-800">{tulisan.bahasa || 'Indonesia'}</p>
          </div>
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 text-center space-y-1">
            <MessageSquare className="mx-auto text-purple-500" size={20} />
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Komunitas</p>
            <p className="text-xs font-extrabold text-slate-800">Aktif</p>
          </div>
        </div>

        {/* Benefits List */}
        <div className="grid sm:grid-cols-2 gap-4">
          {[
            "Baca kapanpun & dimanapun",
            "Dukung langsung karya penulis",
            "Akses membaca selamanya",
            "Tanpa iklan yang mengganggu"
          ].map((benefit, idx) => (
            <div key={idx} className="flex items-center gap-3 p-4 border border-slate-100 rounded-2xl bg-white shadow-sm">
              <CheckCircle2 className="text-amber-500 h-5 w-5 flex-shrink-0" />
              <span className="text-sm font-semibold text-slate-700">{benefit}</span>
            </div>
          ))}
        </div>

      </div>
    </PublicProductLayout>
      <UnifiedCheckoutDialog
        open={checkoutOpen}
        onOpenChange={setCheckoutOpen}
        productType="tulisan"
        productId={tulisan.id}
        productName={tulisan.nama}
        harga={checkoutPrice}
        couponCode={couponCode}
      />
    </>
  );
}
