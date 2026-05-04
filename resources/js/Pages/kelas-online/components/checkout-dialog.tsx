import { useState, useEffect } from "react";
import {
  Dialog, DialogContent, DialogHeader,
  DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Loader2, CheckCircle2, Lock, ArrowRight,
  Mail, KeyRound, User, ChevronLeft, UserPlus, Phone,
} from "lucide-react";

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────
type Step = "pilihan" | "email" | "password" | "register" | "form" | "success";

type KelasOnline = {
  id: number;
  nama: string;
  harga: number;
  is_gratis: boolean;
};

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  kelas: KelasOnline;
};

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────
/**
 * Ambil CSRF token dari cookie XSRF-TOKEN.
 * Cookie ini di-refresh otomatis oleh Laravel setiap response,
 * sehingga tetap valid setelah session regeneration (post-login/register).
 * Laravel menerima header X-XSRF-TOKEN dengan nilai URL-decoded dari cookie ini.
 */
function getCsrfToken(): string {
  const match = document.cookie.match(/(?:^|;\s*)XSRF-TOKEN=([^;]+)/);
  if (match) return decodeURIComponent(match[1]);
  // fallback: meta tag (statis, bisa basi setelah login)
  return (
    (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)
      ?.content ?? ""
  );
}

function jsonHeaders(): Record<string, string> {
  return {
    "Content-Type":  "application/json",
    "X-XSRF-TOKEN": getCsrfToken(),
  };
}

function formatHarga(harga: number, isGratis: boolean) {
  if (isGratis || harga === 0) return "Gratis";
  return `Rp ${Number(harga).toLocaleString("id-ID")}`;
}

