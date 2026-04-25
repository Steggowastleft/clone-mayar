import { useState } from "react";
import { router } from "@inertiajs/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Lock, Plus, Trash2, GripVertical,
  Loader2, ChevronDown, ChevronUp,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────
export type FieldType =
  | "single_line"
  | "multi_line"
  | "checkbox"
  | "number"
  | "datepicker"
  | "dropdown"
  | "url"
  | "divider"
  | "title"
  | "text_notes"
  | "file_upload"
  | "image_upload";

export type FormField = {
  id: string;
  type: FieldType;
  label: string;
  placeholder?: string;
  help_text?: string;
  is_required: boolean;
  is_locked?: boolean;
};

const FIELD_TYPE_OPTIONS: { value: FieldType; label: string; desc?: string }[] = [
  { value: "single_line",   label: "Single Line Text",   desc: "Limit 99 karakter" },
  { value: "multi_line",    label: "Multi Line Text",    desc: "250 karakter" },
  { value: "checkbox",      label: "Checkbox",           desc: "Pilihan centang" },
  { value: "number",        label: "Number",             desc: "Angka saja" },
  { value: "datepicker",    label: "Date Picker",        desc: "Pilih tanggal" },
  { value: "dropdown",      label: "Dropdown",           desc: "Pilih dari daftar" },
  { value: "url",           label: "URL / Tautan",       desc: "Link / URL" },
  { value: "divider",       label: "Divider / Pemisah",  desc: "Garis pemisah" },
  { value: "title",         label: "Title / Judul",      desc: "Teks judul section" },
  { value: "text_notes",    label: "Text / Notes",       desc: "Teks keterangan" },
  { value: "file_upload",   label: "File Upload",        desc: "Upload file" },
  { value: "image_upload",  label: "Image Upload",       desc: "Upload gambar" },
];

const LOCKED_FIELDS: FormField[] = [
  { id: "locked_nama",  type: "single_line", label: "Nama",         is_required: true, is_locked: true },
  { id: "locked_email", type: "single_line", label: "Email",        is_required: true, is_locked: true },
  { id: "locked_hp",    type: "single_line", label: "No Handphone", is_required: true, is_locked: true },
];

