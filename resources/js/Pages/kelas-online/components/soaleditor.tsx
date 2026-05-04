import { useState, useEffect, useRef } from "react";
import { router } from "@inertiajs/react";
import { Plus, Trash2, Pencil, CheckCircle2, Loader2, X, Save, ChevronDown, ChevronUp, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";

export type Soal = {
  id: number;
  pertanyaan: string;
  image?: string;
  image_url?: string;
  show_image: boolean;
  tipe_soal: "pilihan_ganda" | "essay";
  pilihan?: string[];
  jawaban_benar?: string;
  urutan: number;
};

const OPSI = ["A", "B", "C", "D", "E"];

function getCsrf() {
  return (document.head.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content ?? "";
}

// ─── Inline Form (bukan Dialog) ────────────────
function SoalForm({ assignmentId, editingSoal, onSuccess, onCancel }: {
  assignmentId: number;
  editingSoal: Soal | null;
  onSuccess: () => void;
  onCancel: () => void;
}) {
  const isEdit = !!editingSoal;

  // Gunakan useRef untuk nilai tipe agar tidak terpengaruh re-render
  const tipeRef = useRef<"pilihan_ganda" | "essay">(
    editingSoal?.tipe_soal ?? "pilihan_ganda"
  );

  const [tipe,         setTipeState]   = useState<"pilihan_ganda" | "essay">(
    editingSoal?.tipe_soal ?? "pilihan_ganda"
  );
  const [pertanyaan,   setPertanyaan]  = useState(editingSoal?.pertanyaan ?? "");
  const [image,        setImage]       = useState<File | null>(null);
  const [showImage,    setShowImage]   = useState(editingSoal?.show_image ?? false);
  const [imagePreview, setImagePreview] = useState(editingSoal?.image_url ?? "");
  
  const [pilihan,      setPilihan]     = useState<string[]>(
    editingSoal?.pilihan?.length ? [...editingSoal.pilihan] : ["", "", "", ""]
  );
  const [jawabanBenar, setJawabanBenar] = useState(editingSoal?.jawaban_benar ?? "A");
  const [submitting,   setSubmitting]  = useState(false);
  const [errors,       setErrors]      = useState<Record<string, string>>({});

  // Sync tipeRef setiap tipe berubah
  const setTipe = (t: "pilihan_ganda" | "essay") => {
    tipeRef.current = t;
    setTipeState(t);
  };

  const handleSubmit = () => {
    const currentTipe = tipeRef.current; // baca dari ref, bukan state
    const errs: Record<string, string> = {};
    if (!pertanyaan.trim()) errs.pertanyaan = "Pertanyaan wajib diisi.";
    if (currentTipe === "pilihan_ganda") {
      const filled = pilihan.filter(p => p.trim());
      if (filled.length < 2) errs.pilihan = "Minimal 2 pilihan jawaban.";
    }
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setSubmitting(true);

    const fd = new FormData();
    fd.append("pertanyaan", pertanyaan.trim());
    fd.append("tipe_soal",  currentTipe);
    fd.append("show_image", showImage ? "1" : "0");
    if (image) fd.append("image", image);
    
    if (currentTipe === "pilihan_ganda") {
      const filteredPilihan = pilihan.filter(p => p.trim());
      filteredPilihan.forEach((p, i) => fd.append(`pilihan[${i}]`, p));
      fd.append("jawaban_benar", jawabanBenar);
    }

    if (isEdit) {
        fd.append("_method", "PUT");
    }

    const url = isEdit
      ? `/assignments/${assignmentId}/soal/${editingSoal!.id}`
      : `/assignments/${assignmentId}/soal`;

    router.post(url, fd, {
      preserveScroll: true,
      onSuccess: () => {
        toast.success(isEdit ? "Soal diperbarui!" : "Soal ditambahkan!");
        onSuccess();
      },
      onError: (e) => {
        const msg = Object.values(e).join(", ");
        toast.error("Gagal: " + msg);
        setSubmitting(false);
      },
      onFinish: () => setSubmitting(false),
    });
  };

  return (
    <div className="border-2 border-blue-200 rounded-xl p-4 bg-blue-50/30 space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-bold text-gray-700">{isEdit ? "Edit Soal" : "Tambah Soal Baru"}</h4>
        <button onClick={onCancel} className="text-gray-400 hover:text-gray-600"><X className="h-4 w-4" /></button>
      </div>

      {/* Tipe — tombol biasa, tidak dalam Dialog */}
      <div>
        <Label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2 block">Tipe Soal</Label>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setTipe("pilihan_ganda")}
            className={`flex-1 py-2.5 rounded-xl text-sm font-bold border-2 transition-all ${
              tipe === "pilihan_ganda"
                ? "bg-blue-600 text-white border-blue-600"
                : "bg-white text-gray-400 border-gray-200"
            }`}
          >
            📝 Pilihan Ganda
          </button>
          <button
            type="button"
            onClick={() => setTipe("essay")}
            className={`flex-1 py-2.5 rounded-xl text-sm font-bold border-2 transition-all ${
              tipe === "essay"
                ? "bg-purple-600 text-white border-purple-600"
                : "bg-white text-gray-400 border-gray-200"
            }`}
          >
            ✍️ Essay
          </button>
        </div>
        <p className={`text-xs font-bold text-center mt-1.5 py-1 rounded-lg ${
          tipe === "pilihan_ganda" ? "bg-blue-100 text-blue-700" : "bg-purple-100 text-purple-700"
        }`}>
          Tipe aktif: {tipe === "pilihan_ganda" ? "PILIHAN GANDA" : "ESSAY"}
        </p>
      </div>

      {/* Pertanyaan */}
      <div>
        <Label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5 block">
          Pertanyaan <span className="text-red-500">*</span>
        </Label>
        <Textarea rows={3} placeholder="Tulis pertanyaan..." value={pertanyaan}
          onChange={e => setPertanyaan(e.target.value)} className="resize-none" />
        {errors.pertanyaan && <p className="text-xs text-red-500 mt-1">{errors.pertanyaan}</p>}
      </div>

      {/* Image Upload */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
            <Label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Gambar Pendukung (Opsional)</Label>
            <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-gray-400 uppercase">Tampilkan Gambar</span>
                <input 
                    type="checkbox" 
                    checked={showImage}
                    onChange={(e) => setShowImage(e.target.checked)}
                    className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
            </div>
        </div>
        
        {imagePreview && (
            <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-gray-100 border border-gray-200 mb-2 group">
                <img src={imagePreview} className="w-full h-full object-contain" />
                <button 
                    onClick={() => { setImage(null); setImagePreview(""); }}
                    className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition"
                >
                    <Trash2 className="h-4 w-4" />
                </button>
            </div>
        )}

        <div 
            onClick={() => document.getElementById('soal-image-input')?.click()}
            className="border-2 border-dashed border-gray-200 rounded-xl py-4 flex flex-col items-center justify-center cursor-pointer hover:border-blue-300 hover:bg-blue-50/30 transition group"
        >
            <Upload className="h-5 w-5 text-gray-400 group-hover:text-blue-500 mb-1" />
            <p className="text-[10px] font-bold text-gray-400 group-hover:text-blue-600">UPLOAD GAMBAR</p>
            <input 
                id="soal-image-input"
                type="file" 
                className="hidden" 
                accept="image/*"
                onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                        setImage(file);
                        setImagePreview(URL.createObjectURL(file));
                    }
                }}
            />
        </div>
      </div>

      {/* Pilihan */}
      {tipe === "pilihan_ganda" && (
        <div>
          <Label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5 block">
            Pilihan Jawaban <span className="text-red-500">*</span>
          </Label>
          <div className="space-y-2">
            {pilihan.map((p, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                  jawabanBenar === OPSI[idx] ? "bg-green-500 text-white" : "bg-gray-100 text-gray-500"
                }`}>{OPSI[idx]}</span>
                <Input placeholder={`Pilihan ${OPSI[idx]}`} value={p}
                  onChange={e => { const a = [...pilihan]; a[idx] = e.target.value; setPilihan(a); }}
                  className="flex-1 text-sm" />
                <button type="button" onClick={() => setJawabanBenar(OPSI[idx])}
                  className={jawabanBenar === OPSI[idx] ? "text-green-500" : "text-gray-300 hover:text-green-400"}>
                  <CheckCircle2 className="h-5 w-5" />
                </button>
                {pilihan.length > 2 && (
                  <button type="button" onClick={() => setPilihan(pilihan.filter((_, i) => i !== idx))}
                    className="text-gray-300 hover:text-red-400"><X className="h-4 w-4" /></button>
                )}
              </div>
            ))}
            {pilihan.length < 5 && (
              <button type="button" onClick={() => setPilihan([...pilihan, ""])}
                className="text-xs text-blue-600 flex items-center gap-1">
                <Plus className="h-3.5 w-3.5" /> Tambah Opsi
              </button>
            )}
          </div>
          {errors.pilihan && <p className="text-xs text-red-500 mt-1">{errors.pilihan}</p>}
          <p className="text-xs text-gray-400 mt-1">Klik ✓ untuk tandai jawaban benar (aktif: <strong>{jawabanBenar}</strong>)</p>
        </div>
      )}

      {tipe === "essay" && (
        <div className="p-3 bg-purple-50 rounded-lg text-xs text-purple-700 border border-purple-200">
          ✍️ Soal essay tidak dihitung otomatis — instruktur menilai manual.
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2">
        <Button variant="outline" className="flex-1" onClick={onCancel} disabled={submitting}>Batal</Button>
        <Button
          type="button"
          onClick={handleSubmit}
          disabled={submitting}
          className={`flex-1 text-white font-bold ${tipe === "pilihan_ganda" ? "bg-blue-600 hover:bg-blue-700" : "bg-purple-600 hover:bg-purple-700"}`}
        >
          {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-1.5" /> : <Save className="h-4 w-4 mr-1.5" />}
          {isEdit ? "Simpan" : "Tambah Soal"}
        </Button>
      </div>
    </div>
  );
}

// ─── Soal Card ──────────────────────────────────
function SoalCard({ soal, onEdit, onDelete }: {
  soal: Soal; onEdit: () => void; onDelete: () => void;
}) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4">
      <div className="flex items-start gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5">
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
              soal.tipe_soal === "pilihan_ganda" ? "bg-blue-100 text-blue-700" : "bg-purple-100 text-purple-700"
            }`}>
              {soal.tipe_soal === "pilihan_ganda" ? "📝 Pilihan Ganda" : "✍️ Essay"}
            </span>
            <span className="text-xs text-gray-400">No. {soal.urutan + 1}</span>
          </div>
          
          {soal.show_image && soal.image_url && (
            <div className="mb-3 rounded-lg overflow-hidden border border-gray-100 bg-gray-50">
                <img src={soal.image_url} className="max-h-64 mx-auto object-contain" />
            </div>
          )}

          <p className="text-sm font-medium text-gray-800">{soal.pertanyaan}</p>
          {soal.tipe_soal === "pilihan_ganda" && soal.pilihan && (
            <div className="mt-2 space-y-1">
              {soal.pilihan.map((p, i) => (
                <div key={i} className={`flex items-center gap-2 text-xs px-2.5 py-1.5 rounded-lg ${
                  OPSI[i] === soal.jawaban_benar
                    ? "bg-green-50 text-green-700 font-semibold border border-green-200"
                    : "text-gray-600"
                }`}>
                  <span className="font-bold w-4 shrink-0">{OPSI[i]}.</span>
                  <span>{p}</span>
                  {OPSI[i] === soal.jawaban_benar && <CheckCircle2 className="h-3.5 w-3.5 text-green-500 ml-auto shrink-0" />}
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <button onClick={onEdit} className="p-1.5 text-gray-400 hover:text-blue-500 rounded-lg hover:bg-blue-50 transition">
            <Pencil className="h-3.5 w-3.5" />
          </button>
          <button onClick={onDelete} className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition">
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main SoalEditor ────────────────────────────
export default function SoalEditor({ assignmentId, initialSoals = [], onReload }: {
  assignmentId: number;
  initialSoals?: Soal[];
  onReload: () => void;
}) {
  const [soals,        setSoals]        = useState<Soal[]>(initialSoals);
  const [showForm,     setShowForm]     = useState(false);
  const [editingSoal,  setEditingSoal]  = useState<Soal | null>(null);
  const [deletingSoal, setDeletingSoal] = useState<Soal | null>(null);
  const [deleting,     setDeleting]     = useState(false);

  // Sync soals dari parent
  const prevJson = useRef("");
  useEffect(() => {
    const json = JSON.stringify(initialSoals);
    if (json !== prevJson.current) {
      prevJson.current = json;
      setSoals(initialSoals);
    }
  }, [initialSoals]);

  const openAdd = () => { setEditingSoal(null); setShowForm(true); };
  const openEdit = (s: Soal) => { setEditingSoal(s); setShowForm(true); };
  const closeForm = () => { setShowForm(false); setEditingSoal(null); };

  const handleSuccess = () => {
    closeForm();
    onReload();
  };

  const handleDelete = () => {
    if (!deletingSoal) return;
    setDeleting(true);
    router.delete(`/assignments/${assignmentId}/soal/${deletingSoal.id}`, {
      preserveScroll: true,
      onSuccess: () => {
        toast.success("Soal dihapus.");
        setDeletingSoal(null);
        onReload();
      },
      onError: () => {
        toast.error("Gagal menghapus soal.");
      },
      onFinish: () => setDeleting(false),
    });
  };

  const totalPilgan = soals.filter(s => s.tipe_soal === "pilihan_ganda").length;
  const totalEssay  = soals.filter(s => s.tipe_soal === "essay").length;

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="text-xs text-gray-500">
          {soals.length} soal · <span className="text-blue-600 font-semibold">{totalPilgan} pilihan ganda</span> · {totalEssay} essay
        </p>
        {!showForm && (
          <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-xs h-8" onClick={openAdd}>
            <Plus className="h-3.5 w-3.5 mr-1" /> Tambah Soal
          </Button>
        )}
      </div>

      {/* Inline form — muncul di halaman, bukan popup */}
      {showForm && (
        <SoalForm
          assignmentId={assignmentId}
          editingSoal={editingSoal}
          onSuccess={handleSuccess}
          onCancel={closeForm}
        />
      )}

      {/* List soal */}
      {soals.length === 0 && !showForm ? (
        <div className="text-center py-6 border-2 border-dashed border-gray-200 rounded-xl text-gray-400">
          <p className="text-sm">Belum ada soal. Klik "Tambah Soal".</p>
        </div>
      ) : (
        <div className="space-y-2">
          {soals.map(s => (
            <SoalCard
              key={s.id}
              soal={s}
              onEdit={() => openEdit(s)}
              onDelete={() => setDeletingSoal(s)}
            />
          ))}
        </div>
      )}

      {totalPilgan > 0 && (
        <div className="p-2.5 bg-blue-50 rounded-xl text-xs text-blue-700 flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          Nilai dihitung otomatis dari {totalPilgan} soal pilihan ganda.
        </div>
      )}

      {/* Confirm delete */}
      <Dialog open={!!deletingSoal} onOpenChange={(v) => { if (!v) setDeletingSoal(null); }}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Hapus Soal?</DialogTitle></DialogHeader>
          <p className="text-sm text-gray-600 mt-2">Soal ini akan dihapus permanen.</p>
          <div className="flex gap-2 mt-4">
            <Button variant="outline" className="flex-1" onClick={() => setDeletingSoal(null)} disabled={deleting}>Batal</Button>
            <Button variant="destructive" className="flex-1" onClick={handleDelete} disabled={deleting}>
              {deleting && <Loader2 className="h-4 w-4 animate-spin mr-1.5" />} Hapus
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
