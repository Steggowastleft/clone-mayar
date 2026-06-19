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
import { CalendarIcon, Upload } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DateRange } from "react-day-picker";

type CreateKelasOnlineDialogProps = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
};

export function CreateKelasOnlineDialog({ open, onOpenChange }: CreateKelasOnlineDialogProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);

  const [form, setForm] = useState({
    nama: "",
    deskripsi: "",
    harga: "0",
    is_gratis: false,
    tanggal_mulai: "",
    tanggal_selesai: "",
    require_quiz_sertifikat: false,
    nilai_minimum_quiz: "70",
    has_assignment: false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [rangeTanggal, setRangeTanggal] = useState<DateRange | undefined>();

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

    setIsSubmitting(true);
    const payload = new FormData();
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

    router.post("/kelas-online", payload, {
      forceFormData: true,
      onSuccess: () => {
        setIsSubmitting(false);
        onOpenChange(false);
        // Reset form
        setForm({
          nama: "",
          deskripsi: "",
          harga: "0",
          is_gratis: false,
          tanggal_mulai: "",
          tanggal_selesai: "",
          require_quiz_sertifikat: false,
          nilai_minimum_quiz: "70",
          has_assignment: false,
        });
        setThumbnailFile(null);
        setThumbnailPreview(null);
        setRangeTanggal(undefined);
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0">
        {/* Header */}
        <div className="bg-white border-b border-slate-100 p-6 rounded-t-lg sticky top-0 z-10 flex items-center justify-between">
          <DialogTitle className="text-slate-900 text-xl font-bold">
            Buat Kelas Online Baru
          </DialogTitle>
        </div>

        <div className="p-6 space-y-5">
          {/* Thumbnail */}
          <div className="space-y-2">
            <Label>Cover Gambar</Label>
            <div
              className="border border-dashed border-slate-200 rounded-lg p-8 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50/30 transition flex flex-col items-center justify-center min-h-[140px]"
              onClick={() => fileInputRef.current?.click()}
            >
              {thumbnailPreview ? (
                <img src={thumbnailPreview} alt="preview" className="max-h-40 mx-auto rounded-md object-cover" />
              ) : (
                <div className="flex items-center gap-3 justify-center">
                  <button
                    type="button"
                    className="px-4 py-2 bg-[#eef2f6] text-blue-600 rounded-lg text-sm font-semibold hover:bg-blue-50 transition"
                  >
                    Select image...
                  </button>
                  <span className="text-sm text-slate-500 flex items-center gap-1.5">
                    <Upload className="h-4 w-4 text-slate-400" />
                    Drop image here
                  </span>
                </div>
              )}
            </div>
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleThumbnailChange} />
            {thumbnailFile && <p className="text-xs text-green-600">✓ {thumbnailFile.name}</p>}
          </div>

          {/* Nama Kelas */}
          <div className="space-y-1">
            <Label>
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
            <Label>Deskripsi</Label>
            <Textarea
              placeholder="Jelaskan isi dan tujuan kelas..."
              rows={4}
              value={form.deskripsi}
              onChange={(e) => setForm({ ...form, deskripsi: e.target.value })}
            />
          </div>

          {/* Tipe Pembayaran */}
          <div className="space-y-1">
            <Label>Tipe Pembayaran <span className="text-red-500">*</span></Label>
            <Select
              value={form.is_gratis ? "gratis" : "berbayar"}
              onValueChange={(value) => setForm({ ...form, is_gratis: value === "gratis" })}
            >
              <SelectTrigger className="w-full bg-white">
                <SelectValue placeholder="Pilih tipe pembayaran..." />
              </SelectTrigger>
              <SelectContent className="z-[200]">
                <SelectItem value="berbayar">Berbayar</SelectItem>
                <SelectItem value="gratis">Gratis</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Harga */}
          {!form.is_gratis && (
            <div className="space-y-1">
              <Label>Harga (Rp) <span className="text-red-500">*</span></Label>
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

          {/* Tanggal Mulai & Selesai */}
          <div className="space-y-1">
            <Label>
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
            <Label className="block">Pengaturan Sertifikat</Label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.require_quiz_sertifikat}
                onChange={(e) => setForm({ ...form, require_quiz_sertifikat: e.target.checked })}
                className="rounded"
              />
              <div>
                <span >Butuh Quiz untuk Sertifikat</span>
                <p className="text-xs text-gray-500">Peserta harus lulus quiz untuk mendapat sertifikat</p>
              </div>
            </label>
            {form.require_quiz_sertifikat && (
              <div className="space-y-1 pl-6">
                <Label>Nilai Minimum Quiz (%)</Label>
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
              <span >Kelas memiliki Assignment</span>
              <p className="text-xs text-gray-500">Peserta akan bisa submit assignment di kelas ini</p>
            </div>
          </label>

          {/* Buttons */}
          <div className="flex justify-center pt-4 border-t border-gray-200">
            <Button
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-2 rounded-lg text-sm transition shadow-sm w-full md:w-auto min-w-[180px]"
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Menyimpan..." : "Simpan Produk"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
