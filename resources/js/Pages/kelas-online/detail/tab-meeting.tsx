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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import {
  Plus, Video, Loader2,
  Clock, User, Pencil, Trash2, Globe,
} from "lucide-react";
import { toast } from "sonner";

export type Meeting = {
  id: number;
  judul: string;
  deskripsi?: string;
  link_zoom?: string;
  nama_pemateri?: string;
  profil_pemateri?: string;
  waktu_mulai?: string;
  waktu_selesai?: string;
};

function MeetingCard({
  meeting,
  kelasId,
  isOwner,
  onEdit,
}: {
  meeting: Meeting;
  kelasId: number;
  isOwner: boolean;
  onEdit: (meeting: Meeting) => void;
}) {
  const [hapusOpen, setHapusOpen] = useState(false);

  const handleHapus = () => {
    router.delete(`/kelas-online/${kelasId}/meetings/${meeting.id}`, {
      preserveScroll: true,
      onSuccess: () => toast.success("Sesi berhasil dihapus."),
      onError: () => toast.error("Gagal menghapus sesi."),
    });
  };

  return (
    <>
      <div className="border border-gray-200 rounded-2xl p-5 bg-white hover:shadow-md transition-all duration-300 group">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                <Video className="h-4 w-4" />
              </div>
              <h4 className="font-bold text-gray-900 text-sm group-hover:text-indigo-600 transition-colors">
                {meeting.judul}
              </h4>
            </div>

            {meeting.waktu_mulai && (
              <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-2">
                <Clock className="h-3.5 w-3.5" />
                <span>
                  {format(new Date(meeting.waktu_mulai), "dd MMM yyyy, HH:mm")}
                  {meeting.waktu_selesai && ` – ${format(new Date(meeting.waktu_selesai), "HH:mm")}`}
                </span>
              </div>
            )}

            {meeting.link_zoom && (
              <a
                href={meeting.link_zoom}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-700 bg-indigo-50 px-3 py-1.5 rounded-xl transition-colors mb-2"
              >
                <Globe className="h-3.5 w-3.5" />
                BUKA LINK SESI
              </a>
            )}

            {meeting.nama_pemateri && (
              <div className="flex items-center gap-1.5 text-xs text-gray-500">
                <User className="h-3.5 w-3.5" />
                <span className="font-medium">{meeting.nama_pemateri}</span>
              </div>
            )}
            
            {meeting.deskripsi && (
                <p className="text-xs text-gray-400 mt-2 line-clamp-2 italic">"{meeting.deskripsi}"</p>
            )}
          </div>

          {isOwner && (
            <div className="flex gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => onEdit(meeting)}
                className="p-2 rounded-xl hover:bg-indigo-50 text-gray-400 hover:text-indigo-600 transition"
              >
                <Pencil className="h-4 w-4" />
              </button>
              <button
                onClick={() => setHapusOpen(true)}
                className="p-2 rounded-xl hover:bg-red-50 text-gray-400 hover:text-red-600 transition"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      <Dialog open={hapusOpen} onOpenChange={setHapusOpen}>
        <DialogContent className="max-w-sm rounded-2xl">
          <DialogHeader>
            <DialogTitle className="font-black text-gray-900">Hapus Sesi?</DialogTitle>
            <DialogDescription className="text-gray-500">
              Sesi <strong>{meeting.judul}</strong> akan dihapus permanen.
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-3 pt-4">
            <Button variant="outline" className="flex-1 rounded-xl" onClick={() => setHapusOpen(false)}>
              Batal
            </Button>
            <Button
              className="flex-1 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold"
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

export default function TabMeeting({
  kelasId,
  meetings = [],
  isOwner = false,
}: {
  kelasId: number;
  meetings?: Meeting[];
  isOwner?: boolean;
}) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingMeeting, setEditingMeeting] = useState<Meeting | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [form, setForm] = useState({
    judul: "",
    deskripsi: "",
    link_zoom: "",
    nama_pemateri: "",
    profil_pemateri: "",
  });

  const [rangeTanggal, setRangeTanggal] = useState<{
    from?: Date;
    to?: Date;
  }>({});

  const [jamMulai, setJamMulai] = useState("");
  const [jamSelesai, setJamSelesai] = useState("");

  const handleOpenCreate = () => {
    setEditingMeeting(null);
    setForm({
      judul: "",
      deskripsi: "",
      link_zoom: "",
      nama_pemateri: "",
      profil_pemateri: "",
    });
    setRangeTanggal({});
    setJamMulai("");
    setJamSelesai("");
    setDialogOpen(true);
  };

  const handleOpenEdit = (m: Meeting) => {
    setEditingMeeting(m);
    setForm({
      judul: m.judul || "",
      deskripsi: m.deskripsi || "",
      link_zoom: m.link_zoom || "",
      nama_pemateri: m.nama_pemateri || "",
      profil_pemateri: m.profil_pemateri || "",
    });

    if (m.waktu_mulai) {
      const start = new Date(m.waktu_mulai);
      const end = m.waktu_selesai ? new Date(m.waktu_selesai) : start;
      setRangeTanggal({ from: start, to: end });
      setJamMulai(format(start, "HH:mm"));
      if (m.waktu_selesai) setJamSelesai(format(new Date(m.waktu_selesai), "HH:mm"));
    }

    setDialogOpen(true);
  };

  const handleSubmit = () => {
    if (!form.judul) {
      toast.error("Judul wajib diisi.");
      return;
    }
    if (!rangeTanggal.from) {
      toast.error("Tanggal wajib diisi.");
      return;
    }
    
    setIsSubmitting(true);

    const formatTanggalJam = (date?: Date, time?: string) => {
      if (!date) return null;
      return `${format(date, "yyyy-MM-dd")} ${time || "00:00"}:00`;
    };

    const payload = {
      ...form,
      waktu_mulai: formatTanggalJam(rangeTanggal.from, jamMulai),
      waktu_selesai: formatTanggalJam(rangeTanggal.to || rangeTanggal.from, jamSelesai),
    };

    const url = editingMeeting
      ? `/kelas-online/${kelasId}/meetings/${editingMeeting.id}`
      : `/kelas-online/${kelasId}/meetings`;

    const method = editingMeeting ? "put" : "post";

    router[method](url, payload, {
      preserveScroll: true,
      onSuccess: () => {
        setIsSubmitting(false);
        setDialogOpen(false);
        toast.success(editingMeeting ? "Sesi diperbarui!" : "Sesi ditambahkan!");
      },
      onError: () => {
        setIsSubmitting(false);
        toast.error("Gagal menyimpan sesi.");
      },
    });
  };

  return (
    <div className="space-y-6">
      {isOwner && (
        <div className="flex justify-end">
          <Button
            onClick={handleOpenCreate}
            className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold px-5 py-2 shadow-lg shadow-indigo-100 flex items-center gap-2"
          >
            <Plus className="h-4 w-4" /> BUAT SESI BARU
          </Button>
        </div>
      )}

      {meetings.length === 0 ? (
        <div className="bg-gray-50 border border-dashed border-gray-200 rounded-2xl p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Video className="h-8 w-8 text-gray-300" />
          </div>
          <p className="text-sm font-bold text-gray-500">Belum ada sesi yang dijadwalkan</p>
          <p className="text-xs text-gray-400 mt-1">Sesi pertemuan seperti Zoom atau Live Class akan muncul di sini.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {meetings.map((m) => (
            <MeetingCard
              key={m.id}
              meeting={m}
              kelasId={kelasId}
              isOwner={isOwner}
              onEdit={handleOpenEdit}
            />
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md rounded-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-black text-gray-900">
              {editingMeeting ? "Edit Sesi" : "Tambah Sesi Baru"}
            </DialogTitle>
            <DialogDescription className="text-gray-500">
              Jadwalkan pertemuan online untuk kelas ini.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 pt-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Judul Sesi</Label>
              <Input
                placeholder="Contoh: Pengenalan Dasar Zoom"
                value={form.judul}
                onChange={(e) => setForm({ ...form, judul: e.target.value })}
                className="rounded-xl border-gray-200 focus:ring-indigo-500"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Deskripsi Singkat</Label>
              <Textarea
                placeholder="Apa yang akan dibahas?"
                value={form.deskripsi}
                onChange={(e) => setForm({ ...form, deskripsi: e.target.value })}
                className="rounded-xl border-gray-200 focus:ring-indigo-500 min-h-[80px]"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Link Zoom / Meeting</Label>
              <Input
                placeholder="https://zoom.us/j/..."
                value={form.link_zoom}
                onChange={(e) => setForm({ ...form, link_zoom: e.target.value })}
                className="rounded-xl border-gray-200 focus:ring-indigo-500"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Tanggal Sesi</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <button
                    className={cn(
                      "w-full px-4 py-2 text-left text-sm font-medium border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors flex items-center justify-between",
                      !rangeTanggal.from && "text-gray-400"
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-gray-400" />
                      {rangeTanggal.from ? (
                        rangeTanggal.to ? (
                          <>
                            {format(rangeTanggal.from, "dd MMM yyyy", { locale: idLocale })} -{" "}
                            {format(rangeTanggal.to, "dd MMM yyyy", { locale: idLocale })}
                          </>
                        ) : (
                          format(rangeTanggal.from, "dd MMM yyyy", { locale: idLocale })
                        )
                      ) : (
                        <span>Pilih rentang tanggal</span>
                      )}
                    </div>
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 rounded-2xl shadow-xl border-gray-100" align="start">
                  <Calendar
                    initialFocus
                    mode="range"
                    defaultMonth={rangeTanggal?.from}
                    selected={rangeTanggal}
                    onSelect={(val) => setRangeTanggal(val || {})}
                    numberOfMonths={2}
                    className="rounded-2xl"
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Jam Mulai</Label>
                <Input
                  type="time"
                  value={jamMulai}
                  onChange={(e) => setJamMulai(e.target.value)}
                  className="rounded-xl border-gray-200 focus:ring-indigo-500"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Jam Selesai</Label>
                <Input
                  type="time"
                  value={jamSelesai}
                  onChange={(e) => setJamSelesai(e.target.value)}
                  className="rounded-xl border-gray-200 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Nama Pemateri</Label>
              <Input
                placeholder="Nama instruktur"
                value={form.nama_pemateri}
                onChange={(e) => setForm({ ...form, nama_pemateri: e.target.value })}
                className="rounded-xl border-gray-200 focus:ring-indigo-500"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                className="flex-1 rounded-xl font-bold"
                onClick={() => setDialogOpen(false)}
                disabled={isSubmitting}
              >
                BATAL
              </Button>
              <Button
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-lg shadow-indigo-100"
                onClick={handleSubmit}
                disabled={isSubmitting}
              >
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "SIMPAN SESI"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
