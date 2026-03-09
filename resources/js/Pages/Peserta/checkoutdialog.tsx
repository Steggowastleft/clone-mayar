import { useState, useEffect } from "react";
import {
  Dialog, DialogContent, DialogHeader,
  DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, CheckCircle2, Lock, ArrowRight, BookOpen } from "lucide-react";

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

type Peserta = {
  id: number;
  nama: string;
  email: string;
  no_hp?: string;
} | null;

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  bootcampId: number;
  bootcampName: string;
  harga?: number;
  peserta: Peserta; // null = belum login
};

// ─────────────────────────────────────────────
// Dynamic Field Renderer
// ─────────────────────────────────────────────
function DynamicField({
  field,
  value,
  onChange,
  error,
}: {
  field: KustomField;
  value: any;
  onChange: (v: any) => void;
  error?: string;
}) {
  if (field.type === "divider") {
    return <hr className="border-gray-100 my-1" />;
  }
  if (field.type === "title") {
    return <p className="text-sm font-semibold text-gray-800 pt-1">{field.label}</p>;
  }
  if (field.type === "text_notes") {
    return <p className="text-xs text-gray-500 leading-relaxed">{field.label}</p>;
  }

  return (
    <div className="space-y-1.5">
      <Label className="text-sm font-medium text-gray-700">
        {field.label}
        {field.is_required && <span className="text-red-500 ml-1">*</span>}
      </Label>

      {field.type === "multi_line" && (
        <textarea
          rows={3}
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.help_text || ""}
          maxLength={250}
          className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
        />
      )}

      {field.type === "checkbox" && (
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={!!value}
            onChange={(e) => onChange(e.target.checked)}
            className="w-4 h-4 rounded border-gray-300 text-blue-600"
          />
          <span className="text-sm text-gray-700">{field.help_text || field.label}</span>
        </label>
      )}

      {field.type === "datepicker" && (
        <Input
          type="date"
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          className={error ? "border-red-400" : ""}
        />
      )}

      {(field.type === "single_line" || field.type === "number" || field.type === "url") && (
        <Input
          type={field.type === "number" ? "number" : field.type === "url" ? "url" : "text"}
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.help_text || ""}
          maxLength={field.type === "single_line" ? 99 : undefined}
          className={error ? "border-red-400" : ""}
        />
      )}

      {field.help_text && !["single_line", "multi_line", "url", "number"].includes(field.type) && (
        <p className="text-xs text-gray-400">{field.help_text}</p>
      )}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}