function generateId() {
  return `field_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

// ─────────────────────────────────────────────
// LockedFieldRow — tidak bisa diubah
// ─────────────────────────────────────────────
function LockedFieldRow({ field }: { field: FormField }) {
  return (
    <div className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-lg px-4 py-3">
      <GripVertical className="h-4 w-4 text-gray-200 shrink-0" />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700">{field.label}</span>
          <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded">Single Line</span>
          <span className="text-xs text-red-500 bg-red-50 px-2 py-0.5 rounded font-medium">Wajib</span>
        </div>
      </div>
      <Lock className="h-4 w-4 text-gray-300 shrink-0" />
    </div>
  );
}

// ─────────────────────────────────────────────
// CustomFieldRow — bisa diubah
// ─────────────────────────────────────────────
function CustomFieldRow({
  field,
  index,
  onChange,
  onRemove,
}: {
  field: FormField;
  index: number;
  onChange: (f: FormField) => void;
  onRemove: () => void;
}) {
  const [expanded, setExpanded] = useState(true);

  const typeLabel = FIELD_TYPE_OPTIONS.find((o) => o.value === field.type)?.label ?? "Single Line Text";

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      {/* Header baris */}
      <div className="flex items-center gap-2 px-3 py-2.5 bg-white">
        <GripVertical className="h-4 w-4 text-gray-300 shrink-0 cursor-grab" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-medium text-gray-700 truncate">
              {field.label || "Field Baru"}
            </span>
            <span className="text-xs text-blue-500 bg-blue-50 px-2 py-0.5 rounded">{typeLabel}</span>
            {field.is_required && (
              <span className="text-xs text-red-500 bg-red-50 px-2 py-0.5 rounded font-medium">Wajib</span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={() => setExpanded(!expanded)}
            className="p-1.5 rounded hover:bg-gray-100 text-gray-400 transition"
          >
            {expanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
          </button>
          <button
            onClick={onRemove}
            className="p-1.5 rounded hover:bg-red-50 text-gray-400 hover:text-red-500 transition"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Form detail */}
      {expanded && (
        <div className="border-t border-gray-100 bg-gray-50 px-4 py-4 space-y-3">
          {/* Tipe isian */}
          <div className="space-y-1">
            <Label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
              Pilih Tipe Isian
            </Label>
            <Select
              value={field.type}
              onValueChange={(v) => onChange({ ...field, type: v as FieldType })}
            >
              <SelectTrigger className="text-sm bg-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="z-[600]">
                {FIELD_TYPE_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    <span className="text-sm">{opt.label}</span>
                    {opt.desc && <span className="text-xs text-gray-400 ml-2">— {opt.desc}</span>}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Label */}
          <div className="space-y-1">
            <Label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
              Label
            </Label>
            <Input
              placeholder="Contoh: Nama Perusahaan"
              value={field.label}
              onChange={(e) => onChange({ ...field, label: e.target.value })}
              className="text-sm bg-white"
            />
          </div>

          {/* Teks bantuan */}
          <div className="space-y-1">
            <Label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
              Teks Bantuan / Penjelasan Isian (Opsional)
            </Label>
            <Input
              placeholder="Contoh: Masukkan nama perusahaan tempat Anda bekerja"
              value={field.help_text || ""}
              onChange={(e) => onChange({ ...field, help_text: e.target.value })}
              className="text-sm bg-white"
            />
          </div>

          {/* Required toggle */}
          <div className="space-y-1">
            <Label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
              Status Isian
            </Label>
            <Select
              value={field.is_required ? "required" : "optional"}
              onValueChange={(v) => onChange({ ...field, is_required: v === "required" })}
            >
              <SelectTrigger className="text-sm bg-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="z-[600]">
                <SelectItem value="optional">Isian ini Opsional</SelectItem>
                <SelectItem value="required">Isian Wajib</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// Main Dialog
// ─────────────────────────────────────────────
export function KustomFormDialog({
  open,
  onOpenChange,
  bootcampId,
  initialFields = [],
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  bootcampId: number;
  initialFields?: FormField[];
}) {
  const [fields, setFields] = useState<FormField[]>(
    initialFields.length > 0 ? initialFields : []
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const addField = () => {
    setFields([
      ...fields,
      {
        id:          generateId(),
        type:        "single_line",
        label:       "",
        help_text:   "",
        is_required: false,
      },
    ]);
  };

  const updateField = (id: string, updated: FormField) => {
    setFields(fields.map((f) => (f.id === id ? updated : f)));
  };

  const removeField = (id: string) => {
    setFields(fields.filter((f) => f.id !== id));
  };

  const handleSave = (apply: boolean) => {
    // Validasi — semua field harus punya label (kecuali divider/title/text_notes)
    const noLabelTypes: FieldType[] = ["divider"];
    const invalid = fields.find(
      (f) => !noLabelTypes.includes(f.type) && !f.label.trim()
    );
    if (invalid) {
      toast.error("Semua field harus memiliki label.");
      return;
    }

    setIsSubmitting(true);
    router.post(
      `/bootcamps/${bootcampId}/kustom-form`,
      { fields, apply },
      {
        preserveScroll: true,
        onSuccess: () => {
          setIsSubmitting(false);
          toast.success(apply ? "Form diterapkan & disimpan!" : "Form berhasil disimpan!");
          onOpenChange(false);
        },
        onError: () => {
          setIsSubmitting(false);
          toast.error("Gagal menyimpan form.");
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl max-h-[90vh] flex flex-col overflow-hidden p-0">
        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-gray-100 shrink-0">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-gray-900">
              Kustomisasi Form Isian
            </DialogTitle>
            <DialogDescription className="text-sm text-gray-500 mt-1">
              Tentukan data apa yang harus diisi oleh pelanggan pada saat checkout
            </DialogDescription>
          </DialogHeader>

          {/* Template dropdown */}
          <div className="mt-4">
            <Select defaultValue="default">
              <SelectTrigger className="text-sm">
                <SelectValue placeholder="Pilih template" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="default">Template Default</SelectItem>
                <SelectItem value="minimal">Minimal (Nama & Email saja)</SelectItem>
                <SelectItem value="lengkap">Lengkap (+ Alamat & Institusi)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Scrollable fields area */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3 min-h-0">

          {/* 3 field wajib terkunci */}
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
            Field Wajib (Terkunci)
          </p>
          {LOCKED_FIELDS.map((f) => (
            <LockedFieldRow key={f.id} field={f} />
          ))}

          {/* Custom fields */}
          {fields.length > 0 && (
            <>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide pt-2">
                Field Tambahan
              </p>
              <div className="space-y-3">
                {fields.map((field, i) => (
                  <CustomFieldRow
                    key={field.id}
                    field={field}
                    index={i}
                    onChange={(updated) => updateField(field.id, updated)}
                    onRemove={() => removeField(field.id)}
                  />
                ))}
              </div>
            </>
          )}

          {/* Tambah field button */}
          <button
            onClick={addField}
            className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-gray-200 rounded-lg text-sm text-blue-600 font-medium hover:border-blue-300 hover:bg-blue-50 transition mt-2"
          >
            <Plus className="h-4 w-4" /> Tambah Field
          </button>
        </div>

        {/* Footer actions */}
        <div className="px-6 py-4 border-t border-gray-100 space-y-2 shrink-0 bg-white">
          {/* Simpan draft */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Batal
            </Button>
            <Button
              variant="outline"
              className="flex-1 border-blue-200 text-blue-600 hover:bg-blue-50"
              onClick={() => handleSave(false)}
              disabled={isSubmitting}
            >
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Simpan
            </Button>
          </div>

          {/* Aplikasikan & simpan */}
          <Button
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold"
            onClick={() => handleSave(true)}
            disabled={isSubmitting}
          >
            {isSubmitting
              ? <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Menyimpan...</>
              : "Aplikasikan & Simpan"
            }
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}