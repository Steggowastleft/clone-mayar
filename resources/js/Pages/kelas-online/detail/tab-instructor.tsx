import { useState } from "react";
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
  Plus, Pencil, Trash2, Loader2, User, Briefcase, Info, Camera
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export type Instructor = {
  id: number;
  nama: string;
  jabatan?: string;
  bio?: string;
  foto?: string;
  foto_url?: string;
  urutan: number;
};

interface Props {
  kelasId: number;
  instructorList?: Instructor[];
  isOwner?: boolean;
}

const emptyForm = { nama: "", jabatan: "", bio: "", foto: null as File | null };

export default function TabInstructor({
  kelasId,
  instructorList = [],
  isOwner = false,
}: Props) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editing, setEditing] = useState<Instructor | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [preview, setPreview] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleOpenCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setPreview(null);
    setErrors({});
    setOpen(true);
  };

  const handleOpenEdit = (ins: Instructor) => {
    setEditing(ins);
    setForm({
      nama: ins.nama,
      jabatan: ins.jabatan || "",
      bio: ins.bio || "",
      foto: null,
    });
    setPreview(ins.foto_url || null);
    setErrors({});
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditing(null);
    setForm(emptyForm);
    setPreview(null);
    setErrors({});
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setForm({ ...form, foto: file });
      setPreview(URL.createObjectURL(file));
    }
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.nama.trim()) e.nama = "Nama instruktur wajib diisi.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    setIsSubmitting(true);

    const formData = new FormData();
    formData.append("nama", form.nama);
    formData.append("jabatan", form.jabatan);
    formData.append("bio", form.bio);
    if (form.foto) {
      formData.append("foto", form.foto);
    }

    const url = editing
      ? `/kelas-online/${kelasId}/instruktur/${editing.id}`
      : `/kelas-online/${kelasId}/instruktur`;

    router.post(url, formData, {
      preserveScroll: true,
      onSuccess: () => {
        setIsSubmitting(false);
        toast.success(editing ? "Instruktur diperbarui!" : "Instruktur ditambahkan!");
        handleClose();
      },
      onError: (err) => {
        setIsSubmitting(false);
        setErrors(err);
        toast.error("Gagal menyimpan instruktur.");
      },
    });
  };

  const handleDelete = (id: number) => {
    if (!confirm("Hapus instruktur ini?")) return;
    router.delete(`/kelas-online/${kelasId}/instruktur/${id}`, {
      preserveScroll: true,
      onSuccess: () => toast.success("Instruktur dihapus."),
    });
  };

  if (!isOwner) {
    return (
      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
        <h3 className="font-bold text-gray-800 mb-6 flex items-center gap-2">
          <User className="h-5 w-5 text-indigo-500" /> Instruktur Kelas
        </h3>
        {instructorList.length === 0 ? (
          <p className="text-center text-gray-400 py-8 text-sm italic">Informasi instruktur belum tersedia.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {instructorList.map((ins) => (
              <div key={ins.id} className="flex gap-4 p-4 border border-gray-100 rounded-2xl bg-gray-50/30">
                <div className="shrink-0">
                  {ins.foto_url ? (
                    <img src={ins.foto_url} alt={ins.nama} className="w-16 h-16 rounded-2xl object-cover border-2 border-white shadow-sm" />
                  ) : (
                    <div className="w-16 h-16 rounded-2xl bg-indigo-100 flex items-center justify-center text-indigo-500 border-2 border-white shadow-sm">
                      <User className="h-8 w-8" />
                    </div>
                  )}
                </div>
                <div className="min-w-0">
                  <h4 className="font-bold text-gray-900 text-sm truncate">{ins.nama}</h4>
                  <p className="text-xs text-indigo-600 font-semibold mb-2">{ins.jabatan || "Instruktur"}</p>
                  <p className="text-xs text-gray-500 leading-relaxed line-clamp-3">{ins.bio}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-50 flex items-center justify-between bg-gradient-to-r from-white to-indigo-50/30">
          <div>
            <h3 className="font-bold text-gray-800">Kelola Instruktur</h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Tambah dan atur instruktur yang mengajar di kelas ini.
            </p>
          </div>
          <Button
            className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold h-9 rounded-xl shadow-sm transition-all hover:shadow-md active:scale-95"
            onClick={handleOpenCreate}
          >
            <Plus className="h-4 w-4 mr-1.5" /> TAMBAH INSTRUKTUR
          </Button>
        </div>

        <div className="p-5">
          {instructorList.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed border-gray-100 rounded-2xl bg-gray-50/50">
              <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center mx-auto mb-3 shadow-sm">
                <User className="h-6 w-6 text-gray-300" />
              </div>
              <p className="text-gray-400 text-sm font-medium">Belum ada instruktur</p>
              <button 
                onClick={handleOpenCreate}
                className="text-indigo-600 text-xs font-bold mt-2 hover:underline"
              >
                Klik di sini untuk menambah instruktur
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {instructorList.map((ins) => (
                <div key={ins.id} className="group flex gap-4 p-4 border border-gray-100 rounded-2xl bg-white hover:border-indigo-200 hover:shadow-md transition-all relative">
                  <div className="shrink-0">
                    {ins.foto_url ? (
                      <img src={ins.foto_url} alt={ins.nama} className="w-20 h-20 rounded-2xl object-cover shadow-sm border border-gray-50" />
                    ) : (
                      <div className="w-20 h-20 rounded-2xl bg-gray-100 flex items-center justify-center text-gray-400">
                        <User className="h-10 w-10" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-gray-900 truncate">{ins.nama}</h4>
                    <p className="text-xs font-bold text-indigo-600 mb-2 uppercase tracking-wider">{ins.jabatan || "Tanpa Jabatan"}</p>
                    <p className="text-xs text-gray-500 leading-relaxed line-clamp-2">{ins.bio || "Tidak ada profil."}</p>
                  </div>
                  
                  <div className="absolute top-4 right-4 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleOpenEdit(ins)}
                      className="p-2 rounded-lg bg-white border border-gray-100 text-gray-400 hover:text-indigo-600 shadow-sm hover:shadow transition"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(ins.id)}
                      className="p-2 rounded-lg bg-white border border-gray-100 text-gray-400 hover:text-red-600 shadow-sm hover:shadow transition"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <Dialog open={open} onOpenChange={(v) => { if (!v) handleClose(); }}>
        <DialogContent className="max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Instruktur" : "Tambah Instruktur"}</DialogTitle>
            <DialogDescription>
              Isi data lengkap instruktur yang akan ditampilkan di halaman kelas.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 pt-2">
            {/* FOTO UPLOAD */}
            <div className="flex flex-col items-center justify-center py-4 border-2 border-dashed border-gray-100 rounded-2xl bg-gray-50/50 relative group">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              />
              {preview ? (
                <div className="relative">
                  <img src={preview} className="w-24 h-24 rounded-2xl object-cover border-2 border-white shadow-md" />
                  <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-indigo-600 rounded-full flex items-center justify-center text-white border-2 border-white">
                    <Camera className="h-3.5 w-3.5" />
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <div className="w-16 h-16 rounded-2xl bg-white flex items-center justify-center text-gray-300 shadow-sm mb-2">
                    <Camera className="h-8 w-8" />
                  </div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">UPLOAD FOTO</span>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
                  <User className="h-3 w-3" /> NAMA LENGKAP <span className="text-red-500">*</span>
                </Label>
                <Input
                  placeholder="Nama Instruktur..."
                  value={form.nama}
                  onChange={(e) => setForm({ ...form, nama: e.target.value })}
                  className={cn("rounded-xl h-10 bg-gray-50 border-gray-200 focus:bg-white transition-colors", errors.nama && "border-red-400")}
                />
                {errors.nama && <p className="text-[10px] text-red-500 font-medium">{errors.nama}</p>}
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
                  <Briefcase className="h-3 w-3" /> PEKERJAAN / JABATAN
                </Label>
                <Input
                  placeholder="Contoh: Senior Web Developer"
                  value={form.jabatan}
                  onChange={(e) => setForm({ ...form, jabatan: e.target.value })}
                  className="rounded-xl h-10 bg-gray-50 border-gray-200 focus:bg-white transition-colors"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
                  <Info className="h-3 w-3" /> PROFIL / BIO
                </Label>
                <Textarea
                  placeholder="Ceritakan singkat tentang pengalaman instruktur..."
                  rows={4}
                  value={form.bio}
                  onChange={(e) => setForm({ ...form, bio: e.target.value })}
                  className="rounded-xl bg-gray-50 border-gray-200 focus:bg-white transition-colors resize-none"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <Button
                variant="outline"
                className="flex-1 rounded-xl h-10 font-bold text-xs"
                onClick={handleClose}
                disabled={isSubmitting}
              >
                BATAL
              </Button>
              <Button
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl h-10 font-bold text-xs shadow-indigo-100"
                onClick={handleSubmit}
                disabled={isSubmitting}
              >
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                {editing ? "SIMPAN PERUBAHAN" : "TAMBAH INSTRUKTUR"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
