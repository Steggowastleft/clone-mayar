import DashboardLayout from "@/components/dashboard/dashboardlayout";
import { Head, router, useForm } from "@inertiajs/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
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
  Printer,
  Download,
  Trash2,
  Edit,
  Plus,
  Search,
  CalendarIcon,
  Upload,
  X,
  ExternalLink,
  Package,
  Power,
} from "lucide-react";
import { useState, useRef } from "react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

type Bundling = {
  id: number;
  nama: string;
  harga: number;
  status: "published" | "unpublished";
  cover_url?: string;
  jumlah_produk: number;
  jumlah_terjual: number;
  created_at: string;
};

type Product = {
  id: number;
  id_type: string;
  nama: string;
  type: string;
  harga: number;
  cover?: string;
};

type IndexProps = {
  bundlings: Bundling[];
  products: Product[];
};

const formatRupiahInput = (value: string | number) => {
  if (value === undefined || value === null || value === "") return "";
  const clean = String(value).replace(/\D/g, "");
  return clean ? new Intl.NumberFormat("id-ID").format(Number(clean)) : "";
};

export default function Index({ bundlings, products }: IndexProps) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [createOpen, setCreateOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const { data, setData, post, processing, reset, errors } = useForm({
    nama: "",
    harga: "",
    hargaCoret: "",
    deskripsi: "",
    cover: null as File | null,
    tipePembayaran: "berbayar",
    tanggalKadaluarsa: "",
    pesanSetelahBayar: "",
    maksimalPembayaran: "",
    redirectUrl: "",
    produkIds: [] as any[],
  });

  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [dateOpen, setDateOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [searchProduk, setSearchProduk] = useState("");
  const [filterProdukType, setFilterProdukType] = useState("all");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const openCreate = () => {
    reset();
    setCoverPreview(null);
    setSelectedDate(undefined);
    setSearchProduk("");
    setFilterProdukType("all");
    setCreateOpen(true);
  };

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setData("cover", file);
      const reader = new FileReader();
      reader.onload = () => setCoverPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleDateChange = (date: Date | undefined) => {
    setSelectedDate(date);
    setData("tanggalKadaluarsa", date ? format(date, "yyyy-MM-dd") : "");
    setDateOpen(false);
  };

  const handleAddProduct = (product: Product) => {
    if (!data.produkIds.find((p) => p.id === product.id_type)) {
      setData("produkIds", [
        ...data.produkIds,
        { id: product.id_type, nama: product.nama, type: product.type },
      ]);
      setSearchProduk("");
    }
  };

  const handleRemoveProduct = (id: string) => {
    setData(
      "produkIds",
      data.produkIds.filter((p) => p.id !== id)
    );
  };

  const filteredBundlings = bundlings.filter((b) => {
    const matchStatus = statusFilter === "all" || b.status === statusFilter;
    const matchSearch = b.nama.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  const filteredProducts = products.filter((p) => {
    const matchSearch = p.nama.toLowerCase().includes(searchProduk.toLowerCase());
    const matchType = filterProdukType === "all" || p.type === filterProdukType;
    return matchSearch && matchType;
  });

  const uniqueProductTypes = Array.from(new Set(products.map((p) => p.type)));

  const statusBadge = (status: string) => {
    switch (status) {
      case "published":
        return <Badge className="bg-green-500 text-white">Published</Badge>;
      case "unpublished":
        return <Badge className="bg-yellow-500 text-white">Unpublished</Badge>;
      default:
        return <Badge>Unknown</Badge>;
    }
  };

  const handleDelete = (id: number) => {
    if (confirm("Apakah Anda yakin ingin menghapus bundling ini?")) {
      router.delete(`/bundling/${id}`, {
        onSuccess: () => {
          toast.success("Bundling berhasil dihapus");
          router.visit("/bundling");
        },
      });
    }
  };

  const handleStatusToggle = (id: number, currentStatus: string) => {
    const nextStatus = currentStatus === "published" ? "unpublished" : "published";
    router.patch(
      `/bundling/${id}/status`,
      { status: nextStatus },
      {
        onSuccess: () => {
          toast.success("Status bundling berhasil diperbarui.");
          router.visit("/bundling");
        },
      }
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!data.nama.trim()) return alert("Nama bundling wajib diisi");
    if (data.produkIds.length === 0) return alert("Minimal pilih 1 produk");
    if (!data.harga) return alert("Harga wajib diisi");

    setIsSubmitting(true);
    
    // Transform produkIds to array of strings (IDs)
    const payload = {
      ...data,
      produkIds: data.produkIds.map(p => p.id)
    };

    router.post("/bundling", payload, {
      forceFormData: true,
      onSuccess: () => {
        setCreateOpen(false);
        setIsSubmitting(false);
        toast.success("Bundling berhasil dibuat!");
        router.visit("/bundling");
      },
      onError: () => setIsSubmitting(false),
    });
  };

  const filterButtons = [
    { label: "SEMUA", value: "all" },
    { label: "PUBLISHED", value: "published" },
    { label: "UNPUBLISHED", value: "unpublished" },
  ];
  // Calculate stats
  const totalBundling = bundlings.length;
  const aktifCount = bundlings.filter((b) => b.status === "published").length;
  const tidakAktifCount = totalBundling - aktifCount;
  const totalTerjual = bundlings.reduce((acc, b) => acc + (b.jumlah_terjual || 0), 0);
  const totalPendapatan = bundlings.reduce((acc, b) => acc + (b.jumlah_terjual || 0) * (b.harga || 0), 0);

  return (
    <DashboardLayout title="Bundling Produk">
      <Head title="Bundling Produk" />

      <div className="p-6 space-y-6 bg-slate-50/50 min-h-screen">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Bundling Produk</h1>
            <div className="space-y-1.5 mt-3">
              {/* Baris 1: Status Produk */}
              <div className="flex items-center gap-2 text-sm text-slate-500 font-medium flex-wrap">
                <span>Total Bundling: <span className="font-bold text-slate-800">{totalBundling}</span></span>
                <span className="bg-green-50 text-green-755 border border-green-100 text-[11px] font-bold px-2 py-0.5 rounded-full">
                  +{aktifCount} Aktif / Published
                </span>
                <span className="bg-red-50 text-red-755 border border-red-100 text-[11px] font-bold px-2 py-0.5 rounded-full">
                  +{tidakAktifCount} Tidak Aktif / Draft
                </span>
              </div>
              {/* Baris 2: Pendapatan & Terjual */}
              <div className="flex items-center gap-2 text-sm text-slate-500 font-medium flex-wrap">
                <span>Total Terjual: <span className="font-bold text-slate-800">{totalTerjual} paket</span></span>
                <span>· Total Pendapatan: <span className="font-bold text-slate-800">Rp. {new Intl.NumberFormat("id-ID").format(totalPendapatan)}</span></span>
              </div>
            </div>
          </div>

          <div className="flex gap-2.5">
            <Button
              variant="outline"
              className="border-gray-200 text-slate-655 hover:bg-slate-50 hover:text-slate-800 text-sm font-semibold flex items-center gap-1.5"
              onClick={() => window.open("/bundling/catalog", "_blank")}
            >
              Katalog Publik
            </Button>
            <Button
              className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold flex items-center gap-1.5"
              onClick={openCreate}
            >
              + Buat Bundling Baru
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
              placeholder="Cari Bundling..."
              className="pl-9 bg-slate-50/50 border-slate-250 rounded-lg text-sm w-full focus:bg-white transition"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Right Filters */}
          <div className="flex items-center gap-3.5 flex-wrap">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-45 bg-white border-slate-250 rounded-lg text-xs font-semibold text-slate-600">
                <SelectValue placeholder="Semua Status" />
              </SelectTrigger>
              <SelectContent className="z-[200]">
                <SelectItem value="all">Semua Status</SelectItem>
                <SelectItem value="published">Publik (Published)</SelectItem>
                <SelectItem value="unpublished">Tidak Publik (Unpublished)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Table List */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-blue-50/80">
                  <th className="px-5 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">No</th>
                  <th className="px-5 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Tampilan</th>
                  <th className="px-5 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Nama Bundling</th>
                  <th className="px-5 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Harga</th>
                  <th className="px-5 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Jumlah Produk</th>
                  <th className="px-5 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Terjual</th>
                  <th className="px-5 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="px-5 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dashed divide-slate-200">
                {filteredBundlings.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center text-slate-400 py-16 text-sm">
                      There are no records to display
                    </td>
                  </tr>
                ) : (
                  filteredBundlings.map((bundling, index) => {
                    const statusIsPublik = bundling.status === "published";
                    return (
                      <tr key={bundling.id} className="hover:bg-slate-50/40 transition">
                        <td className="px-5 py-5 text-sm text-slate-550 font-semibold">{index + 1}</td>
                        <td className="px-5 py-5">
                          {bundling.cover_url ? (
                            <img
                              src={bundling.cover_url}
                              alt={bundling.nama}
                              className="h-10 w-14 object-cover rounded-lg border border-slate-100 shadow-sm"
                            />
                          ) : (
                            <div className="h-10 w-14 bg-slate-100 rounded-lg flex items-center justify-center border border-slate-200">
                              <Package className="h-5 w-5 text-slate-455" />
                            </div>
                          )}
                        </td>
                        <td className="px-5 py-5 text-sm font-bold text-slate-800 select-all max-w-[250px] truncate">
                          {bundling.nama}
                        </td>
                        <td className="px-5 py-5 text-sm text-slate-800 font-semibold whitespace-nowrap">
                          Rp {new Intl.NumberFormat("id-ID").format(bundling.harga)}
                        </td>
                        <td className="px-5 py-5 text-sm text-slate-600 font-semibold">
                          {bundling.jumlah_produk} produk
                        </td>
                        <td className="px-5 py-5 text-sm text-slate-655 font-semibold">
                          {bundling.jumlah_terjual} terjual
                        </td>
                        <td className="px-5 py-5">
                          <span
                            className={cn(
                              "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border",
                              statusIsPublik
                                ? "bg-green-50 text-green-700 border-green-200"
                                : "bg-red-50 text-red-755 border-red-200"
                            )}
                          >
                            <span className={cn("h-1.5 w-1.5 rounded-full mr-1.5", statusIsPublik ? "bg-green-500" : "bg-red-500")} />
                            {statusIsPublik ? "Publik" : "Draft"}
                          </span>
                        </td>
                        <td className="px-5 py-5 text-center whitespace-nowrap space-x-2">
                          <button
                            onClick={() => router.visit(`/bundling/${bundling.id}`)}
                            className="text-sm font-bold text-blue-600 hover:text-blue-800 underline transition"
                          >
                            Lihat
                          </button>
                          <button
                            onClick={() => router.visit(`/bundling/${bundling.id}/edit`)}
                            className="text-sm font-bold text-slate-600 hover:text-slate-800 underline transition"
                          >
                            Edit
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleStatusToggle(bundling.id, bundling.status);
                            }}
                            className={cn(
                              "text-sm font-bold underline transition",
                              statusIsPublik ? "text-yellow-600 hover:text-yellow-800" : "text-green-600 hover:text-green-800"
                            )}
                          >
                            {statusIsPublik ? "Draftkan" : "Publish"}
                          </button>
                          <button
                            onClick={() => handleDelete(bundling.id)}
                            className="text-sm font-bold text-red-600 hover:text-red-800 underline transition"
                          >
                            Hapus
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

      {/* CREATE DIALOG */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0">
          {/* Header */}
          <div className="bg-gradient-to-br from-blue-600 to-blue-700 p-6 rounded-t-lg sticky top-0 z-10">
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-white/20 rounded-lg p-2">
                <Package className="h-6 w-6 text-white" />
              </div>
              <DialogTitle className="text-white text-xl font-bold">
                Buat Bundling Baru
              </DialogTitle>
            </div>
            <p className="text-blue-100 text-sm leading-relaxed">
              Jual paket bundling produk anda dengan mudah dalam satu transaksi
            </p>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {/* Nama */}
            <div className="space-y-1">
              <Label className="text-sm font-medium text-gray-700">
                Nama Bundling <span className="text-red-500">*</span>
              </Label>
              <Input
                placeholder="Contoh: Paket Premium Web Developer"
                value={data.nama}
                onChange={(e) => setData("nama", e.target.value)}
              />
              {errors.nama && (
                <p className="text-xs text-red-500 mt-1">{errors.nama}</p>
              )}
            </div>

            {/* Pilih Produk */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">
                Pilih Produk Bundling <span className="text-red-500">*</span>
              </Label>
              <div className="flex gap-2 relative">
                <div className="w-1/3">
                  <Select value={filterProdukType} onValueChange={setFilterProdukType}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Semua Tipe" />
                    </SelectTrigger>
                    <SelectContent className="z-[200]">
                      <SelectItem value="all">Semua Tipe</SelectItem>
                      {uniqueProductTypes.map((type) => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="relative flex-1">
                  <Input
                    placeholder="Ketik Nama Produk..."
                    value={searchProduk}
                    onChange={(e) => setSearchProduk(e.target.value)}
                    className="pl-8"
                  />
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
                  
                  {searchProduk && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-[200] max-h-48 overflow-y-auto">
                    {filteredProducts.length > 0 ? (
                      filteredProducts.map((p) => (
                        <button
                          key={p.id_type}
                          type="button"
                          onClick={() => handleAddProduct(p)}
                          className="w-full text-left px-4 py-2 hover:bg-gray-50 border-b border-gray-100 last:border-0"
                        >
                          <p className="font-medium text-sm text-gray-800">{p.nama}</p>
                          <p className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">
                            {p.type} · Rp {p.harga.toLocaleString("id-ID")}
                          </p>
                        </button>
                      ))
                    ) : (
                      <p className="px-4 py-2 text-gray-500 text-xs">
                        Tidak ada produk ditemukan
                      </p>
                    )}
                  </div>
                )}
                </div>
              </div>

              {/* Selected Products List */}
              {data.produkIds.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-1">
                  {data.produkIds.map((p) => (
                    <div
                      key={p.id}
                      className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-full group"
                    >
                      <span className="text-xs font-medium text-blue-700">{p.nama}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveProduct(p.id)}
                        className="text-blue-400 hover:text-red-500 transition-colors"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              {errors.produkIds && (
                <p className="text-xs text-red-500 mt-1">{errors.produkIds}</p>
              )}
            </div>

            {/* Harga */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label className="text-sm font-medium text-gray-700">Harga (Rp) *</Label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-sm text-gray-500">Rp</span>
                  <Input
                    className="pl-9"
                    type="text"
                    placeholder="0"
                    value={data.harga ? formatRupiahInput(data.harga) : ""}
                    onChange={(e) => setData("harga", e.target.value.replace(/\D/g, ""))}
                  />
                </div>
                {errors.harga && (
                  <p className="text-xs text-red-500 mt-1">{errors.harga}</p>
                )}
              </div>

              <div className="space-y-1">
                <Label className="text-sm font-medium text-gray-700">
                  Harga Coret (Rp) <span className="text-gray-400 font-normal">(Opsional)</span>
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-sm text-gray-500">Rp</span>
                  <Input
                    className="pl-9"
                    type="text"
                    placeholder="0"
                    value={data.hargaCoret ? formatRupiahInput(data.hargaCoret) : ""}
                    onChange={(e) => setData("hargaCoret", e.target.value.replace(/\D/g, ""))}
                  />
                </div>
              </div>
            </div>

            {/* Deskripsi */}
            <div className="space-y-1">
              <Label className="text-sm font-medium text-gray-700">Deskripsi *</Label>
              <Textarea
                placeholder="Jelaskan bundling anda..."
                rows={3}
                value={data.deskripsi}
                onChange={(e) => setData("deskripsi", e.target.value)}
              />
              {errors.deskripsi && (
                <p className="text-xs text-red-500 mt-1">{errors.deskripsi}</p>
              )}
            </div>

            {/* Cover */}
            <div className="space-y-1">
              <Label className="text-sm font-medium text-gray-700">Cover Gambar</Label>
              <div
                className="border-2 border-dashed border-gray-200 rounded-lg p-6 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition"
                onClick={() => fileInputRef.current?.click()}
              >
                {coverPreview ? (
                  <div className="relative inline-block">
                    <img src={coverPreview} alt="preview" className="max-h-32 rounded-md object-cover" />
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setCoverPreview(null);
                        setData("cover", null);
                      }}
                      className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full shadow-sm hover:bg-red-600"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Upload className="h-8 w-8 text-gray-400 mx-auto" />
                    <p className="text-sm text-gray-500">Klik untuk unggah gambar cover</p>
                    <p className="text-xs text-gray-400">PNG, JPG, WEBP (maks. 5MB)</p>
                  </div>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleCoverChange}
              />
              {data.cover && <p className="text-[10px] text-green-600 mt-1 font-medium">✓ {data.cover.name}</p>}
            </div>

            {/* Tanggal Kadaluarsa */}
            <div className="space-y-1">
              <Label className="text-sm font-medium text-gray-700">
                Tanggal Kadaluarsa <span className="text-gray-400 font-normal">(Opsional)</span>
              </Label>
              <Popover open={dateOpen} onOpenChange={setDateOpen}>
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    className={cn(
                      "w-full flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-md bg-white text-sm text-left hover:border-gray-300 transition",
                      selectedDate ? "text-gray-800" : "text-gray-400"
                    )}
                  >
                    <CalendarIcon className="h-4 w-4 shrink-0 text-gray-400" />
                    {selectedDate
                      ? format(selectedDate, "dd MMMM yyyy", { locale: idLocale })
                      : "Pilih tanggal penutupan..."}
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 z-[200]" align="start">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={handleDateChange}
                    initialFocus
                  />
                  {selectedDate && (
                    <div className="p-2 border-t">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full text-xs text-gray-500"
                        onClick={() => handleDateChange(undefined)}
                      >
                        Hapus tanggal
                      </Button>
                    </div>
                  )}
                </PopoverContent>
              </Popover>
              <p className="text-[10px] text-gray-400">Link pembayaran akan ditutup otomatis pada tanggal ini.</p>
            </div>

            {/* Buttons */}
            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                className="flex-1 font-semibold"
                onClick={() => setCreateOpen(false)}
                disabled={isSubmitting}
              >
                Batal
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-md shadow-blue-200"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Menyimpan..." : "Buat Bundling"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
