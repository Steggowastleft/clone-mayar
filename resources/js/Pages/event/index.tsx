import DashboardLayout from "@/components/dashboard/dashboardlayout";
import { Head, router } from "@inertiajs/react";
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import {
  CalendarIcon,
  Printer,
  Download,
  ExternalLink,
  Upload,
  CalendarDays,
  MapPin,
  Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";

type Event = {
  id: number;
  name: string;
  status: "published" | "unpublished" | "unlisted";
  date: string;
  location: string;
  participants: number;
  tipe: "online" | "offline";
};

type IndexProps = {
  events: Event[];
};

// ─── DateTimePickerField ───
function DateTimePickerField({
  label,
  value,
  onChange,
  optional = false,
}: {
  label: string;
  value: Date | undefined;
  onChange: (d: Date | undefined) => void;
  optional?: boolean;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="space-y-1">
      <Label className="text-sm font-medium text-gray-700">
        {label}{" "}
        {optional && (
          <span className="text-gray-400 font-normal">(Opsional)</span>
        )}
      </Label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            className={cn(
              "w-full flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-md bg-white text-sm text-left hover:border-gray-300 transition",
              value ? "text-gray-800" : "text-gray-400"
            )}
          >
            <CalendarIcon className="h-4 w-4 shrink-0 text-gray-400" />
            {value
              ? format(value, "dd MMMM yyyy HH:mm", { locale: idLocale })
              : "Pilih tanggal & waktu..."}
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0 z-[200]" align="start">
          <Calendar
            mode="single"
            selected={value}
            onSelect={(d) => {
              onChange(d);
              setOpen(false);
            }}
            initialFocus
          />
          {value && optional && (
            <div className="p-2 border-t">
              <Button
                variant="ghost"
                size="sm"
                className="w-full text-xs text-gray-500"
                onClick={() => {
                  onChange(undefined);
                  setOpen(false);
                }}
              >
                Hapus tanggal
              </Button>
            </div>
          )}
        </PopoverContent>
      </Popover>
    </div>
  );
}

// ─── Default form values ───
const defaultForm = {
  nama: "",
  deskripsi: "",
  tipe: "online" as "online" | "offline",
  lokasi: "",
  lokasiMap: "",
  instruksi: "",
  syaratKetentuan: "",
  maxTiketPerTransaksi: "1",
  redirectUrl: "",
  bisaAffiliate: false,
};

// ─── Main ───
export default function Index({ events }: IndexProps) {
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [dateFilter, setDateFilter] = useState<Date | undefined>(undefined);
  const [dateOpen, setDateOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({ ...defaultForm });
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [waktuMulai, setWaktuMulai] = useState<Date | undefined>();
  const [waktuSelesai, setWaktuSelesai] = useState<Date | undefined>();
  const [waktuMulaiJual, setWaktuMulaiJual] = useState<Date | undefined>();
  const [tanggalTutupDaftar, setTanggalTutupDaftar] = useState<
    Date | undefined
  >();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const openCreate = () => {
    setFormData({ ...defaultForm });
    setCoverFile(null);
    setCoverPreview(null);
    setWaktuMulai(undefined);
    setWaktuSelesai(undefined);
    setWaktuMulaiJual(undefined);
    setTanggalTutupDaftar(undefined);
    setCreateOpen(true);
  };

  const filteredEvents = events.filter((e) => {
    const matchStatus =
      statusFilter === "all" || e.status === statusFilter;
    const matchSearch = e.name
      .toLowerCase()
      .includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  const statusBadge = (status: string) => {
    switch (status) {
      case "published":
        return (
          <Badge className="bg-green-500 text-white">Published</Badge>
        );
      case "unpublished":
        return (
          <Badge className="bg-yellow-500 text-white">Unpublished</Badge>
        );
      case "unlisted":
        return (
          <Badge className="bg-gray-500 text-white">Unlisted</Badge>
        );
      default:
        return <Badge>Unknown</Badge>;
    }
  };

  const tipeBadge = (tipe: string) =>
    tipe === "online" ? (
      <Badge className="bg-blue-100 text-blue-700 border border-blue-200">
        Online
      </Badge>
    ) : (
      <Badge className="bg-orange-100 text-orange-700 border border-orange-200">
        Offline
      </Badge>
    );

  const filterButtons = [
    { label: "SEMUA", value: "all" },
    { label: "PUBLISHED", value: "published" },
    { label: "UNPUBLISHED", value: "unpublished" },
    { label: "UNLISTED", value: "unlisted" },
  ];

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCoverFile(file);
      const reader = new FileReader();
      reader.onload = () => setCoverPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = () => {
    if (!formData.nama.trim()) return alert("Nama event tidak boleh kosong");
    if (!formData.deskripsi.trim())
      return alert("Deskripsi tidak boleh kosong");
    if (!waktuMulai) return alert("Waktu mulai harus diisi");
    setIsSubmitting(true);

    const payload = new FormData();
    payload.append("nama", formData.nama);
    payload.append("deskripsi", formData.deskripsi);
    payload.append("tipe", formData.tipe);
    payload.append("lokasi", formData.lokasi);
    payload.append("lokasi_map", formData.lokasiMap);
    payload.append("instruksi", formData.instruksi);
    payload.append("syarat_ketentuan", formData.syaratKetentuan);
    payload.append(
      "max_tiket_per_transaksi",
      formData.maxTiketPerTransaksi
    );
    payload.append("redirect_url", formData.redirectUrl);
    payload.append("bisa_affiliate", formData.bisaAffiliate ? "1" : "0");
    if (waktuMulai)
      payload.append(
        "waktu_mulai",
        format(waktuMulai, "yyyy-MM-dd HH:mm:ss")
      );
    if (waktuSelesai)
      payload.append(
        "waktu_selesai",
        format(waktuSelesai, "yyyy-MM-dd HH:mm:ss")
      );
    if (waktuMulaiJual)
      payload.append(
        "waktu_mulai_jual",
        format(waktuMulaiJual, "yyyy-MM-dd HH:mm:ss")
      );
    if (tanggalTutupDaftar)
      payload.append(
        "tanggal_tutup_daftar",
        format(tanggalTutupDaftar, "yyyy-MM-dd")
      );
    if (coverFile) payload.append("cover", coverFile);

    router.post("/event", payload, {
      forceFormData: true,
      onSuccess: () => {
        setCreateOpen(false);
        setIsSubmitting(false);
      },
      onError: () => {
        setIsSubmitting(false);
      },
    });
  };

  const tiketOptions = Array.from({ length: 50 }, (_, i) => i + 1);

  return (
    <DashboardLayout title="Event & Acara">
      <div className="flex gap-0 min-h-screen">
        {/* MAIN CONTENT */}
        <div className="flex-1 p-6">
          <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">
            PROJEK
          </p>
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-800">
              Event & Acara
            </h1>
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="border-blue-500 text-blue-600 hover:bg-blue-50"
                onClick={() =>
                  window.open("/event/catalog", "_blank")
                }
              >
                PRODUK
              </Button>
              <Button
                className="bg-blue-600 hover:bg-blue-700 text-white"
                onClick={openCreate}
              >
                + BUAT
              </Button>
            </div>
          </div>

          {/* Table Panel */}
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="font-semibold text-gray-700">
                Semua Event & Acara
              </h2>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Input
                    placeholder="Filter Halaman"
                    className="pl-8 w-48 text-sm"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                  <svg
                    className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>
                <button className="text-gray-400 hover:text-gray-600">
                  <Printer className="h-5 w-5" />
                </button>
                <button className="text-gray-400 hover:text-gray-600">
                  <Download className="h-5 w-5" />
                </button>
              </div>
            </div>
            <div className="p-6">
              {filteredEvents.length === 0 ? (
                <p className="text-center text-gray-400 py-12 text-sm">
                  There are no records to display
                </p>
              ) : (
                <div className="space-y-3">
                  {filteredEvents.map((event) => (
                    <div
                      key={event.id}
                      className="flex items-center justify-between p-4 border border-gray-100 rounded-lg hover:bg-gray-50 transition"
                    >
                      <div className="flex items-start gap-3">
                        <div className="bg-blue-50 rounded-lg p-2 mt-0.5">
                          <CalendarDays className="h-5 w-5 text-blue-500" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800">
                            {event.name}
                          </p>
                          <div className="flex items-center gap-2 mt-1 text-sm text-gray-500 flex-wrap">
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {event.date}
                            </span>
                            {event.location && (
                              <span className="flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {event.location}
                              </span>
                            )}
                            <span>{event.participants} peserta</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {tipeBadge(event.tipe)}
                        {statusBadge(event.status)}
                        <Button
                          size="sm"
                          onClick={() =>
                            router.visit(`/event/${event.id}`)
                          }
                        >
                          Detail
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT SIDEBAR */}
        <div className="w-72 border-l border-gray-200 bg-gray-50 p-4 space-y-3 shrink-0">
          <Popover open={dateOpen} onOpenChange={setDateOpen}>
            <PopoverTrigger asChild>
              <button
                className={cn(
                  "w-full flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-md bg-white text-sm text-left text-gray-500 hover:border-gray-300 transition",
                  dateFilter && "text-gray-800"
                )}
              >
                <CalendarIcon className="h-4 w-4 text-gray-400 shrink-0" />
                {dateFilter
                  ? format(dateFilter, "dd MMM yyyy")
                  : "Filter Berdasarkan Tanggal..."}
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                mode="single"
                selected={dateFilter}
                onSelect={(date) => {
                  setDateFilter(date);
                  setDateOpen(false);
                }}
                initialFocus
              />
              {dateFilter && (
                <div className="p-2 border-t">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full text-xs text-gray-500"
                    onClick={() => {
                      setDateFilter(undefined);
                      setDateOpen(false);
                    }}
                  >
                    Reset Tanggal
                  </Button>
                </div>
              )}
            </PopoverContent>
          </Popover>

          <Input
            placeholder="Cari Event & Acara"
            className="bg-white text-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <div className="space-y-2">
            {filterButtons.map((btn) => (
              <button
                key={btn.value}
                onClick={() => setStatusFilter(btn.value)}
                className={cn(
                  "w-full px-4 py-2.5 rounded-md text-sm font-semibold tracking-wide transition",
                  statusFilter === btn.value
                    ? "bg-blue-600 text-white"
                    : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-100"
                )}
              >
                {btn.label}
              </button>
            ))}
          </div>

          <button
            onClick={() =>
              window.open("/event/catalog", "_blank")
            }
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gray-800 hover:bg-gray-900 text-white text-sm font-semibold rounded-md transition mt-2"
          >
            KATALOG EVENT & ACARA
            <ExternalLink className="h-4 w-4" />
          </button>
          <p className="text-xs text-gray-500 text-center leading-relaxed">
            Katalog Event adalah halaman katalog online dimana semua
            event anda yang aktif ditampilkan.
          </p>

          <button
            onClick={openCreate}
            className="w-full px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-md transition"
          >
            + Buat Event Baru
          </button>
        </div>
      </div>

      {/* CREATE DIALOG */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0">
          {/* Header */}
          <div className="bg-gradient-to-br from-blue-600 to-blue-700 p-6 rounded-t-lg sticky top-0 z-10">
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-white/20 rounded-lg p-2">
                <CalendarDays className="h-6 w-6 text-white" />
              </div>
              <DialogTitle className="text-white text-xl font-bold">
                Buat Event / Acara
              </DialogTitle>
            </div>
            <p className="text-blue-100 text-sm leading-relaxed">
              Mengadakan event offline atau online, menerima pembelian
              tiket, pendaftaran dan pembayaran semakin mudah dengan
              Mayar
            </p>
          </div>

          <div className="p-6 space-y-5">
            {/* Nama Event */}
            <div className="space-y-1">
              <Label className="text-sm font-medium text-gray-700">
                Nama Event / Acara{" "}
                <span className="text-red-500">*</span>
              </Label>
              <Input
                placeholder="Contoh: Tech Conference 2025"
                maxLength={100}
                value={formData.nama}
                onChange={(e) =>
                  setFormData({ ...formData, nama: e.target.value })
                }
              />
              <p className="text-xs text-gray-400 text-right">
                {formData.nama.length}/100
              </p>
            </div>

            {/* Deskripsi */}
            <div className="space-y-1">
              <Label className="text-sm font-medium text-gray-700">
                Deskripsi <span className="text-red-500">*</span>
              </Label>
              <Textarea
                placeholder="Tuliskan deskripsi event kamu..."
                rows={4}
                value={formData.deskripsi}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    deskripsi: e.target.value,
                  })
                }
              />
            </div>

            {/* Tipe Event */}
            <div className="space-y-1">
              <Label className="text-sm font-medium text-gray-700">
                Tipe Event
              </Label>
              <div className="flex gap-3">
                {(["online", "offline"] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() =>
                      setFormData({ ...formData, tipe: t })
                    }
                    className={cn(
                      "flex-1 py-2.5 rounded-md text-sm font-semibold border transition",
                      formData.tipe === t
                        ? "bg-blue-600 text-white border-blue-600"
                        : "bg-white text-gray-700 border-gray-200 hover:border-gray-300"
                    )}
                  >
                    {t === "online" ? "EVENT ONLINE" : "EVENT OFFLINE"}
                  </button>
                ))}
              </div>
            </div>

            {/* Lokasi */}
            <div className="space-y-1">
              <Label className="text-sm font-medium text-gray-700">
                Lokasi / Alamat Venue
              </Label>
              <Textarea
                placeholder="Tulis lokasi acara selengkapnya (nama venue, jalan, kota, provinsi)"
                rows={2}
                maxLength={300}
                value={formData.lokasi}
                onChange={(e) =>
                  setFormData({ ...formData, lokasi: e.target.value })
                }
              />
              <p className="text-xs text-gray-400 text-right">
                {formData.lokasi.length}/300
              </p>
            </div>

            {/* Lokasi Map */}
            <div className="space-y-1">
              <Label className="text-sm font-medium text-gray-700">
                Lokasi dalam Map{" "}
                <span className="text-gray-400 font-normal">
                  (Opsional)
                </span>
              </Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                <Input
                  className="pl-9"
                  placeholder="Cari lokasi..."
                  value={formData.lokasiMap}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      lokasiMap: e.target.value,
                    })
                  }
                />
              </div>
              {/* Map placeholder */}
              <div className="w-full h-32 bg-gray-100 rounded-md border border-gray-200 flex items-center justify-center mt-1">
                <div className="text-center text-gray-400">
                  <MapPin className="h-6 w-6 mx-auto mb-1" />
                  <p className="text-xs">
                    Peta akan tampil setelah lokasi dipilih
                  </p>
                </div>
              </div>
            </div>

            {/* Waktu */}
            <div className="grid grid-cols-2 gap-4">
              <DateTimePickerField
                label="Waktu Mulai"
                value={waktuMulai}
                onChange={setWaktuMulai}
              />
              <DateTimePickerField
                label="Waktu Selesai"
                value={waktuSelesai}
                onChange={setWaktuSelesai}
                optional
              />
            </div>
            <p className="text-xs text-gray-400">
              Timezone menggunakan WIB (GMT+07:00) - Asia/Jakarta
            </p>

            {/* Cover */}
            <div className="space-y-1">
              <Label className="text-sm font-medium text-gray-700">
                Cover (gambar/video untuk promo)
              </Label>
              <div
                className="border-2 border-dashed border-gray-200 rounded-lg p-6 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition"
                onClick={() => fileInputRef.current?.click()}
              >
                {coverPreview ? (
                  <img
                    src={coverPreview}
                    alt="preview"
                    className="max-h-40 mx-auto rounded-md object-cover"
                  />
                ) : (
                  <div className="space-y-2">
                    <Upload className="h-8 w-8 text-gray-400 mx-auto" />
                    <p className="text-sm text-gray-500">
                      Drag &amp; drop image
                    </p>
                    <p className="text-xs text-gray-400">
                      PNG, JPG, WEBP, MP4 (maks. 10MB)
                    </p>
                  </div>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,video/*"
                className="hidden"
                onChange={handleCoverChange}
              />
              {coverFile && (
                <p className="text-xs text-green-600">
                  ✓ {coverFile.name}
                </p>
              )}
            </div>

            {/* Instruksi */}
            <div className="space-y-1">
              <Label className="text-sm font-medium text-gray-700">
                Instruksi
              </Label>
              <p className="text-xs text-gray-500">
                Instruksi setelah pendaftaran / pembayaran
              </p>
              <Textarea
                placeholder="Contoh: Silakan bergabung ke grup WhatsApp melalui link berikut..."
                rows={3}
                maxLength={500}
                value={formData.instruksi}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    instruksi: e.target.value,
                  })
                }
              />
              <p className="text-xs text-gray-400 text-right">
                {formData.instruksi.length}/500
              </p>
            </div>

            {/* Syarat & Ketentuan */}
            <div className="space-y-1">
              <Label className="text-sm font-medium text-gray-700">
                Syarat dan Ketentuan
              </Label>
              <Textarea
                placeholder="Tuliskan syarat dan ketentuan event..."
                rows={4}
                maxLength={1000}
                value={formData.syaratKetentuan}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    syaratKetentuan: e.target.value,
                  })
                }
              />
              <p className="text-xs text-gray-400 text-right">
                {formData.syaratKetentuan.length}/1000
              </p>
              <p className="text-xs text-gray-400">
                1 akun email - 1 kali transaksi
              </p>
            </div>

            {/* Tanggal Jual & Tutup */}
            <div className="grid grid-cols-2 gap-4">
              <DateTimePickerField
                label="Waktu Mulai Penjualan"
                value={waktuMulaiJual}
                onChange={setWaktuMulaiJual}
                optional
              />
              <DateTimePickerField
                label="Tanggal Pendaftaran Ditutup"
                value={tanggalTutupDaftar}
                onChange={setTanggalTutupDaftar}
                optional
              />
            </div>
            <div className="space-y-1">
              <p className="text-xs text-gray-400">
                Kami akan membuka link pembayaran pada tanggal dan
                waktu yang anda pilih. Opsional, kosongkan untuk
                langsung membuka penjualan.
              </p>
              <p className="text-xs text-gray-400">
                Kami akan menutup pendaftaran pada tanggal ini
                (opsional), jika tidak diisi kami akan menutup event
                ini setelah acara dimulai.
              </p>
            </div>

            {/* Max Tiket per Transaksi */}
            <div className="space-y-1">
              <Label className="text-sm font-medium text-gray-700">
                Jumlah maksimal tiket per transaksi
              </Label>
              <Select
                value={formData.maxTiketPerTransaksi}
                onValueChange={(v) =>
                  setFormData({
                    ...formData,
                    maxTiketPerTransaksi: v,
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="z-[200] max-h-60">
                  {tiketOptions.map((n) => (
                    <SelectItem key={n} value={String(n)}>
                      {n} Tiket
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Redirect URL */}
            <div className="space-y-1">
              <Label className="text-sm font-medium text-gray-700">
                Redirect URL{" "}
                <span className="text-gray-400 font-normal">
                  (Opsional)
                </span>
              </Label>
              <Input
                type="url"
                placeholder="https://example.com/thank-you"
                value={formData.redirectUrl}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    redirectUrl: e.target.value,
                  })
                }
              />
              <p className="text-xs text-gray-400">
                Pelanggan akan dibawa ke halaman ini setelah membayar
                (opsional / bisa dikosongkan).
              </p>
            </div>

            {/* Affiliate Toggle */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div>
                <Label className="text-sm font-medium text-gray-700">
                  Produk bisa diaffiliate
                </Label>
                <p className="text-xs text-gray-400">
                  Izinkan affiliate untuk mempromosikan event ini
                </p>
              </div>
              <Switch
                checked={formData.bisaAffiliate}
                onCheckedChange={(v) =>
                  setFormData({ ...formData, bisaAffiliate: v })
                }
              />
            </div>

            {/* Buttons */}
            <div className="flex gap-3 pt-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setCreateOpen(false)}
                disabled={isSubmitting}
              >
                Batal
              </Button>
              <Button
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                onClick={handleSubmit}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Menyimpan..." : "Buat Event"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}