import { useState, useEffect, useRef } from "react";
import { router, usePage } from "@inertiajs/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import {
  Plus, Video, MapPin, Search, Loader2, X,
  Clock, User, Pencil, Trash2, Globe,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { DateTimePicker } from "./components/DatePickers";
import { MapPicker } from "@/components/ui/mappicker";

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────
export type Sesi = {
  id: number;
  judul: string;
  deskripsi?: string;
  is_online: boolean;
  link_sesi?: string;
  lokasi?: string;
  lokasi_map?: string;
  nama_pemateri?: string;
  profil_pemateri?: string;
  waktu_mulai?: string;
  waktu_selesai?: string;
};

// ─────────────────────────────────────────────
// Form kosong default
// ─────────────────────────────────────────────
const emptyForm = {
  judul: "", deskripsi: "", linkSesi: "",
  lokasi: "", lokasiMap: "", namaPemateri: "", profilPemateri: "",
};
const emptyWaktu = { date: undefined as Date | undefined, time: "" };

// ─────────────────────────────────────────────
// Sesi Card
// ─────────────────────────────────────────────
function SesiCard({
  sesi,
  bootcampId,
  onEdit,
}: {
  sesi: Sesi;
  bootcampId: number;
  onEdit: (sesi: Sesi) => void;
}) {
  const [hapusOpen, setHapusOpen] = useState(false);

  const handleHapus = () => {
    router.delete(`/bootcamps/${bootcampId}/sesi/${sesi.id}`, {
      preserveScroll: true,
      onSuccess: () => {
        toast.success("Sesi berhasil dihapus.");
        router.reload({ only: ["sesiList"] });
      },
      onError: () => toast.error("Gagal menghapus sesi."),
    });
  };

  return (
    <>
      <div className="border border-gray-200 rounded-lg p-4 bg-white hover:shadow-sm transition">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            {/* Judul + badge */}
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="font-semibold text-gray-800 text-sm">{sesi.judul}</h4>
              <Badge className={cn(
                "text-xs text-white",
                sesi.is_online ? "bg-blue-500" : "bg-emerald-500"
              )}>
                {sesi.is_online ? "Online" : "Offline"}
              </Badge>
            </div>

            {/* Waktu */}
            {sesi.waktu_mulai && (
              <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                <Clock className="h-3 w-3" />
                {sesi.waktu_mulai}
                {sesi.waktu_selesai && ` – ${sesi.waktu_selesai}`}
              </p>
            )}

            {/* Lokasi / Link */}
            {sesi.is_online ? (
              sesi.link_sesi && (
                <a
                  href={sesi.link_sesi}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-600 hover:underline flex items-center gap-1 mt-1 truncate"
                >
                  <Globe className="h-3 w-3 shrink-0" />
                  {sesi.link_sesi}
                </a>
              )
            ) : (
              sesi.lokasi && (
                <p className="text-xs text-gray-500 flex items-start gap-1 mt-1">
                  <MapPin className="h-3 w-3 shrink-0 mt-0.5" />
                  <span className="line-clamp-2">{sesi.lokasi}</span>
                </p>
              )
            )}

            {/* Pemateri */}
            {sesi.nama_pemateri && (
              <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                <User className="h-3 w-3" /> {sesi.nama_pemateri}
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-1 shrink-0">
            <button
              onClick={() => onEdit(sesi)}
              className="p-1.5 rounded-md hover:bg-gray-100 text-gray-400 hover:text-blue-600 transition"
            >
              <Pencil className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => setHapusOpen(true)}
              className="p-1.5 rounded-md hover:bg-red-50 text-gray-400 hover:text-red-600 transition"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Confirm hapus */}
      <Dialog open={hapusOpen} onOpenChange={setHapusOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Hapus Sesi?</DialogTitle>
            <DialogDescription>Sesi <strong>{sesi.judul}</strong> akan dihapus permanen.</DialogDescription>
          </DialogHeader>
          <div className="flex gap-3 pt-2">
            <Button variant="outline" className="flex-1" onClick={() => setHapusOpen(false)}>Batal</Button>
            <Button className="flex-1 bg-red-600 hover:bg-red-700 text-white" onClick={() => { handleHapus(); setHapusOpen(false); }}>
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
export default function TabSesiMeeting({
  bootcampId,
  initialSesiList = [],
}: {
  bootcampId: number;
  initialSesiList?: Sesi[];
}) {
  const [createOpen,  setCreateOpen]  = useState(false);
  const [isOnline,    setIsOnline]    = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingSesi,  setEditingSesi]  = useState<Sesi | null>(null);
  const [sesiList,     setSesiList]     = useState<Sesi[]>(initialSesiList);
  const [errors,       setErrors]       = useState<Record<string, string>>({});

  const [sesiForm,     setSesiForm]  = useState(emptyForm);
  const [rangeTanggal, setRangeTanggal] = useState<{
  from?: Date;
  to?: Date;
  }>({});

  const [jamMulai, setJamMulai] = useState("");
  const [jamSelesai, setJamSelesai] = useState("");

  // ── Sync sesiList dari props jika reload ──
  const page = usePage<{ sesiList?: Sesi[] }>();
  useEffect(() => {
    if (page.props.sesiList) setSesiList(page.props.sesiList);
  }, [page.props.sesiList]);

  // ── Buka form edit ──
  const handleOpenEdit = (sesi: Sesi) => {
    setEditingSesi(sesi);
    setIsOnline(sesi.is_online);
    setSesiForm({
      judul:         sesi.judul           || "",
      deskripsi:     sesi.deskripsi       || "",
      linkSesi:      sesi.link_sesi       || "",
      lokasi:        sesi.lokasi          || "",
      lokasiMap:     sesi.lokasi_map      || "",
      namaPemateri:  sesi.nama_pemateri   || "",
      profilPemateri:sesi.profil_pemateri || "",
    });
    setCreateOpen(true);
  };

  const handleCloseDialog = () => {
    setCreateOpen(false);
    setEditingSesi(null);
    setSesiForm(emptyForm);
    setWaktuMulai(emptyWaktu);
    setWaktuSelesai(emptyWaktu);
    setErrors({});
    setIsOnline(false);
  };

  // ── Validasi ──
  const validate = () => {
    const e: Record<string, string> = {};
    if (!sesiForm.judul.trim())        e.judul = "Judul sesi wajib diisi.";
    if (!waktuMulai.date)              e.waktuMulai = "Waktu mulai wajib diisi.";
    if (isOnline && !sesiForm.linkSesi.trim()) e.linkSesi = "Link sesi wajib diisi untuk sesi online.";
    if (!isOnline && !sesiForm.lokasi.trim())  e.lokasi   = "Lokasi wajib diisi untuk sesi offline.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // ── Submit (create / update) ──
  const handleSubmit = () => {
  if (!validate()) return;
  setIsSubmitting(true);

  const formatTanggalJam = (date?: Date, time?: string) => {
    if (!date) return "";
    return `${format(date, "yyyy-MM-dd")} ${time || "00:00"}`;
  };

  const payload = {
    judul:           sesiForm.judul,
    deskripsi:       sesiForm.deskripsi,
    is_online:       isOnline ? 1 : 0,
    link_sesi:       isOnline ? sesiForm.linkSesi : "",
    lokasi:          !isOnline ? sesiForm.lokasi : "",
    lokasi_map:      !isOnline ? sesiForm.lokasiMap : "",
    nama_pemateri:   sesiForm.namaPemateri,
    profil_pemateri: sesiForm.profilPemateri,

    // ✅ pakai date range + time
    waktu_mulai: formatTanggalJam(rangeTanggal.from, jamMulai),
    waktu_selesai: formatTanggalJam(rangeTanggal.to, jamSelesai),
  };

  const isEdit = !!editingSesi;
  const url = isEdit
    ? `/bootcamps/${bootcampId}/sesi/${editingSesi!.id}`
    : `/bootcamps/${bootcampId}/sesi`;

  const routerOptions = {
    preserveScroll: true as const,
    onSuccess: () => {
      setIsSubmitting(false);
      toast.success(isEdit ? "Sesi berhasil diperbarui!" : "Sesi berhasil dibuat!");
      handleCloseDialog();
      router.reload({ only: ["sesiList"] });
    },
    onError: (e: Record<string, string>) => {
      setIsSubmitting(false);
      toast.error("Gagal menyimpan sesi.");
      setErrors(e);
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
          <h3 className="font-semibold text-gray-800">Sesi Meeting</h3>
          <p className="text-xs text-gray-400 mt-0.5">Kelola sesi pertemuan untuk bootcamp ini</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700 text-white text-sm" onClick={() => setCreateOpen(true)}>
          <Plus className="h-4 w-4 mr-1" /> Buat Sesi
        </Button>
      </div>

      {/* List Sesi */}
      <div className="p-5">
        {sesiList.length === 0 ? (
          <p className="text-center text-gray-400 py-8 text-sm">Belum ada sesi meeting</p>
        ) : (
          <div className="space-y-3">
            {sesiList.map((sesi) => (
              <SesiCard
                key={sesi.id}
                sesi={sesi}
                bootcampId={bootcampId}
                onEdit={handleOpenEdit}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── Dialog Form ── */}
      <Dialog open={createOpen} onOpenChange={(v) => { if (!v) handleCloseDialog(); }}>
        <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingSesi ? "Edit Sesi Meeting" : "Buat Sesi Meeting"}</DialogTitle>
            <DialogDescription>Isi detail untuk sesi pertemuan.</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 pt-2">
            {/* Judul */}
            <div className="space-y-1">
              <Label className="text-sm font-medium text-gray-700">
                Judul Sesi <span className="text-red-500">*</span>
              </Label>
              <Input
                placeholder="Contoh: Sesi 1 - Pengenalan Laravel"
                value={sesiForm.judul}
                onChange={(e) => setSesiForm({ ...sesiForm, judul: e.target.value })}
                className={errors.judul ? "border-red-400" : ""}
              />
              {errors.judul && <p className="text-xs text-red-500">{errors.judul}</p>}
            </div>

            {/* Deskripsi */}
            <div className="space-y-1">
              <Label className="text-sm font-medium text-gray-700">Deskripsi</Label>
              <Textarea
                placeholder="Deskripsi sesi..."
                rows={3}
                value={sesiForm.deskripsi}
                onChange={(e) => setSesiForm({ ...sesiForm, deskripsi: e.target.value })}
              />
            </div>

            {/* Toggle Online/Offline */}
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex items-center gap-2">
                {isOnline
                  ? <Video className="h-4 w-4 text-blue-600" />
                  : <MapPin className="h-4 w-4 text-gray-500" />
                }
                <Label className="text-sm font-medium text-gray-700">
                  {isOnline ? "Sesi Online" : "Sesi Offline"}
                </Label>
              </div>
              <Switch checked={isOnline} onCheckedChange={setIsOnline} />
            </div>

            {/* Online */}
            {isOnline ? (
              <div className="space-y-1">
                <Label className="text-sm font-medium text-gray-700">
                  Link Sesi <span className="text-red-500">*</span>
                </Label>
                <Input
                  placeholder="https://zoom.us/j/... atau Google Meet link"
                  value={sesiForm.linkSesi}
                  onChange={(e) => setSesiForm({ ...sesiForm, linkSesi: e.target.value })}
                  className={errors.linkSesi ? "border-red-400" : ""}
                />
                {errors.linkSesi && <p className="text-xs text-red-500">{errors.linkSesi}</p>}
                <p className="text-xs text-gray-400">Zoom / Google Meet / Youtube Live, dll</p>
              </div>
            ) : (
              /* Offline */
              <MapPicker
                address={sesiForm.lokasi}
                mapUrl={sesiForm.lokasiMap}
                onAddressChange={(address) => setSesiForm({ ...sesiForm, lokasi: address })}
                onMapUrlChange={(url) => setSesiForm({ ...sesiForm, lokasiMap: url })}
                label="Lokasi / Alamat Venue *"
              />
            )}

            {/* Waktu */}
            <div className="space-y-3">
  {/* Date Range */}
  <div>
    <Label>Tanggal Sesi *</Label>
    <Popover>
      <PopoverTrigger asChild>
        <button className="w-full px-3 py-2 border rounded-md text-left text-sm">
          {rangeTanggal.from && rangeTanggal.to
            ? `${format(rangeTanggal.from, "dd MMM yyyy")} - ${format(rangeTanggal.to, "dd MMM yyyy")}`
            : "Pilih rentang tanggal"}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <Calendar
          mode="range"
          selected={rangeTanggal}
          onSelect={(val) => setRangeTanggal(val || {})}
          numberOfMonths={2}
        />
      </PopoverContent>
    </Popover>
  </div>

  {/* Time */}
  <div className="grid grid-cols-2 gap-3">
    <div>
      <Label>Jam Mulai *</Label>
      <Input
        type="time"
        value={jamMulai}
        onChange={(e) => setJamMulai(e.target.value)}
      />
    </div>

    <div>
      <Label>Jam Selesai</Label>
      <Input
        type="time"
        value={jamSelesai}
        onChange={(e) => setJamSelesai(e.target.value)}
      />
    </div>
  </div>
</div>

            {/* Pemateri */}
            <div className="space-y-1">
              <Label className="text-sm font-medium text-gray-700">Nama Pemateri</Label>
              <Input
                placeholder="Nama instruktur / pemateri"
                value={sesiForm.namaPemateri}
                onChange={(e) => setSesiForm({ ...sesiForm, namaPemateri: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <Label className="text-sm font-medium text-gray-700">Profil Pemateri</Label>
              <Textarea
                placeholder="Bio singkat pemateri..."
                rows={2}
                value={sesiForm.profilPemateri}
                onChange={(e) => setSesiForm({ ...sesiForm, profilPemateri: e.target.value })}
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-1">
              <Button variant="outline" className="flex-1" onClick={handleCloseDialog} disabled={isSubmitting}>
                Batal
              </Button>
              <Button
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                onClick={handleSubmit}
                disabled={isSubmitting}
              >
                {isSubmitting
                  ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Menyimpan...</>
                  : editingSesi ? "Simpan Perubahan" : "Buat Sesi"
                }
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}