// ─────────────────────────────────────────────
// Step indicator dots
// ─────────────────────────────────────────────
function StepDots({ current }: { current: number }) {
  return (
    <div className="flex items-center gap-1.5 justify-center mb-1">
      {[0, 1, 2].map((i) => (
        <div key={i} className={`rounded-full transition-all duration-300 ${
          i === current
            ? "w-5 h-1.5 bg-indigo-600"
            : i < current
            ? "w-1.5 h-1.5 bg-indigo-300"
            : "w-1.5 h-1.5 bg-gray-200"
        }`} />
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────
// Main Checkout Dialog
// ─────────────────────────────────────────────
export function KelasOnlineCheckoutDialog({ open, onOpenChange, kelas }: Props) {
  const [step, setStep]         = useState<Step>("pilihan");
  const [email, setEmail]       = useState("");
  const [nama, setNama]         = useState("");
  const [noHp, setNoHp]         = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw]     = useState(false);
  const [loading, setLoading]   = useState(false);
  const [errors, setErrors]     = useState<Record<string, string>>({});
  const [peserta, setPeserta]   = useState<{ id: number; nama: string; email: string } | null>(null);

  useEffect(() => {
    if (open) {
      setStep("pilihan");
      setEmail(""); setNama(""); setNoHp(""); setPassword("");
      setErrors({}); setPeserta(null); setShowPw(false);
    }
  }, [open]);

  // Dot index
  const dotIndex =
    step === "pilihan" || step === "email" || step === "password" || step === "register" ? 0
    : step === "form" ? 1
    : 2;

  // ── STEP 1: Cek email ────────────────────────
  const handleCheckEmail = async () => {
    if (!email) { setErrors({ email: "Email wajib diisi." }); return; }
    if (!/\S+@\S+\.\S+/.test(email)) { setErrors({ email: "Format email tidak valid." }); return; }
    setErrors({});
    setLoading(true);
    try {
      const res  = await fetch("/peserta/check-email", {
        method:  "POST",
        headers: jsonHeaders(),
        body:    JSON.stringify({ email }),
      });
      const data = await res.json();
      setStep(data.exists ? "password" : "register");
    } catch { setErrors({ email: "Terjadi kesalahan, coba lagi." }); }
    finally  { setLoading(false); }
  };

  // ── STEP 2a: Login ───────────────────────────
  const handleLogin = async () => {
    if (!password) { setErrors({ password: "Password wajib diisi." }); return; }
    setErrors({});
    setLoading(true);
    try {
      const res  = await fetch("/peserta/login-checkout", {
        method:  "POST",
        headers: jsonHeaders(),
        body:    JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (res.ok && data.peserta) {
        setPeserta(data.peserta);
        // Cek apakah sudah terdaftar (CSRF diambil ulang setelah session baru)
        const checkRes = await fetch(`/kelas-online/${kelas.id}/daftar`, {
          method:  "POST",
          headers: jsonHeaders(),     // getCsrfToken() re-read cookie terbaru
          body:    JSON.stringify({}),
        });
        if (checkRes.status === 409) {
          const checkData = await checkRes.json();
          window.location.href = checkData.redirect || "/peserta/dashboard";
        } else {
          setStep("form");
        }
      } else if (res.status === 401) {
        setErrors({ password: data.message || "Email atau password salah." });
      } else {
        setErrors({ password: data.message || "Terjadi kesalahan. Coba lagi." });
      }
    } catch { setErrors({ password: "Terjadi kesalahan jaringan. Coba lagi." }); }
    finally  { setLoading(false); }
  };

  // ── STEP 2b: Register ────────────────────────
  const handleRegister = async () => {
    const errs: Record<string, string> = {};
    if (!nama)                           errs.nama     = "Nama wajib diisi.";
    if (!password || password.length < 8) errs.password = "Password minimal 8 karakter.";
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setLoading(true);
    try {
      const res  = await fetch("/peserta/register-checkout", {
        method:  "POST",
        headers: jsonHeaders(),
        body:    JSON.stringify({ email, nama, password }),
      });
      const data = await res.json();
      if (res.ok && data.peserta) {
        setPeserta(data.peserta);
        setStep("form");
      } else if (res.status === 422) {
        const flatErrors: Record<string, string> = {};
        for (const [key, val] of Object.entries(data.errors || data)) {
          flatErrors[key] = Array.isArray(val) ? val[0] : String(val);
        }
        setErrors(flatErrors);
      } else {
        setErrors({ email: data.message || "Gagal membuat akun." });
      }
    } catch { setErrors({ email: "Terjadi kesalahan jaringan." }); }
    finally  { setLoading(false); }
  };

  // ── STEP 3: Submit pendaftaran kelas ─────────
  const handleDaftar = async () => {
    setErrors({});
    setLoading(true);
    try {
      const res  = await fetch(`/kelas-online/${kelas.id}/daftar`, {
        method:  "POST",
        headers: jsonHeaders(),     // token terbaru dari cookie
        body:    JSON.stringify({ no_hp: noHp }),
      });
      const data = await res.json();
      if (res.ok) {
        setStep("success");
        setTimeout(() => {
          window.location.href = data.redirect || "/peserta/dashboard";
        }, 2000);
      } else if (res.status === 409) {
        window.location.href = data.redirect || "/peserta/dashboard";
      } else {
        setErrors({ general: data.message || "Gagal mendaftar. Coba lagi." });
      }
    } catch { setErrors({ general: "Terjadi kesalahan. Coba lagi." }); }
    finally  { setLoading(false); }
  };

  // ─────────────────────────────────────────────
  // Title & Description per step
  // ─────────────────────────────────────────────
  const titles: Record<Step, string> = {
    pilihan:  "Daftar Kelas Online",
    email:    `Daftar: ${kelas.nama}`,
    password: "Masukkan Password",
    register: "Buat Akun",
    form:     "Konfirmasi Pendaftaran",
    success:  "Pendaftaran Berhasil! 🎉",
  };
  const descs: Record<Step, string> = {
    pilihan:  "Pilih cara pendaftaran kamu.",
    email:    "Masukkan email kamu untuk melanjutkan.",
    password: `Kami mengenali email ${email}. Masukkan password kamu.`,
    register: "Email baru! Buat password untuk akunmu.",
    form:     "Konfirmasi data pendaftaranmu.",
    success:  "Kamu akan diarahkan ke dashboard...",
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] flex flex-col overflow-hidden p-0">

        {/* Header */}
        <div className="px-6 pt-5 pb-4 border-b border-gray-100 shrink-0">
          {step !== "pilihan" && step !== "success" && (
            <button
              onClick={() => {
                if (step === "email")    setStep("pilihan");
                if (step === "password" || step === "register") setStep("email");
                if (step === "form")    setStep(peserta ? "email" : "register");
              }}
              className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 mb-3 transition"
            >
              <ChevronLeft className="h-3.5 w-3.5" /> Kembali
            </button>
          )}
          <StepDots current={dotIndex} />
          <DialogHeader className="mt-2">
            <DialogTitle className="text-base font-bold text-gray-900">{titles[step]}</DialogTitle>
            <DialogDescription className="text-xs">{descs[step]}</DialogDescription>
          </DialogHeader>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 min-h-0">

          {/* ── PILIHAN ── */}
          {step === "pilihan" && (
            <div className="space-y-3">
              <div className="p-3 bg-indigo-50 rounded-xl border border-indigo-100 text-center">
                <p className="text-xs text-indigo-600 font-semibold">Mendaftar ke</p>
                <p className="text-sm font-bold text-indigo-900 mt-0.5">{kelas.nama}</p>
                <p className="text-lg font-extrabold text-indigo-600 mt-1">
                  {formatHarga(kelas.harga, kelas.is_gratis)}
                </p>
              </div>

              <button
                onClick={() => setStep("email")}
                className="w-full flex items-center gap-4 p-4 border-2 border-indigo-200 rounded-xl hover:border-indigo-500 hover:bg-indigo-50 transition group text-left"
              >
                <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center shrink-0 group-hover:bg-indigo-200 transition">
                  <KeyRound className="h-5 w-5 text-indigo-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-gray-800">Sudah punya akun</p>
                  <p className="text-xs text-gray-500 mt-0.5">Masuk dengan email & password</p>
                </div>
                <ChevronLeft className="h-4 w-4 text-gray-400 rotate-180 shrink-0" />
              </button>

              <button
                onClick={() => setStep("email")}
                className="w-full flex items-center gap-4 p-4 border-2 border-violet-200 rounded-xl hover:border-violet-500 hover:bg-violet-50 transition group text-left"
              >
                <div className="w-10 h-10 bg-violet-100 rounded-full flex items-center justify-center shrink-0 group-hover:bg-violet-200 transition">
                  <UserPlus className="h-5 w-5 text-violet-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-gray-800">Belum punya akun</p>
                  <p className="text-xs text-gray-500 mt-0.5">Daftar akun baru, gratis!</p>
                </div>
                <ChevronLeft className="h-4 w-4 text-gray-400 rotate-180 shrink-0" />
              </button>

              <p className="text-xs text-center text-gray-400 pt-1">
                🔒 Data kamu aman dan tidak akan disalahgunakan
              </p>
            </div>
          )}

          {/* ── EMAIL ── */}
          {step === "email" && (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-sm font-medium text-gray-700">
                  Email <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    type="email"
                    placeholder="email@kamu.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleCheckEmail()}
                    className={`pl-9 ${errors.email ? "border-red-400" : ""}`}
                  />
                </div>
                {errors.email && <p className="text-xs text-red-500">{errors.email}</p>}
              </div>
            </div>
          )}

          {/* ── PASSWORD (existing user) ── */}
          {step === "password" && (
            <div className="space-y-4">
              <div className="p-3 bg-indigo-50 rounded-xl border border-indigo-100 text-xs text-indigo-700">
                ✅ Email ini sudah terdaftar. Masukkan password untuk melanjutkan.
              </div>
              <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2.5 text-sm text-gray-600">
                <Mail className="h-4 w-4 text-gray-400 shrink-0" />
                <span className="flex-1 truncate">{email}</span>
                <Lock className="h-3.5 w-3.5 text-gray-300" />
              </div>

              <div className="space-y-1.5">
                <Label className="text-sm font-medium text-gray-700">
                  Password <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    type={showPw ? "text" : "password"}
                    placeholder="Password kamu"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                    className={`pl-9 pr-20 ${errors.password ? "border-red-400" : ""}`}
                  />
                  <button type="button" onClick={() => setShowPw(!showPw)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 hover:text-gray-600">
                    {showPw ? "Sembunyikan" : "Tampilkan"}
                  </button>
                </div>
                {errors.password && <p className="text-xs text-red-500">{errors.password}</p>}
              </div>
            </div>
          )}

          {/* ── REGISTER (new user) ── */}
          {step === "register" && (
            <div className="space-y-4">
              <div className="p-3 bg-violet-50 rounded-xl border border-violet-100 text-xs text-violet-700">
                🆕 Email ini belum terdaftar. Buat akun baru untuk melanjutkan.
              </div>
              <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2.5 text-sm text-gray-600">
                <Mail className="h-4 w-4 text-gray-400 shrink-0" />
                <span className="flex-1 truncate">{email}</span>
                <Lock className="h-3.5 w-3.5 text-gray-300" />
              </div>

              <div className="space-y-1.5">
                <Label className="text-sm font-medium text-gray-700">
                  Nama Lengkap <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Nama lengkap kamu"
                    value={nama}
                    onChange={(e) => setNama(e.target.value)}
                    className={`pl-9 ${errors.nama ? "border-red-400" : ""}`}
                  />
                </div>
                {errors.nama && <p className="text-xs text-red-500">{errors.nama}</p>}
              </div>

              <div className="space-y-1.5">
                <Label className="text-sm font-medium text-gray-700">
                  Buat Password <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    type={showPw ? "text" : "password"}
                    placeholder="Min. 8 karakter"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleRegister()}
                    className={`pl-9 pr-20 ${errors.password ? "border-red-400" : ""}`}
                  />
                  <button type="button" onClick={() => setShowPw(!showPw)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 hover:text-gray-600">
                    {showPw ? "Sembunyikan" : "Tampilkan"}
                  </button>
                </div>
                {errors.password && <p className="text-xs text-red-500">{errors.password}</p>}
                <p className="text-xs text-gray-400">Password ini akan dipakai untuk login ke akun pesertamu.</p>
              </div>

              {errors.email && (
                <div className="p-3 bg-red-50 rounded-lg border border-red-200">
                  <p className="text-xs text-red-700">{errors.email}</p>
                </div>
              )}
            </div>
          )}

          {/* ── FORM KONFIRMASI ── */}
          {step === "form" && (
            <div className="space-y-4">
              {peserta && (
                <div className="space-y-2 pb-3 border-b border-gray-100">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Data Akun</p>
                  {[
                    { label: "Nama",  value: peserta.nama },
                    { label: "Email", value: peserta.email },
                  ].map((f) => (
                    <div key={f.label} className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2 text-sm text-gray-600">
                      <Lock className="h-3.5 w-3.5 text-gray-300 shrink-0" />
                      <span className="text-gray-400 w-12 text-xs">{f.label}</span>
                      <span className="flex-1 truncate font-medium text-gray-700">{f.value}</span>
                    </div>
                  ))}
                </div>
              )}

              <div className="space-y-1.5">
                <Label className="text-sm font-medium text-gray-700">No. WhatsApp (opsional)</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="08xxxxxxxxxx"
                    value={noHp}
                    onChange={(e) => setNoHp(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <p className="text-xs text-gray-400">Digunakan untuk informasi kelas via WhatsApp.</p>
              </div>

              <div className="p-3 bg-indigo-50 rounded-xl border border-indigo-100">
                <p className="text-xs text-indigo-600 font-semibold">Kelas yang didaftarkan</p>
                <p className="text-sm font-bold text-indigo-900 mt-0.5">{kelas.nama}</p>
                <p className="text-sm font-bold text-indigo-600 mt-1">
                  {formatHarga(kelas.harga, kelas.is_gratis)}
                </p>
              </div>

              {errors.general && (
                <p className="text-xs text-red-500 text-center">{errors.general}</p>
              )}
            </div>
          )}

          {/* ── SUCCESS ── */}
          {step === "success" && (
            <div className="flex flex-col items-center justify-center py-8 space-y-3">
              <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center">
                <CheckCircle2 className="h-9 w-9 text-emerald-500" />
              </div>
              <p className="text-sm text-gray-600 text-center">
                Pendaftaran berhasil! Mengalihkan ke dashboard...
              </p>
              <Loader2 className="h-5 w-5 text-indigo-500 animate-spin" />
            </div>
          )}
        </div>

        {/* Footer CTA */}
        {step !== "success" && (
          <div className="px-6 py-4 border-t border-gray-100 shrink-0">
            {step === "email" && (
              <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold"
                onClick={handleCheckEmail} disabled={loading}>
                {loading
                  ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Memeriksa...</>
                  : <>Lanjutkan <ArrowRight className="h-4 w-4 ml-1" /></>}
              </Button>
            )}
            {step === "password" && (
              <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold"
                onClick={handleLogin} disabled={loading}>
                {loading
                  ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Masuk...</>
                  : <>Masuk & Lanjutkan <ArrowRight className="h-4 w-4 ml-1" /></>}
              </Button>
            )}
            {step === "register" && (
              <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold"
                onClick={handleRegister} disabled={loading}>
                {loading
                  ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Membuat akun...</>
                  : <>Buat Akun & Lanjutkan <ArrowRight className="h-4 w-4 ml-1" /></>}
              </Button>
            )}
            {step === "form" && (
              <div className="flex gap-3">
                <Button variant="outline" className="flex-1" onClick={() => onOpenChange(false)} disabled={loading}>
                  Batal
                </Button>
                <Button className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold"
                  onClick={handleDaftar} disabled={loading}>
                  {loading
                    ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Mendaftar...</>
                    : "Daftar Sekarang"}
                </Button>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
