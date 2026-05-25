import DashboardLayout from "@/components/dashboard/dashboardlayout";
import { Head, router } from "@inertiajs/react";
import { useState, useRef } from "react";
import { toast } from "sonner";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

type OldFile = {
  id: string;
  label: string;
  file_path: string;
  file_url: string;
};

type IndexProps = {
  produkList: ProdukDigital[];
  oldFiles: OldFile[];
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

const defaultForm = {
  nama: "",
  deskripsi: "",
  kategori: "" as "" | "e-book" | "novel" | "komik" | "tulisan" | "video",
  tipePembayaran: "berbayar" as "berbayar" | "gratis" | "bayar_semaunya",
  harga: "",
  hargaCoret: "",
  sumberFile: "upload" as "upload" | "file_lama" | "link",
  redirectUrl: "",
  catatan: "",
  maxPembayaran: "",
  author: "",
  isbn: "",
  format: "PDF",
  bahasa: "Indonesia",
  jumlahHalaman: "",
  bisaDidownload: true,
  tipeTulisan: "one_shot" as "one_shot" | "chapter",
  mekanismeBayar: "sekali_bayar" as "per_chapter" | "semua_chapter" | "sekali_bayar",
  genre: "",
  transkrip: "",
  pembicara: "",
  durasi: "",
  artis: "",
  kategori_produk: "",
  tipe_pembaca: "Gulir Vertikal",
};

const KATEGORI_OPTIONS = [
  { value: "novel", label: "Novel" },
  { value: "komik", label: "Komik" },
  { value: "e-book", label: "E-Book" },
  { value: "tulisan", label: "Tulisan / Artikel" },
  { value: "video", label: "Video / Podcast" },
] as const;

// ─── Helpers ──────────────────────────────────────────────────────────

function formatRupiah(value: number): string {
  return new Intl.NumberFormat("id-ID").format(value);
}

const getCategoryTheme = (cat: string) => {
  switch (cat) {
    case "novel":
      return {
        name: "Novel",
        from: "from-pink-600",
        to: "to-pink-700",
        bgHeader: "bg-pink-600",
        textLight: "text-pink-100",
        textClass: "text-pink-600",
        borderClass: "border-pink-200 focus:border-pink-500 focus:ring-pink-500 focus:ring-2",
        bgBadge: "bg-pink-50 text-pink-700 border-pink-200",
        buttonClass: "bg-pink-600 hover:bg-pink-700 text-white focus:ring-pink-500 focus:ring-2 focus:ring-offset-2",
        accentColor: "pink",
        iconBg: "bg-pink-50 text-pink-600"
      };
    case "komik":
      return {
        name: "Komik",
        from: "from-lime-600",
        to: "to-green-600",
        bgHeader: "bg-lime-600",
        textLight: "text-lime-100",
        textClass: "text-lime-600",
        borderClass: "border-lime-200 focus:border-lime-500 focus:ring-lime-500 focus:ring-2",
        bgBadge: "bg-lime-50 text-lime-700 border-lime-200",
        buttonClass: "bg-lime-600 hover:bg-lime-700 text-white focus:ring-lime-500 focus:ring-2 focus:ring-offset-2",
        accentColor: "lime",
        iconBg: "bg-lime-50 text-lime-600"
      };
    case "e-book":
      return {
        name: "E-Book",
        from: "from-blue-600",
        to: "to-indigo-600",
        bgHeader: "bg-blue-600",
        textLight: "text-blue-100",
        textClass: "text-blue-600",
        borderClass: "border-blue-200 focus:border-blue-500 focus:ring-blue-500 focus:ring-2",
        bgBadge: "bg-blue-50 text-blue-700 border-blue-200",
        buttonClass: "bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500 focus:ring-2 focus:ring-offset-2",
        accentColor: "blue",
        iconBg: "bg-blue-50 text-blue-600"
      };
    case "tulisan":
      return {
        name: "Tulisan / Artikel",
        from: "from-amber-500",
        to: "to-yellow-600",
        bgHeader: "bg-amber-500",
        textLight: "text-amber-100",
        textClass: "text-amber-600",
        borderClass: "border-amber-200 focus:border-amber-500 focus:ring-amber-500 focus:ring-2",
        bgBadge: "bg-amber-50 text-amber-700 border-amber-200",
        buttonClass: "bg-amber-600 hover:bg-amber-700 text-white focus:ring-amber-500 focus:ring-2 focus:ring-offset-2",
        accentColor: "amber",
        iconBg: "bg-amber-50 text-amber-600"
      };
    case "video":
      return {
        name: "Video / Podcast",
        from: "from-purple-600",
        to: "to-purple-700",
        bgHeader: "bg-purple-600",
        textLight: "text-purple-100",
        textClass: "text-purple-600",
        borderClass: "border-purple-200 focus:border-purple-500 focus:ring-purple-500 focus:ring-2",
        bgBadge: "bg-purple-50 text-purple-700 border-purple-200",
        buttonClass: "bg-purple-600 hover:bg-purple-700 text-white focus:ring-purple-500 focus:ring-2 focus:ring-offset-2",
        accentColor: "purple",
        iconBg: "bg-purple-50 text-purple-600"
      };
    default:
      return {
        name: "Produk Digital",
        from: "from-blue-600",
        to: "to-indigo-600",
        bgHeader: "bg-blue-600",
        textLight: "text-blue-100",
        textClass: "text-blue-600",
        borderClass: "border-blue-200 focus:border-blue-500 focus:ring-blue-500 focus:ring-2",
        bgBadge: "bg-blue-50 text-blue-700 border-blue-200",
        buttonClass: "bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500 focus:ring-2 focus:ring-offset-2",
        accentColor: "blue",
        iconBg: "bg-blue-50 text-blue-600"
      };
  }
};

// ─── Main ─────────────────────────────────────────────────────────────

export default function Index({ produkList, oldFiles }: IndexProps) {
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({ ...defaultForm });
  const theme = getCategoryTheme(formData.kategori);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [kontenFile, setKontenFile] = useState<File | null>(null);
  const [waktuMulaiJual, setWaktuMulaiJual] = useState<Date | undefined>();
  const [tanggalKadaluarsa, setTanggalKadaluarsa] = useState<Date | undefined>();
  const [tanggalPublish, setTanggalPublish] = useState<Date | undefined>();

  const coverInputRef = useRef<HTMLInputElement>(null);
  const kontenInputRef = useRef<HTMLInputElement>(null);

  const openCreate = () => {
    setFormData({ ...defaultForm });
    setCoverFile(null);
    setCoverPreview(null);
    setKontenFile(null);
    setWaktuMulaiJual(undefined);
    setTanggalKadaluarsa(undefined);
    setTanggalPublish(undefined);
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
    if (!formData.nama.trim()) {
      toast.error("Nama produk tidak boleh kosong");
      return;
    }
    if (!formData.deskripsi.trim()) {
      toast.error("Deskripsi tidak boleh kosong");
      return;
    }
    if (formData.tipePembayaran === "berbayar" && !formData.harga) {
      toast.error("Harga harus diisi untuk produk berbayar");
      return;
    }
    if (formData.sumberFile === "upload" && !kontenFile) {
      toast.error("File konten harus diupload");
      return;
    }
    if (formData.sumberFile === "file_lama" && !formData.redirectUrl) {
      toast.error("File lama harus dipilih");
      return;
    }
    if (formData.sumberFile === "link" && !formData.redirectUrl) {
      toast.error("URL redirect harus diisi");
      return;
    }

    setIsSubmitting(true);

    const payload = new FormData();
    payload.append("nama", formData.nama);
    payload.append("deskripsi", formData.deskripsi);
    if (formData.kategori) payload.append("kategori", formData.kategori);
    payload.append("tipe_pembayaran", formData.tipePembayaran);
    payload.append("harga", formData.harga || "0");
    if (formData.hargaCoret) payload.append("harga_coret", formData.hargaCoret);
    payload.append("sumber_file", formData.sumberFile);
    
    // Handle redirect_url / file_lama_id based on sumber_file
    if (formData.sumberFile === "file_lama") {
      if (formData.redirectUrl) payload.append("file_lama_id", formData.redirectUrl);
    } else if (formData.sumberFile === "link") {
      if (formData.redirectUrl) payload.append("redirect_url", formData.redirectUrl);
    }
    
    if (formData.catatan) payload.append("catatan", formData.catatan);
    if (formData.maxPembayaran) payload.append("max_pembayaran", formData.maxPembayaran);
    
    // Append Specific Fields
    if (formData.author) payload.append("author", formData.author);
    if (formData.isbn) payload.append("isbn", formData.isbn);
    if (formData.format) payload.append("format", formData.format);
    if (formData.bahasa) payload.append("bahasa", formData.bahasa);
    if (formData.jumlahHalaman) payload.append("jumlah_halaman", formData.jumlahHalaman);
    payload.append("bisa_didownload", formData.bisaDidownload ? "1" : "0");
    if (formData.kategori === "tulisan" || formData.kategori === "komik") {
      payload.append("tipe_tulisan", formData.tipeTulisan);
      if (formData.tipeTulisan === "chapter") {
        payload.append("mekanisme_bayar", formData.mekanismeBayar);
      }
    }
    if (formData.genre) payload.append("genre", formData.genre);
    if (formData.transkrip) payload.append("transkrip", formData.transkrip);
    if (formData.pembicara) payload.append("pembicara", formData.pembicara);
    if (formData.durasi) payload.append("durasi", formData.durasi);
    if (formData.artis) payload.append("artis", formData.artis);
    if (formData.kategori_produk) payload.append("kategori_produk", formData.kategori_produk);
    if (formData.tipe_pembaca) payload.append("tipe_pembaca", formData.tipe_pembaca);

    if (waktuMulaiJual)
      payload.append("waktu_mulai_jual", format(waktuMulaiJual, "yyyy-MM-dd HH:mm:ss"));
    if (tanggalKadaluarsa)
      payload.append("tanggal_kadaluarsa", format(tanggalKadaluarsa, "yyyy-MM-dd"));
    if (tanggalPublish)
      payload.append("tanggal_publish", format(tanggalPublish, "yyyy-MM-dd"));
    if (coverFile) payload.append("cover", coverFile);
    if (kontenFile) payload.append("file", kontenFile);

    router.post("/produk-digital", payload, {
      forceFormData: true,
      onSuccess: () => {
        setCreateOpen(false);
        setIsSubmitting(false);
        toast.success("Produk digital berhasil dibuat!");
        router.reload();
      },
      onError: (errors) => {
        setIsSubmitting(false);
        const errorMsg = Object.values(errors)[0] as string || "Terjadi kesalahan saat membuat produk";
        toast.error(errorMsg);
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
          <div className={cn("bg-gradient-to-br p-6 rounded-t-lg sticky top-0 z-10 text-white", theme.from, theme.to)}>
            <div className="flex items-center gap-3 mb-1">
              <div className="bg-white/20 rounded-lg p-2">
                <Package className="h-6 w-6 text-white" />
              </div>
              <DialogTitle className="text-white text-xl font-bold">
                Buat Produk Digital {formData.kategori && `(${theme.name})`}
              </DialogTitle>
            </div>
            <p className={cn("text-sm leading-relaxed opacity-90")}>
              Penjualan produk digital semakin mudah dengan otomasi download dan halaman produk keren
            </p>
          </div>

          <div className="p-6 space-y-5">
            {/* Kategori Select (Selalu ditampilkan di atas) */}
            <div className="space-y-1">
              <Label className="text-sm font-medium text-gray-700">
                Kategori <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.kategori}
                onValueChange={(value) => setFormData({ ...formData, kategori: value as any })}
              >
                <SelectTrigger className={cn("w-full bg-white", theme.borderClass)}>
                  <SelectValue placeholder="-- Pilih Kategori --" />
                </SelectTrigger>
                <SelectContent className="z-[200]">
                  {KATEGORI_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {formData.kategori === "" ? (
              <div className="text-center py-12 text-gray-400 text-sm border-2 border-dashed border-gray-100 rounded-lg">
                Pilih kategori produk digital untuk mulai mengisi form
              </div>
            ) : (
              <>
                {/* Judul Produk */}
                <div className="space-y-1">
                  <Label className="text-sm font-medium text-gray-700">
                    Judul Produk <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    placeholder="Masukkan Nama Produk Digital"
                    maxLength={200}
                    value={formData.nama}
                    onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                  />
                  <p className="text-xs text-gray-400 text-right">{formData.nama.length}/200</p>
                </div>

                {/* Tipe Penulisan & Mekanisme Pembayaran (Khusus Komik dan Tulisan/Artikel) */}
                {(formData.kategori === "komik" || formData.kategori === "tulisan") && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <Label className="text-sm font-medium text-gray-700">Tipe Penulisan *</Label>
                      <Select
                        value={formData.tipeTulisan}
                        onValueChange={(value) => setFormData({ ...formData, tipeTulisan: value as any })}
                      >
                        <SelectTrigger className={cn("w-full bg-white", theme.borderClass)}>
                          <SelectValue placeholder="Pilih tipe penulisan..." />
                        </SelectTrigger>
                        <SelectContent className="z-[200]">
                          {formData.kategori === "tulisan" ? (
                            <>
                              <SelectItem value="one_shot">One-Shot (Cerpen,Blog,Essay)</SelectItem>
                              <SelectItem value="chapter">Chapter (Buku, Antologi)</SelectItem>
                            </>
                          ) : (
                            <>
                              <SelectItem value="one_shot">One-Shot</SelectItem>
                              <SelectItem value="chapter">Chapter</SelectItem>
                            </>
                          )}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-1">
                      <Label className="text-sm font-medium text-gray-700">Mekanisme Pembayaran *</Label>
                      <Select
                        value={formData.mekanismeBayar}
                        onValueChange={(value) => setFormData({ ...formData, mekanismeBayar: value as any })}
                      >
                        <SelectTrigger className={cn("w-full bg-white", theme.borderClass)}>
                          <SelectValue placeholder="Pilih mekanisme..." />
                        </SelectTrigger>
                        <SelectContent className="z-[200]">
                          <SelectItem value="sekali_bayar">Sekali Bayar</SelectItem>
                          <SelectItem value="per_chapter">Bayar Per-chapter</SelectItem>
                          <SelectItem value="semua_chapter">Semua Chapter(paket)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}

                {/* Tipe Pembayaran */}
                <div className="space-y-1">
                  <Label className="text-sm font-medium text-gray-700">Tipe Pembayaran *</Label>
                  <Select
                    value={formData.tipePembayaran}
                    onValueChange={(value) => setFormData({ ...formData, tipePembayaran: value as any })}
                  >
                    <SelectTrigger className={cn("w-full bg-white", theme.borderClass)}>
                      <SelectValue placeholder="Pilih tipe pembayaran..." />
                    </SelectTrigger>
                    <SelectContent className="z-[200]">
                      <SelectItem value="berbayar">Produk Berbayar</SelectItem>
                      <SelectItem value="gratis">Produk Gratis</SelectItem>
                      <SelectItem value="bayar_semaunya">Produk Bayar Semaunya</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Harga & Harga Coret */}
                {formData.tipePembayaran !== "gratis" && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <Label className="text-sm font-medium text-gray-700">
                        Harga <span className="text-red-500">*</span>
                      </Label>
                      <div className="relative">
                        <span className="absolute left-3 top-2 text-sm text-gray-500 font-semibold text-blue-600">RP.</span>
                        <Input
                          className="pl-9"
                          type="number"
                          min={0}
                          placeholder="50.000"
                          value={formData.harga}
                          onChange={(e) => setFormData({ ...formData, harga: e.target.value })}
                        />
                      </div>
                    </div>

                    {/* Harga Coret hanya untuk Ebook */}
                    {formData.kategori === "e-book" && (
                      <div className="space-y-1">
                        <Label className="text-sm font-medium text-gray-700">
                          Harga Coret (opsional)
                        </Label>
                        <div className="relative">
                          <span className="absolute left-3 top-2 text-sm text-gray-500 font-semibold text-blue-600">RP.</span>
                          <Input
                            className="pl-9"
                            type="number"
                            min={0}
                            placeholder="75.000"
                            value={formData.hargaCoret}
                            onChange={(e) => setFormData({ ...formData, hargaCoret: e.target.value })}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Deskripsi/Sinopsis */}
                <div className="space-y-1">
                  <Label className="text-sm font-medium text-gray-700">
                    {formData.kategori === "novel" || formData.kategori === "komik" ? "Deskripsi/Sinopsis" : "Deskripsi"}{" "}
                    <span className="text-red-500">*</span>
                  </Label>
                  <Textarea
                    placeholder="Tuliskan deskripsi produk digital..."
                    rows={4}
                    value={formData.deskripsi}
                    onChange={(e) => setFormData({ ...formData, deskripsi: e.target.value })}
                  />
                </div>

                {/* Transkrip (khusus video/podcast) */}
                {formData.kategori === "video" && (
                  <div className="space-y-1">
                    <Label className="text-sm font-medium text-gray-700">Transkrip</Label>
                    <Textarea
                      placeholder="Tuliskan transkrip video / podcast..."
                      rows={4}
                      value={formData.transkrip}
                      onChange={(e) => setFormData({ ...formData, transkrip: e.target.value })}
                    />
                  </div>
                )}

                {/* Cover Produk */}
                <div className="space-y-1">
                  <Label className="text-sm font-medium text-gray-700">
                    Cover Produk <span className="text-red-500">*</span>
                  </Label>
                  <div
                    className={cn(
                      "border-2 border-dashed border-gray-200 rounded-lg p-6 text-center cursor-pointer hover:bg-gray-50 transition"
                    )}
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
                        <p className="text-sm text-gray-500 font-semibold text-blue-600">Select Image...</p>
                        <p className="text-xs text-gray-400">Drop image here</p>
                      </div>
                    )}
                  </div>
                  <input
                    ref={coverInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleCoverChange}
                  />
                  {coverFile && (
                    <p className="text-xs text-green-600 font-medium">✓ {coverFile.name}</p>
                  )}
                </div>

                {/* Waktu Mulai & Selesai Penjualan */}
                <div className="grid grid-cols-2 gap-4">
                  <DatePickerField
                    label="Waktu Mulai Penjualan"
                    value={waktuMulaiJual}
                    onChange={setWaktuMulaiJual}
                  />
                  <DatePickerField
                    label="Waktu Selesai Penjualan (opsional)"
                    value={tanggalKadaluarsa}
                    onChange={setTanggalKadaluarsa}
                    optional
                  />
                </div>
                <div className="grid grid-cols-2 gap-4 text-xs text-gray-400 leading-tight">
                  <p>Kami akan membuka penjualan pada waktu yang dipilih.</p>
                  <p>Kami akan membuka penjualan pada waktu yang dipilih.</p>
                </div>

                {/* Catatan */}
                <div className="space-y-1">
                  <Label className="text-sm font-medium text-gray-700">Catatan (Opsional)</Label>
                  <Textarea
                    placeholder="Catatan akan dilihat oleh pembeli setelah membayar..."
                    rows={3}
                    maxLength={1000}
                    value={formData.catatan}
                    onChange={(e) => setFormData({ ...formData, catatan: e.target.value })}
                  />
                  <p className="text-xs text-gray-400">Catatan akan dilihat oleh pembeli setelah membayar.</p>
                </div>

                {/* Maksimum Jumlah Pembelian */}
                <div className="space-y-1">
                  <Label className="text-sm font-medium text-gray-700">Maksimum Jumlah Pembelian (Opsional)</Label>
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      className="h-9 w-9 p-0"
                      onClick={() => {
                        const val = parseInt(formData.maxPembayaran) || 0;
                        if (val > 0) setFormData({ ...formData, maxPembayaran: String(val - 1) });
                      }}
                    >
                      -
                    </Button>
                    <Input
                      type="number"
                      placeholder="0"
                      value={formData.maxPembayaran}
                      onChange={(e) => setFormData({ ...formData, maxPembayaran: e.target.value })}
                      className="w-40 text-center"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      className="h-9 w-9 p-0"
                      onClick={() => {
                        const val = parseInt(formData.maxPembayaran) || 0;
                        setFormData({ ...formData, maxPembayaran: String(val + 1) });
                      }}
                    >
                      +
                    </Button>
                  </div>
                  <p className="text-xs text-gray-400">Kami akan menutup penjualan pada maksimum jumlah pembelian yang telah ditentukan.</p>
                </div>

                {/* Tipe Pembaca (Khusus Komik) */}
                {formData.kategori === "komik" && (
                  <div className="space-y-1">
                    <Label className="text-sm font-medium text-gray-700">Tipe Pembaca</Label>
                    <Select
                      value={formData.tipe_pembaca}
                      onValueChange={(value) => setFormData({ ...formData, tipe_pembaca: value })}
                    >
                      <SelectTrigger className={cn("w-full bg-white", theme.borderClass)}>
                        <SelectValue placeholder="Pilih tipe pembaca..." />
                      </SelectTrigger>
                      <SelectContent className="z-[200]">
                        <SelectItem value="Gulir Vertikal">Gulir Vertikal</SelectItem>
                        <SelectItem value="Lembaran">Lembaran</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Kategori Produk (Khusus Ebook) */}
                {formData.kategori === "e-book" && (
                  <div className="space-y-1">
                    <Label className="text-sm font-medium text-gray-700">Kategori Produk</Label>
                    <Select
                      value={formData.kategori_produk}
                      onValueChange={(value) => setFormData({ ...formData, kategori_produk: value })}
                    >
                      <SelectTrigger className={cn("w-full bg-white", theme.borderClass)}>
                        <SelectValue placeholder="Pilih Kategori Produk..." />
                      </SelectTrigger>
                      <SelectContent className="z-[200]">
                        <SelectItem value="Buku Programmer">Buku Programmer</SelectItem>
                        <SelectItem value="Buku Soal SMA">Buku Soal SMA</SelectItem>
                        <SelectItem value="Resep Masak">Resep Masak</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Toggles / Link URL / File uploads */}
                {/* Switch untuk Ebook saja */}
                {formData.kategori === "e-book" && (
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div>
                      <Label className="text-sm font-medium text-gray-700">Tidak Pakai File, Pakai Link saja</Label>
                      <p className="text-xs text-gray-400">Jika pakai upload file, setelah bayar file langsung terunduh. Jika pakai redirect URL, pelanggan akan diarahkan ke halaman tersebut setelah pembayaran.</p>
                    </div>
                    <Switch
                      checked={formData.sumberFile === "link"}
                      onCheckedChange={(checked) => setFormData({ ...formData, sumberFile: checked ? "link" : "upload" })}
                    />
                  </div>
                )}

                {/* Jika Pakai Link */}
                {formData.sumberFile === "link" ? (
                  <div className="space-y-1">
                    <Label className="text-sm font-medium text-gray-700">Link URL</Label>
                    <Textarea
                      placeholder="Masukkan URL Link..."
                      rows={3}
                      value={formData.redirectUrl}
                      onChange={(e) => setFormData({ ...formData, redirectUrl: e.target.value })}
                    />
                    <p className="text-xs text-gray-400">Pelanggan akan diarahkan ke halaman ini setelah membayar produk.</p>
                  </div>
                ) : (
                  /* Jika Pakai Upload/File (Novel, Komik, Ebook, Video/Podcast semuanya butuh file jika bukan link) */
                  (formData.kategori === "novel" || formData.kategori === "e-book" || formData.kategori === "video") && (
                    <div className="space-y-4 p-4 border border-gray-100 rounded-lg bg-gray-50/50">
                      {/* File Digital Type */}
                      <div className="space-y-1">
                        <Label className="text-sm font-medium text-gray-700">File Digital</Label>
                        <Select
                          value={formData.format}
                          onValueChange={(value) => setFormData({ ...formData, format: value })}
                        >
                          <SelectTrigger className={cn("w-full bg-white", theme.borderClass)}>
                            <SelectValue placeholder="Pilih format..." />
                          </SelectTrigger>
                          <SelectContent className="z-[200]">
                            {formData.kategori === "video" ? (
                              <>
                                <SelectItem value="MP4">MP4</SelectItem>
                                <SelectItem value="WAV">WAV</SelectItem>
                                <SelectItem value="MP3">MP3</SelectItem>
                              </>
                            ) : (
                              <>
                                <SelectItem value="PDF">PDF</SelectItem>
                                <SelectItem value="EPUB">EPUB</SelectItem>
                              </>
                            )}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Sumber File */}
                      <div className="space-y-1">
                        <Label className="text-sm font-medium text-gray-700">Sumber File *</Label>
                        <Select
                          value={formData.sumberFile}
                          onValueChange={(value) => setFormData({ ...formData, sumberFile: value as any })}
                        >
                          <SelectTrigger className={cn("w-full bg-white", theme.borderClass)}>
                            <SelectValue placeholder="Pilih sumber file..." />
                          </SelectTrigger>
                          <SelectContent className="z-[200]">
                            <SelectItem value="upload">File Baru</SelectItem>
                            <SelectItem value="file_lama">File Lama</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* File Upload Zone */}
                      {formData.sumberFile === "upload" ? (
                        <div className="space-y-1">
                          <Label className="text-sm font-medium text-gray-700">File/Konten *</Label>
                          <div
                            className={cn(
                              "border-2 border-dashed border-gray-200 rounded-lg p-6 text-center cursor-pointer hover:bg-gray-50 transition"
                            )}
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
                                <p className="text-sm text-gray-500 font-semibold text-blue-600">Upload files...</p>
                                <p className="text-xs text-gray-400">Drop files here</p>
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
                      ) : (
                        /* File Lama */
                        <div className="space-y-1">
                          <Label className="text-sm font-medium text-gray-700">Pilih File Lama *</Label>
                          <Select
                            value={formData.redirectUrl}
                            onValueChange={(value) => setFormData({ ...formData, redirectUrl: value })}
                          >
                            <SelectTrigger className={cn("w-full bg-white", theme.borderClass)}>
                              <SelectValue placeholder="-- Pilih File Lama --" />
                            </SelectTrigger>
                            <SelectContent className="z-[200]">
                              {oldFiles.map((file) => (
                                <SelectItem key={file.id} value={file.id}>
                                  {file.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      )}

                      {/* Bisa Download */}
                      <div className="space-y-1">
                        <Label className="text-sm font-medium text-gray-700">Bisa Download</Label>
                        <Select
                          value={formData.bisaDidownload ? "Bisa" : "Tidak"}
                          onValueChange={(value) => setFormData({ ...formData, bisaDidownload: value === "Bisa" })}
                        >
                          <SelectTrigger className={cn("w-full bg-white", theme.borderClass)}>
                            <SelectValue placeholder="Pilih..." />
                          </SelectTrigger>
                          <SelectContent className="z-[200]">
                            <SelectItem value="Bisa">Bisa</SelectItem>
                            <SelectItem value="Tidak">Tidak</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  )
                )}

                {/* Detail Tambahan Section */}
                <div className="pt-4 border-t border-gray-100 space-y-4">
                  <h3 className="text-sm font-bold text-gray-900">Detail Tambahan</h3>

                  {/* Fields for NOVEL */}
                  {formData.kategori === "novel" && (
                    <div className="space-y-4">
                      <div className="space-y-1">
                        <Label className="text-sm font-medium text-gray-700">Genre</Label>
                        <Select
                          value={formData.genre}
                          onValueChange={(value) => setFormData({ ...formData, genre: value })}
                        >
                          <SelectTrigger className={cn("w-full bg-white", theme.borderClass)}>
                            <SelectValue placeholder="Pilih genre..." />
                          </SelectTrigger>
                          <SelectContent className="z-[200]">
                            <SelectItem value="Action">Action</SelectItem>
                            <SelectItem value="Romance">Romance</SelectItem>
                            <SelectItem value="Fantasy">Fantasy</SelectItem>
                            <SelectItem value="Horror">Horror</SelectItem>
                            <SelectItem value="Mystery">Mystery</SelectItem>
                            <SelectItem value="Drama">Drama</SelectItem>
                            <SelectItem value="Slice of Life">Slice of Life</SelectItem>
                            <SelectItem value="Superhero">Superhero</SelectItem>
                            <SelectItem value="Comedy">Comedy</SelectItem>
                            <SelectItem value="Historical">Historical</SelectItem>
                            <SelectItem value="Adventure">Adventure</SelectItem>
                            <SelectItem value="Thriller">Thriller</SelectItem>
                            <SelectItem value="Lainnya">Lainnya</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-sm font-medium text-gray-700">Penulis</Label>
                        <Input
                          placeholder="Nama Penulis"
                          value={formData.author}
                          onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-sm font-medium text-gray-700">Tag</Label>
                        <Input
                          placeholder="tag1, tag2"
                          value={formData.isbn}
                          onChange={(e) => setFormData({ ...formData, isbn: e.target.value })}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-sm font-medium text-gray-700">Umur Pembaca</Label>
                        <Input
                          placeholder="SU"
                          value={formData.format}
                          onChange={(e) => setFormData({ ...formData, format: e.target.value })}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-sm font-medium text-gray-700">Bahasa</Label>
                        <Input
                          placeholder="Indonesia"
                          value={formData.bahasa}
                          onChange={(e) => setFormData({ ...formData, bahasa: e.target.value })}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-sm font-medium text-gray-700">Status</Label>
                        <Select
                          value={formData.tipeTulisan}
                          onValueChange={(value) => setFormData({ ...formData, tipeTulisan: value as any })}
                        >
                          <SelectTrigger className={cn("w-full bg-white", theme.borderClass)}>
                            <SelectValue placeholder="Pilih status..." />
                          </SelectTrigger>
                          <SelectContent className="z-[200]">
                            <SelectItem value="tamat">Tamat</SelectItem>
                            <SelectItem value="ongoing">Ongoing</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  )}

                  {/* Fields for KOMIK */}
                  {formData.kategori === "komik" && (
                    <div className="space-y-4">
                      <div className="space-y-1">
                        <Label className="text-sm font-medium text-gray-700">Genre</Label>
                        <Select
                          value={formData.genre}
                          onValueChange={(value) => setFormData({ ...formData, genre: value })}
                        >
                          <SelectTrigger className={cn("w-full bg-white", theme.borderClass)}>
                            <SelectValue placeholder="Pilih genre..." />
                          </SelectTrigger>
                          <SelectContent className="z-[200]">
                            <SelectItem value="Action">Action</SelectItem>
                            <SelectItem value="Romance">Romance</SelectItem>
                            <SelectItem value="Fantasy">Fantasy</SelectItem>
                            <SelectItem value="Horror">Horror</SelectItem>
                            <SelectItem value="Mystery">Mystery</SelectItem>
                            <SelectItem value="Drama">Drama</SelectItem>
                            <SelectItem value="Slice of Life">Slice of Life</SelectItem>
                            <SelectItem value="Superhero">Superhero</SelectItem>
                            <SelectItem value="Comedy">Comedy</SelectItem>
                            <SelectItem value="Historical">Historical</SelectItem>
                            <SelectItem value="Adventure">Adventure</SelectItem>
                            <SelectItem value="Thriller">Thriller</SelectItem>
                            <SelectItem value="Lainnya">Lainnya</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-sm font-medium text-gray-700">Author</Label>
                        <Input
                          placeholder="Nama Author"
                          value={formData.author}
                          onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-sm font-medium text-gray-700">Penulis</Label>
                        <Input
                          placeholder="Nama Penulis"
                          value={formData.pembicara}
                          onChange={(e) => setFormData({ ...formData, pembicara: e.target.value })}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-sm font-medium text-gray-700">Artis</Label>
                        <Input
                          placeholder="Nama Artis"
                          value={formData.artis}
                          onChange={(e) => setFormData({ ...formData, artis: e.target.value })}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-sm font-medium text-gray-700">ISBN</Label>
                        <Input
                          placeholder="ISBN Komik"
                          value={formData.isbn}
                          onChange={(e) => setFormData({ ...formData, isbn: e.target.value })}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-sm font-medium text-gray-700">Bahasa</Label>
                        <Input
                          placeholder="Indonesia"
                          value={formData.bahasa}
                          onChange={(e) => setFormData({ ...formData, bahasa: e.target.value })}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-sm font-medium text-gray-700">Jumlah Halaman</Label>
                        <Input
                          type="number"
                          placeholder="0"
                          value={formData.jumlahHalaman}
                          onChange={(e) => setFormData({ ...formData, jumlahHalaman: e.target.value })}
                        />
                      </div>
                    </div>
                  )}

                  {/* Fields for EBOOK */}
                  {formData.kategori === "e-book" && (
                    <div className="space-y-4">
                      <div className="space-y-1">
                        <Label className="text-sm font-medium text-gray-700">Author</Label>
                        <Input
                          placeholder="Nama Penulis"
                          value={formData.author}
                          onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-sm font-medium text-gray-700">ISBN</Label>
                        <Input
                          placeholder="ISBN E-Book"
                          value={formData.isbn}
                          onChange={(e) => setFormData({ ...formData, isbn: e.target.value })}
                        />
                      </div>
                      <div className="space-y-1">
                        <Select
                          value={formData.format}
                          onValueChange={(value) => setFormData({ ...formData, format: value })}
                        >
                          <SelectTrigger className={cn("w-full bg-white", theme.borderClass)}>
                            <SelectValue placeholder="Pilih format..." />
                          </SelectTrigger>
                          <SelectContent className="z-[200]">
                            <SelectItem value="PDF">PDF</SelectItem>
                            <SelectItem value="EPUB">EPUB</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-sm font-medium text-gray-700">Bahasa</Label>
                        <Input
                          placeholder="Indonesia"
                          value={formData.bahasa}
                          onChange={(e) => setFormData({ ...formData, bahasa: e.target.value })}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-sm font-medium text-gray-700">Jumlah Halaman</Label>
                        <Input
                          type="number"
                          placeholder="0"
                          value={formData.jumlahHalaman}
                          onChange={(e) => setFormData({ ...formData, jumlahHalaman: e.target.value })}
                        />
                      </div>
                    </div>
                  )}

                  {/* Fields for TULISAN */}
                  {formData.kategori === "tulisan" && (
                    <div className="space-y-4">
                      <div className="space-y-1">
                        <Label className="text-sm font-medium text-gray-700">Genre</Label>
                        <Select
                          value={formData.genre}
                          onValueChange={(value) => setFormData({ ...formData, genre: value })}
                        >
                          <SelectTrigger className={cn("w-full bg-white", theme.borderClass)}>
                            <SelectValue placeholder="Pilih genre..." />
                          </SelectTrigger>
                          <SelectContent className="z-[200]">
                            <SelectItem value="Fiksi">Fiksi</SelectItem>
                            <SelectItem value="Non fiksi">Non fiksi</SelectItem>
                            <SelectItem value="Puisi">Puisi</SelectItem>
                            <SelectItem value="Karya Seni">Karya Seni</SelectItem>
                            <SelectItem value="Edukasi">Edukasi</SelectItem>
                            <SelectItem value="Drama">Drama</SelectItem>
                            <SelectItem value="Cerita Pendek">Cerita Pendek</SelectItem>
                            <SelectItem value="Fotografi">Fotografi</SelectItem>
                            <SelectItem value="Fantasi">Fantasi</SelectItem>
                            <SelectItem value="Cerita Anak">Cerita Anak</SelectItem>
                            <SelectItem value="Horor">Horor</SelectItem>
                            <SelectItem value="Acak">Acak</SelectItem>
                            <SelectItem value="Spiritual">Spiritual</SelectItem>
                            <SelectItem value="Humor">Humor</SelectItem>
                            <SelectItem value="Chicklit">Chicklit</SelectItem>
                            <SelectItem value="Misteri / Thriller">Misteri / Thriller</SelectItem>
                            <SelectItem value="Paranormal">Paranormal</SelectItem>
                            <SelectItem value="Vampir">Vampir</SelectItem>
                            <SelectItem value="Aksi">Aksi</SelectItem>
                            <SelectItem value="Romansa">Romansa</SelectItem>
                            <SelectItem value="Lainnya">Lainnya</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-sm font-medium text-gray-700">Author</Label>
                        <Input
                          placeholder="Nama Penulis"
                          value={formData.author}
                          onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-sm font-medium text-gray-700">Bahasa</Label>
                        <Input
                          placeholder="Indonesia"
                          value={formData.bahasa}
                          onChange={(e) => setFormData({ ...formData, bahasa: e.target.value })}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-sm font-medium text-gray-700">Jumlah Halaman</Label>
                        <Input
                          type="number"
                          placeholder="0"
                          value={formData.jumlahHalaman}
                          onChange={(e) => setFormData({ ...formData, jumlahHalaman: e.target.value })}
                        />
                      </div>
                    </div>
                  )}

                  {/* Fields for VIDEO/PODCAST */}
                  {formData.kategori === "video" && (
                    <div className="space-y-4">
                      <div className="space-y-1">
                        <Label className="text-sm font-medium text-gray-700">Pembicara / Narator</Label>
                        <Input
                          placeholder="Nama Pembicara"
                          value={formData.pembicara}
                          onChange={(e) => setFormData({ ...formData, pembicara: e.target.value })}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-sm font-medium text-gray-700">Durasi</Label>
                        <Input
                          placeholder="Contoh: 5 jam 30 menit"
                          value={formData.durasi}
                          onChange={(e) => setFormData({ ...formData, durasi: e.target.value })}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-sm font-medium text-gray-700">Tag</Label>
                        <Input
                          placeholder="tag1, tag2"
                          value={formData.genre}
                          onChange={(e) => setFormData({ ...formData, genre: e.target.value })}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-sm font-medium text-gray-700">Umur Pembaca</Label>
                        <Input
                          placeholder="SU"
                          value={formData.isbn}
                          onChange={(e) => setFormData({ ...formData, isbn: e.target.value })}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-sm font-medium text-gray-700">Bahasa</Label>
                        <Input
                          placeholder="Indonesia"
                          value={formData.bahasa}
                          onChange={(e) => setFormData({ ...formData, bahasa: e.target.value })}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-sm font-medium text-gray-700">Status</Label>
                        <Select
                          value={formData.tipeTulisan}
                          onValueChange={(value) => setFormData({ ...formData, tipeTulisan: value as any })}
                        >
                          <SelectTrigger className={cn("w-full bg-white", theme.borderClass)}>
                            <SelectValue placeholder="Pilih status..." />
                          </SelectTrigger>
                          <SelectContent className="z-[200]">
                            <SelectItem value="tamat">Tamat</SelectItem>
                            <SelectItem value="ongoing">Ongoing</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}

            {/* Buttons */}
            <div className="flex gap-3 pt-2 border-t border-gray-100">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setCreateOpen(false)}
                disabled={isSubmitting}
              >
                Batal
              </Button>
              <Button
                className={cn("flex-1 text-white", theme.buttonClass)}
                onClick={handleSubmit}
                disabled={isSubmitting || formData.kategori === ""}
              >
                {isSubmitting ? "Menyimpan..." : "Simpan Produk"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}