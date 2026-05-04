import { useState, useEffect, useRef } from "react";
import {
  Dialog, DialogContent, DialogHeader,
  DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Loader2, CheckCircle2, Lock, ArrowRight,
  Mail, KeyRound, User, ChevronLeft, UserPlus, X, Upload,
} from "lucide-react";

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────
type FieldType = "single_line" | "multi_line" | "checkbox" | "number"
  | "datepicker" | "dropdown" | "url" | "divider" | "title"
  | "text_notes" | "file_upload" | "image_upload";

type KustomField = {
  id: string;
  type: FieldType;
  label: string;
  help_text?: string;
  is_required: boolean;
};

type Step = "pilihan" | "email" | "password" | "register" | "form" | "success";

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  bootcampId: number;
  bootcampName: string;
  harga?: number;
};

// ─────────────────────────────────────────────
// Dynamic Field Renderer
// ─────────────────────────────────────────────
function DynamicField({
  field, value, onChange, error,
}: {
  field: KustomField;
  value: any;
  onChange: (v: any) => void;
  error?: string;
}) {
  if (field.type === "divider")    return <hr className="border-gray-100 my-1" />;
  if (field.type === "title")      return <p className="text-sm font-semibold text-gray-800 pt-1">{field.label}</p>;
  if (field.type === "text_notes") return <p className="text-xs text-gray-500 leading-relaxed">{field.label}</p>;

  return (
    <div className="space-y-1.5">
      <Label className="text-sm font-medium text-gray-700">
        {field.label}
        {field.is_required && <span className="text-red-500 ml-1">*</span>}
      </Label>

      {field.type === "multi_line" && (
        <textarea rows={3} value={value || ""} onChange={(e) => onChange(e.target.value)}
          placeholder={field.help_text || ""}
          className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
      )}

      {field.type === "checkbox" && (
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={!!value} onChange={(e) => onChange(e.target.checked)}
            className="w-4 h-4 rounded border-gray-300 text-blue-600" />
          <span className="text-sm text-gray-700">{field.help_text || field.label}</span>
        </label>
      )}

      {field.type === "datepicker" && (
        <Input type="date" value={value || ""} onChange={(e) => onChange(e.target.value)}
          className={error ? "border-red-400" : ""} />
      )}

      {(["single_line", "number", "url"] as FieldType[]).includes(field.type) && (
        <Input
          type={field.type === "number" ? "number" : field.type === "url" ? "url" : "text"}
          value={value || ""} onChange={(e) => onChange(e.target.value)}
          placeholder={field.help_text || ""}
          className={error ? "border-red-400" : ""} />
      )}

      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}

// ─────────────────────────────────────────────
// Step indicator
// ─────────────────────────────────────────────
function StepDots({ current }: { current: number }) {
  return (
    <div className="flex items-center gap-1.5 justify-center mb-1">
      {[0, 1, 2].map((i) => (
        <div key={i} className={`rounded-full transition-all duration-300 ${
          i === current
            ? "w-5 h-1.5 bg-blue-600"
            : i < current
            ? "w-1.5 h-1.5 bg-blue-300"
            : "w-1.5 h-1.5 bg-gray-200"
        }`} />
      ))}
    </div>
  );
}

function getCsrf(): string {
  return (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content || "";
}

// ─────────────────────────────────────────────
// Main Dialog
// ─────────────────────────────────────────────
export function CheckoutDialog({ open, onOpenChange, bootcampId, bootcampName, harga }: Props) {
  const [step, setStep]           = useState<Step>("pilihan");
  const [email, setEmail]         = useState("");
  const [nama, setNama]           = useState("");
  const [password, setPassword]   = useState("");
  const [showPw, setShowPw]       = useState(false);
  const [fields, setFields]       = useState<KustomField[]>([]);
  const [formData, setFormData]   = useState<Record<string, any>>({});
  const [errors, setErrors]       = useState<Record<string, string>>({});
  const [loading, setLoading]     = useState(false);
  const [fetching, setFetching]   = useState(false);
  // Setelah auth berhasil, simpan data peserta
  const [peserta, setPeserta]     = useState<{ id: number; nama: string; email: string; no_hp?: string } | null>(null);

  useEffect(() => {
    if (open) {
      // Reset setiap kali dialog dibuka
      setStep("pilihan");
      setEmail(""); setNama(""); setPassword("");
      setFormData({}); setErrors({}); setPeserta(null);
    }
  }, [open]);

  // ── Step dot index ───────────────────────────
  const dotIndex = step === "pilihan" || step === "email" || step === "password" || step === "register" ? 0
    : step === "form" ? 1
    : 2;

  // ── Fetch kustom form ────────────────────────
  const fetchFields = async () => {
    setFetching(true);
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10000); // 10 detik timeout
      
      const res  = await fetch(`/bootcamps/${bootcampId}/kustom-form`, {
        signal: controller.signal
      });
      clearTimeout(timeout);
      
      if (!res.ok) {
        console.error("Fetch fields failed:", res.status, res.statusText);
        setFields([]);
        return;
      }
      
      const data = await res.json();
      setFields(data.fields || []);
    } catch (err) { 
      console.error("Fetch fields error:", err);
      setFields([]); 
    }
    finally  { setFetching(false); }
  };

  // ── STEP 1: Cek email ────────────────────────
  const handleCheckEmail = async () => {
    if (!email) { setErrors({ email: "Email wajib diisi." }); return; }
    if (!/\S+@\S+\.\S+/.test(email)) { setErrors({ email: "Format email tidak valid." }); return; }
    setErrors({});
    setLoading(true);
    try {
      const res  = await fetch("/peserta/check-email", {
        method:  "POST",
        headers: { "Content-Type": "application/json", "X-CSRF-TOKEN": getCsrf() },
        body:    JSON.stringify({ email }),
      });
      const data = await res.json();
      // exists: true  → minta password (login)
      // exists: false → minta buat password + nama (register)
      setStep(data.exists ? "password" : "register");
    } catch { setErrors({ email: "Terjadi kesalahan, coba lagi." }); }
    finally  { setLoading(false); }
  };

  // ── STEP 2a: Login peserta yang sudah ada ────
  const handleLogin = async () => {
    if (!password) { setErrors({ password: "Password wajib diisi." }); return; }
    setErrors({});
    setLoading(true);
    try {
      const res  = await fetch("/peserta/login-checkout", {
        method:  "POST",
        headers: { "Content-Type": "application/json", "X-CSRF-TOKEN": getCsrf() },
        body:    JSON.stringify({ email, password }),
      });
      const data = await res.json();
      console.log("Login response:", { status: res.status, ok: res.ok, data: JSON.stringify(data, null, 2) });
      
      if (res.ok && data.peserta) {
        console.log("✅ Login berhasil! Cek apakah sudah terdaftar di bootcamp...");
        setPeserta(data.peserta);
        
        // Cek apakah sudah terdaftar di bootcamp ini
        try {
          const checkRes = await fetch(`/bootcamps/${bootcampId}/daftar`, {
            method:  "POST",
            headers: { "Content-Type": "application/json", "X-CSRF-TOKEN": getCsrf() },
            body:    JSON.stringify({}),
          });
          
          const checkData = await checkRes.json();
          console.log("Registration check response:", { status: checkRes.status, data: checkData });
          
          if (checkRes.status === 409) {
            // Sudah terdaftar → langsung redirect ke kelas
            console.log("✅ Sudah terdaftar! Redirect ke kelas...");
            window.location.href = checkData.redirect || `/peserta/kelas/${bootcampId}`;
          } else if (checkRes.ok || checkRes.status === 422) {
            // Belum terdaftar → tampilkan form checkout
            console.log("📋 Belum terdaftar, tampilkan form checkout...");
            setStep("form");
            fetchFields();
          } else {
            setErrors({ password: "Gagal cek status registrasi. Coba lagi." });
          }
        } catch (err) {
          console.error("Check registration error:", err);
          // Jika error, lanjut ke form checkout (assume belum terdaftar)
          setStep("form");
          fetchFields();
        }
      } else if (res.status === 422 && data.errors) {
        const flatErrors: Record<string, string> = {};
        for (const [key, value] of Object.entries(data.errors)) {
          if (Array.isArray(value) && value.length > 0) {
            flatErrors[key] = value[0];
          } else if (typeof value === 'string') {
            flatErrors[key] = value;
          }
        }
        setErrors(flatErrors);
      } else if (res.status === 401) {
        setErrors({ password: data.message || "Email atau password salah." });
      } else {
        setErrors({ password: data.message || "Terjadi kesalahan. Coba lagi." });
      }
    } catch (err) { 
      console.error("Login error:", err);
      setErrors({ password: "Terjadi kesalahan jaringan. Coba lagi." }); 
    }
    finally  { setLoading(false); }
  };

  // ── STEP 2b: Register peserta baru ───────────
  const handleRegister = async () => {
    const errs: Record<string, string> = {};
    if (!nama)                          errs.nama     = "Nama wajib diisi.";
    if (!password || password.length < 8) errs.password = "Password minimal 8 karakter.";
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setLoading(true);
    
    console.log("📤 Sending register request:", { email, nama, password: "***" });
    
    try {
      const res  = await fetch("/peserta/register-checkout", {
        method:  "POST",
        headers: { "Content-Type": "application/json", "X-CSRF-TOKEN": getCsrf() },
        body:    JSON.stringify({ email, nama, password }),
      });
      
      const data = await res.json();
      console.log("📥 Register response:", { 
        status: res.status, 
        ok: res.ok, 
        data: JSON.stringify(data, null, 2) 
      });
      
      if (res.ok && data.peserta) {
        console.log("✅ Register berhasil! Pindah ke step form...");
        setPeserta(data.peserta);
        setStep("form");
        fetchFields();
      } else if (res.status === 422) {
        // Validation error — Laravel mengirim error dengan struktur { field: ['message1', 'message2'] }
        const errorData = data.errors || data;
        console.error("❌ Validation errors:", errorData);
        
        const flatErrors: Record<string, string> = {};
        for (const [key, value] of Object.entries(errorData)) {
          if (Array.isArray(value) && value.length > 0) {
            flatErrors[key] = value[0]; // Ambil pesan pertama dari array
          } else if (typeof value === 'string') {
            flatErrors[key] = value;
          }
        }
        console.log("Flattened errors:", flatErrors);
        setErrors(flatErrors);
      } else if (res.status === 500) {
        console.error("❌ Server error:", data);
        setErrors({ email: data.message || "Terjadi kesalahan server. Hubungi admin." });
      } else {
        console.error("❌ Unknown error:", data);
        setErrors({ email: data.message || "Gagal membuat akun. Silakan coba lagi." });
      }
    } catch (err) { 
      console.error("❌ Network error:", err);
      setErrors({ email: "Terjadi kesalahan jaringan. Coba lagi." }); 
    }
    finally  { setLoading(false); }
  };

  // ── STEP 3: Submit checkout ──────────────────
  const handleCheckout = async () => {
    const errs: Record<string, string> = {};
    fields.forEach((f) => {
      if (f.is_required && !formData[f.id]) errs[f.id] = `${f.label} wajib diisi.`;
    });
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setLoading(true);
    try {
      const res  = await fetch(`/bootcamps/${bootcampId}/daftar`, {
        method:  "POST",
        headers: { "Content-Type": "application/json", "X-CSRF-TOKEN": getCsrf() },
        body:    JSON.stringify(formData),
      });
      const data = await res.json();
      if (res.ok) {
        setStep("success");
        setTimeout(() => { window.location.href = data.redirect || "/peserta/dashboard"; }, 2000);
      } else if (res.status === 409) {
        window.location.href = data.redirect;
      } else {
        setErrors(data.errors || {});
      }
    } catch { setErrors({ general: "Terjadi kesalahan. Coba lagi." }); }
    finally  { setLoading(false); }
  };

  // ─────────────────────────────────────────────
  // Title & description per step
  // ─────────────────────────────────────────────
  const titles: Record<Step, string> = {
    email:    `Daftar: ${bootcampName}`,
    pilihan:  "Daftar Bootcamp",
    password: "Masukkan Password",
    register: "Buat Password",
    form:     "Lengkapi Data",
    success:  "Pendaftaran Berhasil! 🎉",
  };
  const descs: Record<Step, string> = {
    pilihan:  "Pilih cara pendaftaran kamu.",
    email:    "Masukkan email kamu untuk melanjutkan.",
    password: `Hai! Kami mengenali email ${email}. Masukkan password kamu.`,
    register: "Email baru! Buat password untuk akunmu.",
    form:     "Lengkapi data berikut untuk mendaftar.",
    success:  "Kamu akan diarahkan ke halaman kelas...",
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] flex flex-col overflow-hidden p-0">

        {/* Header */}
        <div className="px-6 pt-5 pb-4 border-b border-gray-100 shrink-0">
          {step !== "pilihan" && step !== "success" && (
            <button
              onClick={() => {
                if (step === "email") setStep("pilihan");
                if (step === "password" || step === "register") setStep("email");
                if (step === "form") setStep(peserta ? "email" : "register");
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

          {/* ── PILIHAN: SUDAH PUNYA AKUN / BELUM ── */}
          {step === "pilihan" && (
            <div className="space-y-3">
              {/* Info bootcamp */}
              <div className="p-3 bg-blue-50 rounded-xl border border-blue-100 text-center">
                <p className="text-xs text-blue-600 font-semibold">Mendaftar ke</p>
                <p className="text-sm font-bold text-blue-900 mt-0.5">{bootcampName}</p>
              </div>

              {/* Pilihan login */}
              <button
                onClick={() => setStep("email")}
                className="w-full flex items-center gap-4 p-4 border-2 border-blue-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition group text-left"
              >
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center shrink-0 group-hover:bg-blue-200 transition">
                  <KeyRound className="h-5 w-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-gray-800">Sudah punya akun</p>
                  <p className="text-xs text-gray-500 mt-0.5">Masuk dengan email & password</p>
                </div>
                <ChevronLeft className="h-4 w-4 text-gray-400 rotate-180 shrink-0" />
              </button>

              {/* Pilihan register */}
              <button
                onClick={() => {
                  // Tetap lewat email check terlebih dahulu
                  setStep("email");
                }}
                className="w-full flex items-center gap-4 p-4 border-2 border-green-200 rounded-xl hover:border-green-500 hover:bg-green-50 transition group text-left"
              >
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center shrink-0 group-hover:bg-green-200 transition">
                  <UserPlus className="h-5 w-5 text-green-600" />
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
              {/* Info sudah punya akun */}
              <div className="p-3 bg-blue-50 rounded-xl border border-blue-100 text-xs text-blue-700">
                ✅ Email ini sudah terdaftar. Masukkan password untuk melanjutkan pendaftaran.
              </div>
              {/* Email locked */}
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
                    className={`pl-9 pr-10 ${errors.password ? "border-red-400" : ""}`}
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
              {/* Info belum punya akun */}
              <div className="p-3 bg-green-50 rounded-xl border border-green-100 text-xs text-green-700">
                🆕 Email ini belum terdaftar. Buat akun baru untuk melanjutkan.
              </div>
              {/* Email locked */}
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
                    className={`pl-9 pr-10 ${errors.password ? "border-red-400" : ""}`}
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

          {/* ── FORM CHECKOUT ── */}
          {step === "form" && (
            <div className="space-y-4">
              {fetching ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 text-blue-600 animate-spin" />
                </div>
              ) : (
                <>
                  {/* 3 field locked dari akun */}
                  {peserta && (
                    <div className="space-y-2 pb-3 border-b border-gray-100">
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                        Data Akun
                      </p>
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

                  {/* Field kustom */}
                  {fields.length > 0 ? (
                    <div className="space-y-3">
                      {fields.map((field) => (
                        <DynamicField
                          key={field.id}
                          field={field}
                          value={formData[field.id]}
                          onChange={(v) => setFormData({ ...formData, [field.id]: v })}
                          error={errors[field.id]}
                        />
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-gray-400 text-center py-4">Tidak ada form tambahan.</p>
                  )}

                  {errors.general && (
                    <p className="text-xs text-red-500 text-center">{errors.general}</p>
                  )}
                </>
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
                Pendaftaran berhasil! Mengalihkan ke halaman kelas...
              </p>
              <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />
            </div>
          )}
        </div>

        {/* Footer CTA */}
        {step !== "success" && (
          <div className="px-6 py-4 border-t border-gray-100 shrink-0">
            {step === "email" && (
              <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold"
                onClick={handleCheckEmail} disabled={loading}>
                {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Memeriksa...</>
                  : <>Lanjutkan <ArrowRight className="h-4 w-4 ml-1" /></>}
              </Button>
            )}
            {step === "password" && (
              <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold"
                onClick={handleLogin} disabled={loading}>
                {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Masuk...</>
                  : <>Masuk & Lanjutkan <ArrowRight className="h-4 w-4 ml-1" /></>}
              </Button>
            )}
            {step === "register" && (
              <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold"
                onClick={handleRegister} disabled={loading}>
                {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Membuat akun...</>
                  : <>Buat Akun & Lanjutkan <ArrowRight className="h-4 w-4 ml-1" /></>}
              </Button>
            )}
            {step === "form" && (
              <div className="flex gap-3">
                <Button variant="outline" className="flex-1" onClick={() => onOpenChange(false)} disabled={loading}>
                  Batal
                </Button>
                <Button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold"
                  onClick={handleCheckout} disabled={loading || fetching}>
                  {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Mendaftar...</>
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

// ─────────────────────────────────────────────
// PaymentDialog — untuk bootcamp berbayar
// Peserta kirim bukti transfer → admin konfirmasi
// ─────────────────────────────────────────────
type PaymentStep = "detail" | "upload" | "waiting" | "confirmed";

type PaymentProps = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  bootcampId: number;
  bootcampName: string;
  harga: number;
};

export function PaymentDialog({ open, onOpenChange, bootcampId, bootcampName, harga }: PaymentProps) {
  const [step,     setStep]     = useState<PaymentStep>("detail");
  const [bukti,    setBukti]    = useState<File | null>(null);
  const [preview,  setPreview]  = useState<string | null>(null);
  const [catatan,  setCatatan]  = useState("");
  const [loading,  setLoading]  = useState(false);
  const [errors,   setErrors]   = useState<Record<string, string>>({});
  const [orderId,  setOrderId]  = useState<string | null>(null);
  const [nama,     setNama]     = useState("");
  const [emailByr, setEmailByr] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setStep("detail");
      setBukti(null); setPreview(null);
      setCatatan(""); setErrors({});
      setOrderId(null);
      setNama(""); setEmailByr("");
    }
  }, [open]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setBukti(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleUpload = async () => {
    if (!nama.trim()) { setErrors({ bukti: "Nama wajib diisi." }); return; }
    if (!emailByr.trim()) { setErrors({ bukti: "Email wajib diisi." }); return; }
    if (!bukti) { setErrors({ bukti: "Upload bukti transfer terlebih dahulu." }); return; }
    setLoading(true);
    setErrors({});
    try {
      const fd = new FormData();
      fd.append("bootcamp_id", String(bootcampId));
      fd.append("nama", nama);
      fd.append("email", emailByr);
      fd.append("bukti_transfer", bukti);
      fd.append("catatan", catatan);
      const csrfMeta = document.head.querySelector('meta[name="csrf-token"]') as HTMLMetaElement;
      if (csrfMeta) fd.append("_token", csrfMeta.content);

      const res  = await fetch("/pembayaran/upload-bukti", { method: "POST", body: fd });
      const data = await res.json();
      if (res.ok) {
        setOrderId(data.order_id);
        setStep("waiting");
      } else {
        setErrors({ bukti: data.message ?? "Gagal mengirim bukti." });
      }
    } catch {
      setErrors({ bukti: "Terjadi kesalahan, coba lagi." });
    } finally {
      setLoading(false);
    }
  };

  const formatHarga = (n: number) =>
    new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(n);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-base font-bold">
            {step === "detail"    && "Detail Pembayaran"}
            {step === "upload"    && "Upload Bukti Transfer"}
            {step === "waiting"   && "Menunggu Konfirmasi"}
            {step === "confirmed" && "Pembayaran Dikonfirmasi!"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-1">

          {/* ── DETAIL PEMBAYARAN ── */}
          {step === "detail" && (
            <div className="space-y-4">
              {/* Info bootcamp */}
              <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                <p className="text-xs text-blue-600 font-semibold mb-1">Kelas yang didaftarkan</p>
                <p className="text-sm font-bold text-gray-800">{bootcampName}</p>
                <p className="text-2xl font-black text-blue-600 mt-2">{formatHarga(harga)}</p>
              </div>

              {/* Instruksi transfer */}
              <div className="space-y-3">
                <p className="text-sm font-semibold text-gray-700">Cara Pembayaran:</p>
                <div className="space-y-2">
                  {[
                    { no: "1", text: "Transfer ke rekening berikut:" },
                    { no: "2", text: "Screenshot bukti transfer" },
                    { no: "3", text: "Upload bukti transfer di sini" },
                    { no: "4", text: "Admin akan mengkonfirmasi dalam 1x24 jam" },
                    { no: "5", text: "Setelah dikonfirmasi, kamu bisa daftar akun & akses kelas" },
                  ].map((item) => (
                    <div key={item.no} className="flex items-start gap-3">
                      <span className="w-6 h-6 bg-blue-600 text-white text-xs font-bold rounded-full flex items-center justify-center shrink-0">
                        {item.no}
                      </span>
                      <p className="text-sm text-gray-600">{item.text}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Info rekening — ini bisa dikustomisasi penjual */}
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-2">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Info Rekening</p>
                <div className="space-y-1">
                  <p className="text-sm"><span className="text-gray-400">Bank:</span> <span className="font-semibold text-gray-800">BCA</span></p>
                  <p className="text-sm"><span className="text-gray-400">No. Rekening:</span> <span className="font-semibold text-gray-800 select-all">1234567890</span></p>
                  <p className="text-sm"><span className="text-gray-400">Atas Nama:</span> <span className="font-semibold text-gray-800">Admin Bootcamp</span></p>
                </div>
                <p className="text-xs text-orange-600 font-medium">
                  ⚠️ Transfer tepat {formatHarga(harga)} agar mudah diverifikasi
                </p>
              </div>

              <button
                onClick={() => setStep("upload")}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-sm transition"
              >
                Sudah Transfer → Upload Bukti
              </button>
              <p className="text-xs text-center text-gray-400">
                Belum transfer? Catat info rekening di atas terlebih dahulu.
              </p>
            </div>
          )}

          {/* ── UPLOAD BUKTI ── */}
          {step === "upload" && (
            <div className="space-y-4">
              {/* Nama & email */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <p className="text-xs font-medium text-gray-600 mb-1">Nama <span className="text-red-500">*</span></p>
                  <input
                    type="text" placeholder="Nama lengkap"
                    value={nama} onChange={e => setNama(e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-600 mb-1">Email <span className="text-red-500">*</span></p>
                  <input
                    type="email" placeholder="Email kamu"
                    value={emailByr} onChange={e => setEmailByr(e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              {/* Upload area */}
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">
                  Bukti Transfer <span className="text-red-500">*</span>
                </p>
                {preview ? (
                  <div className="relative">
                    <img src={preview} alt="bukti" className="w-full max-h-48 object-contain rounded-xl border border-gray-200" />
                    <button
                      onClick={() => { setBukti(null); setPreview(null); }}
                      className="absolute top-2 right-2 bg-white rounded-full p-1 shadow border border-gray-200"
                    >
                      <X className="h-4 w-4 text-gray-500" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => fileRef.current?.click()}
                    className="w-full h-32 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center gap-2 hover:border-blue-400 hover:bg-blue-50 transition"
                  >
                    <Upload className="h-6 w-6 text-gray-400" />
                    <p className="text-sm text-gray-500">Klik untuk upload screenshot</p>
                    <p className="text-xs text-gray-400">JPG, PNG, max 5MB</p>
                  </button>
                )}
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                {errors.bukti && <p className="text-xs text-red-500 mt-1">{errors.bukti}</p>}
              </div>

              {/* Catatan */}
              <div>
                <p className="text-sm font-medium text-gray-700 mb-1.5">Catatan (opsional)</p>
                <textarea
                  rows={2}
                  placeholder="Contoh: Transfer dari BNI atas nama Budi"
                  value={catatan}
                  onChange={e => setCatatan(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setStep("detail")}
                  className="flex-1 py-2.5 border border-gray-200 text-gray-600 font-semibold rounded-xl text-sm hover:bg-gray-50 transition"
                >
                  Kembali
                </button>
                <button
                  onClick={handleUpload}
                  disabled={loading || !bukti}
                  className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold rounded-xl text-sm transition flex items-center justify-center gap-2"
                >
                  {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                  Kirim Bukti
                </button>
              </div>
            </div>
          )}

          {/* ── MENUNGGU KONFIRMASI ── */}
          {step === "waiting" && (
            <div className="text-center space-y-4 py-4">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto">
                <span className="text-3xl">⏳</span>
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-800">Bukti Transfer Terkirim!</h3>
                <p className="text-sm text-gray-500 mt-1">
                  Admin akan memverifikasi pembayaranmu dalam <strong>1x24 jam</strong>.
                </p>
              </div>
              <div className="p-4 bg-yellow-50 rounded-xl border border-yellow-200 text-left space-y-2">
                <p className="text-xs font-bold text-yellow-700 uppercase tracking-wide">Selanjutnya:</p>
                <p className="text-xs text-yellow-700">
                  Setelah admin mengkonfirmasi, kamu akan mendapat notifikasi dan bisa langsung daftar akun untuk mengakses kelas.
                </p>
              </div>
              {orderId && (
                <p className="text-xs text-gray-400">ID Pesanan: <span className="font-semibold text-gray-600">{orderId}</span></p>
              )}
              <button
                onClick={() => onOpenChange(false)}
                className="w-full py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl text-sm transition"
              >
                Tutup
              </button>
            </div>
          )}

        </div>
      </DialogContent>
    </Dialog>
  );
}