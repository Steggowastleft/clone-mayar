import { Head } from "@inertiajs/react";
import { useState } from "react";
import UnifiedCheckoutDialog from "@/components/public/UnifiedCheckoutDialog";
import { 
  Link, 
  CheckCircle2, 
  DollarSign,
  FileText,
  Clock,
  Zap,
  ExternalLink
} from "lucide-react";
import PublicProductLayout from "@/components/public/PublicProductLayout";

type PaymentLink = {
  id: number;
  nama: string;
  deskripsi: string | null;
  harga: number;
  harga_coret: number | null;
  cover_url: string | null;
  redirect_url: string | null;
  pesan_setelah_bayar: string | null;
  status: string;
  user_id?: number | null;
};

type Props = {
  link: PaymentLink;
};

export default function PaymentLinkPublic({ link }: Props) {
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [checkoutPrice, setCheckoutPrice] = useState(link.harga);
  const [couponCode, setCouponCode] = useState("");

  const handleCheckout = (finalPrice?: number, coupon?: string) => {
    if (typeof finalPrice === "number") {
      setCheckoutPrice(finalPrice);
    }
    setCouponCode(coupon || "");
    setCheckoutOpen(true);
  };

  return (
    <>
      <PublicProductLayout
        productId={`payment-link:${link.id}`}
        title={link.nama}
        harga={link.harga}
        hargaCoret={link.harga_coret}
        redirectUrl={link.redirect_url}
        themeColorClass="bg-sky-600 hover:bg-sky-700"
        textColorClass="text-sky-600"
        badgeText="Payment Link"
        navTitle="Mayar Payment"
        navIcon={<Link className="text-white h-5 w-5" />}
        hideCoupon={true}
        onCheckout={handleCheckout}
        creatorId={link.user_id}
      >
        <div className="space-y-8">
        
        {/* Cover and Info */}
        <div className="grid md:grid-cols-12 gap-8 items-start">
          <div className="md:col-span-5">
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-sky-600 to-blue-600 rounded-3xl blur opacity-20 group-hover:opacity-30 transition duration-1000 group-hover:duration-200"></div>
              <div className="relative aspect-[3/4] bg-slate-100 rounded-2xl overflow-hidden shadow-xl border border-slate-200/60 flex items-center justify-center p-6 bg-gradient-to-br from-sky-50 to-blue-100">
                {link.cover_url ? (
                  <img 
                    src={link.cover_url.startsWith('http') ? link.cover_url : `/storage/${link.cover_url}`} 
                    alt={link.nama} 
                    className="w-full h-full object-cover rounded-xl"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-sky-400 text-center">
                    <DollarSign size={64} className="stroke-1 mb-2 text-sky-300" />
                    <p className="font-bold text-sm tracking-wider text-sky-600">Link Pembayaran</p>
                  </div>
                )}
                
                {/* Badge */}
                <div className="absolute top-4 right-4 bg-slate-900/90 backdrop-blur-md text-white px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase border border-slate-700">
                  PEMBAYARAN
                </div>
              </div>
            </div>
          </div>

          <div className="md:col-span-7 space-y-6">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-sky-50 text-sky-700 border border-sky-100">
                <DollarSign size={12} /> Payment Link
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-950 tracking-tight leading-tight">
                {link.nama}
              </h1>
              <div className="flex flex-wrap gap-4 text-xs font-semibold text-slate-500 pt-2">
                <span className="flex items-center gap-1.5">
                  <Zap size={14} className="text-amber-500" />
                  Pembayaran Mudah & Aman
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock size={14} className="text-sky-600" />
                  Proses Instan
                </span>
              </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 gap-3 max-w-[150px]">
              <div className="bg-white rounded-2xl p-4 text-center border border-slate-100 shadow-sm">
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Status</p>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-green-50 text-green-700 border border-green-100 capitalize">
                  {link.status}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Deskripsi */}
        <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-100 shadow-sm space-y-4">
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <FileText className="text-sky-600" /> Deskripsi
          </h3>
          <div className="prose prose-slate max-w-none text-slate-600 leading-relaxed whitespace-pre-wrap">
            {link.deskripsi || <p className="italic text-slate-400">Tidak ada deskripsi untuk link pembayaran ini.</p>}
          </div>
        </div>

        {/* Benefits Grid */}
        <div className="grid sm:grid-cols-2 gap-4">
          {[
            "Proses Pembayaran Instan",
            "Keamanan Transaksi Terjamin",
            "Notifikasi Real-time",
            "Dukungan Pembayaran 24/7",
          ].map((benefit, idx) => (
            <div key={idx} className="flex items-center gap-3 p-4 border border-slate-100 rounded-2xl bg-white shadow-sm">
              <CheckCircle2 className="text-sky-500 h-5 w-5 flex-shrink-0" />
              <span className="text-sm font-semibold text-slate-700">{benefit}</span>
            </div>
          ))}
        </div>

        {/* Pesan Setelah Bayar */}
        {link.pesan_setelah_bayar && (
          <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-100 shadow-sm space-y-4">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <ExternalLink className="text-sky-600" /> Informasi Setelah Pembayaran
            </h3>
            <div className="bg-sky-50/50 border border-sky-100 rounded-2xl p-6 text-slate-700 text-sm leading-relaxed whitespace-pre-wrap">
              {link.pesan_setelah_bayar}
            </div>
          </div>
        )}

        {/* Payment Methods */}
        <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-100 shadow-sm space-y-4">
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <FileText className="text-sky-600" /> Metode Pembayaran yang Didukung
          </h3>
          <p className="text-sm text-slate-500">
            Halaman ini mendukung berbagai channel pembayaran lokal dan internasional:
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {["Virtual Account", "E-Wallet (OVO, Dana, QRIS)", "Bank Transfer", "Kartu Kredit", "BNPL / Paylater", "Retail Outlet"].map((method, idx) => (
              <div key={idx} className="bg-slate-50/50 border border-slate-100 rounded-xl p-3 text-center text-xs font-semibold text-slate-700">
                {method}
              </div>
            ))}
          </div>
        </div>

      </div>
    </PublicProductLayout>
      <UnifiedCheckoutDialog
        open={checkoutOpen}
        onOpenChange={setCheckoutOpen}
        productType="payment-link"
        productId={link.id}
        productName={link.nama}
        harga={checkoutPrice}
        couponCode={couponCode}
      />
    </>
  );
}
