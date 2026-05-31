import { useState } from "react";
import { Head, router } from "@inertiajs/react";
import { Loader2, ArrowRight, Zap, ShieldCheck, Download, Sparkles } from "lucide-react";

type Props = { redirectTo?: string };

export default function PesertaRegister({ redirectTo = "/peserta/dashboard" }: Props) {
  const [form, setForm]       = useState({ nama: "", email: "", password: "", redirect_to: redirectTo });
  const [showPw, setShowPw]   = useState(false);
  const [errors, setErrors]   = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const handleSubmit = () => {
    setLoading(true);
    router.post("/peserta/register", form, {
      onError:  (e) => { setErrors(e); setLoading(false); },
      onFinish: () => setLoading(false),
    });
  };

  return (
    <>
      <Head title="Daftar Member — BiinsCart" />
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cabinet+Grotesk:wght@400;500;700;800;900&family=Instrument+Serif:ital@0;1&display=swap');
        .font-cabinet  { font-family: 'Cabinet Grotesk', sans-serif; }
        .font-serif-in { font-family: 'Instrument Serif', serif; }
        @keyframes fadeUp { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
        @keyframes float  { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
        @keyframes float2 { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-14px)} }
        @keyframes float3 { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
        .anim-1{animation:fadeUp 0.45s ease 0.00s both}
        .anim-2{animation:fadeUp 0.45s ease 0.06s both}
        .anim-3{animation:fadeUp 0.45s ease 0.12s both}
        .anim-4{animation:fadeUp 0.45s ease 0.18s both}
        .anim-5{animation:fadeUp 0.45s ease 0.24s both}
        .f1{animation:float  6s ease-in-out infinite}
        .f2{animation:float2 8s ease-in-out 1s infinite}
        .f3{animation:float3 7s ease-in-out 2s infinite}
        .f4{animation:float  9s ease-in-out 3s infinite}
        .inp{width:100%;border:1.5px solid #dbeafe;border-radius:10px;padding:11px 14px;font-family:'Cabinet Grotesk',sans-serif;font-size:14px;color:#1e3a5f;background:#f0f7ff;outline:none;transition:all 0.2s}
        .inp:focus{border-color:#3b82f6;background:#fff;box-shadow:0 0 0 3px rgba(59,130,246,0.12)}
        .inp::placeholder{color:#93c5fd}
        .inp-err{border-color:#fca5a5!important;background:#fff5f5!important}
      `}</style>

      <div className="min-h-screen flex font-cabinet">
        {/* ── Kiri: Form ── */}
        <div className="flex-1 flex items-center justify-center p-8 bg-white">
          <div className="w-full max-w-[360px]">

            <div className="flex items-center gap-2.5 mb-10 anim-1">
              <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center shadow-md shadow-blue-200">
                <Zap className="h-5 w-5 text-white" fill="currentColor" />
              </div>
              <span className="font-black text-gray-900 text-xl tracking-tight">BiinsCart</span>
              <span className="text-xs bg-blue-50 text-blue-600 font-bold px-2 py-0.5 rounded-full">Member</span>
            </div>

            <div className="anim-1 mb-8">
              <p className="text-blue-500 text-xs font-bold uppercase tracking-widest mb-2">Daftar Akun Baru</p>
              <h2 className="text-gray-900 text-3xl font-black tracking-tight leading-tight">
                Mulai akses<br />
                <span className="font-serif-in italic font-normal text-blue-600">produk kamu.</span>
              </h2>
              <p className="text-gray-400 text-sm mt-2">Daftar akun gratis untuk mengunduh & membaca konten</p>
            </div>

            <div className="space-y-4">
              <div className="anim-2 space-y-1.5">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Nama Lengkap</label>
                <input type="text" placeholder="Nama Lengkap Anda"
                  value={form.nama} onChange={(e) => setForm({...form, nama: e.target.value})}
                  className={`inp ${errors.nama ? "inp-err" : ""}`} />
                {errors.nama && <p className="text-red-400 text-xs">{errors.nama}</p>}
              </div>

              <div className="anim-3 space-y-1.5">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Email</label>
                <input type="email" placeholder="email@kamu.com"
                  value={form.email} onChange={(e) => setForm({...form, email: e.target.value})}
                  className={`inp ${errors.email ? "inp-err" : ""}`} />
                {errors.email && <p className="text-red-400 text-xs">{errors.email}</p>}
              </div>

              <div className="anim-4 space-y-1.5">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Password</label>
                <div className="relative">
                  <input type={showPw ? "text" : "password"} placeholder="••••••••"
                    value={form.password} onChange={(e) => setForm({...form, password: e.target.value})}
                    onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                    className={`inp pr-20 ${errors.password ? "inp-err" : ""}`} />
                  <button type="button" onClick={() => setShowPw(!showPw)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-blue-400 hover:text-blue-600 font-semibold transition">
                    {showPw ? "Sembunyikan" : "Tampilkan"}
                  </button>
                </div>
                {errors.password && <p className="text-red-400 text-xs">{errors.password}</p>}
              </div>

              <div className="anim-5 pt-1">
                <button
                  onClick={handleSubmit} disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-55 text-white font-black text-sm py-3 px-6 rounded-xl transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-blue-200 flex items-center justify-center gap-2">
                  {loading
                    ? <><Loader2 className="h-4 w-4 animate-spin" /> Mendaftar...</>
                    : <>Daftar Sekarang <ArrowRight className="h-4 w-4" /></>
                  }
                </button>
              </div>

              <div className="anim-5 flex items-center gap-3 pt-1">
                <div className="flex-1 h-px bg-gray-100" />
                <span className="text-gray-300 text-xs">atau</span>
                <div className="flex-1 h-px bg-gray-100" />
              </div>

              <p className="anim-5 text-center text-xs text-gray-400">
                Sudah punya akun?{" "}
                <a href={`/peserta/login?redirect=${encodeURIComponent(redirectTo)}`} className="text-blue-600 hover:text-blue-700 font-bold underline transition">
                  Masuk di sini
                </a>
              </p>

              <p className="anim-5 text-center text-xs text-gray-300 pt-2">
                Mau jual produk digital?{" "}
                <a href="/login" className="text-gray-400 hover:text-blue-500 underline transition">
                  Masuk sebagai penjual
                </a>
              </p>
            </div>
          </div>
        </div>

        {/* ── Kanan: Floating cards ── */}
        <div className="hidden lg:flex w-[48%] relative overflow-hidden items-center justify-center p-12"
          style={{ background: "linear-gradient(160deg, #eff6ff 0%, #dbeafe 50%, #bfdbfe 100%)" }}>

          <div className="absolute inset-0 opacity-[0.15]" style={{
            backgroundImage: "radial-gradient(circle, #3b82f6 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }} />
          <div className="absolute top-10 right-10 w-48 h-48 bg-blue-300 rounded-full opacity-20 blur-[60px]" />
          <div className="absolute bottom-10 left-10 w-40 h-40 bg-blue-400 rounded-full opacity-20 blur-[50px]" />

          <div className="relative z-10 w-full max-w-xs space-y-4">
            {/* Ebook/File Card */}
            <div className="bg-white rounded-2xl shadow-lg shadow-blue-100 p-5 f1">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center shadow-sm text-white">
                  <Download className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-black text-gray-900 text-sm">Download File Digital</p>
                  <p className="text-xs text-gray-400">PDF, ZIP, Video, & Tulisan</p>
                </div>
              </div>
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-gray-400">Kecepatan Unduh</span>
                <span className="font-black text-blue-600">Instan</span>
              </div>
              <div className="h-2 bg-blue-50 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-blue-400 to-blue-600 rounded-full" style={{width:'100%'}} />
              </div>
            </div>

            {/* Secure Payment Card */}
            <div className="bg-white rounded-xl shadow-md shadow-blue-100 p-4 ml-8 f2">
              <div className="flex items-center gap-3">
                <ShieldCheck className="h-6 w-6 text-green-500" />
                <div>
                  <p className="font-black text-gray-800 text-sm">Pembayaran 100% Aman</p>
                  <p className="text-xs text-blue-400 font-semibold">Tersertifikasi & Terenkripsi</p>
                </div>
              </div>
            </div>

            {/* Premium Access */}
            <div className="rounded-xl p-4 f3"
              style={{ background: "linear-gradient(135deg, #1d4ed8, #2563eb)" }}>
              <div className="flex items-center gap-2 mb-1">
                <Sparkles className="h-4 w-4 text-yellow-300 animate-pulse" />
                <p className="text-blue-200 text-xs font-semibold">Akses Selamanya</p>
              </div>
              <p className="text-white font-black text-sm">Sekali Beli, Baca Kapan Saja</p>
              <p className="text-blue-300 text-xs mt-1">Tanpa biaya bulanan tersembunyi</p>
            </div>

            {/* Review */}
            <div className="bg-white rounded-xl shadow-md p-4 f4">
              <p className="text-gray-500 text-xs font-serif-in italic leading-relaxed">
                "Proses checkout cepat, file langsung terunduh detik itu juga. Sangat puas!"
              </p>
              <div className="flex items-center gap-2 mt-3">
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-400 to-blue-600" />
                <p className="text-xs font-bold text-gray-700">Rian · Pembeli Terverifikasi</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
