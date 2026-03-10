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
  Mail, KeyRound, User, ChevronLeft,
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

type Step = "email" | "password" | "register" | "form" | "success";

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
  const [step, setStep]           = useState<Step>("email");
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
      setStep("email");
      setEmail(""); setNama(""); setPassword("");
      setFormData({}); setErrors({}); setPeserta(null);
    }
  }, [open]);

  // ── Step dot index ───────────────────────────
  const dotIndex = step === "email" || step === "password" || step === "register" ? 0
    : step === "form" ? 1
    : 2;

  // ── Fetch kustom form ────────────────────────
  const fetchFields = async () => {
    setFetching(true);
    try {
      const res  = await fetch(`/bootcamps/${bootcampId}/kustom-form`);
      const data = await res.json();
      setFields(data.fields || []);
    } catch { setFields([]); }
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
      if (res.ok) {
        setPeserta(data.peserta);
        await fetchFields();
        setStep("form");
      } else {
        setErrors({ password: data.message || "Password salah." });
      }
    } catch { setErrors({ password: "Terjadi kesalahan, coba lagi." }); }
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
    try {
      const res  = await fetch("/peserta/register-checkout", {
        method:  "POST",
        headers: { "Content-Type": "application/json", "X-CSRF-TOKEN": getCsrf() },
        body:    JSON.stringify({ email, nama, password }),
      });
      const data = await res.json();
      if (res.ok) {
        setPeserta(data.peserta);
        await fetchFields();
        setStep("form");
      } else {
        setErrors(data.errors || { email: "Gagal membuat akun." });
      }
    } catch { setErrors({ email: "Terjadi kesalahan, coba lagi." }); }
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
    password: "Masukkan Password",
    register: "Buat Password",
    form:     "Lengkapi Data",
    success:  "Pendaftaran Berhasil! 🎉",
  };
  const descs: Record<Step, string> = {
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
          {step !== "email" && step !== "success" && (
            <button
              onClick={() => {
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