// ─────────────────────────────────────────────
// Locked Field (nama, email, no_hp dari profil)
// ─────────────────────────────────────────────
function LockedField({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
        {label}
        <span className="text-xs text-red-500">*</span>
        <Lock className="h-3 w-3 text-gray-300" />
      </Label>
      <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-sm text-gray-600">
        {value || "-"}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Main Dialog
// ─────────────────────────────────────────────
export function CheckoutDialog({
  open, onOpenChange, bootcampId, bootcampName, harga, peserta,
}: Props) {
  const [step, setStep]         = useState<"auth" | "form" | "success">("form");
  const [fields, setFields]     = useState<KustomField[]>([]);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [errors, setErrors]     = useState<Record<string, string>>({});
  const [loading, setLoading]   = useState(false);
  const [fetching, setFetching] = useState(false);

  // Kalau belum login, tampilkan step auth
  useEffect(() => {
    if (open) {
      setStep(peserta ? "form" : "auth");
      if (peserta) fetchFields();
    }
  }, [open, peserta]);

  const fetchFields = async () => {
    setFetching(true);
    try {
      const res = await fetch(`/bootcamps/${bootcampId}/kustom-form`);
      const data = await res.json();
      setFields(data.fields || []);
    } catch {
      setFields([]);
    } finally {
      setFetching(false);
    }
  };

  const handleSubmit = async () => {
    // Validasi field wajib
    const newErrors: Record<string, string> = {};
    fields.forEach((f) => {
      if (f.is_required && !formData[f.id]) {
        newErrors[f.id] = `${f.label} wajib diisi.`;
      }
    });
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/bootcamps/${bootcampId}/daftar`, {
        method:  "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-TOKEN": (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content || "",
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        setStep("success");
        setTimeout(() => {
          window.location.href = data.redirect || "/peserta/dashboard";
        }, 2000);
      } else if (res.status === 409) {
        // Sudah terdaftar
        window.location.href = data.redirect;
      } else {
        setErrors(data.errors || {});
      }
    } catch {
      setErrors({ general: "Terjadi kesalahan. Coba lagi." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] flex flex-col overflow-hidden p-0">

        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-gray-100 shrink-0">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-gray-900">
              {step === "success" ? "Pendaftaran Berhasil! 🎉" : `Daftar: ${bootcampName}`}
            </DialogTitle>
            <DialogDescription>
              {step === "auth"    && "Masuk atau buat akun untuk melanjutkan pendaftaran."}
              {step === "form"    && "Lengkapi data berikut untuk mendaftar bootcamp ini."}
              {step === "success" && "Kamu akan diarahkan ke halaman kelas..."}
            </DialogDescription>
          </DialogHeader>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 min-h-0">

          {/* ── STEP: AUTH ── */}
          {step === "auth" && (
            <div className="space-y-3 py-4">
              <div className="w-14 h-14 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <BookOpen className="h-7 w-7 text-blue-600" />
              </div>
              <p className="text-sm text-gray-600 text-center">
                Kamu perlu masuk atau daftar akun terlebih dahulu untuk mengikuti bootcamp ini.
              </p>
              <a
                href={`/peserta/login?redirect=/bootcamp/${bootcampId}`}
                className="flex items-center justify-center gap-2 w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition"
              >
                Masuk <ArrowRight className="h-4 w-4" />
              </a>
              <a
                href={`/peserta/register?redirect=/bootcamp/${bootcampId}`}
                className="flex items-center justify-center gap-2 w-full py-2.5 border border-blue-200 text-blue-600 text-sm font-semibold rounded-lg hover:bg-blue-50 transition"
              >
                Buat Akun Baru
              </a>
            </div>
          )}

          {/* ── STEP: FORM ── */}
          {step === "form" && (
            <div className="space-y-4">
              {fetching ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 text-blue-600 animate-spin" />
                </div>
              ) : (
                <>
                  {/* 3 field locked dari profil */}
                  {peserta && (
                    <div className="space-y-3 pb-3 border-b border-gray-100">
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                        Data Akun (Terkunci)
                      </p>
                      <LockedField label="Nama"         value={peserta.nama} />
                      <LockedField label="Email"        value={peserta.email} />
                      <LockedField label="No Handphone" value={peserta.no_hp || "-"} />
                    </div>
                  )}

                  {/* Field kustom dari admin */}
                  {fields.length > 0 && (
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
                  )}

                  {errors.general && (
                    <p className="text-xs text-red-500 text-center">{errors.general}</p>
                  )}
                </>
              )}
            </div>
          )}

          {/* ── STEP: SUCCESS ── */}
          {step === "success" && (
            <div className="flex flex-col items-center justify-center py-8 space-y-3">
              <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center">
                <CheckCircle2 className="h-9 w-9 text-emerald-500" />
              </div>
              <p className="text-sm text-gray-600 text-center">
                Pendaftaran kamu berhasil! Mengalihkan ke halaman kelas...
              </p>
              <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />
            </div>
          )}
        </div>

        {/* Footer */}
        {step === "form" && (
          <div className="px-6 py-4 border-t border-gray-100 shrink-0">
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => onOpenChange(false)} disabled={loading}>
                Batal
              </Button>
              <Button
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold"
                onClick={handleSubmit}
                disabled={loading || fetching}
              >
                {loading
                  ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Mendaftar...</>
                  : "Daftar Sekarang"
                }
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}