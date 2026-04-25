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
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import {
  CalendarIcon,
  Printer,
  Download,
  ExternalLink,
  Upload,
  Package,
  Tag,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Types ───────────────────────────────────────────────────────────

type ProdukDigital = {
  id: number;
  nama: string;
  status: "published" | "unpublished" | "unlisted";
  tipe_pembayaran: "berbayar" | "gratis";
  harga: number;
  harga_coret: number | null;
  sumber_file: "upload" | "file_lama" | "link";
  cover_url: string | null;
  total_penjualan: number;
  created_at: string;
};

type IndexProps = {
  produkList: ProdukDigital[];
};

// ─── DatePickerField ─────────────────────────────────────────────────

function DatePickerField({
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
              ? format(value, "dd MMMM yyyy", { locale: idLocale })
              : "Pilih tanggal..."}
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

// ─── Default form ─────────────────────────────────────────────────────

const defaultForm = {
  nama: "",
  deskripsi: "",
  tipePembayaran: "berbayar" as "berbayar" | "gratis",
  harga: "",
  hargaCoret: "",
  sumberFile: "upload" as "upload" | "file_lama" | "link",
  redirectUrl: "",
  catatan: "",
  maxPembayaran: "",
  bisaAffiliate: false,
};

// ─── Helpers ──────────────────────────────────────────────────────────

function formatRupiah(value: number): string {
  return new Intl.NumberFormat("id-ID").format(value);
}

// ─── Main ─────────────────────────────────────────────────────────────

export default function Index({ produkList }: IndexProps) {
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({ ...defaultForm });
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [kontenFile, setKontenFile] = useState<File | null>(null);
  const [waktuMulaiJual, setWaktuMulaiJual] = useState<Date | undefined>();
  const [tanggalKadaluarsa, setTanggalKadaluarsa] = useState<Date | undefined>();

  const coverInputRef = useRef<HTMLInputElement>(null);
  const kontenInputRef = useRef<HTMLInputElement>(null);

  const openCreate = () => {
    setFormData({ ...defaultForm });
    setCoverFile(null);
    setCoverPreview(null);
    setKontenFile(null);
    setWaktuMulaiJual(undefined);
    setTanggalKadaluarsa(undefined);
    setCreateOpen(true);
  };

  const filteredProduk = produkList.filter((p) => {
    const matchStatus = statusFilter === "all" || p.status === statusFilter;
    const matchSearch = p.nama.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
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

  const tipeBadge = (tipe: string) =>
    tipe === "berbayar" ? (
      <Badge className="bg-green-100 text-green-700 border border-green-200">
        Berbayar
      </Badge>
    ) : (
      <Badge className="bg-blue-100 text-blue-700 border border-blue-200">
        Gratis
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

  const handleKontenChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setKontenFile(file);
  };

  const handleSubmit = () => {
    if (!formData.nama.trim()) return alert("Nama produk tidak boleh kosong");
    if (!formData.deskripsi.trim()) return alert("Deskripsi tidak boleh kosong");
    if (formData.tipePembayaran === "berbayar" && !formData.harga)
      return alert("Harga harus diisi untuk produk berbayar");
    if (formData.sumberFile === "upload" && !kontenFile)
      return alert("File konten harus diupload");

    setIsSubmitting(true);

    const payload = new FormData();
    payload.append("nama", formData.nama);
    payload.append("deskripsi", formData.deskripsi);
    payload.append("tipe_pembayaran", formData.tipePembayaran);
    payload.append("harga", formData.harga || "0");
    if (formData.hargaCoret) payload.append("harga_coret", formData.hargaCoret);
    payload.append("sumber_file", formData.sumberFile);
    if (formData.redirectUrl) payload.append("redirect_url", formData.redirectUrl);
    if (formData.catatan) payload.append("catatan", formData.catatan);
    if (formData.maxPembayaran) payload.append("max_pembayaran", formData.maxPembayaran);
    payload.append("bisa_affiliate", formData.bisaAffiliate ? "1" : "0");
    if (waktuMulaiJual)
      payload.append("waktu_mulai_jual", format(waktuMulaiJual, "yyyy-MM-dd HH:mm:ss"));
    if (tanggalKadaluarsa)
      payload.append("tanggal_kadaluarsa", format(tanggalKadaluarsa, "yyyy-MM-dd"));
    if (coverFile) payload.append("cover", coverFile);
    if (kontenFile) payload.append("file", kontenFile);

    router.post("/produk-digital", payload, {
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
    <DashboardLayout title="Produk Digital">
      <Head title="Produk Digital" />
      <div className="flex gap-0 min-h-screen">
        {/* MAIN CONTENT */}
        <div className="flex-1 p-6">
          <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">PROJEK</p>
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-800">Produk Digital</h1>
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="border-blue-500 text-blue-600 hover:bg-blue-50"
                onClick={() => window.open("/produk-digital/catalog", "_blank")}
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
              <h2 className="font-semibold text-gray-700">Semua Produk Digital</h2>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Input
                    placeholder="Filter Produk"
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
              {filteredProduk.length === 0 ? (
                <p className="text-center text-gray-400 py-12 text-sm">
                  There are no records to display
                </p>
              ) : (
                <div className="space-y-3">
                  {filteredProduk.map((produk) => (
                    <div
                      key={produk.id}
                      className="flex items-center justify-between p-4 border border-gray-100 rounded-lg hover:bg-gray-50 transition"
                    >
                      <div className="flex items-start gap-3">
                        {/* Cover thumbnail or icon */}
                        {produk.cover_url ? (
                          <img
                            src={produk.cover_url}
                            alt={produk.nama}
                            className="h-12 w-16 object-cover rounded-md shrink-0"
                          />
                        ) : (
                          <div className="bg-purple-50 rounded-lg p-2 mt-0.5">
                            <Package className="h-5 w-5 text-purple-500" />
                          </div>
                        )}
                        <div>
                          <p className="font-semibold text-gray-800">{produk.nama}</p>
                          <div className="flex items-center gap-2 mt-1 text-sm text-gray-500 flex-wrap">
                            {produk.tipe_pembayaran === "berbayar" ? (
                              <span className="flex items-center gap-1 font-medium text-gray-700">
                                <Tag className="h-3 w-3" />
                                Rp {formatRupiah(produk.harga)}
                                {produk.harga_coret && (
                                  <span className="line-through text-gray-400 text-xs ml-1">
                                    Rp {formatRupiah(produk.harga_coret)}
                                  </span>
                                )}
                              </span>
                            ) : (
                              <span className="text-blue-600 font-medium">Gratis</span>
                            )}
                            <span>{produk.total_penjualan} penjualan</span>
                            <span className="text-xs text-gray-400">{produk.created_at}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {tipeBadge(produk.tipe_pembayaran)}
                        {statusBadge(produk.status)}
                        <Button
                          size="sm"
                          onClick={() => router.visit(`/produk-digital/${produk.id}`)}
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
          <Input
            placeholder="Cari Produk Digital"
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
            onClick={() => window.open("/produk-digital/catalog", "_blank")}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gray-800 hover:bg-gray-900 text-white text-sm font-semibold rounded-md transition mt-2"
          >
            KATALOG PRODUK DIGITAL
            <ExternalLink className="h-4 w-4" />
          </button>
          <p className="text-xs text-gray-500 text-center leading-relaxed">
            Katalog adalah halaman online dimana semua produk digital anda yang aktif ditampilkan.
          </p>

          <button
            onClick={openCreate}
            className="w-full px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-md transition"
          >
            + Buat Produk Digital Baru
          </button>
        </div>
      </div>

      {/* ─── CREATE DIALOG ─────────────────────────────────────────────── */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0">
          {/* Header */}
          <div className="bg-gradient-to-br from-purple-600 to-purple-700 p-6 rounded-t-lg sticky top-0 z-10">
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-white/20 rounded-lg p-2">
                <Package className="h-6 w-6 text-white" />
              </div>
              <DialogTitle className="text-white text-xl font-bold">
                Buat Produk Digital
              </DialogTitle>
            </div>
            <p className="text-purple-100 text-sm leading-relaxed">
              Penjualan produk digital semakin mudah dengan otomasi download dan halaman produk keren
            </p>
          </div>

          <div className="p-6 space-y-5">
            {/* Nama Produk */}
            <div className="space-y-1">
              <Label className="text-sm font-medium text-gray-700">
                Nama Produk <span className="text-red-500">*</span>
              </Label>
              <Input
                placeholder="Contoh: Ebook Panduan Bisnis 2025"
                maxLength={200}
                value={formData.nama}
                onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
              />
              <p className="text-xs text-gray-400 text-right">{formData.nama.length}/200</p>
            </div>

            {/* Tipe Pembayaran */}
            <div className="space-y-1">
              <Label className="text-sm font-medium text-gray-700">Tipe Pembayaran</Label>
              <div className="flex gap-3">
                {(["berbayar", "gratis"] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setFormData({ ...formData, tipePembayaran: t })}
                    className={cn(
                      "flex-1 py-2.5 rounded-md text-sm font-semibold border transition",
                      formData.tipePembayaran === t
                        ? "bg-blue-600 text-white border-blue-600"
                        : "bg-white text-gray-700 border-gray-200 hover:border-gray-300"
                    )}
                  >
                    {t === "berbayar" ? "Produk Berbayar" : "Produk Gratis"}
                  </button>
                ))}
              </div>
            </div>

            {/* Harga (kondisional) */}
            {formData.tipePembayaran === "berbayar" && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label className="text-sm font-medium text-gray-700">
                    Harga <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-sm text-gray-500">Rp</span>
                    <Input
                      className="pl-9"
                      type="number"
                      min={0}
                      placeholder="0"
                      value={formData.harga}
                      onChange={(e) => setFormData({ ...formData, harga: e.target.value })}
                    />
                  </div>
                  <p className="text-xs text-gray-400">Penagihan menggunakan IDR (Rupiah)</p>
                </div>
                <div className="space-y-1">
                  <Label className="text-sm font-medium text-gray-700">
                    Harga Coret{" "}
                    <span className="text-gray-400 font-normal">(Opsional)</span>
                  </Label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-sm text-gray-500">Rp</span>
                    <Input
                      className="pl-9"
                      type="number"
                      min={0}
                      placeholder="0"
                      value={formData.hargaCoret}
                      onChange={(e) => setFormData({ ...formData, hargaCoret: e.target.value })}
                    />
                  </div>
                  <p className="text-xs text-gray-400">Harus lebih besar dari harga utama</p>
                </div>
              </div>
            )}

            {/* Deskripsi */}
            <div className="space-y-1">
              <Label className="text-sm font-medium text-gray-700">
                Deskripsi <span className="text-red-500">*</span>
              </Label>
              <Textarea
                placeholder="Tuliskan deskripsi produk digital kamu..."
                rows={4}
                value={formData.deskripsi}
                onChange={(e) => setFormData({ ...formData, deskripsi: e.target.value })}
              />
            </div>

            {/* Cover */}
            <div className="space-y-1">
              <Label className="text-sm font-medium text-gray-700">
                Cover (gambar/video untuk promo)
              </Label>
              <div
                className="border-2 border-dashed border-gray-200 rounded-lg p-6 text-center cursor-pointer hover:border-purple-400 hover:bg-purple-50 transition"
                onClick={() => coverInputRef.current?.click()}
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
                    <p className="text-sm text-gray-500">Drag &amp; drop image</p>
                    <p className="text-xs text-gray-400">PNG, JPG, WEBP, MP4 (maks. 10MB)</p>
                  </div>
                )}
              </div>
              <input
                ref={coverInputRef}
                type="file"
                accept="image/*,video/*"
                className="hidden"
                onChange={handleCoverChange}
              />
              {coverFile && (
                <p className="text-xs text-green-600">✓ {coverFile.name}</p>
              )}
            </div>

            {/* Waktu Penjualan & Kadaluarsa */}
            <div className="grid grid-cols-2 gap-4">
              <DatePickerField
                label="Waktu Mulai Penjualan"
                value={waktuMulaiJual}
                onChange={setWaktuMulaiJual}
                optional
              />
              <DatePickerField
                label="Tanggal Kadaluarsa"
                value={tanggalKadaluarsa}
                onChange={setTanggalKadaluarsa}
                optional
              />
            </div>
            <div className="space-y-1">
              <p className="text-xs text-gray-400">
                Kami akan membuka link pembayaran pada tanggal dan waktu yang anda pilih. Opsional, kosongkan untuk langsung membuka penjualan.
              </p>
              <p className="text-xs text-gray-400">
                Kami akan menutup link pembayaran pada tanggal kadaluarsa (opsional).
              </p>
            </div>

            {/* Catatan */}
            <div className="space-y-1">
              <Label className="text-sm font-medium text-gray-700">
                Catatan{" "}
                <span className="text-gray-400 font-normal">(Opsional)</span>
              </Label>
              <Textarea
                placeholder="Catatan akan dilihat oleh pembeli setelah melakukan pembayaran..."
                rows={3}
                maxLength={1000}
                value={formData.catatan}
                onChange={(e) => setFormData({ ...formData, catatan: e.target.value })}
              />
              <p className="text-xs text-gray-400 text-right">
                {formData.catatan.length}/1000
              </p>
            </div>

            {/* Kuota / Max Pembayaran */}
            <div className="space-y-1">
              <Label className="text-sm font-medium text-gray-700">
                Maksimum Jumlah Pembayaran (Kuota / QTY){" "}
                <span className="text-gray-400 font-normal">(Opsional)</span>
              </Label>
              <Input
                type="number"
                min={1}
                placeholder="Kosongkan untuk unlimited"
                value={formData.maxPembayaran}
                onChange={(e) => setFormData({ ...formData, maxPembayaran: e.target.value })}
              />
              <p className="text-xs text-gray-400">
                Kami akan menutup link pembayaran setelah melewati batas jumlah maksimal. Kosongkan untuk tanpa limit.
              </p>
            </div>

            {/* Sumber File */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">
                Sumber File <span className="text-red-500">*</span>
              </Label>
              <div className="flex gap-2 flex-wrap">
                {(
                  [
                    { value: "upload", label: "Upload Baru" },
                    { value: "file_lama", label: "File Lama" },
                    { value: "link", label: "Tidak Pakai File, Pakai Link Saja" },
                  ] as const
                ).map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() =>
                      setFormData({ ...formData, sumberFile: opt.value })
                    }
                    className={cn(
                      "px-3 py-2 rounded-md text-sm font-medium border transition",
                      formData.sumberFile === opt.value
                        ? "bg-blue-600 text-white border-blue-600"
                        : "bg-white text-gray-700 border-gray-200 hover:border-gray-300"
                    )}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>

              {/* Upload Baru */}
              {formData.sumberFile === "upload" && (
                <div>
                  <div
                    className="border-2 border-dashed border-gray-200 rounded-lg p-8 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition"
                    onClick={() => kontenInputRef.current?.click()}
                  >
                    {kontenFile ? (
                      <div className="space-y-1">
                        <Package className="h-8 w-8 text-blue-500 mx-auto" />
                        <p className="text-sm font-medium text-blue-600">{kontenFile.name}</p>
                        <p className="text-xs text-gray-400">
                          {(kontenFile.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <Upload className="h-8 w-8 text-gray-400 mx-auto" />
                        <p className="text-sm text-gray-500">
                          Drag Files or Click to Browse
                        </p>
                        <p className="text-xs text-gray-400">
                          Ukuran file maksimal 1GB
                        </p>
                      </div>
                    )}
                  </div>
                  <input
                    ref={kontenInputRef}
                    type="file"
                    className="hidden"
                    onChange={handleKontenChange}
                  />
                </div>
              )}

              {/* File Lama */}
              {formData.sumberFile === "file_lama" && (
                <div className="space-y-1">
                  <Label className="text-sm font-medium text-gray-700">
                    Pilih File Lama <span className="text-red-500">*</span>
                  </Label>
                  <select
                    className="w-full px-3 py-2 border border-gray-200 rounded-md bg-white text-sm text-gray-700"
                    defaultValue=""
                  >
                    <option value="" disabled>
                      Select...
                    </option>
                    {/* TODO: populate from server */}
                  </select>
                  <p className="text-xs text-gray-400">File harus diisi</p>
                </div>
              )}

              {/* Link */}
              {formData.sumberFile === "link" && (
                <div className="space-y-1">
                  <Label className="text-sm font-medium text-gray-700">
                    Redirect URL{" "}
                    <span className="text-gray-400 font-normal">(Opsional)</span>
                  </Label>
                  <Input
                    type="url"
                    placeholder="https://example.com/download"
                    value={formData.redirectUrl}
                    onChange={(e) =>
                      setFormData({ ...formData, redirectUrl: e.target.value })
                    }
                  />
                </div>
              )}

              <p className="text-xs text-gray-400">
                Jika menggunakan upload file, setelah membayar otomatis file akan didownload oleh pembeli. Jika menggunakan redirect URL, pelanggan akan dibawa ke halaman redirect URL setelah membayar.
              </p>
            </div>

            {/* Affiliate Toggle */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div>
                <Label className="text-sm font-medium text-gray-700">
                  Produk bisa diaffiliate
                </Label>
                <p className="text-xs text-gray-400">
                  Izinkan affiliate untuk mempromosikan produk ini
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
                className="flex-1 bg-purple-600 hover:bg-purple-700 text-white"
                onClick={handleSubmit}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Menyimpan..." : "Buat Produk Digital"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}