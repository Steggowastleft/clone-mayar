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
} from "lucide-react";
import { useState, useRef } from "react";
import { cn } from "@/lib/utils";

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
      router.delete(`/bundling/${id}/`, {
        onSuccess: () => {
          // Refresh page
          router.visit("/bundling/");
        },
      });
    }
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

    router.post("/bundling/", payload, {
      forceFormData: true,
      onSuccess: () => {
        setCreateOpen(false);
        setIsSubmitting(false);
        router.visit("/bundling/");
      },
      onError: () => setIsSubmitting(false),
    });
  };

  const filterButtons = [
    { label: "SEMUA", value: "all" },
    { label: "PUBLISHED", value: "published" },
    { label: "UNPUBLISHED", value: "unpublished" },
  ];

  return (
    <DashboardLayout title="Bundling Produk">
      <Head title="Bundling Produk" />

      <div className="flex gap-0 min-h-screen">
        {/* MAIN CONTENT */}
        <div className="flex-1 p-6">
          <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">
            PRODUK
          </p>
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-800">
              Bundling Produk
            </h1>
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="border-blue-500 text-blue-600 hover:bg-blue-50"
                onClick={() => window.open("/bundling/", "_blank")}
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
                Semua Bundling Produk
              </h2>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Input
                    placeholder="Filter Halaman"
                    className="pl-8 w-48 text-sm"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
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
              {filteredBundlings.length === 0 ? (
                <p className="text-center text-gray-400 py-12 text-sm">
                  There are no records to display
                </p>
              ) : (
                <div className="space-y-3">
                  {filteredBundlings.map((bundling) => (
                    <div
                      key={bundling.id}
                      className="flex items-center justify-between p-4 border border-gray-100 rounded-lg hover:bg-gray-50 transition"
                    >
                      <div className="flex items-center gap-4 flex-1">
                        {bundling.cover_url ? (
                          <img
                            src={bundling.cover_url}
                            alt={bundling.nama}
                            className="h-12 w-12 rounded-md object-cover"
                          />
                        ) : (
                          <div className="h-12 w-12 rounded-md bg-gray-100 flex items-center justify-center text-gray-400">
                            <Package className="h-6 w-6" />
                          </div>
                        )}
                        <div>
                          <p className="font-semibold text-gray-800">
                            {bundling.nama}
                          </p>
                          <p className="text-sm text-gray-500">
                            Rp {bundling.harga.toLocaleString("id-ID")} ·{" "}
                            {bundling.jumlah_produk} produk · Terjual{" "}
                            {bundling.jumlah_terjual}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {statusBadge(bundling.status)}
                        <Button
                          size="sm"
                          onClick={() =>
                            router.visit(`/bundling/${bundling.id}/`)
                          }
                        >
                          Detail
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() =>
                            router.visit(`/bundling/${bundling.id}/edit/`)
                          }
                        >
                          <Edit className="h-4 w-4 text-gray-500" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-red-500 hover:text-red-600"
                          onClick={() => handleDelete(bundling.id)}
                        >
                          <Trash2 className="h-4 w-4" />
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
          <div className="relative">
            <Input
              placeholder="Cari Bundling"
              className="bg-white text-sm pl-8"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
          </div>

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
            onClick={() => window.open("/bundling/catalog", "_blank")}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gray-800 hover:bg-gray-900 text-white text-sm font-semibold rounded-md transition mt-2"
          >
            KATALOG BUNDLING
            <ExternalLink className="h-4 w-4" />
          </button>
          <p className="text-xs text-gray-500 text-center leading-relaxed">
            Katalog Bundling adalah halaman katalog online dimana semua paket bundling anda ditampilkan.
          </p>

          <button className="w-full px-4 py-2.5 border border-gray-200 rounded-md text-sm font-semibold text-gray-700 hover:bg-gray-100 transition bg-white">
            INFO & TUTORIAL
          </button>

          <button
            onClick={openCreate}
            className="w-full px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-md transition"
          >
            + Buat Bundling Baru
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
                    type="number"
                    min={0}
                    value={data.harga}
                    onChange={(e) => setData("harga", e.target.value)}
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
                    type="number"
                    min={0}
                    value={data.hargaCoret}
                    onChange={(e) => setData("hargaCoret", e.target.value)}
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
