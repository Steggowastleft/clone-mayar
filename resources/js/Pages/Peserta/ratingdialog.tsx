import { useState, useRef } from "react";
import { router } from "@inertiajs/react";
import { Star, Upload, X, Loader2 } from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────
export type RatingData = {
  id: number;
  bintang: number;
  ulasan?: string;
  tampil_anonim: boolean;
  foto_url?: string;
};

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  bootcampId: number;
  bootcampName: string;
  existingRating?: RatingData | null;
  onSuccess?: (rating: RatingData) => void;
};

// ─────────────────────────────────────────────
// Star Picker
// ─────────────────────────────────────────────
function StarPicker({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hover, setHover] = useState(0);
  const labels = ["", "Sangat Buruk", "Buruk", "Cukup", "Bagus", "Sangat Bagus"];

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((s) => (
          <button
            key={s}
            type="button"
            onMouseEnter={() => setHover(s)}
            onMouseLeave={() => setHover(0)}
            onClick={() => onChange(s)}
            className="transition-transform hover:scale-110"
          >
            <Star
              className={`h-8 w-8 transition-colors ${
                s <= (hover || value)
                  ? "text-yellow-400 fill-yellow-400"
                  : "text-gray-200 fill-gray-200"
              }`}
            />
          </button>
        ))}
      </div>
      {(hover || value) > 0 && (
        <p className="text-sm font-semibold text-yellow-600">
          {labels[hover || value]}
        </p>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// Main Dialog
// ─────────────────────────────────────────────
export default function RatingDialog({
  open, onOpenChange, bootcampId, bootcampName, existingRating, onSuccess,
}: Props) {
  const isEdit = !!existingRating;
  const fileRef = useRef<HTMLInputElement>(null);

  const [bintang,      setBintang]      = useState(existingRating?.bintang ?? 0);
  const [ulasan,       setUlasan]       = useState(existingRating?.ulasan ?? "");
  const [anonim,       setAnonim]       = useState(existingRating?.tampil_anonim ?? false);
  const [fotoPreview,  setFotoPreview]  = useState<string | null>(existingRating?.foto_url ?? null);
  const [fotoFile,     setFotoFile]     = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors,       setErrors]       = useState<Record<string, string>>({});

  const handleFotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFotoFile(file);
    setFotoPreview(URL.createObjectURL(file));
  };

  const handleRemoveFoto = () => {
    setFotoFile(null);
    setFotoPreview(null);
    if (fileRef.current) fileRef.current.value = "";
  };

  const handleSubmit = () => {
    const errs: Record<string, string> = {};
    if (!bintang) errs.bintang = "Pilih rating bintang terlebih dahulu.";
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setIsSubmitting(true);

    const fd = new FormData();
    fd.append("bintang",       String(bintang));
    fd.append("ulasan",        ulasan);
    fd.append("tampil_anonim", anonim ? "1" : "0");
    if (fotoFile) fd.append("foto", fotoFile);

    // Inject CSRF token
    const csrfMeta = document.head.querySelector('meta[name="csrf-token"]') as HTMLMetaElement;
    if (csrfMeta) fd.append("_token", csrfMeta.content);

    router.post(`/peserta/bootcamp/${bootcampId}/rating`, fd, {
      forceFormData: true,
      preserveScroll: true,
      onSuccess: (page) => {
        setIsSubmitting(false);
        onSuccess?.({
          id:           (page.props as any).rating?.id ?? 0,
          bintang,
          ulasan,
          tampil_anonim: anonim,
          foto_url:     fotoPreview ?? undefined,
        });
        onOpenChange(false);
      },
      onError: (e) => {
        setIsSubmitting(false);
        setErrors(e);
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-base font-bold">
            {isEdit ? "Edit Ulasan" : "Beri Ulasan"}
          </DialogTitle>
          <p className="text-xs text-gray-400">{bootcampName}</p>
        </DialogHeader>

        <div className="space-y-5 pt-1">

          {/* Bintang */}
          <div className="space-y-1.5">
            <Label>Rating <span className="text-red-500">*</span></Label>
            <StarPicker value={bintang} onChange={setBintang} />
            {errors.bintang && <p className="text-xs text-red-500">{errors.bintang}</p>}
          </div>

          {/* Ulasan */}
          <div className="space-y-1.5">
            <Label>Ulasan <span className="text-gray-400 text-xs">(opsional)</span></Label>
            <Textarea
              placeholder="Ceritakan pengalamanmu mengikuti kelas ini..."
              rows={4}
              value={ulasan}
              onChange={(e) => setUlasan(e.target.value)}
              maxLength={1000}
            />
            <p className="text-xs text-gray-400 text-right">{ulasan.length}/1000</p>
          </div>

          {/* Foto */}
          <div className="space-y-1.5">
            <Label>Foto <span className="text-gray-400 text-xs">(opsional)</span></Label>
            {fotoPreview ? (
              <div className="relative inline-block">
                <img
                  src={fotoPreview}
                  alt="preview"
                  className="w-20 h-20 rounded-xl object-cover border border-gray-200"
                />
                <button
                  onClick={handleRemoveFoto}
                  className="absolute -top-2 -right-2 bg-white border border-gray-200 rounded-full p-0.5 shadow-sm hover:bg-red-50"
                >
                  <X className="h-3.5 w-3.5 text-gray-500" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="flex items-center gap-2 px-4 py-2 border border-dashed border-gray-300 rounded-xl text-sm text-gray-500 hover:border-blue-400 hover:text-blue-500 transition"
              >
                <Upload className="h-4 w-4" />
                Upload Foto
              </button>
            )}
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFotoChange}
            />
          </div>

          {/* Anonim */}
          <label className="flex items-center gap-3 cursor-pointer group">
            <div
              onClick={() => setAnonim(!anonim)}
              className={`w-10 h-5 rounded-full transition-colors relative ${
                anonim ? "bg-blue-600" : "bg-gray-200"
              }`}
            >
              <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                anonim ? "translate-x-5" : "translate-x-0.5"
              }`} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700">Tampil sebagai Anonim</p>
              <p className="text-xs text-gray-400">Nama kamu tidak akan ditampilkan</p>
            </div>
          </label>

          {errors.general && (
            <p className="text-xs text-red-500 bg-red-50 p-3 rounded-lg">{errors.general}</p>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-1">
            <Button variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>
              Batal
            </Button>
            <Button
              className="flex-1 bg-blue-600 hover:bg-blue-700"
              onClick={handleSubmit}
              disabled={isSubmitting || !bintang}
            >
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin mr-1.5" />}
              {isEdit ? "Simpan Perubahan" : "Kirim Ulasan"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}