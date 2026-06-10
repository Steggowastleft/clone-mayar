import DashboardLayout from "@/components/dashboard/dashboardlayout";
import { Head, router } from "@inertiajs/react";
import { useState, useRef, useEffect } from "react";
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
import { RichTextEditor } from "@/components/ui/RichTextEditor";

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
  kategori?: "e-book" | "novel" | "komik" | "template" | "tulisan" | "video";
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
      <Label >
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
  format: "",
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

const getFileAcceptAttribute = (kategori: string, format: string) => {
  if (kategori === "video") {
    if (format === "MP4") return "video/mp4";
    return "video/*";
  }
  if (kategori === "komik") {
    if (format === "PDF") return "application/pdf";
    if (format === "JPG") return "image/jpeg,image/jpg";
    if (format === "JPEG") return "image/jpeg";
    if (format === "PNG") return "image/png";
    return "application/pdf,image/png,image/jpeg,image/jpg";
  }
  return "application/pdf";
};

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
  const [pageFiles, setPageFiles] = useState<(File | null)[]>([]);
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
    setPageFiles([]);
    setWaktuMulaiJual(undefined);
    setTanggalKadaluarsa(undefined);
    setTanggalPublish(undefined);
    setCreateOpen(true);
  };

  useEffect(() => {
    if (
      formData.kategori === "komik" &&
      formData.format !== "PDF" &&
      formData.sumberFile === "upload"
    ) {
      const count = parseInt(formData.jumlahHalaman) || 0;
      setPageFiles((prev) => {
        const next = [...prev];
        if (next.length < count) {
          while (next.length < count) {
            next.push(null);
          }
        } else if (next.length > count) {
          next.splice(count);
        }
        return next;
      });
    } else {
      setPageFiles([]);
    }
  }, [formData.jumlahHalaman, formData.kategori, formData.format, formData.sumberFile]);

  const handlePageFileChange = (index: number, file: File) => {
    setPageFiles((prev) => {
      const next = [...prev];
      next[index] = file;
      return next;
    });
  };



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
    if (file) {
      const fileType = file.type;
      const fileName = file.name.toLowerCase();
      
      if (formData.kategori === "video") {
        if (!fileType.startsWith("video/")) {
          toast.error("Format file harus berupa video");
          return;
        }
        if (formData.format === "MP4" && !fileName.endsWith(".mp4")) {
          toast.error("File harus berupa MP4");
          return;
        }
      } else if (formData.kategori === "komik") {
        if (formData.format === "PDF" && !fileName.endsWith(".pdf") && fileType !== "application/pdf") {
          toast.error("File harus berupa PDF");
          return;
        }
        if (formData.format === "PNG" && !fileName.endsWith(".png") && fileType !== "image/png") {
          toast.error("File harus berupa PNG");
          return;
        }
        if ((formData.format === "JPG" || formData.format === "JPEG") && 
            !fileName.endsWith(".jpg") && !fileName.endsWith(".jpeg") && 
            fileType !== "image/jpeg" && fileType !== "image/jpg") {
          toast.error("File harus berupa JPG/JPEG");
          return;
        }
        if (!formData.format) {
          const isValid = fileType === "application/pdf" || 
                          fileType.startsWith("image/") || 
                          fileName.endsWith(".pdf") || 
                          fileName.endsWith(".png") || 
                          fileName.endsWith(".jpg") || 
                          fileName.endsWith(".jpeg");
          if (!isValid) {
            toast.error("File komik harus berupa PDF atau Gambar (PNG, JPG, JPEG)");
            return;
          }
        }
      } else {
        if (!fileName.endsWith(".pdf") && fileType !== "application/pdf") {
          toast.error("File harus berupa PDF");
          return;
        }
      }
      setKontenFile(file);
    }
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
    if (formData.sumberFile === "upload") {
      if (formData.kategori === "komik" && formData.format !== "PDF") {
        const count = parseInt(formData.jumlahHalaman) || 0;
        if (count <= 0) {
          toast.error("Jumlah halaman harus diisi dan lebih besar dari 0");
          return;
        }
        const missingPages = pageFiles.some((f) => f === null);
        if (missingPages) {
          toast.error("Semua halaman komik harus diupload");
          return;
        }
      } else if (!kontenFile && formData.kategori !== "tulisan") {
        toast.error("File konten harus diupload");
        return;
      }
    }
    if (formData.sumberFile === "file_lama" && !formData.redirectUrl && formData.kategori !== "tulisan") {
      toast.error("File lama harus dipilih");
      return;
    }
    if (formData.sumberFile === "link" && !formData.redirectUrl && formData.kategori !== "tulisan") {
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
    if (formData.kategori === "novel" || formData.kategori === "komik") {
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
    if (formData.kategori === "komik" && formData.format !== "PDF" && formData.sumberFile === "upload") {
      pageFiles.forEach((file) => {
        if (file) {
          payload.append("page_files[]", file);
        }
      });
    } else {
      if (kontenFile) payload.append("file", kontenFile);
    }

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

  // Stats
  const totalProduk = produkList.length;
  const publikCount = produkList.filter((p) => p.status === "published").length;
  const tidakPublikCount = totalProduk - publikCount;
  const totalPendapatan = produkList.reduce((acc, p) => acc + p.total_penjualan * p.harga, 0);

  const [categoryFilter, setCategoryFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState<Date | undefined>(undefined);
  const [dateFilterOpen, setDateFilterOpen] = useState(false);

  const filteredProduk = produkList.filter((p) => {
    const matchStatus = statusFilter === "all" || p.status === statusFilter;
    const matchSearch = p.nama.toLowerCase().includes(search.toLowerCase());
    const matchCategory = categoryFilter === "all" || p.kategori === categoryFilter;
    let matchDate = true;
    if (dateFilter) {
      matchDate = p.created_at.toLowerCase().includes(format(dateFilter, "d").toLowerCase());
    }
    return matchStatus && matchSearch && matchCategory && matchDate;
  });

  return (
    <DashboardLayout title="Produk Digital">
      <Head title="Produk Digital" />
      <div className="p-6 space-y-6 bg-slate-50/50 min-h-screen">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Produk Digital</h1>
            <div className="flex items-center gap-6 mt-3 text-sm text-slate-500 font-medium flex-wrap">
              <div className="flex items-center gap-2">
                <span>Total Produk: <span className="font-bold text-slate-800">{totalProduk}</span></span>
                <span className="bg-red-50 text-red-650 border border-red-100 text-[11px] font-bold px-2 py-0.5 rounded-full">
                  +{tidakPublikCount} Tidak Publik
                </span>
                <span className="bg-green-50 text-green-650 border border-green-100 text-[11px] font-bold px-2 py-0.5 rounded-full">
                  +{publikCount} Publik
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span>Total Pendapatan: <span className="font-bold text-slate-800">Rp. {formatRupiah(totalPendapatan)}</span></span>
                <span className="bg-red-50 text-red-650 border border-red-100 text-[11px] font-bold px-2 py-0.5 rounded-full">
                  +6% Dari bulan kemarin
                </span>
              </div>
            </div>
          </div>

          <div className="flex gap-2.5">
            <Button
              variant="outline"
              className="border-gray-200 text-slate-600 hover:bg-slate-50 hover:text-slate-800 text-sm font-semibold flex items-center gap-1.5"
            >
              <Download className="h-4 w-4" /> Ekspor Data
            </Button>
            <Button
              className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold flex items-center gap-1.5"
              onClick={openCreate}
            >
              + Tambah Produk
            </Button>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="flex items-center justify-between gap-3 bg-white p-4 border border-slate-200/85 rounded-xl shadow-sm flex-wrap">
          {/* Left Search */}
          <div className="relative w-72 max-w-full">
            <svg
              className="absolute left-3 top-3 h-4 w-4 text-slate-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <Input
              placeholder="Cari Nama Produk..."
              className="pl-9 bg-slate-50/50 border-slate-250 rounded-lg text-sm w-full focus:bg-white transition"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Right Filters */}
          <div className="flex items-center gap-3.5 flex-wrap">
            {/* Kategori Select */}
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-40 bg-white border-slate-250 rounded-lg text-xs font-semibold text-slate-600">
                <SelectValue placeholder="Kategori" />
              </SelectTrigger>
              <SelectContent className="z-[200]">
                <SelectItem value="all">Semua Kategori</SelectItem>
                <SelectItem value="e-book">E-Book</SelectItem>
                <SelectItem value="novel">Novel</SelectItem>
                <SelectItem value="komik">Komik</SelectItem>
                <SelectItem value="tulisan">Tulisan / Artikel</SelectItem>
                <SelectItem value="video">Video</SelectItem>
              </SelectContent>
            </Select>

            {/* Status Select */}
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40 bg-white border-slate-250 rounded-lg text-xs font-semibold text-slate-600">
                <SelectValue placeholder="Semua Status" />
              </SelectTrigger>
              <SelectContent className="z-[200]">
                <SelectItem value="all">Semua Status</SelectItem>
                <SelectItem value="published">Publik</SelectItem>
                <SelectItem value="unpublished">Tidak Publik (Unpublished)</SelectItem>
                <SelectItem value="unlisted">Tidak Publik (Unlisted)</SelectItem>
              </SelectContent>
            </Select>

            {/* Date Filter */}
            <Popover open={dateFilterOpen} onOpenChange={setDateFilterOpen}>
              <PopoverTrigger asChild>
                <button
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 border border-slate-250 rounded-lg bg-white text-xs font-semibold hover:border-slate-350 transition text-slate-600",
                    dateFilter && "text-slate-800 border-slate-450"
                  )}
                >
                  <CalendarIcon className="h-4 w-4 text-slate-450 shrink-0" />
                  {dateFilter
                    ? format(dateFilter, "dd MMM yyyy", { locale: idLocale })
                    : "Pilih Tanggal"}
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 z-[200]" align="end">
                <Calendar
                  mode="single"
                  selected={dateFilter}
                  onSelect={(d) => {
                    setDateFilter(d);
                    setDateFilterOpen(false);
                  }}
                  initialFocus
                />
                {dateFilter && (
                  <div className="p-2 border-t">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full text-xs text-slate-500"
                      onClick={() => {
                        setDateFilter(undefined);
                        setDateFilterOpen(false);
                      }}
                    >
                      Hapus filter tanggal
                    </Button>
                  </div>
                )}
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {/* Table List */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/70">
                  <th className="px-5 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">No</th>
                  <th className="px-5 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Tampilan</th>
                  <th className="px-5 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Kategori</th>
                  <th className="px-5 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Nama Produk Digital</th>
                  <th className="px-5 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Harga</th>
                  <th className="px-5 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Terjual</th>
                  <th className="px-5 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Pendapatan</th>
                  <th className="px-5 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Status</th>
                  <th className="px-5 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Dibuat</th>
                  <th className="px-5 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dashed divide-slate-200">
                {filteredProduk.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="text-center text-slate-400 py-16 text-sm">
                      There are no records to display
                    </td>
                  </tr>
                ) : (
                  filteredProduk.map((produk, index) => {
                    const statusIsPublik = produk.status === "published";
                    const itemRevenue = produk.total_penjualan * produk.harga;
                    return (
                      <tr key={produk.id} className="hover:bg-slate-50/40 transition">
                        <td className="px-5 py-5 text-sm text-slate-550 font-semibold">{index + 1}</td>
                        <td className="px-5 py-5">
                          {produk.cover_url ? (
                            <img
                              src={produk.cover_url}
                              alt={produk.nama}
                              className="h-10 w-14 object-cover rounded-lg border border-slate-100 shadow-sm"
                            />
                          ) : (
                            <div className="h-10 w-14 bg-slate-100 rounded-lg flex items-center justify-center border border-slate-200">
                              <Package className="h-5 w-5 text-slate-455" />
                            </div>
                          )}
                        </td>
                        <td className="px-5 py-5 text-sm font-semibold text-slate-655 capitalize">
                          {produk.kategori || "e-book"}
                        </td>
                        <td className="px-5 py-5 text-sm font-bold text-slate-800 select-all max-w-[200px] truncate">
                          {produk.nama}
                        </td>
                        <td className="px-5 py-5 text-sm text-slate-655 font-semibold whitespace-nowrap">
                          {produk.tipe_pembayaran === "berbayar" ? `Rp. ${formatRupiah(produk.harga)}` : "Gratis"}
                        </td>
                        <td className="px-5 py-5 text-sm text-slate-550 font-semibold">{produk.total_penjualan}</td>
                        <td className="px-5 py-5 text-sm text-slate-800 font-bold whitespace-nowrap">
                          Rp. {formatRupiah(itemRevenue)}
                        </td>
                        <td className="px-5 py-5">
                          <span
                            className={cn(
                              "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border",
                              statusIsPublik
                                ? "bg-green-50 text-green-700 border-green-200"
                                : "bg-red-50 text-red-750 border-red-200"
                            )}
                          >
                            <span className={cn("h-1.5 w-1.5 rounded-full mr-1.5", statusIsPublik ? "bg-green-500" : "bg-red-500")} />
                            {statusIsPublik ? "Publik" : "Tidak Publik"}
                          </span>
                        </td>
                        <td className="px-5 py-5 text-xs text-slate-400 font-semibold whitespace-nowrap">
                          {produk.created_at}
                        </td>
                        <td className="px-5 py-5 text-right whitespace-nowrap">
                          <button
                            onClick={() => router.visit(`/produk-digital/${produk.id}`)}
                            className="text-sm font-bold text-blue-600 hover:text-blue-800 underline transition"
                          >
                            Lihat
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ─── CREATE DIALOG ─────────────────────────────────────────────── */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent aria-describedby={undefined} className="max-w-2xl max-h-[90vh] overflow-y-auto p-0">
          {/* Header */}
          <div className="bg-white border-b border-slate-100 p-6 rounded-t-lg sticky top-0 z-10 flex items-center justify-between">
            <DialogTitle className="text-slate-900 text-xl font-bold">
              Buat Produk Digital {formData.kategori && `(${theme.name})`}
            </DialogTitle>
          </div>

          <div className="p-6 space-y-5">
            {/* Kategori Select (Selalu ditampilkan di atas) */}
            <div className="space-y-1">
              <Label >
                Kategori <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.kategori}
                onValueChange={(value) => {
                  // Reset format based on category: 'PDF' only for categories that use Select, '' for categories using number input
                  const newFormat = (value === "e-book" || value === "komik") ? "PDF" : "";
                  setFormData({ ...formData, kategori: value as any, format: newFormat });
                }}
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
                  <Label >
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

                {/* Tipe Penulisan & Mekanisme Pembayaran (Khusus Komik dan Novel) */}
                {(formData.kategori === "komik" || formData.kategori === "novel") && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <Label >Tipe Penulisan *</Label>
                      <Select
                        value={formData.tipeTulisan}
                        onValueChange={(value) => setFormData({ ...formData, tipeTulisan: value as any })}
                      >
                        <SelectTrigger className={cn("w-full bg-white", theme.borderClass)}>
                          <SelectValue placeholder="Pilih tipe penulisan..." />
                        </SelectTrigger>
                        <SelectContent className="z-[200]">
                          <SelectItem value="one_shot">One-Shot</SelectItem>
                          <SelectItem value="chapter">Chapter</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-1">
                      <Label >Mekanisme Pembayaran *</Label>
                      <Select
                        value={formData.mekanismeBayar}
                        onValueChange={(value) => setFormData({ ...formData, mekanismeBayar: value as any })}
                      >
                        <SelectTrigger className={cn("w-full bg-white", theme.borderClass)}>
                          <SelectValue placeholder="Pilih mekanisme..." />
                        </SelectTrigger>
                        <SelectContent className="z-[200]">
                          <SelectItem value="per_chapter">Bayar Per-chapter</SelectItem>
                          <SelectItem value="semua_chapter">Semua Chapter(paket)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}

                {/* Tipe Pembayaran */}
                <div className="space-y-1">
                  <Label >Tipe Pembayaran *</Label>
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
                      <Label >
                        Harga <span className="text-red-500">*</span>
                      </Label>
                      <div className="relative">
                        <span className="absolute left-3 top-2 text-sm text-gray-500 font-semibold text-blue-600">RP.</span>
                        <Input
                          className="pl-9"
                          type="text"
                          placeholder="50.000"
                          value={formData.harga ? formatRupiah(Number(formData.harga)) : ""}
                          onChange={(e) => setFormData({ ...formData, harga: e.target.value.replace(/\D/g, "") })}
                        />
                      </div>
                    </div>

                    {/* Harga Coret hanya untuk Ebook */}
                    {formData.kategori === "e-book" && (
                      <div className="space-y-1">
                        <Label >
                          Harga Coret (opsional)
                        </Label>
                        <div className="relative">
                          <span className="absolute left-3 top-2 text-sm text-gray-500 font-semibold text-blue-600">RP.</span>
                          <Input
                            className="pl-9"
                            type="text"
                            placeholder="75.000"
                            value={formData.hargaCoret ? formatRupiah(Number(formData.hargaCoret)) : ""}
                            onChange={(e) => setFormData({ ...formData, hargaCoret: e.target.value.replace(/\D/g, "") })}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Deskripsi/Sinopsis */}
                <div className="space-y-1">
                  <Label >
                    {formData.kategori === "novel" || formData.kategori === "komik" ? "Deskripsi/Sinopsis" : "Deskripsi"}{" "}
                    <span className="text-red-500">*</span>
                  </Label>
                  {formData.kategori === "tulisan" ? (
                    <RichTextEditor
                      value={formData.deskripsi}
                      onChange={(val) => setFormData({ ...formData, deskripsi: val })}
                    />
                  ) : (
                    <Textarea
                      placeholder="Tuliskan deskripsi produk digital..."
                      rows={4}
                      value={formData.deskripsi}
                      onChange={(e) => setFormData({ ...formData, deskripsi: e.target.value })}
                    />
                  )}
                </div>

                {/* Transkrip (khusus video/podcast) */}
                {formData.kategori === "video" && (
                  <div className="space-y-1">
                    <Label >Transkrip</Label>
                    <Textarea
                      placeholder="Tuliskan transkrip video / podcast..."
                      rows={4}
                      value={formData.transkrip}
                      onChange={(e) => setFormData({ ...formData, transkrip: e.target.value })}
                    />
                  </div>
                )}

                {/* Cover Produk */}
                <div className="space-y-2">
                  <Label>Cover Gambar <span className="text-red-500">*</span></Label>
                  <div
                    className="border border-dashed border-slate-200 rounded-lg p-8 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50/30 transition flex flex-col items-center justify-center min-h-[140px]"
                    onClick={() => coverInputRef.current?.click()}
                  >
                    {coverPreview ? (
                      <img
                        src={coverPreview}
                        alt="preview"
                        className="max-h-40 mx-auto rounded-md object-cover"
                      />
                    ) : (
                      <div className="flex items-center gap-3 justify-center">
                        <button
                          type="button"
                          className="px-4 py-2 bg-[#eef2f6] text-blue-600 rounded-lg text-sm font-semibold hover:bg-blue-50 transition"
                        >
                          Select image...
                        </button>
                        <span className="text-sm text-slate-500 flex items-center gap-1.5">
                          <Upload className="h-4 w-4 text-slate-400" />
                          Drop image here
                        </span>
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
                  <Label >Catatan (Opsional)</Label>
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
                  <Label >Maksimum Jumlah Pembelian (Opsional)</Label>
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
                    <Label >Tipe Pembaca</Label>
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



                {/* Toggles / Link URL / File uploads */}
                {/* Switch untuk Ebook saja */}
                {formData.kategori === "e-book" && (
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div>
                      <Label >Tidak Pakai File, Pakai Link saja</Label>
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
                    <Label >Link URL</Label>
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
                  (formData.kategori === "novel" || formData.kategori === "e-book" || formData.kategori === "video" || formData.kategori === "komik" || formData.kategori === "tulisan") && (
                    <div className="space-y-4 p-4 border border-gray-100 rounded-lg bg-gray-50/50">
                      {/* File Digital Type */}
                      <div className="space-y-1">
                        <Label >File Digital</Label>
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
                              </>
                            ) : formData.kategori === "komik" ? (
                              <>
                                <SelectItem value="PDF">PDF</SelectItem>
                                <SelectItem value="JPG">JPG</SelectItem>
                                <SelectItem value="PNG">PNG</SelectItem>
                                <SelectItem value="JPEG">JPEG</SelectItem>
                              </>
                            ) : (
                              <>
                                <SelectItem value="PDF">PDF</SelectItem>
                              </>
                            )}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Jumlah Halaman (Khusus Komik) */}
                      {formData.kategori === "komik" && (
                        <div className="space-y-1">
                          <Label >
                            Jumlah Halaman <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            type="number"
                            min={1}
                            placeholder="Masukkan jumlah halaman..."
                            value={formData.jumlahHalaman}
                            onChange={(e) => setFormData({ ...formData, jumlahHalaman: e.target.value })}
                          />
                        </div>
                      )}

                    {/* Sumber File */}
                      <div className="space-y-1">
                        <Label >Sumber File {formData.kategori === "tulisan" ? "(opsional)" : "*"}</Label>
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
                        formData.kategori === "komik" && formData.format !== "PDF" ? (
                          pageFiles.length > 0 ? (
                            <div className="space-y-3">
                              <div className="flex items-center justify-between">
                                <Label >Upload Halaman Komik ({pageFiles.length} Halaman)</Label>
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  className="text-xs flex items-center gap-1.5 py-1 px-2.5 h-auto bg-white hover:bg-gray-50 border-gray-200"
                                  onClick={() => document.getElementById('bulk-upload-pages')?.click()}
                                >
                                  <Upload className="h-3.5 w-3.5 text-gray-500" /> Upload Sekaligus
                                </Button>
                                <input
                                  id="bulk-upload-pages"
                                  type="file"
                                  multiple
                                  accept={getFileAcceptAttribute("komik", formData.format)}
                                  className="hidden"
                                  onChange={(e) => {
                                    const files = Array.from(e.target.files || []);
                                    if (files.length === 0) return;
                                    
                                    // Sort alphabetically/numerically
                                    files.sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' }));
                                    
                                    setPageFiles((prev) => {
                                      const next = [...prev];
                                      for (let i = 0; i < Math.min(files.length, next.length); i++) {
                                        next[i] = files[i];
                                      }
                                      return next;
                                    });
                                    toast.success(`Berhasil memuat ${Math.min(files.length, pageFiles.length)} file halaman.`);
                                  }}
                                />
                              </div>
                              <div className="grid grid-cols-2 gap-3 max-h-60 overflow-y-auto p-2 border border-gray-100 rounded-md bg-white">
                                {pageFiles.map((file, idx) => (
                                  <div
                                    key={idx}
                                    className="border border-gray-200 rounded-lg p-3 bg-gray-50/50 flex flex-col justify-between hover:border-blue-400 transition cursor-pointer relative"
                                    onClick={() => {
                                      const input = document.getElementById(`page-input-${idx}`);
                                      input?.click();
                                    }}
                                  >
                                    <div className="flex items-center justify-between mb-2">
                                      <span className="text-xs font-semibold text-gray-500">Halaman {idx + 1}</span>
                                      {file ? (
                                        <span className="text-xs text-green-600 font-bold bg-green-50 px-1.5 py-0.5 rounded">
                                          ✓ Uploaded
                                        </span>
                                      ) : (
                                        <span className="text-xs text-red-500 font-bold bg-red-50 px-1.5 py-0.5 rounded">
                                          Belum diisi
                                        </span>
                                      )}
                                    </div>
                                    {file ? (
                                      <p className="text-xs text-gray-600 truncate font-medium">{file.name}</p>
                                    ) : (
                                      <p className="text-xs text-gray-400 font-normal">Pilih gambar...</p>
                                    )}
                                    <input
                                      id={`page-input-${idx}`}
                                      type="file"
                                      accept={getFileAcceptAttribute("komik", formData.format)}
                                      className="hidden"
                                      onChange={(e) => {
                                        const f = e.target.files?.[0];
                                        if (f) {
                                          const fileType = f.type;
                                          const fileName = f.name.toLowerCase();
                                          if (formData.format === "PNG" && !fileName.endsWith(".png") && fileType !== "image/png") {
                                            toast.error(`File halaman ${idx + 1} harus berupa PNG`);
                                            return;
                                          }
                                          if ((formData.format === "JPG" || formData.format === "JPEG") && 
                                              !fileName.endsWith(".jpg") && !fileName.endsWith(".jpeg") && 
                                              fileType !== "image/jpeg" && fileType !== "image/jpg") {
                                            toast.error(`File halaman ${idx + 1} harus berupa JPG/JPEG`);
                                            return;
                                          }
                                          handlePageFileChange(idx, f);
                                        }
                                      }}
                                    />
                                  </div>
                                ))}
                              </div>
                            </div>
                          ) : (
                            <div className="text-center py-6 text-xs text-gray-400 border border-dashed rounded-md bg-white">
                              Masukkan jumlah halaman untuk menampilkan slot upload
                            </div>
                          )
                        ) : (
                          <div className="space-y-1">
                            <Label >File/Konten {formData.kategori === "tulisan" ? "(opsional)" : "*"}</Label>
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
                              accept={getFileAcceptAttribute(formData.kategori, formData.format)}
                              className="hidden"
                              onChange={handleKontenChange}
                            />
                          </div>
                        )
                      ) : (
                        /* File Lama */
                        <div className="space-y-1">
                          <Label >Pilih File Lama *</Label>
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
                        <Label >Bisa Download</Label>
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
                        <Label >Genre</Label>
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
                        <Label >Penulis</Label>
                        <Input
                          placeholder="Nama Penulis"
                          value={formData.author}
                          onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label >Tag</Label>
                        <Input
                          placeholder="tag1, tag2"
                          value={formData.isbn}
                          onChange={(e) => setFormData({ ...formData, isbn: e.target.value })}
                        />
                        <p className="text-xs text-gray-400">Gunakan tanda koma (,) untuk memisahkan tag (Contoh: fiksi, romance, bestseller)</p>
                      </div>
                      <div className="space-y-1">
                        <Label >Umur Pembaca</Label>
                        <div className="flex items-center gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            className="h-9 w-9 p-0 bg-white"
                            onClick={() => {
                              const val = parseInt(formData.format) || 0;
                              if (val > 0) setFormData({ ...formData, format: String(val - 1) });
                            }}
                          >
                            -
                          </Button>
                          <Input
                            type="number"
                            placeholder="0"
                            value={formData.format}
                            onChange={(e) => setFormData({ ...formData, format: e.target.value })}
                            className="w-24 text-center bg-white"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            className="h-9 w-9 p-0 bg-white"
                            onClick={() => {
                              const val = parseInt(formData.format) || 0;
                              setFormData({ ...formData, format: String(val + 1) });
                            }}
                          >
                            +
                          </Button>
                          <span className="text-xs text-gray-500 font-medium">Tahun</span>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <Label >Bahasa</Label>
                        <Input
                          placeholder="Indonesia"
                          value={formData.bahasa}
                          onChange={(e) => setFormData({ ...formData, bahasa: e.target.value })}
                        />
                      </div>
                    </div>
                  )}

                  {/* Fields for KOMIK */}
                  {formData.kategori === "komik" && (
                    <div className="space-y-4">
                      <div className="space-y-1">
                        <Label >Genre</Label>
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
                        <Label >Author</Label>
                        <Input
                          placeholder="Nama Author"
                          value={formData.author}
                          onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label >Penulis</Label>
                        <Input
                          placeholder="Nama Penulis"
                          value={formData.pembicara}
                          onChange={(e) => setFormData({ ...formData, pembicara: e.target.value })}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label >Artis</Label>
                        <Input
                          placeholder="Nama Artis"
                          value={formData.artis}
                          onChange={(e) => setFormData({ ...formData, artis: e.target.value })}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label >ISBN</Label>
                        <Input
                          placeholder="ISBN Komik"
                          value={formData.isbn}
                          onChange={(e) => setFormData({ ...formData, isbn: e.target.value })}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label >Bahasa</Label>
                        <Input
                          placeholder="Indonesia"
                          value={formData.bahasa}
                          onChange={(e) => setFormData({ ...formData, bahasa: e.target.value })}
                        />
                      </div>
                    </div>
                  )}

                  {/* Fields for EBOOK */}
                  {formData.kategori === "e-book" && (
                    <div className="space-y-4">
                      <div className="space-y-1">
                        <Label >Author</Label>
                        <Input
                          placeholder="Nama Penulis"
                          value={formData.author}
                          onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label >ISBN</Label>
                        <Input
                          placeholder="ISBN E-Book"
                          value={formData.isbn}
                          onChange={(e) => setFormData({ ...formData, isbn: e.target.value })}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label >Format File</Label>
                        <Select
                          value={formData.format}
                          onValueChange={(value) => setFormData({ ...formData, format: value })}
                        >
                          <SelectTrigger className={cn("w-full bg-white", theme.borderClass)}>
                            <SelectValue placeholder="Pilih format..." />
                          </SelectTrigger>
                          <SelectContent className="z-[200]">
                            <SelectItem value="PDF">PDF</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1">
                        <Label >Bahasa</Label>
                        <Input
                          placeholder="Indonesia"
                          value={formData.bahasa}
                          onChange={(e) => setFormData({ ...formData, bahasa: e.target.value })}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label >Jumlah Halaman</Label>
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
                        <Label >Genre</Label>
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
                        <Label >Author</Label>
                        <Input
                          placeholder="Nama Penulis"
                          value={formData.author}
                          onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label >Bahasa</Label>
                        <Input
                          placeholder="Indonesia"
                          value={formData.bahasa}
                          onChange={(e) => setFormData({ ...formData, bahasa: e.target.value })}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label >Jumlah Halaman</Label>
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
                        <Label >Pembicara / Narator</Label>
                        <Input
                          placeholder="Nama Pembicara"
                          value={formData.pembicara}
                          onChange={(e) => setFormData({ ...formData, pembicara: e.target.value })}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label >Durasi</Label>
                        <Input
                          placeholder="Contoh: 5 jam 30 menit"
                          value={formData.durasi}
                          onChange={(e) => setFormData({ ...formData, durasi: e.target.value })}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label >Tag</Label>
                        <Input
                          placeholder="tag1, tag2"
                          value={formData.genre}
                          onChange={(e) => setFormData({ ...formData, genre: e.target.value })}
                        />
                        <p className="text-xs text-gray-400">Gunakan tanda koma (,) untuk memisahkan tag (Contoh: video, tutorial, tips)</p>
                      </div>
                      <div className="space-y-1">
                        <Label >Umur Pembaca</Label>
                        <div className="flex items-center gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            className="h-9 w-9 p-0 bg-white"
                            onClick={() => {
                              const val = parseInt(formData.isbn) || 0;
                              if (val > 0) setFormData({ ...formData, isbn: String(val - 1) });
                            }}
                          >
                            -
                          </Button>
                          <Input
                            type="number"
                            placeholder="0"
                            value={formData.isbn}
                            onChange={(e) => setFormData({ ...formData, isbn: e.target.value })}
                            className="w-24 text-center bg-white"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            className="h-9 w-9 p-0 bg-white"
                            onClick={() => {
                              const val = parseInt(formData.isbn) || 0;
                              setFormData({ ...formData, isbn: String(val + 1) });
                            }}
                          >
                            +
                          </Button>
                          <span className="text-xs text-gray-500 font-medium">Tahun</span>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <Label >Bahasa</Label>
                        <Input
                          placeholder="Indonesia"
                          value={formData.bahasa}
                          onChange={(e) => setFormData({ ...formData, bahasa: e.target.value })}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}

            {/* Buttons */}
            <div className="flex justify-center pt-4 border-t border-gray-100">
              <Button
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-2 rounded-lg text-sm transition shadow-sm w-full md:w-auto min-w-[180px]"
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