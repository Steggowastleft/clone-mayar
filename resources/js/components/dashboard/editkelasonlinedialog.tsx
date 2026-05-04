import { useState, useRef } from "react";
import { router } from "@inertiajs/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { DateRange } from "react-day-picker";

type KelasOnline = {
  id: number;
  nama: string;
  deskripsi: string | null;
  harga: number;
  is_gratis: boolean;
  status: string;
  tanggal_mulai: string | null;
  tanggal_selesai: string | null;
  require_quiz_sertifikat: boolean;
  nilai_minimum_quiz: number | null;
  has_assignment: boolean;
  thumbnail: string | null;
};

type EditKelasOnlineDialogProps = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  kelas: KelasOnline | null;
};

export function EditKelasOnlineDialog({ open, onOpenChange, kelas }: EditKelasOnlineDialogProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(kelas?.thumbnail ?? null);

  const [form, setForm] = useState({
    nama: kelas?.nama ?? "",
    deskripsi: kelas?.deskripsi ?? "",
    harga: String(kelas?.harga ?? "0"),
    is_gratis: kelas?.is_gratis ?? false,
    require_quiz_sertifikat: kelas?.require_quiz_sertifikat ?? false,
    nilai_minimum_quiz: String(kelas?.nilai_minimum_quiz ?? "70"),
    has_assignment: kelas?.has_assignment ?? false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const parseDate = (dateStr?: string | null): Date | undefined => {
    if (!dateStr) return undefined;
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? undefined : d;
  };

  const [rangeTanggal, setRangeTanggal] = useState<DateRange | undefined>({
    from: parseDate(kelas?.tanggal_mulai),
    to: parseDate(kelas?.tanggal_selesai),
  });

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setThumbnailFile(file);
    const reader = new FileReader();
    reader.onload = () => setThumbnailPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSubmit = () => {
    if (!form.nama.trim()) {
      setErrors({ nama: "Nama kelas tidak boleh kosong" });
      return;
    }

    if (!kelas) return;

    setIsSubmitting(true);
    const payload = new FormData();
    payload.append("_method", "PUT");
    payload.append("nama", form.nama);
    payload.append("deskripsi", form.deskripsi);
    payload.append("is_gratis", form.is_gratis ? "1" : "0");
    payload.append("harga", form.is_gratis ? "0" : form.harga);
    payload.append("require_quiz_sertifikat", form.require_quiz_sertifikat ? "1" : "0");
    payload.append("nilai_minimum_quiz", form.nilai_minimum_quiz);
    payload.append("has_assignment", form.has_assignment ? "1" : "0");
    if (rangeTanggal?.from) payload.append("tanggal_mulai", format(rangeTanggal.from, "yyyy-MM-dd HH:mm:ss"));
    if (rangeTanggal?.to) payload.append("tanggal_selesai", format(rangeTanggal.to, "yyyy-MM-dd HH:mm:ss"));
    if (thumbnailFile) payload.append("thumbnail", thumbnailFile);

    router.post(`/kelas-online/${kelas.id}`, payload, {
      forceFormData: true,
      onSuccess: () => {
        setIsSubmitting(false);
        onOpenChange(false);
        router.reload();
      },
      onError: (errs) => {
        setErrors(errs);
        setIsSubmitting(false);
      },
    });
  };

  const InputError = ({ field }: { field: string }) =>
    errors[field] ? <p className="text-xs text-red-600 mt-1">{errors[field]}</p> : null;

  if (!kelas) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0">
        {/* Header */}
        <div className="bg-gradient-to-br from-indigo-600 to-indigo-700 p-6 rounded-t-lg sticky top-0 z-10">
          <DialogHeader>
            <DialogTitle className="text-white text-xl font-bold">
              Edit Kelas Online
            </DialogTitle>
            <DialogDescription className="text-indigo-100 text-sm leading-relaxed mt-1">
              Perbarui informasi dan pengaturan kelas online Anda
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="p-6 space-y-5">
          {/* Thumbnail */}
          <div className="space-y-1">
            <Label className="text-sm font-medium text-gray-700">Thumbnail Kelas</Label>
            <div
              className="border-2 border-dashed border-gray-200 rounded-lg p-6 text-center cursor-pointer hover:border-indigo-400 hover:bg-indigo-50 transition"
              onClick={() => fileInputRef.current?.click()}
            >
              {thumbnailPreview ? (
                <img src={thumbnailPreview} alt="preview" className="max-h-40 mx-auto rounded-md object-cover" />
              ) : (
                <div className="space-y-2">
                  <div className="text-gray-400 text-3xl">🖼️</div>
                  <p className="text-sm text-gray-500">Klik untuk unggah thumbnail</p>
                  <p className="text-xs text-gray-400">PNG, JPG, WEBP (maks. 5MB)</p>
                </div>
              )}
            </div>
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleThumbnailChange} />
            {thumbnailFile && <p className="text-xs text-green-600">✓ {thumbnailFile.name}</p>}
          </div>

          {/* Nama Kelas */}
          <div className="space-y-1">
            <Label className="text-sm font-medium text-gray-700">
              Nama Kelas <span className="text-red-500">*</span>
            </Label>
            <Input
              placeholder="Contoh: Workshop React Pemula"
              value={form.nama}
              onChange={(e) => setForm({ ...form, nama: e.target.value })}
            />
            <InputError field="nama" />
          </div>

          {/* Deskripsi */}
          <div className="space-y-1">
            <Label className="text-sm font-medium text-gray-700">Deskripsi</Label>
            <Textarea
              placeholder="Jelaskan isi dan tujuan kelas..."
              rows={4}
              value={form.deskripsi}
              onChange={(e) => setForm({ ...form, deskripsi: e.target.value })}
            />
          </div>

          {/* Harga */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="is_gratis"
                checked={form.is_gratis}
                onChange={(e) => setForm({ ...form, is_gratis: e.target.checked })}
                className="rounded"
              />
              <Label htmlFor="is_gratis" className="text-sm font-medium text-gray-700 cursor-pointer">
                Kelas Gratis
              </Label>
            </div>
            {!form.is_gratis && (
              <div className="space-y-1">
                <Label className="text-sm font-medium text-gray-700">Harga (Rp)</Label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-sm text-gray-500">Rp</span>
                  <Input
                    className="pl-9"
                    placeholder="0"
                    type="number"
                    value={form.harga}
                    onChange={(e) => setForm({ ...form, harga: e.target.value })}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Tanggal Mulai & Selesai */}
          <div className="space-y-1">
            <Label className="text-sm font-medium text-gray-700">
              Periode Kelas
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <button className="w-full px-3 py-2 border border-gray-200 rounded-md text-left text-sm hover:border-gray-300 transition flex items-center gap-2">
                  <CalendarIcon className="h-4 w-4 shrink-0 text-gray-400" />
                  {rangeTanggal?.from && rangeTanggal?.to
                    ? `${format(rangeTanggal.from, "dd MMM yyyy", { locale: idLocale })} - ${format(rangeTanggal.to, "dd MMM yyyy", { locale: idLocale })}`
                    : "Pilih periode kelas..."}
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 z-[200]" align="start">
                <Calendar
                  mode="range"
                  selected={rangeTanggal}
                  onSelect={setRangeTanggal}
                  numberOfMonths={2}
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Quiz & Sertifikat */}
          <div className="space-y-3 border-t border-gray-200 pt-5">
            <Label className="text-sm font-medium text-gray-700 block">Pengaturan Sertifikat</Label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.require_quiz_sertifikat}
                onChange={(e) => setForm({ ...form, require_quiz_sertifikat: e.target.checked })}
                className="rounded"
              />
              <div>
                <span className="text-sm font-medium text-gray-700">Butuh Quiz untuk Sertifikat</span>
                <p className="text-xs text-gray-500">Peserta harus lulus quiz untuk mendapat sertifikat</p>
              </div>
            </label>
            {form.require_quiz_sertifikat && (
              <div className="space-y-1 pl-6">
                <Label className="text-sm font-medium text-gray-700">Nilai Minimum Quiz (%)</Label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  value={form.nilai_minimum_quiz}
                  onChange={(e) => setForm({ ...form, nilai_minimum_quiz: e.target.value })}
                />
              </div>
            )}
          </div>

          {/* Assignment */}
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={form.has_assignment}
              onChange={(e) => setForm({ ...form, has_assignment: e.target.checked })}
              className="rounded"
            />
            <div>
              <span className="text-sm font-medium text-gray-700">Kelas memiliki Assignment</span>
              <p className="text-xs text-gray-500">Peserta akan bisa submit assignment di kelas ini</p>
            </div>
          </label>

          {/* Actions */}
          <div className="flex gap-3 pt-5 border-t border-gray-200">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Batal
            </Button>
            <Button
              className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white"
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Menyimpan..." : "Simpan Perubahan"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
