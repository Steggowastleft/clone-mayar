import { useState } from "react";
import { Head, router } from "@inertiajs/react";
import { Eye, EyeOff, Loader2, ArrowRight, Zap } from "lucide-react";

export default function PenjualLogin() {
  const [form, setForm]       = useState({ email: "", password: "" });
  const [showPw, setShowPw]   = useState(false);
  const [errors, setErrors]   = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const handleSubmit = () => {
    setLoading(true);
    router.post("/login", form, {
      onError:  (e) => { setErrors(e); setLoading(false); },
      onFinish: () => setLoading(false),
    });
  };

  return (
    <>
      <Head title="Masuk — BootcampOS" />
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cabinet+Grotesk:wght@400;500;700;800;900&family=Instrument+Serif:ital@0;1&display=swap');
        * { box-sizing: border-box; }
        .font-cabinet  { font-family: 'Cabinet Grotesk', sans-serif; }
        .font-serif-in { font-family: 'Instrument Serif', serif; }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideLeft {
          from { opacity: 0; transform: translateX(24px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.4; transform: scale(1); }
          50%       { opacity: 0.7; transform: scale(1.05); }
        }
        .anim-1 { animation: fadeUp 0.5s ease 0.0s both; }
        .anim-2 { animation: fadeUp 0.5s ease 0.1s both; }
        .anim-3 { animation: fadeUp 0.5s ease 0.2s both; }
        .anim-4 { animation: fadeUp 0.5s ease 0.3s both; }
        .slide-l { animation: slideLeft 0.7s ease 0.1s both; }
        .blob1 { animation: pulse-slow 7s ease-in-out infinite; }
        .blob2 { animation: pulse-slow 9s ease-in-out 2s infinite; }
        .blob3 { animation: pulse-slow 6s ease-in-out 1s infinite; }

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
          letter-spacing: -0.01em;
        }
        .btn-primary:hover:not(:disabled) {
          background: #1e40af;
          transform: translateY(-1px);
          box-shadow: 0 8px 24px rgba(29,78,216,0.3);
        }
        .btn-primary:disabled { opacity: 0.55; cursor: not-allowed; }

        .feature-pill {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: rgba(255,255,255,0.15);
          backdrop-filter: blur(8px);
          border: 1px solid rgba(255,255,255,0.25);
          border-radius: 100px;
          padding: 6px 14px;
          font-size: 12px;
          color: white;
          font-family: 'Cabinet Grotesk', sans-serif;
          font-weight: 500;
        }
      `}</style>

      <div className="min-h-screen flex font-cabinet bg-white">

        {/* ── Kiri: Branding biru ── */}
        <div className="hidden lg:flex w-[52%] relative overflow-hidden flex-col justify-between p-14"
          style={{ background: "linear-gradient(145deg, #1e40af 0%, #1d4ed8 40%, #2563eb 70%, #3b82f6 100%)" }}>

          {/* Blob decorations */}
          <div className="blob1 absolute -top-20 -left-20 w-96 h-96 rounded-full"
            style={{ background: "rgba(255,255,255,0.08)" }} />
          <div className="blob2 absolute top-1/2 -right-16 w-72 h-72 rounded-full"
            style={{ background: "rgba(255,255,255,0.06)" }} />
          <div className="blob3 absolute -bottom-12 left-1/3 w-56 h-56 rounded-full"
            style={{ background: "rgba(255,255,255,0.07)" }} />

          {/* Dot grid */}
          <div className="absolute inset-0 opacity-[0.08]" style={{
            backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }} />

          {/* Logo */}
          <div className="relative z-10 flex items-center gap-3">
            <div className="w-9 h-9 bg-white rounded-xl flex items-center justify-center shadow-lg">
              <Zap className="h-5 w-5 text-blue-600" fill="currentColor" />
            </div>
            <span className="text-white font-black text-xl tracking-tight">BootcampOS</span>
          </div>

          {/* Headline */}
          <div className="relative z-10">
            <div className="flex flex-wrap gap-2 mb-8">
              {["Bootcamp", "Live Sesi", "Materi", "Peserta", "Landing Page"].map((t) => (
                <span key={t} className="feature-pill">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-300 inline-block" />
                  {t}
                </span>
              ))}
            </div>

            <h1 className="text-white font-black text-5xl leading-[1.1] tracking-tight mb-4">
              Platform untuk<br />
              jualan <br />
              yang serius.
            </h1>
            <p className="text-blue-200 text-sm leading-relaxed max-w-sm">
              Buat landing page, kelola peserta, jadwalkan sesi live, dan pantau semua dari satu dashboard.
            </p>
          </div>

          {/* Testimonial card */}
          <div className="relative z-10">
            <div className="bg-white/10 backdrop-blur border border-white/20 rounded-2xl p-5">
              <p className="text-white text-xs font-bold">
                "Dalam 2 minggu bootcamp pertama saya sudah punya 47 peserta. Platform ini luar biasa mudah dipakai."
              </p>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-300 to-blue-400" />
                <div>
                  <p className="text-white text-xs font-bold">Reza Firmansyah</p>
                  <p className="text-blue-300 text-xs">Penjual · Batch perdana 47 peserta</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Kanan: Form ── */}
        <div className="flex-1 flex items-center justify-center p-8 bg-white">
          <div className="w-full max-w-[360px]">

            {/* Mobile logo */}
            <div className="flex items-center gap-2.5 mb-10 lg:hidden">
              <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center">
                <Zap className="h-5 w-5 text-white" fill="currentColor" />
              </div>
              <span className="font-black text-gray-900 text-xl">BootcampOS</span>
            </div>

            {/* Heading */}
            <div className="anim-1 mb-8">
              <p className="text-blue-500 text-xs font-bold uppercase tracking-widest mb-2">
                Halo Penjual
              </p>
              <h2 className="text-gray-900 text-3xl font-black tracking-tight leading-tight">
                Selamat datang<br />
                <span className="text-gray-900 text-3xl font-black tracking-tight leading-tight">kembali.</span>
              </h2>
              <p className="text-gray-400 text-sm mt-2">
                Masuk untuk mengelola bootcamp kamu
              </p>
            </div>

            {/* Form */}
            <div className="space-y-4">
              {/* Email */}
              <div className="anim-2 space-y-1.5">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Email</label>
                <input
                  type="email"
                  placeholder="email@kamu.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className={`inp ${errors.email ? "inp-err" : ""}`}
                />
                {errors.email && <p className="text-red-400 text-xs">{errors.email}</p>}
              </div>

              {/* Password */}
              <div className="anim-3 space-y-1.5">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Password</label>
                <div className="relative">
                  <input
                    type={showPw ? "text" : "password"}
                    placeholder="••••••••"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                    className={`inp pr-20 ${errors.password ? "inp-err" : ""}`}
                  />
                  <button type="button" onClick={() => setShowPw(!showPw)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-blue-400 hover:text-blue-600 font-semibold transition">
                    {showPw ? "Sembunyikan" : "Tampilkan"}
                  </button>
                </div>
                {errors.password && <p className="text-red-400 text-xs">{errors.password}</p>}
              </div>

              {/* Submit */}
              <div className="anim-4 pt-1">
                <button className="btn-primary" onClick={handleSubmit} disabled={loading}>
                  {loading
                    ? <><Loader2 className="h-4 w-4 animate-spin" /> Masuk...</>
                    : <>Masuk ke Dashboard <ArrowRight className="h-4 w-4" /></>
                  }
                </button>
              </div>

              <p className="anim-4 text-center text-sm text-gray-400 pt-1">
                Belum punya akun?{" "}
                <a href="/register" className="text-blue-600 font-bold hover:text-blue-700 transition">
                  Daftar gratis
                </a>
              </p>

              {/* Divider */}
              <div className="anim-4 flex items-center gap-3 pt-2">
                <div className="flex-1 h-px bg-gray-100" />
                <span className="text-gray-300 text-xs">atau</span>
                <div className="flex-1 h-px bg-gray-100" />
              </div>

              <p className="anim-4 text-center text-xs text-gray-300">
                Kamu peserta bootcamp?{" "}
                <a href="/peserta/login" className="text-gray-400 hover:text-blue-500 underline transition">
                  Masuk sebagai peserta
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}