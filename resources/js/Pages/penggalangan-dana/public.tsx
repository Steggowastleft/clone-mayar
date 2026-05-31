import { Head } from "@inertiajs/react";
import { useState } from "react";
import UnifiedCheckoutDialog from "@/components/public/UnifiedCheckoutDialog";
import { 
  Heart, 
  Share2, 
  Target, 
  Users, 
  Calendar,
  Clock,
  CheckCircle2,
  Info,
  Newspaper,
  ArrowLeft,
  Copy,
  MessageCircle,
  Sparkles,
  ShieldCheck,
  UserCheck
} from "lucide-react";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import Checkbox from "@/components/Checkbox";
import { toast } from "sonner";

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
  user_id?: number | null;
};

type Props = {
  penggalangan_dana: PenggalanganDana;
};

const QUICK_AMOUNTS = [25000, 50000, 100000, 250000, 500000];

const formatHarga = (n: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(n);
};

export default function PenggalanganDanaPublic({ penggalangan_dana: p }: Props) {
  const [copied, setCopied] = useState(false);
  const [donorName, setDonorName] = useState("");
  const [donationAmount, setDonationAmount] = useState<number | "">("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [doaSupport, setDoaSupport] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    toast.success("Tautan kampanye berhasil disalin!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleQuickAmount = (amount: number) => {
    setDonationAmount(amount);
  };

  const handleCustomAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/[^0-9]/g, "");
    setDonationAmount(val === "" ? "" : parseInt(val));
  };

  const handleDonate = () => {
    if (!donationAmount || donationAmount < 1000) {
      toast.error("Minimal donasi adalah Rp 1.000");
      return;
    }

    if (!isAnonymous && !donorName.trim()) {
      toast.error("Harap masukkan nama Anda atau pilih Donasi sebagai Hamba Allah");
      return;
    }

    setCheckoutOpen(true);
  };

  // Mock comments / prayers to show social Proof
  const mockPrayers = [
    { name: "Hamba Allah", amount: 100000, time: "2 jam yang lalu", prayer: "Semoga berkah dan bermanfaat untuk sesama. Amin ya rabbal alamin." },
    { name: "Andi Saputra", amount: 50000, time: "4 jam yang lalu", prayer: "Bismillah, semoga dilancarkan segala urusan dan dilipatgandakan rezeki bagi yang membantunya." },
    { name: "Siti Rahma", amount: 250000, time: "1 hari yang lalu", prayer: "Semoga cepat terkumpul targetnya agar segera dirasakan manfaatnya oleh penerima." },
  ];

  return (
    <div className="min-h-screen bg-[#FFF8F8] text-slate-800 antialiased selection:bg-rose-500 selection:text-white relative overflow-hidden font-sans">
      <Head title={p.nama} />

      {/* Decorative Warm Elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-rose-200/20 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute top-1/2 left-0 w-80 h-80 bg-pink-200/20 rounded-full blur-3xl pointer-events-none"></div>

      {/* NAVIGATION */}
      <nav className="border-b border-rose-100 bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => {
                if (document.referrer && document.referrer.includes('/catalog')) {
                  window.history.back();
                } else {
                  window.location.href = p.user_id ? `/catalog?user_id=${p.user_id}` : "/catalog";
                }
              }}
              className="inline-flex items-center justify-center p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 bg-rose-600 rounded-xl flex items-center justify-center text-white shadow-md shadow-rose-500/20">
                <Heart className="text-white h-5 w-5 fill-current" />
              </div>
              <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-rose-700 to-pink-700 bg-clip-text text-transparent">
                Peduli & Berbagi
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleCopyLink}
              className="rounded-xl border-rose-200 hover:bg-rose-50 text-rose-600 gap-2 font-semibold"
            >
              <Share2 className="h-4 w-4" />
              <span>{copied ? "Tersalin" : "Bagikan"}</span>
            </Button>
          </div>
        </div>
      </nav>

      {/* MAIN CONTAINER */}
      <main className="max-w-6xl mx-auto px-4 py-8 lg:py-12 relative z-10">
        <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          
          {/* LEFT: COVER & STORIES */}
          <div className="lg:col-span-7 space-y-8">
            <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-rose-100/50">
              {/* Campaign Image Cover */}
              <div className="aspect-video bg-rose-50/50 relative overflow-hidden group">
                {p.cover ? (
                  <img 
                    src={p.cover.startsWith('http') ? p.cover : `/storage/${p.cover}`} 
                    alt={p.nama}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-rose-300">
                    <Heart size={80} strokeWidth={1} className="text-rose-200 fill-current mb-3 animate-pulse" />
                    <p className="text-xs font-bold tracking-widest text-rose-400">BAGIKAN HARAPAN, WUJUDKAN PERUBAHAN</p>
                  </div>
                )}
                <div className="absolute top-4 left-4">
                  <span className="bg-rose-600 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full shadow-lg">
                    {p.tipe}
                  </span>
                </div>
              </div>
              
              {/* Main Campaign details */}
              <div className="p-6 lg:p-8 space-y-6">
                <h1 className="text-2xl lg:text-3xl font-extrabold text-slate-900 leading-tight">
                  {p.nama}
                </h1>

                {/* Progress Bar & Campaign Stats */}
                {(p.tipe !== 'qurban' || p.tampilkan_target) && (
                  <div className="bg-rose-50/30 border border-rose-100/50 rounded-2xl p-5 space-y-4">
                    <div className="flex justify-between items-end">
                      <div>
                        <p className="text-2xl font-black text-rose-600">{formatHarga(p.terkumpul)}</p>
                        <p className="text-xs text-slate-500 font-medium mt-0.5">terkumpul dari target {formatHarga(p.harga)}</p>
                      </div>
                      <p className="text-lg font-black text-rose-600">{Math.round(p.progress_percent)}%</p>
                    </div>
                    <Progress value={p.progress_percent} className="h-2.5 bg-rose-100/80 [&>div]:bg-gradient-to-r [&>div]:from-rose-500 [&>div]:to-pink-600 rounded-full" />
                    
                    <div className="flex justify-between text-xs font-bold text-slate-500 pt-1">
                      <span className="flex items-center gap-1.5">
                        <Users size={15} className="text-rose-500" /> 
                        {p.pembeli} Orang Baik bergabung
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Clock size={15} className="text-pink-500" /> 
                        {p.tanggal_tutup ? `Berakhir ${format(new Date(p.tanggal_tutup), "dd MMMM yyyy", { locale: idLocale })}` : "Terus Berlanjut"}
                      </span>
                    </div>
                  </div>
                )}

                {/* Campaign Story */}
                <div className="pt-6 border-t border-slate-100">
                  <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <Info className="text-rose-500" size={18} /> Cerita Kampanye
                  </h2>
                  <div className="prose prose-slate max-w-none text-slate-600 leading-relaxed whitespace-pre-wrap text-sm">
                    {p.deskripsi || "Belum ada deskripsi lengkap untuk program ini."}
                  </div>
                </div>
              </div>
            </div>

            {/* Campaign Updates (Kabar Terbaru) */}
            {p.kabars && p.kabars.length > 0 && (
              <div className="bg-white rounded-3xl p-6 lg:p-8 border border-rose-100/50 shadow-sm space-y-6">
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Newspaper className="text-rose-500" size={18} /> Kabar Terbaru Penyaluran
                </h2>
                
                <div className="space-y-6 relative before:absolute before:inset-0 before:left-4 before:h-full before:w-0.5 before:bg-rose-100">
                  {p.kabars.map((kabar) => (
                    <div key={kabar.id} className="relative flex gap-6 pl-2 items-start">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full border-2 border-white bg-rose-500 text-white shadow-md z-10 shrink-0">
                        <Newspaper size={14} />
                      </div>
                      <div className="bg-rose-50/30 border border-rose-100/40 p-5 rounded-2xl space-y-2 flex-grow">
                        <h3 className="font-bold text-slate-800 text-sm">{kabar.judul}</h3>
                        <p className="text-[10px] text-rose-500 font-bold">
                          {format(new Date(kabar.created_at), "dd MMMM yyyy, HH:mm", { locale: idLocale })}
                        </p>
                        <p className="text-xs text-slate-600 whitespace-pre-line leading-relaxed">
                          {kabar.deskripsi}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Supporter Prayers list */}
            <div className="bg-white rounded-3xl p-6 lg:p-8 border border-rose-100/50 shadow-sm space-y-6">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <MessageCircle className="text-rose-500" size={18} /> Doa & Dukungan Donatur
              </h2>
              <div className="space-y-4">
                {mockPrayers.map((donor, idx) => (
                  <div key={idx} className="p-4 rounded-2xl bg-[#FFFBFB] border border-rose-100/30 space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-800">{donor.name}</span>
                        <span className="text-[10px] bg-rose-50 text-rose-600 px-2 py-0.5 rounded-full font-bold">
                          Donasi {formatHarga(donor.amount)}
                        </span>
                      </div>
                      <span className="text-slate-400">{donor.time}</span>
                    </div>
                    <p className="text-xs text-slate-600 italic">
                      "{donor.prayer}"
                    </p>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* RIGHT: CUSTOM SOCIAL DONATION FORM */}
          <div className="lg:col-span-5 lg:sticky lg:top-24">
            <div className="bg-white rounded-3xl p-6 shadow-xl shadow-rose-100/40 border border-rose-100 space-y-6">
              <div className="text-center space-y-2">
                <div className="inline-flex p-3 bg-rose-50 rounded-full text-rose-600">
                  <Heart className="h-6 w-6 fill-current animate-pulse" />
                </div>
                <h3 className="font-extrabold text-xl text-slate-900">Salurkan Kepedulian</h3>
                <p className="text-xs text-slate-500 max-w-xs mx-auto">
                  Setiap uluran tangan Anda membawa berkah dan harapan bagi saudara kita yang membutuhkan.
                </p>
              </div>

              <hr className="border-rose-50" />

              {/* Quick Donation Badges */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                  Pilih Nominal Donasi
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {QUICK_AMOUNTS.map((amount) => (
                    <button
                      key={amount}
                      onClick={() => handleQuickAmount(amount)}
                      className={`py-2.5 px-1 rounded-xl text-xs font-bold border transition-all ${
                        donationAmount === amount
                          ? "bg-rose-600 border-rose-600 text-white shadow-md shadow-rose-500/20"
                          : "bg-[#FFFBFB] border-rose-100 text-rose-600 hover:bg-rose-50"
                      }`}
                    >
                      {formatHarga(amount).replace(/,00$/, "")}
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Input */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                  Nominal Donasi Lainnya
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-slate-400 text-sm">
                    Rp
                  </span>
                  <Input
                    type="text"
                    placeholder="Masukkan nominal donasi"
                    value={donationAmount !== "" ? donationAmount.toLocaleString("id-ID") : ""}
                    onChange={handleCustomAmountChange}
                    className="pl-11 rounded-xl border-rose-100 focus:border-rose-500 focus:ring-rose-500 font-bold text-slate-800"
                  />
                </div>
              </div>

              {/* Donor Name Input (conditionally disabled) */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                    Nama Lengkap Anda
                  </label>
                  <div className="flex items-center gap-1.5">
                    <Checkbox
                      id="anonymous"
                      checked={isAnonymous}
                      onChange={(e) => setIsAnonymous(e.target.checked)}
                      className="rounded border-rose-200 text-rose-600 focus:ring-rose-500"
                    />
                    <label htmlFor="anonymous" className="text-[10px] font-bold text-rose-600 cursor-pointer select-none">
                      Hamba Allah (Sembunyikan nama)
                    </label>
                  </div>
                </div>
                <Input
                  placeholder={isAnonymous ? "Donatur Anonim (Hamba Allah)" : "Masukkan nama lengkap Anda"}
                  value={isAnonymous ? "" : donorName}
                  onChange={(e) => setDonorName(e.target.value)}
                  disabled={isAnonymous}
                  className="rounded-xl border-rose-100 focus:border-rose-500 focus:ring-rose-500 text-slate-800"
                />
              </div>

              {/* Doa / Support Message */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                  Doa & Dukungan (Opsional)
                </label>
                <Textarea
                  placeholder="Tulis pesan penyemangat atau doa baik Anda..."
                  value={doaSupport}
                  onChange={(e) => setDoaSupport(e.target.value)}
                  className="rounded-xl border-rose-100 focus:border-rose-500 focus:ring-rose-500 text-xs min-h-[80px]"
                />
              </div>

              {/* Trust Badge */}
              <div className="bg-rose-50/50 rounded-2xl p-3.5 border border-rose-100/50 flex gap-3 text-slate-600">
                <ShieldCheck className="text-rose-500 shrink-0 h-5 w-5" />
                <div className="space-y-0.5">
                  <p className="text-xs font-bold text-rose-900">Pembayaran Aman & Transparan</p>
                  <p className="text-[10px] text-slate-500">
                    Tersertifikasi legal. Donasi Anda terdistribusi aman melalui integrasi payment gateway.
                  </p>
                </div>
              </div>

              {/* Donate Button */}
              <Button
                onClick={handleDonate}
                disabled={isSubmitting}
                className="w-full bg-rose-600 hover:bg-rose-700 text-white font-extrabold py-7 text-lg rounded-2xl shadow-lg shadow-rose-200 hover:scale-[1.01] active:scale-[0.99] transition-all"
              >
                {isSubmitting ? "MEMPROSES..." : "SALURKAN DONASI SEKARANG"}
              </Button>

              <div className="flex items-center justify-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-center">
                <UserCheck size={12} className="text-rose-400" />
                <span>Terverifikasi Platform Mayar Peduli</span>
              </div>

            </div>
          </div>

        </div>
      </main>

      {/* FOOTER */}
      <footer className="border-t border-rose-100/40 py-12 mt-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 text-center space-y-4">
          <div className="flex items-center justify-center gap-2 opacity-60">
            <Heart className="h-5 w-5 text-rose-500 fill-current" />
            <span className="font-bold text-slate-700">Mayar Peduli</span>
          </div>
          <p className="text-xs text-slate-400">&copy; 2026 Mayar Peduli. Program kemanusiaan & donasi terpercaya.</p>
        </div>
      </footer>
      <UnifiedCheckoutDialog
        open={checkoutOpen}
        onOpenChange={setCheckoutOpen}
        productType="penggalangan-dana"
        productId={p.id}
        productName={p.nama}
        harga={Number(donationAmount)}
        prefilledName={isAnonymous ? "Hamba Allah" : donorName}
      />
    </div>
  );
}
