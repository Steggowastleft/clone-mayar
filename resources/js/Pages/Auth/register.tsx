import { useState } from "react";
import { Head, router } from "@inertiajs/react";
import { Eye, EyeOff, Loader2, ArrowRight, Zap, CheckCircle2 } from "lucide-react";

export default function PenjualRegister() {
  const [form, setForm] = useState({
    name: "", email: "", password: "", password_confirmation: "",
  });
  const [showPw, setShowPw]   = useState(false);
  const [errors, setErrors]   = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const handleSubmit = () => {
    setLoading(true);
    router.post("/register", form, {
      onError:  (e) => { setErrors(e); setLoading(false); },
      onFinish: () => setLoading(false),
    });
  };

  const f = (key: keyof typeof form) => ({
    value: form[key],
    onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm({ ...form, [key]: e.target.value }),
  });

  const perks = [
    { icon: "🚀", text: "Buat bootcamp pertama dalam 5 menit" },
    { icon: "💳", text: "Terima pembayaran otomatis" },
    { icon: "📊", text: "Pantau peserta & progress real-time" },
    { icon: "🎨", text: "Landing page profesional tanpa coding" },
  ];

  return (
    <>
      <Head title="Daftar Penjual — BiinsCart" />
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cabinet+Grotesk:wght@400;500;700;800;900&family=Instrument+Serif:ital@0;1&display=swap');
        .font-cabinet  { font-family: 'Cabinet Grotesk', sans-serif; }
        .font-serif-in { font-family: 'Instrument Serif', serif; }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.4; transform: scale(1); }
          50%       { opacity: 0.65; transform: scale(1.04); }
        }
        .anim-1 { animation: fadeUp 0.45s ease 0.00s both; }
        .anim-2 { animation: fadeUp 0.45s ease 0.08s both; }
        .anim-3 { animation: fadeUp 0.45s ease 0.16s both; }
        .anim-4 { animation: fadeUp 0.45s ease 0.24s both; }
        .anim-5 { animation: fadeUp 0.45s ease 0.32s both; }
        .blob1  { animation: pulse-slow 7s ease-in-out infinite; }
        .blob2  { animation: pulse-slow 10s ease-in-out 3s infinite; }

        .inp {
          width: 100%;
          border: 1.5px solid #dbeafe;
          border-radius: 10px;
          padding: 11px 14px;
          font-family: 'Cabinet Grotesk', sans-serif;
          font-size: 14px;
          color: #1e3a5f;
          background: #f0f7ff;
          outline: none;
          transition: all 0.2s;
        }
        .inp:focus {
          border-color: #3b82f6;
          background: #fff;
          box-shadow: 0 0 0 3px rgba(59,130,246,0.12);
        }
        .inp::placeholder { color: #93c5fd; }
        .inp-err { border-color: #fca5a5 !important; background: #fff5f5 !important; }

        .btn-primary {
          width: 100%;
          background: #1d4ed8;
          color: white;
          font-family: 'Cabinet Grotesk', sans-serif;
          font-weight: 800;
          font-size: 15px;
          padding: 12px;
          border-radius: 10px;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition: all 0.2s;
        }
        .btn-primary:hover:not(:disabled) {
          background: #1e40af;
          transform: translateY(-1px);
          box-shadow: 0 8px 24px rgba(29,78,216,0.3);
        }
        .btn-primary:disabled { opacity: 0.55; cursor: not-allowed; }
      `}</style>

      <div className="min-h-screen flex font-cabinet">

        {/* ── Kiri: Form ── */}
        <div className="flex-1 flex items-center justify-center p-8 bg-white overflow-y-auto">
          <div className="w-full max-w-[360px] py-6">

            {/* Logo */}
            <div className="flex items-center gap-2.5 mb-9 anim-1">
              <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center shadow-md shadow-blue-200">
                <Zap className="h-5 w-5 text-white" fill="currentColor" />
              </div>
              <span className="font-black text-gray-900 text-xl tracking-tight">BiinsCart</span>
              <span className="text-xs bg-blue-50 text-blue-600 font-bold px-2 py-0.5 rounded-full">Penjual</span>
            </div>

            {/* Heading */}
            <div className="anim-1 mb-7">
              <p className="text-blue-500 text-xs font-bold uppercase tracking-widest mb-2">
                Daftar Gratis
              </p>
              <h2 className="text-gray-900 text-3xl font-black tracking-tight leading-tight">
                Mulai jual<br />
                <span className="font-serif-in italic font-normal text-blue-600">
                  bootcamp kamu.
                </span>
              </h2>
              <p className="text-gray-400 text-sm mt-2">Tidak perlu kartu kredit. Gratis selamanya.</p>
            </div>

            {/* Form */}
            <div className="space-y-3.5">
              {/* Nama */}
              <div className="anim-2 space-y-1.5">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Nama Lengkap</label>
                <input type="text" placeholder="Nama kamu" {...f("name")}
                  className={`inp ${errors.name ? "inp-err" : ""}`} />
                {errors.name && <p className="text-red-400 text-xs">{errors.name}</p>}
              </div>

              {/* Email */}
              <div className="anim-2 space-y-1.5">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Email</label>
                <input type="email" placeholder="email@kamu.com" {...f("email")}
                  className={`inp ${errors.email ? "inp-err" : ""}`} />
                {errors.email && <p className="text-red-400 text-xs">{errors.email}</p>}
              </div>

              {/* Password */}
              <div className="anim-3 space-y-1.5">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Password</label>
                <div className="relative">
                  <input type={showPw ? "text" : "password"} placeholder="Min. 8 karakter" {...f("password")}
                    className={`inp pr-20 ${errors.password ? "inp-err" : ""}`} />
                  <button type="button" onClick={() => setShowPw(!showPw)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-blue-400 hover:text-blue-600 font-semibold transition">
                    {showPw ? "Sembunyikan" : "Tampilkan"}
                  </button>
                </div>
                {errors.password && <p className="text-red-400 text-xs">{errors.password}</p>}
              </div>

              {/* Konfirmasi */}
              <div className="anim-3 space-y-1.5">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Konfirmasi Password</label>
                <input type={showPw ? "text" : "password"} placeholder="Ulangi password"
                  {...f("password_confirmation")}
                  onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                  className="inp" />
              </div>

              {/* Submit */}
              <div className="anim-4 pt-1">
                <button className="btn-primary" onClick={handleSubmit} disabled={loading}>
                  {loading
                    ? <><Loader2 className="h-4 w-4 animate-spin" /> Mendaftar...</>
                    : <>Buat Akun Gratis <ArrowRight className="h-4 w-4" /></>
                  }
                </button>
              </div>

              <p className="anim-5 text-center text-sm text-gray-400">
                Sudah punya akun?{" "}
                <a href="/login" className="text-blue-600 font-bold hover:text-blue-700 transition">
                  Masuk di sini
                </a>
              </p>

              <div className="anim-5 flex items-center gap-3">
                <div className="flex-1 h-px bg-gray-100" />
                <span className="text-gray-300 text-xs">atau</span>
                <div className="flex-1 h-px bg-gray-100" />
              </div>

              <p className="anim-5 text-center text-xs text-gray-300">
                Kamu peserta bootcamp?{" "}
                <a href="/peserta/login" className="text-gray-400 hover:text-blue-500 underline transition">
                  Masuk sebagai peserta
                </a>
              </p>
            </div>
          </div>
        </div>

        {/* ── Kanan: Perks ── */}
        <div className="hidden lg:flex w-[48%] relative overflow-hidden flex-col justify-center p-14"
          style={{ background: "linear-gradient(160deg, #eff6ff 0%, #dbeafe 50%, #bfdbfe 100%)" }}>

          {/* Blobs */}
          <div className="blob1 absolute -top-24 -right-24 w-80 h-80 rounded-full bg-blue-200 opacity-40" />
          <div className="blob2 absolute -bottom-16 -left-16 w-64 h-64 rounded-full bg-blue-300 opacity-30" />

          {/* Dot grid */}
          <div className="absolute inset-0 opacity-[0.15]" style={{
            backgroundImage: "radial-gradient(circle, #3b82f6 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }} />

          <div className="relative z-10">
            <p className="text-blue-500 text-xs font-bold uppercase tracking-widest mb-3">
              Kenapa BiinsCart?
            </p>
            <h3 className="text-blue-900 text-4xl font-black leading-tight tracking-tight mb-3">
              Semua yang kamu<br />
              butuhkan untuk<br />
              <span className="font-serif-in italic font-normal text-blue-500">
                sukses jualan.
              </span>
            </h3>
            <p className="text-blue-600/70 text-sm mb-10 leading-relaxed">
              Dari landing page sampai pembayaran — semuanya sudah tersedia dalam satu platform.
            </p>

            {/* Perks */}
            <div className="space-y-4 mb-10">
              {perks.map((p, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white rounded-xl shadow-sm shadow-blue-100 flex items-center justify-center text-lg shrink-0">
                    {p.icon}
                  </div>
                  <p className="text-blue-900 text-sm font-semibold">{p.text}</p>
                </div>
              ))}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
              {[
                { value: "500+", label: "Penjual aktif" },
                { value: "12rb+", label: "Peserta total" },
                { value: "98%",  label: "Kepuasan" },
              ].map((s) => (
                <div key={s.label} className="bg-white/60 backdrop-blur rounded-xl p-3 text-center border border-blue-100">
                  <p className="text-blue-700 text-xl font-black">{s.value}</p>
                  <p className="text-blue-500 text-xs mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}