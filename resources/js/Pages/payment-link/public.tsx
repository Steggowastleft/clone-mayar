import { Head } from "@inertiajs/react";
import { 
  Link, 
  Share2, 
  CheckCircle2, 
  DollarSign,
  FileText,
  Clock,
  Zap,
  ExternalLink,
  Copy
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

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
};

type Props = {
  link: PaymentLink;
};

const formatHarga = (n: number) => {
  if (n === 0) return "Gratis";
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(n);
};

export default function PaymentLinkPublic({ link }: Props) {
  const [copied, setCopied] = useState(false);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePay = () => {
    // Redirect to payment gateway or payment process
    if (link.redirect_url) {
      window.location.href = link.redirect_url;
    } else {
      // Default payment action - you may want to adjust this based on your payment flow
      alert("Hubungi penjual untuk instruksi pembayaran lebih lanjut.");
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Head title={link.nama} />

      {/* NAVIGATION */}
      <nav className="border-b bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-sky-600 rounded-lg flex items-center justify-center">
              <Link className="text-white h-5 w-5" />
            </div>
            <span className="font-bold text-xl tracking-tight text-gray-900 underline decoration-sky-500 decoration-2 underline-offset-4">Mayar Payment</span>
          </div>
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleCopyLink}
              className="hidden sm:flex gap-2"
            >
              <Copy className="h-4 w-4" />
              {copied ? "Tersalin!" : "Salin Link"}
            </Button>
            <Button 
              onClick={handlePay}
              className="bg-sky-600 hover:bg-sky-700 text-white rounded-full px-6"
            >
              Bayar Sekarang
            </Button>
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-12 gap-12 items-start">
          
          {/* LEFT: COVER/IMAGE */}
          <div className="lg:col-span-5 sticky top-28">
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-sky-600 to-blue-600 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
              <div className="relative aspect-[3/4] bg-gradient-to-br from-sky-50 to-blue-100 rounded-xl overflow-hidden shadow-2xl border border-gray-200 flex items-center justify-center p-8">
                {link.cover_url ? (
                  <img 
                    src={link.cover_url.startsWith('http') ? link.cover_url : `/storage/${link.cover_url}`} 
                    alt={link.nama} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-sky-400">
                    <DollarSign size={80} strokeWidth={1} />
                    <p className="mt-4 font-medium italic text-sky-600">Link Pembayaran</p>
                  </div>
                )}
                
                {/* Badge */}
                <div className="absolute top-4 right-4 bg-black/70 backdrop-blur-md text-white px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase border border-white/20">
                  PEMBAYARAN
                </div>
              </div>
            </div>

            {/* QUICK STATS */}
            <div className="grid grid-cols-2 gap-4 mt-8">
              <div className="bg-sky-50 rounded-xl p-4 text-center border border-sky-100">
                <p className="text-[10px] text-sky-600 font-bold uppercase tracking-widest mb-1">Tipe</p>
                <p className="text-sm font-extrabold text-sky-900 mt-1">Link Pembayaran</p>
              </div>
              <div className="bg-blue-50 rounded-xl p-4 text-center border border-blue-100">
                <p className="text-[10px] text-blue-600 font-bold uppercase tracking-widest mb-1">Status</p>
                <p className="text-sm font-extrabold text-blue-900 mt-1 capitalize">{link.status}</p>
              </div>
            </div>
          </div>

          {/* RIGHT: INFO */}
          <div className="lg:col-span-7 space-y-8">
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sky-600 font-bold text-sm tracking-widest uppercase">
                <DollarSign size={16} /> Payment Link
              </div>
              <h1 className="text-4xl lg:text-5xl font-black text-gray-900 leading-tight">
                {link.nama}
              </h1>
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <span className="flex items-center gap-1.5">
                  <Zap size={16} className="text-yellow-500" />
                  Pembayaran Mudah & Aman
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock size={16} className="text-sky-600" />
                  Proses Instan
                </span>
              </div>
            </div>

            {/* PRICE CARD */}
            <div className="bg-gradient-to-br from-slate-900 to-sky-950 rounded-2xl p-8 text-white shadow-xl shadow-sky-200/50 relative overflow-hidden">
               {/* Decorative Circles */}
               <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-2xl"></div>
               <div className="absolute bottom-0 left-0 w-24 h-24 bg-sky-500/10 rounded-full -ml-12 -mb-12 blur-xl"></div>

               <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                 <div>
                   <p className="text-sky-300 text-sm font-semibold mb-1">Total Pembayaran</p>
                   <div className="flex items-baseline gap-3">
                     <span className="text-4xl font-black">{formatHarga(link.harga)}</span>
                     {link.harga_coret && (
                       <span className="text-lg text-slate-400 line-through font-medium">{formatHarga(link.harga_coret)}</span>
                     )}
                   </div>
                 </div>
                 <Button 
                   onClick={handlePay}
                   className="bg-white text-sky-900 hover:bg-sky-50 font-black text-lg py-7 px-10 rounded-xl shadow-lg hover:scale-105 transition-all"
                 >
                    BAYAR SEKARANG
                 </Button>
               </div>
            </div>

            {/* DESKRIPSI */}
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <FileText className="text-sky-600" /> Deskripsi
              </h3>
              <div className="prose prose-sky max-w-none text-gray-600 leading-relaxed">
                {link.deskripsi ? (
                  <p>{link.deskripsi}</p>
                ) : (
                  <p className="italic text-gray-400">Tidak ada deskripsi untuk link pembayaran ini.</p>
                )}
              </div>
            </div>

            {/* FEATURES/BENEFITS */}
            <div className="grid sm:grid-cols-2 gap-4 pt-4">
              {[
                "Proses Pembayaran Instan",
                "Keamanan Terjamin",
                "Notifikasi Real-time",
                "Dukungan 24/7",
              ].map((benefit, idx) => (
                <div key={idx} className="flex items-center gap-3 p-4 border border-gray-100 rounded-xl bg-gray-50/50">
                  <CheckCircle2 className="text-sky-500 h-5 w-5 flex-shrink-0" />
                  <span className="text-sm font-semibold text-gray-700">{benefit}</span>
                </div>
              ))}
            </div>

            {/* PESAN SETELAH BAYAR */}
            {link.pesan_setelah_bayar && (
              <div className="pt-8 border-t border-gray-100">
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <ExternalLink className="text-sky-600" /> Pesan Setelah Pembayaran
                </h3>
                <div className="bg-sky-50 border border-sky-200 rounded-xl p-6 text-gray-700 prose prose-sky max-w-none">
                  <p>{link.pesan_setelah_bayar}</p>
                </div>
              </div>
            )}

            {/* PAYMENT METHOD */}
            <div className="pt-8 border-t border-gray-100">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <FileText className="text-sky-600" /> Metode Pembayaran
              </h3>
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
                <p className="text-gray-700 mb-4">
                  Link pembayaran ini mendukung berbagai metode pembayaran untuk kemudahan Anda.
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {["Bank Transfer", "E-Wallet", "Kartu Kredit", "BNPL", "Cicilan", "Virtual Account"].map((method, idx) => (
                    <div key={idx} className="bg-white border border-gray-200 rounded-lg p-3 text-center text-sm font-medium text-gray-700">
                      {method}
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
