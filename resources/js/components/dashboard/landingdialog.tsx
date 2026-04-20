import { useState, useRef } from "react";
import { router } from "@inertiajs/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Plus, Trash2, Loader2, Star, GripVertical,
  User, BookOpen, Users, Target, HelpCircle, MessageSquare, Upload, X,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

// ─────────────────────────────────────────────
// Shared Types
// ─────────────────────────────────────────────
type BaseProps = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  bootcampId: number;
};

// ─────────────────────────────────────────────
// Reusable: List Editor (untuk Silabus, Cocok Untuk, Outcome)
// ─────────────────────────────────────────────
function ListEditor({
  items,
  onChange,
  placeholder,
  addLabel,
}: {
  items: string[];
  onChange: (items: string[]) => void;
  placeholder: string;
  addLabel: string;
}) {
  const add = () => onChange([...items, ""]);
  const update = (i: number, v: string) => {
    const next = [...items];
    next[i] = v;
    onChange(next);
  };
  const remove = (i: number) => onChange(items.filter((_, j) => j !== i));

  return (
    <div className="space-y-2">
      {items.map((item, i) => (
        <div key={i} className="flex items-center gap-2">
          <GripVertical className="h-4 w-4 text-gray-300 shrink-0" />
          <Input
            value={item}
            onChange={(e) => update(i, e.target.value)}
            placeholder={placeholder}
            className="flex-1 text-sm"
          />
          <button
            onClick={() => remove(i)}
            className="text-gray-300 hover:text-red-500 transition shrink-0"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ))}
      <button
        onClick={add}
        className="flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-700 font-medium mt-1"
      >
        <Plus className="h-4 w-4" /> {addLabel}
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────
// 1. INSTRUKTUR Dialog
// ─────────────────────────────────────────────
type Instruktur = {
  nama: string;
  jabatan: string;
  bio: string;
  foto: File | null;
  foto_url?: string;
};

export function InstrukturDialog({ open, onOpenChange, bootcampId }: BaseProps) {
  const [instrukturList, setInstrukturList] = useState<Instruktur[]>([
    { nama: "", jabatan: "", bio: "", foto: null },
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileRefs = useRef<(HTMLInputElement | null)[]>([]);

  const updateItem = (i: number, field: keyof Instruktur, value: any) => {
    const next = [...instrukturList];
    next[i] = { ...next[i], [field]: value };
    setInstrukturList(next);
  };

  const addInstruktur = () =>
    setInstrukturList([...instrukturList, { nama: "", jabatan: "", bio: "", foto: null }]);

  const removeInstruktur = (i: number) =>
    setInstrukturList(instrukturList.filter((_, j) => j !== i));

  const handleSubmit = () => {
    const hasEmpty = instrukturList.some((ins) => !ins.nama.trim());
    if (hasEmpty) { toast.error("Nama instruktur wajib diisi."); return; }

    setIsSubmitting(true);
    const fd = new FormData();
    instrukturList.forEach((ins, i) => {
      fd.append(`instruktur[${i}][nama]`,    ins.nama);
      fd.append(`instruktur[${i}][jabatan]`, ins.jabatan);
      fd.append(`instruktur[${i}][bio]`,     ins.bio);
      if (ins.foto) fd.append(`instruktur[${i}][foto]`, ins.foto);
    });

    router.post(`/bootcamps/${bootcampId}/landing/instruktur`, fd, {
      forceFormData: true,
      preserveScroll: true,
      onSuccess: () => { setIsSubmitting(false); toast.success("Instruktur berhasil disimpan!"); onOpenChange(false); },
      onError:   () => { setIsSubmitting(false); toast.error("Gagal menyimpan instruktur."); },
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-4 w-4 text-blue-600" /> Instruktur
          </DialogTitle>
          <DialogDescription>Tambahkan profil instruktur untuk landing page bootcamp.</DialogDescription>
        </DialogHeader>

        <div className="space-y-5 pt-1">
          {instrukturList.map((ins, i) => (
            <div key={i} className="border border-gray-200 rounded-lg p-4 space-y-3 relative">
              {instrukturList.length > 1 && (
                <button
                  onClick={() => removeInstruktur(i)}
                  className="absolute top-3 right-3 text-gray-300 hover:text-red-500 transition"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}

              {/* Foto */}
              <div className="flex items-center gap-3">
                <div
                  onClick={() => fileRefs.current[i]?.click()}
                  className="w-16 h-16 rounded-full border-2 border-dashed border-gray-200 flex items-center justify-center cursor-pointer hover:border-blue-400 transition overflow-hidden bg-gray-50 shrink-0"
                >
                  {ins.foto_url || ins.foto ? (
                    <img
                      src={ins.foto ? URL.createObjectURL(ins.foto) : ins.foto_url}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Upload className="h-5 w-5 text-gray-300" />
                  )}
                </div>
                <input
                  ref={(el) => { fileRefs.current[i] = el; }}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => updateItem(i, "foto", e.target.files?.[0] || null)}
                />
                <div className="flex-1 space-y-2">
                  <Input
                    placeholder="Nama instruktur *"
                    value={ins.nama}
                    onChange={(e) => updateItem(i, "nama", e.target.value)}
                    className="text-sm"
                  />
                  <Input
                    placeholder="Jabatan / Title (contoh: Senior Developer)"
                    value={ins.jabatan}
                    onChange={(e) => updateItem(i, "jabatan", e.target.value)}
                    className="text-sm"
                  />
                </div>
              </div>

              <Textarea
                placeholder="Bio singkat instruktur..."
                rows={2}
                value={ins.bio}
                onChange={(e) => updateItem(i, "bio", e.target.value)}
                className="text-sm"
              />
            </div>
          ))}

          <button
            onClick={addInstruktur}
            className="flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            <Plus className="h-4 w-4" /> Tambah Instruktur
          </button>

          <div className="flex gap-3 pt-1">
            <Button variant="outline" className="flex-1" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
              Batal
            </Button>
            <Button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white" onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Menyimpan...</> : "Simpan"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─────────────────────────────────────────────
// 2. SILABUS Dialog
// ─────────────────────────────────────────────
export function SilabusDialog({ open, onOpenChange, bootcampId }: BaseProps) {
  const [items, setItems] = useState<string[]>([""]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = () => {
    const filtered = items.filter((s) => s.trim());
    if (!filtered.length) { toast.error("Tambahkan minimal 1 poin silabus."); return; }

    setIsSubmitting(true);
    router.post(`/bootcamps/${bootcampId}/landing/silabus`, { silabus: filtered }, {
      preserveScroll: true,
      onSuccess: () => { setIsSubmitting(false); toast.success("Silabus berhasil disimpan!"); onOpenChange(false); },
      onError:   () => { setIsSubmitting(false); toast.error("Gagal menyimpan silabus."); },
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-blue-600" /> Silabus
          </DialogTitle>
          <DialogDescription>Daftar materi / topik yang akan dipelajari peserta.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-1">
          <ListEditor
            items={items}
            onChange={setItems}
            placeholder="Contoh: Pengenalan Laravel & MVC Pattern"
            addLabel="Tambah Poin Silabus"
          />
          <div className="flex gap-3 pt-2">
            <Button variant="outline" className="flex-1" onClick={() => onOpenChange(false)} disabled={isSubmitting}>Batal</Button>
            <Button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white" onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Menyimpan...</> : "Simpan"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─────────────────────────────────────────────
// 3. KELAS INI COCOK UNTUK Dialog
// ─────────────────────────────────────────────
export function CocokUntukDialog({ open, onOpenChange, bootcampId }: BaseProps) {
  const [items, setItems] = useState<string[]>([""]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = () => {
    const filtered = items.filter((s) => s.trim());
    if (!filtered.length) { toast.error("Tambahkan minimal 1 target peserta."); return; }

    setIsSubmitting(true);
    router.post(`/bootcamps/${bootcampId}/landing/cocok-untuk`, { items: filtered }, {
      preserveScroll: true,
      onSuccess: () => { setIsSubmitting(false); toast.success("Berhasil disimpan!"); onOpenChange(false); },
      onError:   () => { setIsSubmitting(false); toast.error("Gagal menyimpan."); },
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-4 w-4 text-blue-600" /> Kelas Ini Cocok Untuk
          </DialogTitle>
          <DialogDescription>Siapa saja yang cocok mengikuti kelas ini?</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-1">
          <ListEditor
            items={items}
            onChange={setItems}
            placeholder="Contoh: Pemula yang ingin belajar web development"
            addLabel="Tambah Target Peserta"
          />
          <div className="flex gap-3 pt-2">
            <Button variant="outline" className="flex-1" onClick={() => onOpenChange(false)} disabled={isSubmitting}>Batal</Button>
            <Button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white" onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Menyimpan...</> : "Simpan"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─────────────────────────────────────────────
// 4. OUTCOME Dialog
// ─────────────────────────────────────────────
export function OutcomeDialog({ open, onOpenChange, bootcampId }: BaseProps) {
  const [items, setItems] = useState<string[]>([""]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = () => {
    const filtered = items.filter((s) => s.trim());
    if (!filtered.length) { toast.error("Tambahkan minimal 1 outcome."); return; }

    setIsSubmitting(true);
    router.post(`/bootcamps/${bootcampId}/landing/outcome`, { items: filtered }, {
      preserveScroll: true,
      onSuccess: () => { setIsSubmitting(false); toast.success("Outcome berhasil disimpan!"); onOpenChange(false); },
      onError:   () => { setIsSubmitting(false); toast.error("Gagal menyimpan outcome."); },
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Target className="h-4 w-4 text-blue-600" /> Outcome
          </DialogTitle>
          <DialogDescription>Apa yang akan peserta capai setelah mengikuti kelas ini?</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-1">
          <ListEditor
            items={items}
            onChange={setItems}
            placeholder="Contoh: Mampu membuat REST API dengan Laravel"
            addLabel="Tambah Outcome"
          />
          <div className="flex gap-3 pt-2">
            <Button variant="outline" className="flex-1" onClick={() => onOpenChange(false)} disabled={isSubmitting}>Batal</Button>
            <Button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white" onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Menyimpan...</> : "Simpan"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─────────────────────────────────────────────
// 5. FAQ Dialog
// ─────────────────────────────────────────────
type FaqItem = { pertanyaan: string; jawaban: string };

export function FaqDialog({ open, onOpenChange, bootcampId }: BaseProps) {
  const [items, setItems] = useState<FaqItem[]>([{ pertanyaan: "", jawaban: "" }]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const update = (i: number, field: keyof FaqItem, v: string) => {
    const next = [...items];
    next[i] = { ...next[i], [field]: v };
    setItems(next);
  };

  const handleSubmit = () => {
    const hasEmpty = items.some((item) => !item.pertanyaan.trim() || !item.jawaban.trim());
    if (hasEmpty) { toast.error("Pertanyaan dan jawaban wajib diisi semua."); return; }

    setIsSubmitting(true);
    router.post(`/bootcamps/${bootcampId}/landing/faq`, { faqs: items }, {
      preserveScroll: true,
      onSuccess: () => { setIsSubmitting(false); toast.success("FAQ berhasil disimpan!"); onOpenChange(false); },
      onError:   () => { setIsSubmitting(false); toast.error("Gagal menyimpan FAQ."); },
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <HelpCircle className="h-4 w-4 text-blue-600" /> FAQ
          </DialogTitle>
          <DialogDescription>Pertanyaan yang sering ditanyakan calon peserta.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-1">
          {items.map((item, i) => (
            <div key={i} className="border border-gray-200 rounded-lg p-4 space-y-3 relative">
              {items.length > 1 && (
                <button
                  onClick={() => setItems(items.filter((_, j) => j !== i))}
                  className="absolute top-3 right-3 text-gray-300 hover:text-red-500 transition"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
              <div className="space-y-1">
                <Label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Pertanyaan</Label>
                <Input
                  placeholder="Contoh: Apakah ada sertifikat setelah lulus?"
                  value={item.pertanyaan}
                  onChange={(e) => update(i, "pertanyaan", e.target.value)}
                  className="text-sm"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Jawaban</Label>
                <Textarea
                  placeholder="Tulis jawaban di sini..."
                  rows={2}
                  value={item.jawaban}
                  onChange={(e) => update(i, "jawaban", e.target.value)}
                  className="text-sm"
                />
              </div>
            </div>
          ))}

          <button
            onClick={() => setItems([...items, { pertanyaan: "", jawaban: "" }])}
            className="flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            <Plus className="h-4 w-4" /> Tambah FAQ
          </button>

          <div className="flex gap-3 pt-1">
            <Button variant="outline" className="flex-1" onClick={() => onOpenChange(false)} disabled={isSubmitting}>Batal</Button>
            <Button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white" onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Menyimpan...</> : "Simpan"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─────────────────────────────────────────────
// 6. RATING & TESTIMONIALS Dialog
// ─────────────────────────────────────────────
type Testimoni = { nama: string; profesi: string; isi: string; rating: number };

function StarRating({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onMouseEnter={() => setHover(star)}
          onMouseLeave={() => setHover(0)}
          onClick={() => onChange(star)}
          className="transition"
        >
          <Star
            className={cn(
              "h-5 w-5 transition",
              (hover || value) >= star ? "fill-yellow-400 text-yellow-400" : "text-gray-200"
            )}
          />
        </button>
      ))}
    </div>
  );
}

export function TestimoniDialog({ open, onOpenChange, bootcampId }: BaseProps) {
  const [items, setItems] = useState<Testimoni[]>([
    { nama: "", profesi: "", isi: "", rating: 5 },
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const update = (i: number, field: keyof Testimoni, v: any) => {
    const next = [...items];
    next[i] = { ...next[i], [field]: v };
    setItems(next);
  };

  const handleSubmit = () => {
    const hasEmpty = items.some((item) => !item.nama.trim() || !item.isi.trim());
    if (hasEmpty) { toast.error("Nama dan isi testimoni wajib diisi."); return; }

    setIsSubmitting(true);
    router.post(`/bootcamps/${bootcampId}/landing/testimoni`, { testimoni: items }, {
      preserveScroll: true,
      onSuccess: () => { setIsSubmitting(false); toast.success("Testimoni berhasil disimpan!"); onOpenChange(false); },
      onError:   () => { setIsSubmitting(false); toast.error("Gagal menyimpan testimoni."); },
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4 text-blue-600" /> Rating & Testimonials
          </DialogTitle>
          <DialogDescription>Tambahkan testimoni dari alumni atau peserta.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-1">
          {items.map((item, i) => (
            <div key={i} className="border border-gray-200 rounded-lg p-4 space-y-3 relative">
              {items.length > 1 && (
                <button
                  onClick={() => setItems(items.filter((_, j) => j !== i))}
                  className="absolute top-3 right-3 text-gray-300 hover:text-red-500 transition"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}

              {/* Rating bintang */}
              <div className="space-y-1">
                <Label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Rating</Label>
                <StarRating value={item.rating} onChange={(v) => update(i, "rating", v)} />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Nama *</Label>
                  <Input
                    placeholder="Nama alumni"
                    value={item.nama}
                    onChange={(e) => update(i, "nama", e.target.value)}
                    className="text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Profesi</Label>
                  <Input
                    placeholder="Contoh: Frontend Developer"
                    value={item.profesi}
                    onChange={(e) => update(i, "profesi", e.target.value)}
                    className="text-sm"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Testimoni *</Label>
                <Textarea
                  placeholder="Tulis testimoni alumni..."
                  rows={3}
                  value={item.isi}
                  onChange={(e) => update(i, "isi", e.target.value)}
                  className="text-sm"
                />
              </div>
            </div>
          ))}

          <button
            onClick={() => setItems([...items, { nama: "", profesi: "", isi: "", rating: 5 }])}
            className="flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            <Plus className="h-4 w-4" /> Tambah Testimoni
          </button>

          <div className="flex gap-3 pt-1">
            <Button variant="outline" className="flex-1" onClick={() => onOpenChange(false)} disabled={isSubmitting}>Batal</Button>
            <Button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white" onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Menyimpan...</> : "Simpan"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}