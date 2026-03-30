import { useState, useEffect } from "react";
import { router, usePage } from "@inertiajs/react";
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
  Plus, Pencil, Trash2, ChevronDown, ChevronRight,
  BookOpen, Loader2, FileText, Video, Link, Music,
} from "lucide-react";
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────
export type Materi = {
  id: number;
  judul: string;
  tipe: "video" | "dokumen" | "link" | "teks";
  konten?: string;
  durasi?: string;
  urutan: number;
};

export type Bab = {
  id: number;
  judul: string;
  deskripsi?: string;
  urutan: number;
  materis?: Materi[];
};

const emptyBabForm  = { judul: "", deskripsi: "" };
const emptyMateriForm = { judul: "", tipe: "video" as Materi["tipe"], konten: "", durasi: "" };

// ─────────────────────────────────────────────
// Ikon tipe materi
// ─────────────────────────────────────────────
function MateriIcon({ tipe }: { tipe: Materi["tipe"] }) {
  switch (tipe) {
    case "video":    return <Video    className="h-3.5 w-3.5 text-blue-500" />;
    case "link":     return <Link     className="h-3.5 w-3.5 text-purple-500" />;
    case "dokumen":  return <FileText className="h-3.5 w-3.5 text-orange-500" />;
    default:         return <FileText className="h-3.5 w-3.5 text-gray-400" />;
  }
}

