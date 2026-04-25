import DashboardLayout from "@/components/dashboard/dashboardlayout";
import { router } from "@inertiajs/react";
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
  Heart,
  Clock,
  Globe,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Types ───
type Produk = {
  id: number;
  tipe: "donasi" | "qurban" | "wakaf";
  nama: string;
  status: "published" | "unpublished" | "unlisted";
  tanggal_mulai_jual: string | null;
  tanggal_tutup: string | null;
  pembeli: number;
  terkumpul: number;
  harga: number;
  cover: string | null;
};

type IndexProps = {
  produk?: Produk[];
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
  const [time, setTime] = useState("09:00");

  const handleSelect = (d: Date | undefined) => {
    if (!d) {
      onChange(undefined);
      setOpen(false);
      return;
    }
    const [h, m] = time.split(":").map(Number);
    const combined = new Date(d);
    combined.setHours(h, m, 0, 0);
    onChange(combined);
    setOpen(false);
  };

  return (
    <div className="space-y-1">
      <Label className="text-sm font-medium text-gray-700">
        {label}{" "}
        {optional && <span className="text-gray-400 font-normal">(Opsional)</span>}
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
            onSelect={handleSelect}
            initialFocus
          />
          <div className="p-3 border-t flex items-center gap-2">
            <Clock className="h-4 w-4 text-gray-400" />
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="text-sm border border-gray-200 rounded px-2 py-1 flex-1"
            />
          </div>
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
  tipe: "donasi" as const,
  nama: "",
  deskripsi: "",
  kategori: "",
  jenis_hewan: "",
  harga: "",
  harga_coret: "",
  minimal_donasi: "",
  stok: "",
  tujuan: "",
  penerima_manfaat: "",
  rincian_penggunaan: "",
  catatan: "",
  redirect_url: "",
  tampilkan_target: true,
  tampilkan_pencairan: false,
  affiliate_enabled: false,
};

const kategoriBentukDonasi = [
  "Bencana Alam",
  "Kesehatan",
  "Pendidikan",
  "Kemanusiaan",
  "Agama",
  "Lainnya",
];

const jenisHewanQurban = ["Sapi", "Kambing", "Domba", "Ayam"];

// ─── Main ───
export default function Index({ produk = [] }: IndexProps) {
  const [statusFilter, setStatusFilter] = useState("all");
  const [tipeFilter, setTipeFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({ ...defaultForm });
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [tanggalMulaiJual, setTanggalMulaiJual] = useState<Date | undefined>();
  const [tanggalTutup, setTanggalTutup] = useState<Date | undefined>();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const openCreate = () => {
    setFormData({ ...defaultForm });
    setCoverFile(null);
    setCoverPreview(null);
    setTanggalMulaiJual(undefined);
    setTanggalTutup(undefined);
    setCreateOpen(true);
  };

  const filteredProduk = (produk ?? []).filter((p) => {
    const matchStatus = statusFilter === "all" || p.status === statusFilter;
    const matchTipe = tipeFilter === "all" || p.tipe === tipeFilter;
    const matchSearch = p.nama.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchTipe && matchSearch;
  });

  const statusBadge = (status: string) => {
    switch (status) {
      case "published":
        return <Badge className="bg-green-500 text-white">Published</Badge>;
      case "unpublished":
        return <Badge className="bg-yellow-500 text-white">Unpublished</Badge>;
      case "unlisted":
        return <Badge className="bg-gray-500 text-white">Unlisted</Badge>;
      default:
        return <Badge>Unknown</Badge>;
    }
  };

  const tipeBadge = (tipe: string) => {
    const badges: Record<string, { label: string; color: string }> = {
      donasi: { label: "Donasi", color: "bg-blue-500" },
      qurban: { label: "Qurban", color: "bg-purple-500" },
      wakaf: { label: "Wakaf", color: "bg-green-600" },
    };
    const config = badges[tipe] || badges["donasi"];
    return <Badge className={`${config.color} text-white`}>{config.label}</Badge>;
  };

  const statusButtons = [
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
    if (!formData.nama.trim()) return alert("Nama tidak boleh kosong");
    if (!formData.harga || Number(formData.harga) <= 0)
      return alert("Harga/Target harus diisi dan lebih dari 0");

    // Validasi tipe-spesifik
    if (formData.tipe === "donasi" && !formData.kategori)
      return alert("Kategori donasi harus dipilih");
    if (formData.tipe === "qurban" && !formData.jenis_hewan)
      return alert("Jenis hewan harus dipilih");

    setIsSubmitting(true);

    const payload = new FormData();
    payload.append("tipe", formData.tipe);
    payload.append("nama", formData.nama);
    payload.append("deskripsi", formData.deskripsi);
    payload.append("redirect_url", formData.redirect_url);
    payload.append("catatan", formData.catatan);
    payload.append("affiliate_enabled", formData.affiliate_enabled ? "1" : "0");

    if (tanggalMulaiJual)
      payload.append(
        "tanggal_mulai_jual",
        format(tanggalMulaiJual, "yyyy-MM-dd HH:mm:ss")
      );
    if (tanggalTutup)
      payload.append("tanggal_tutup", format(tanggalTutup, "yyyy-MM-dd HH:mm:ss"));

    // Tipe-spesifik fields
    if (formData.tipe === "donasi") {
      payload.append("kategori", formData.kategori);
      payload.append("harga", formData.harga);
      payload.append("minimal_donasi", formData.minimal_donasi);
      payload.append("tujuan", formData.tujuan);
      payload.append("penerima_manfaat", formData.penerima_manfaat);
      payload.append("rincian_penggunaan", formData.rincian_penggunaan);
      payload.append("tampilkan_target", formData.tampilkan_target ? "1" : "0");
      payload.append(
        "tampilkan_pencairan",
        formData.tampilkan_pencairan ? "1" : "0"
      );
    } else if (formData.tipe === "qurban") {
      payload.append("jenis_hewan", formData.jenis_hewan);
      payload.append("harga", formData.harga);
      payload.append("harga_coret", formData.harga_coret);
      payload.append("stok", formData.stok);
    } else if (formData.tipe === "wakaf") {
      payload.append("harga", formData.harga);
      payload.append("tujuan", formData.tujuan);
      payload.append("penerima_manfaat", formData.penerima_manfaat);
      payload.append("rincian_penggunaan", formData.rincian_penggunaan);
      payload.append("tampilkan_target", formData.tampilkan_target ? "1" : "0");
    }

    if (coverFile) payload.append("cover", coverFile);

    router.post("/penggalangan-dana", payload, {
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

  return (
    <DashboardLayout title="Penggalangan Dana">
      <div className="flex gap-0 min-h-screen">
        {/* ── MAIN CONTENT ── */}
        <div className="flex-1 p-6">
          <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">
            PROJEK
          </p>
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-800">
              Penggalangan Dana
            </h1>
            <div className="flex gap-2">
              <Button variant="outline">PRODUK</Button>
              <Button className="bg-blue-600 hover:bg-blue-700 text-white" onClick={openCreate}>
                + BUAT
              </Button>
            </div>
          </div>

          {/* Table Panel */}
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="font-semibold text-gray-700">
                Semua Penggalangan Dana
              </h2>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Input
                    placeholder="Filter Halaman"
                    className="pl-8 w-48 text-sm"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                  <svg className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
              {filteredProduk.length === 0 ? (
                <p className="text-center text-gray-400 py-12 text-sm">
                  There are no records to display
                </p>
              ) : (
                <div className="space-y-3">
                  {filteredProduk.map((p) => (
                    <div
                      key={p.id}
                      className="flex items-center justify-between p-4 border border-gray-100 rounded-lg hover:bg-gray-50 transition"
                    >
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-semibold text-gray-800">{p.nama}</p>
                          {tipeBadge(p.tipe)}
                        </div>
                        <p className="text-sm text-gray-500">
                          {p.tanggal_mulai_jual
                            ? format(
                                new Date(p.tanggal_mulai_jual),
                                "dd MMM yyyy HH:mm",
                                { locale: idLocale }
                              )
                            : "Tanggal belum diset"}
                          {" · "}
                          Rp {p.terkumpul.toLocaleString("id-ID")} / Rp{" "}
                          {p.harga.toLocaleString("id-ID")}
                          {" · "}
                          {p.pembeli} pembeli
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        {statusBadge(p.status)}
                        <Button
                          size="sm"
                          onClick={() =>
                            router.visit(
                              `/penggalangan-dana/${p.id}`
                            )
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

        {/* ── RIGHT SIDEBAR ── */}
        <div className="w-72 border-l border-gray-200 bg-gray-50 p-4 space-y-3 shrink-0">
          <div className="space-y-2">
            <Label className="text-xs font-semibold text-gray-600 uppercase">
              Filter Status
            </Label>
            {statusButtons.map((btn) => (
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

          <div className="space-y-2 border-t pt-3">
            <Label className="text-xs font-semibold text-gray-600 uppercase">
              Filter Tipe
            </Label>
            <Select value={tipeFilter} onValueChange={setTipeFilter}>
              <SelectTrigger className="bg-white border-gray-200">
                <SelectValue placeholder="Pilih tipe..." />
              </SelectTrigger>
              <SelectContent className="z-[200]">
                <SelectItem value="all">Semua Tipe</SelectItem>
                <SelectItem value="donasi">Donasi</SelectItem>
                <SelectItem value="qurban">Qurban</SelectItem>
                <SelectItem value="wakaf">Wakaf</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Input
            placeholder="Cari Penggalangan"
            className="bg-white text-sm mt-3"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <button
            onClick={openCreate}
            className="w-full px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-md transition mt-4"
          >
            + Buat Penggalangan
          </button>
        </div>
      </div>

      {/* ── CREATE DIALOG ── */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0">
          {/* Header */}
          <div className="bg-gradient-to-br from-blue-600 to-blue-700 p-6 rounded-t-lg sticky top-0 z-10">
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-white/20 rounded-lg p-2">
                <Heart className="h-6 w-6 text-white" />
              </div>
              <DialogTitle className="text-white text-xl font-bold">
                Buat Penggalangan Dana Baru
              </DialogTitle>
            </div>
            <p className="text-blue-100 text-sm leading-relaxed">
              Buat penggalangan dana (Donasi, Qurban, atau Wakaf) dengan mudah
            </p>
          </div>

          <div className="p-6 space-y-5">
            {/* Tipe Penggalangan Dana */}
            <div className="space-y-1">
              <Label className="text-sm font-medium text-gray-700">
                Tipe Penggalangan Dana <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.tipe}
                onValueChange={(v) =>
                  setFormData({
                    ...formData,
                    tipe: v as "donasi" | "qurban" | "wakaf",
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih tipe..." />
                </SelectTrigger>
                <SelectContent className="z-[200]">
                  <SelectItem value="donasi">Donasi</SelectItem>
                  <SelectItem value="qurban">Qurban</SelectItem>
                  <SelectItem value="wakaf">Wakaf</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Kategori (untuk Donasi) */}
            {formData.tipe === "donasi" && (
              <div className="space-y-1">
                <Label className="text-sm font-medium text-gray-700">
                  Kategori Penggalangan Dana{" "}
                  <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.kategori}
                  onValueChange={(v) =>
                    setFormData({ ...formData, kategori: v })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih kategori..." />
                  </SelectTrigger>
                  <SelectContent className="z-[200]">
                    {kategoriBentukDonasi.map((k) => (
                      <SelectItem key={k} value={k}>
                        {k}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Jenis Hewan (untuk Qurban) */}
            {formData.tipe === "qurban" && (
              <div className="space-y-1">
                <Label className="text-sm font-medium text-gray-700">
                  Jenis Hewan Qurban{" "}
                  <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.jenis_hewan}
                  onValueChange={(v) =>
                    setFormData({ ...formData, jenis_hewan: v })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih jenis hewan..." />
                  </SelectTrigger>
                  <SelectContent className="z-[200]">
                    {jenisHewanQurban.map((j) => (
                      <SelectItem key={j} value={j}>
                        {j}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Nama */}
            <div className="space-y-1">
              <Label className="text-sm font-medium text-gray-700">
                Judul{" "}
                {formData.tipe === "qurban" ? "Qurban" : "Penggalangan Dana"}
                <span className="text-red-500">*</span>
              </Label>
              <Input
                placeholder={
                  formData.tipe === "donasi"
                    ? "Contoh: Bantu Warga Pengungsi Bencana Alam"
                    : formData.tipe === "qurban"
                    ? "Contoh: Jual Sapi Limosin"
                    : "Contoh: Wakaf Pembangunan Masjid"
                }
                value={formData.nama}
                onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
              />
            </div>

            {/* Deskripsi */}
            <div className="space-y-1">
              <Label className="text-sm font-medium text-gray-700">
                Deskripsi <span className="text-gray-400 font-normal">(Opsional)</span>
              </Label>
              <Textarea
                placeholder="Deskripsi singkat tentang penggalangan dana ini"
                value={formData.deskripsi}
                onChange={(e) =>
                  setFormData({ ...formData, deskripsi: e.target.value })
                }
                className="min-h-[80px]"
              />
            </div>

            {/* Harga / Target */}
            <div className="space-y-1">
              <Label className="text-sm font-medium text-gray-700">
                {formData.tipe === "qurban" ? "Harga 1 Ekor" : "Target"}{" "}
                <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-sm text-gray-600 font-medium">
                  Rp
                </span>
                <Input
                  className="pl-10"
                  type="number"
                  placeholder="0"
                  value={formData.harga}
                  onChange={(e) =>
                    setFormData({ ...formData, harga: e.target.value })
                  }
                />
              </div>
              <p className="text-xs text-gray-400">
                {formData.tipe === "qurban"
                  ? "Harga menggunakan mata uang IDR (Rp)"
                  : formData.tipe === "donasi"
                  ? "Donasi menggunakan mata uang IDR(Rp)"
                  : "Wakaf menggunakan mata uang IDR(Rp)"}
              </p>
            </div>

            {/* Harga Coret (untuk Qurban) */}
            {formData.tipe === "qurban" && (
              <div className="space-y-1">
                <Label className="text-sm font-medium text-gray-700">
                  Harga Sebelum Diskon{" "}
                  <span className="text-gray-400 font-normal">(Opsional)</span>
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-sm text-gray-600 font-medium">
                    Rp
                  </span>
                  <Input
                    className="pl-10"
                    type="number"
                    placeholder="Contoh: 30000000"
                    value={formData.harga_coret}
                    onChange={(e) =>
                      setFormData({ ...formData, harga_coret: e.target.value })
                    }
                  />
                </div>
                <p className="text-xs text-gray-400">
                  Isi jika ingin menampilkan promo / harga coret di halaman
                  pembayaran
                </p>
              </div>
            )}

            {/* Minimal Donasi (untuk Donasi) */}
            {formData.tipe === "donasi" && (
              <div className="space-y-1">
                <Label className="text-sm font-medium text-gray-700">
                  Minimal Donasi{" "}
                  <span className="text-gray-400 font-normal">(Opsional)</span>
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-sm text-gray-600 font-medium">
                    Rp
                  </span>
                  <Input
                    className="pl-10"
                    type="number"
                    placeholder="0"
                    value={formData.minimal_donasi}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        minimal_donasi: e.target.value,
                      })
                    }
                  />
                </div>
                <p className="text-xs text-gray-400">
                  dalam mata uang IDR (Rupiah), kosongkan jika tidak ada minimal
                </p>
              </div>
            )}

            {/* Stok (untuk Qurban) */}
            {formData.tipe === "qurban" && (
              <div className="space-y-1">
                <Label className="text-sm font-medium text-gray-700">
                  Stok Hewan Tersedia (ekor){" "}
                  <span className="text-gray-400 font-normal">(Opsional)</span>
                </Label>
                <Input
                  type="number"
                  placeholder="Tidak perlu diisi untuk stok tidak terbatas"
                  value={formData.stok}
                  onChange={(e) =>
                    setFormData({ ...formData, stok: e.target.value })
                  }
                />
              </div>
            )}

            {/* Tujuan */}
            <div className="space-y-1">
              <Label className="text-sm font-medium text-gray-700">
                Tujuan
                <span className="text-gray-400 font-normal">(Opsional)</span>
              </Label>
              <Input
                placeholder={
                  formData.tipe === "donasi"
                    ? "Contoh: Membantu pengungsi bencana alam yang kekurangan makanan"
                    : "Contoh: Membantu biaya pembangunan Masjid"
                }
                value={formData.tujuan}
                onChange={(e) =>
                  setFormData({ ...formData, tujuan: e.target.value })
                }
              />
            </div>

            {/* Penerima Manfaat */}
            <div className="space-y-1">
              <Label className="text-sm font-medium text-gray-700">
                Penerima Manfaat
                <span className="text-gray-400 font-normal">(Opsional)</span>
              </Label>
              <Input
                placeholder="Contoh: Pak Abunawas dan Keluarganya"
                value={formData.penerima_manfaat}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    penerima_manfaat: e.target.value,
                  })
                }
              />
            </div>

            {/* Cerita / Deskripsi */}
            <div className="space-y-1">
              <Label className="text-sm font-medium text-gray-700">
                {formData.tipe === "qurban"
                  ? "Deskripsi Qurban"
                  : "Cerita / Deskripsi"}
                <span className="text-red-500">*</span>
              </Label>
              <Textarea
                placeholder={
                  formData.tipe === "donasi"
                    ? "Ceritakan mengenai tujuan penggalangan dana, rencana penggunaan dana, dll (Lihat Contoh)"
                    : formData.tipe === "qurban"
                    ? "Deskripsi lengkap tentang hewan qurban, kualitas, asal, dll"
                    : "Ceritakan mengenai tujuan wakaf, rencana penggunaan dana, dll"
                }
                value={formData.deskripsi}
                onChange={(e) =>
                  setFormData({ ...formData, deskripsi: e.target.value })
                }
                className="min-h-[120px]"
              />
            </div>

            {/* Rincian Penggunaan Dana */}
            <div className="space-y-1">
              <Label className="text-sm font-medium text-gray-700">
                Rincian Penggunaan Dana Jika Terkumpul
                <span className="text-gray-400 font-normal">(Opsional)</span>
              </Label>
              <Textarea
                placeholder="Tulis sedetail mungkin. Contoh: Pembelian material bangunan, pembayaran tukang, dll"
                value={formData.rincian_penggunaan}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    rincian_penggunaan: e.target.value,
                  })
                }
                className="min-h-[100px]"
              />
            </div>

            {/* Cover */}
            <div className="space-y-1">
              <Label className="text-sm font-medium text-gray-700">
                Cover (gambar/video untuk promo){" "}
                <span className="text-gray-400 font-normal">(Opsional)</span>
              </Label>
              <div
                onClick={() => fileInputRef.current?.click()}
                className="relative border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition"
              >
                {coverPreview ? (
                  <div>
                    <img
                      src={coverPreview}
                      alt="Preview"
                      className="max-h-32 mx-auto mb-2 rounded"
                    />
                    <p className="text-xs text-gray-500">Klik untuk ubah gambar</p>
                  </div>
                ) : (
                  <div>
                    <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm font-medium text-gray-600">
                      Drag & drop image atau klik untuk upload
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      JPG, PNG, WebP | Max 5MB
                    </p>
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleCoverChange}
                  className="hidden"
                />
              </div>
            </div>

            {/* Schedule */}
            <div className="grid grid-cols-2 gap-4">
              <DateTimePickerField
                label="Waktu Mulai Penjualan / terima donasi"
                value={tanggalMulaiJual}
                onChange={setTanggalMulaiJual}
                optional
              />
              <DateTimePickerField
                label="Batas Waktu"
                value={tanggalTutup}
                onChange={setTanggalTutup}
                optional
              />
            </div>

            <p className="text-xs text-gray-400 -mt-3">
              Kami akan membuka link pembayaran pada tanggal dan waktu yang anda
              pilih. Opsional, kosongkan untuk langsung membuka penjualan
            </p>

            {/* Catatan */}
            <div className="space-y-1">
              <Label className="text-sm font-medium text-gray-700">
                Catatan{" "}
                <span className="text-gray-400 font-normal">(Opsional)</span>
              </Label>
              <Textarea
                placeholder="Catatan akan dilihat oleh pembeli/donatur setelah melakukan pembayaran"
                value={formData.catatan}
                onChange={(e) =>
                  setFormData({ ...formData, catatan: e.target.value })
                }
                className="min-h-[80px]"
              />
            </div>

            {/* Redirect URL */}
            <div className="space-y-1">
              <Label className="text-sm font-medium text-gray-700">
                Redirect URL{" "}
                <span className="text-gray-400 font-normal">(Opsional)</span>
              </Label>
              <div className="relative">
                <Globe className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                <Input
                  className="pl-9"
                  type="url"
                  placeholder="https://websiteanda.com/terimakasih"
                  value={formData.redirect_url}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      redirect_url: e.target.value,
                    })
                  }
                />
              </div>
              <p className="text-xs text-gray-400">
                Donatur akan dibawa kehalaman ini setelah membayar (opsional /
                bisa dikosongkan)
              </p>
            </div>

            {/* Options */}
            {(formData.tipe === "donasi" || formData.tipe === "wakaf") && (
              <div className="space-y-3 bg-gray-50 p-4 rounded-lg border border-gray-200">
                <Label className="text-sm font-medium text-gray-700">Opsi</Label>
                <div className="flex items-center justify-between">
                  <label className="text-sm text-gray-700">
                    Tampilkan Target {formData.tipe === "wakaf" ? "Wakaf" : "Donasi"}
                  </label>
                  <Switch
                    checked={formData.tampilkan_target}
                    onCheckedChange={(v) =>
                      setFormData({ ...formData, tampilkan_target: v })
                    }
                  />
                </div>
                {formData.tipe === "donasi" && (
                  <div className="flex items-center justify-between">
                    <label className="text-sm text-gray-700">
                      Tampilkan Pencairan Dana Donasi
                    </label>
                    <Switch
                      checked={formData.tampilkan_pencairan}
                      onCheckedChange={(v) =>
                        setFormData({ ...formData, tampilkan_pencairan: v })
                      }
                    />
                  </div>
                )}
              </div>
            )}

            {/* Affiliate */}
            <div className="flex items-center justify-between bg-gray-50 p-4 rounded-lg border border-gray-200">
              <label className="text-sm font-medium text-gray-700">
                Produk bisa diaffiliate
              </label>
              <Switch
                checked={formData.affiliate_enabled}
                onCheckedChange={(v) =>
                  setFormData({ ...formData, affiliate_enabled: v })
                }
              />
            </div>
          </div>

          {/* Footer */}
          <div className="bg-gray-50 border-t border-gray-200 p-4 flex justify-end gap-3 rounded-b-lg sticky bottom-0 z-10">
            <Button
              variant="outline"
              onClick={() => setCreateOpen(false)}
              disabled={isSubmitting}
            >
              Batal
            </Button>
            <Button
              className="bg-blue-600 hover:bg-blue-700 text-white"
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Menyimpan..." : "Simpan"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