// ─────────────────────────────────────────────
// Bab Card
// ─────────────────────────────────────────────
function BabCard({
  bab,
  bootcampId,
  onEdit,
  onAddMateri,
  onEditMateri,
  onDeleteMateri,
}: {
  bab: Bab;
  bootcampId: number;
  onEdit: (bab: Bab) => void;
  onAddMateri: (babId: number) => void;
  onEditMateri: (materi: Materi, babId: number) => void;
  onDeleteMateri: (materi: Materi, babId: number) => void;
}) {
  const [expanded,  setExpanded]  = useState(true);
  const [hapusOpen, setHapusOpen] = useState(false);

  const handleHapus = () => {
    router.delete(`/bootcamps/${bootcampId}/bab/${bab.id}`, {
      preserveScroll: true,
      onSuccess: () => {
        toast.success("Bab berhasil dihapus.");
        router.reload({ only: ["babList"] });
      },
      onError: () => toast.error("Gagal menghapus bab."),
    });
  };

  return (
    <>
      <div className="border border-gray-200 rounded-lg bg-white overflow-hidden">
        {/* Header bab */}
        <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 border-b border-gray-100">
          {/* Toggle expand */}
          <button
            onClick={() => setExpanded((v) => !v)}
            className="text-gray-400 hover:text-gray-600 transition shrink-0"
          >
            {expanded
              ? <ChevronDown  className="h-4 w-4" />
              : <ChevronRight className="h-4 w-4" />
            }
          </button>

          <BookOpen className="h-4 w-4 text-blue-500 shrink-0" />

          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-800 truncate">{bab.judul}</p>
            {bab.deskripsi && (
              <p className="text-xs text-gray-400 truncate">{bab.deskripsi}</p>
            )}
          </div>

          {/* Jumlah materi */}
          <span className="text-xs text-gray-400 shrink-0">
            {bab.materis?.length ?? 0} materi
          </span>

          {/* Actions */}
          <div className="flex gap-1 shrink-0">
            <button
              onClick={() => onEdit(bab)}
              className="p-1.5 rounded hover:bg-gray-200 text-gray-400 hover:text-blue-600 transition"
            >
              <Pencil className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => setHapusOpen(true)}
              className="p-1.5 rounded hover:bg-red-50 text-gray-400 hover:text-red-600 transition"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* List materi */}
        {expanded && (
          <div className="divide-y divide-gray-50">
            {bab.materis && bab.materis.length > 0 ? (
              bab.materis.map((m) => (
                <div key={m.id} className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition">
                  <MateriIcon tipe={m.tipe} />
                  <span className="text-xs text-gray-700 flex-1 truncate">{m.judul}</span>
                  {m.durasi && (
                    <span className="text-xs text-gray-400 shrink-0">{m.durasi}</span>
                  )}
                </div>
              ))
            ) : (
              <div className="px-4 py-3 text-xs text-gray-400 text-center">
                Belum ada materi. Tambahkan materi ke bab ini.
              </div>
            )}

            {/* Tombol tambah materi */}
            <div className="px-4 py-2.5">
              <button
                className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1 font-medium"
                onClick={() => onAddMateri(bab.id)}
              >
                <Plus className="h-3.5 w-3.5" /> Tambah Materi
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Confirm hapus */}
      <Dialog open={hapusOpen} onOpenChange={setHapusOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Hapus Bab?</DialogTitle>
            <DialogDescription>
              Bab <strong>{bab.judul}</strong> beserta semua materinya akan dihapus permanen.
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-3 pt-2">
            <Button variant="outline" className="flex-1" onClick={() => setHapusOpen(false)}>
              Batal
            </Button>
            <Button
              className="flex-1 bg-red-600 hover:bg-red-700 text-white"
              onClick={() => { handleHapus(); setHapusOpen(false); }}
            >
              Ya, Hapus
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

// ─────────────────────────────────────────────
// Main Tab
// ─────────────────────────────────────────────
export default function TabModul({
  bootcampId,
  initialBabList = [],
}: {
  bootcampId: number;
  initialBabList?: Bab[];
}) {
  const [createOpen,   setCreateOpen]   = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingBab,   setEditingBab]   = useState<Bab | null>(null);
  const [babList,      setBabList]      = useState<Bab[]>(initialBabList);
  const [babForm,      setBabForm]      = useState(emptyBabForm);
  const [errors,       setErrors]       = useState<Record<string, string>>({});

  // ── State Materi ──
  const [materiOpen,      setMateriOpen]      = useState(false);
  const [materiSubmitting,setMateriSubmitting] = useState(false);
  const [materiForm,      setMateriForm]      = useState(emptyMateriForm);
  const [materiErrors,    setMateriErrors]    = useState<Record<string, string>>({});
  const [editingMateri,   setEditingMateri]   = useState<Materi | null>(null);
  const [activeBabId,     setActiveBabId]     = useState<number | null>(null);
  const [hapusMateriOpen,   setHapusMateriOpen]   = useState(false);
  const [deletingMateri,    setDeletingMateri]    = useState<{ materi: Materi; babId: number } | null>(null);

  // Sync dari Inertia partial reload
  const page = usePage<{ babList?: Bab[] }>();
  useEffect(() => {
    if (page.props.babList) setBabList(page.props.babList);
  }, [page.props.babList]);

  // ── Buka form edit ──
  const handleOpenEdit = (bab: Bab) => {
    setEditingBab(bab);
    setBabForm({ judul: bab.judul, deskripsi: bab.deskripsi || "" });
    setCreateOpen(true);
  };

  const handleCloseDialog = () => {
    setCreateOpen(false);
    setEditingBab(null);
    setBabForm(emptyBabForm);
    setErrors({});
  };

  // ── Materi handlers ──
  const handleOpenAddMateri = (babId: number) => {
    setActiveBabId(babId);
    setEditingMateri(null);
    setMateriForm(emptyMateriForm);
    setMateriErrors({});
    setMateriOpen(true);
  };

  const handleOpenEditMateri = (materi: Materi, babId: number) => {
    setActiveBabId(babId);
    setEditingMateri(materi);
    setMateriForm({ judul: materi.judul, tipe: materi.tipe, konten: materi.konten || "", durasi: materi.durasi || "" });
    setMateriErrors({});
    setMateriOpen(true);
  };

  const handleCloseMateriDialog = () => {
    setMateriOpen(false);
    setEditingMateri(null);
    setMateriForm(emptyMateriForm);
    setMateriErrors({});
    setActiveBabId(null);
  };

  const validateMateri = () => {
    const e: Record<string, string> = {};
    if (!materiForm.judul.trim()) e.judul = "Judul materi wajib diisi.";
    if (!materiForm.konten.trim()) e.konten = "Konten wajib diisi.";
    setMateriErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmitMateri = () => {
    if (!validateMateri() || !activeBabId) return;
    setMateriSubmitting(true);

    const isEdit = !!editingMateri;
    const url = isEdit
      ? `/bootcamps/${bootcampId}/bab/${activeBabId}/materi/${editingMateri!.id}`
      : `/bootcamps/${bootcampId}/bab/${activeBabId}/materi`;

    const payload = {
      judul:  materiForm.judul.trim(),
      tipe:   materiForm.tipe,
      konten: materiForm.konten.trim(),
      durasi: materiForm.durasi.trim(),
    };

    const opts = {
      preserveScroll: true as const,
      onSuccess: () => {
        setMateriSubmitting(false);
        toast.success(isEdit ? "Materi berhasil diperbarui!" : "Materi berhasil ditambahkan!");
        handleCloseMateriDialog();
        router.reload({ only: ["babList"] });
      },
      onError: (e: Record<string, string>) => {
        setMateriSubmitting(false);
        toast.error("Gagal menyimpan materi.");
        setMateriErrors(e);
      },
    };

    if (isEdit) {
      router.put(url, payload, opts);
    } else {
      router.post(url, payload, opts);
    }
  };

  const handleDeleteMateri = (materi: Materi, babId: number) => {
    setDeletingMateri({ materi, babId });
    setHapusMateriOpen(true);
  };

  const confirmDeleteMateri = () => {
    if (!deletingMateri) return;
    router.delete(`/bootcamps/${bootcampId}/bab/${deletingMateri.babId}/materi/${deletingMateri.materi.id}`, {
      preserveScroll: true,
      onSuccess: () => {
        toast.success("Materi berhasil dihapus.");
        setHapusMateriOpen(false);
        setDeletingMateri(null);
        router.reload({ only: ["babList"] });
      },
      onError: () => {
        toast.error("Gagal menghapus materi.");
        setHapusMateriOpen(false);
      },
    });
  };

  // ── Validasi ──
  const validate = () => {
    const e: Record<string, string> = {};
    if (!babForm.judul.trim()) e.judul = "Judul bab wajib diisi.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // ── Submit ──
  const handleSubmit = () => {
    if (!validate()) return;
    setIsSubmitting(true);

    const isEdit = !!editingBab;
    const url = isEdit
      ? `/bootcamps/${bootcampId}/bab/${editingBab!.id}`
      : `/bootcamps/${bootcampId}/bab`;

    const payload = {
      judul:     babForm.judul.trim(),
      deskripsi: babForm.deskripsi.trim(),
    };

    const routerOptions = {
      preserveScroll: true as const,
      onSuccess: () => {
        setIsSubmitting(false);
        toast.success(isEdit ? "Bab berhasil diperbarui!" : "Bab berhasil dibuat!");
        handleCloseDialog();
        router.reload({ only: ["babList"] });
      },
      onError: (e: Record<string, string>) => {
        setIsSubmitting(false);
        toast.error("Gagal menyimpan bab.");
        const serverErrors: Record<string, string> = {};
        Object.keys(e).forEach((key) => { serverErrors[key] = e[key]; });
        setErrors(serverErrors);
      },
    };

    if (isEdit) {
      router.put(url, payload, routerOptions);
    } else {
      router.post(url, payload, routerOptions);
    }
  };

  // ─────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
      {/* Header */}
      <div className="p-5 border-b border-gray-100 flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-gray-800">Buat Bab (Section)</h3>
          <p className="text-xs text-gray-400 mt-0.5">
            Bab adalah pembagian utama yang memuat satu pokok permasalahan.
            Buat Bab untuk memisahkan tiap bagian dari keseluruhan materi.
          </p>
        </div>
        <Button
          className="bg-blue-600 hover:bg-blue-700 text-white text-sm shrink-0 ml-4"
          onClick={() => setCreateOpen(true)}
        >
          <Plus className="h-4 w-4 mr-1" /> Buat Bab
        </Button>
      </div>

      {/* List Bab */}
      <div className="p-5">
        {babList.length === 0 ? (
          <p className="text-center text-gray-400 py-8 text-sm">Belum ada bab / modul</p>
        ) : (
          <div className="space-y-3">
            {babList.map((bab) => (
              <BabCard
                key={bab.id}
                bab={bab}
                bootcampId={bootcampId}
                onEdit={handleOpenEdit}
              onAddMateri={handleOpenAddMateri}
              onEditMateri={handleOpenEditMateri}
              onDeleteMateri={handleDeleteMateri}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── Dialog Form ── */}
      <Dialog open={createOpen} onOpenChange={(v) => { if (!v) handleCloseDialog(); }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingBab ? "Edit Bab" : "Buat Bab Baru"}</DialogTitle>
            <DialogDescription>
              {editingBab
                ? "Perbarui informasi bab ini."
                : "Tambahkan bab/section baru untuk materi bootcamp."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 pt-2">
            {/* Judul */}
            <div className="space-y-1">
              <Label className="text-sm font-medium text-gray-700">
                Judul Bab <span className="text-red-500">*</span>
              </Label>
              <Input
                placeholder="Contoh: Bab 1 - Pengenalan"
                value={babForm.judul}
                onChange={(e) => setBabForm({ ...babForm, judul: e.target.value })}
                className={errors.judul ? "border-red-400" : ""}
              />
              {errors.judul && <p className="text-xs text-red-500">{errors.judul}</p>}
            </div>

            {/* Deskripsi */}
            <div className="space-y-1">
              <Label className="text-sm font-medium text-gray-700">
                Deskripsi <span className="text-gray-400 font-normal">(Opsional)</span>
              </Label>
              <Textarea
                placeholder="Deskripsi singkat bab ini..."
                rows={3}
                value={babForm.deskripsi}
                onChange={(e) => setBabForm({ ...babForm, deskripsi: e.target.value })}
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={handleCloseDialog}
                disabled={isSubmitting}
              >
                Batal
              </Button>
              <Button
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                onClick={handleSubmit}
                disabled={isSubmitting}
              >
                {isSubmitting
                  ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Menyimpan...</>
                  : editingBab ? "Simpan Perubahan" : "Simpan Bab"
                }
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Dialog Tambah/Edit Materi ── */}
      <Dialog open={materiOpen} onOpenChange={handleCloseMateriDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingMateri ? "Edit Materi" : "Tambah Materi"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-1">

            {/* Judul */}
            <div className="space-y-1.5">
              <Label>Judul Materi <span className="text-red-500">*</span></Label>
              <Input
                placeholder="Contoh: Pengenalan React"
                value={materiForm.judul}
                onChange={(e) => setMateriForm({ ...materiForm, judul: e.target.value })}
              />
              {materiErrors.judul && <p className="text-xs text-red-500">{materiErrors.judul}</p>}
            </div>

            {/* Tipe */}
            <div className="space-y-1.5">
              <Label>Tipe Materi</Label>
              <Select
                value={materiForm.tipe}
                onValueChange={(v) => setMateriForm({ ...materiForm, tipe: v as Materi["tipe"] })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="video">🎬 Video</SelectItem>
                  <SelectItem value="dokumen">📄 Dokumen</SelectItem>
                  <SelectItem value="link">🔗 Link</SelectItem>
                  <SelectItem value="teks">📝 Teks</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Konten */}
            <div className="space-y-1.5">
              <Label>
                {materiForm.tipe === "teks" ? "Isi Konten" : "URL / Link"}
                <span className="text-red-500"> *</span>
              </Label>
              {materiForm.tipe === "teks" ? (
                <Textarea
                  placeholder="Tulis isi materi di sini..."
                  rows={4}
                  value={materiForm.konten}
                  onChange={(e) => setMateriForm({ ...materiForm, konten: e.target.value })}
                />
              ) : (
                <Input
                  placeholder={materiForm.tipe === "video" ? "https://youtube.com/..." : "https://..."}
                  value={materiForm.konten}
                  onChange={(e) => setMateriForm({ ...materiForm, konten: e.target.value })}
                />
              )}
              {materiErrors.konten && <p className="text-xs text-red-500">{materiErrors.konten}</p>}
            </div>

            {/* Durasi (opsional) */}
            <div className="space-y-1.5">
              <Label>Durasi <span className="text-gray-400 text-xs">(opsional)</span></Label>
              <Input
                placeholder="Contoh: 15 menit"
                value={materiForm.durasi}
                onChange={(e) => setMateriForm({ ...materiForm, durasi: e.target.value })}
              />
            </div>

            <div className="flex gap-2 pt-1">
              <Button variant="outline" className="flex-1" onClick={handleCloseMateriDialog}>
                Batal
              </Button>
              <Button className="flex-1 bg-blue-600 hover:bg-blue-700" onClick={handleSubmitMateri} disabled={materiSubmitting}>
                {materiSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
                {editingMateri ? "Simpan Perubahan" : "Tambah Materi"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Confirm Hapus Materi ── */}
      <Dialog open={hapusMateriOpen} onOpenChange={setHapusMateriOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Hapus Materi?</DialogTitle>
            <DialogDescription>
              Materi <strong>{deletingMateri?.materi.judul}</strong> akan dihapus permanen.
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-2 mt-2">
            <Button variant="outline" className="flex-1" onClick={() => setHapusMateriOpen(false)}>Batal</Button>
            <Button variant="destructive" className="flex-1" onClick={confirmDeleteMateri}>Hapus</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}