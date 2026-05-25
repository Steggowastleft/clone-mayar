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
  Book,
  Clock,
  Globe,
  ShoppingBag,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Types ───
type Ebook = {
  id: number;
  nama: string;
  status: "published" | "unpublished" | "unlisted";
  tipe_pembayaran: string | null;
  harga: number;
  terjual: number;
  created_at: string;
};

type IndexProps = {
  produk: Ebook[];
  createOpen?: boolean;
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
    if (!d) { onChange(undefined); setOpen(false); return; }
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
                onClick={() => { onChange(undefined); setOpen(false); }}
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
  url: "",
  tipe_pembayaran: "berbayar",
  harga: "",
  harga_coret: "",
  deskripsi: "",
  catatan: "",
  max_pembayaran: "",
  sumber_file: "upload",
  file_url: "",
  bisa_didownload: true,
  author: "",
  isbn: "",
  format: "",
  bahasa: "",
  jumlah_halaman: "",
};

// ─── Formatter ───
const formatRupiah = (number: string | number) => {
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
};

// ─── Main ───
export default function Index({ produk = [], createOpen: initialCreateOpen = false }: IndexProps) {
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [dateFilter, setDateFilter] = useState<Date | undefined>(undefined);
  const [dateOpen, setDateOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(initialCreateOpen);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({ ...defaultForm });
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [tanggalMulaiJual, setTanggalMulaiJual] = useState<Date | undefined>();
  const [tanggalKadaluarsa, setTanggalKadaluarsa] = useState<Date | undefined>();
  const [tanggalPublish, setTanggalPublish] = useState<Date | undefined>();
  const [sourceFile, setSourceFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const openCreate = () => {
    setFormData({ ...defaultForm });
    setCoverFile(null);
    setCoverPreview(null);
    setSourceFile(null);
    setTanggalMulaiJual(undefined);
    setTanggalKadaluarsa(undefined);
    setTanggalPublish(undefined);
    setCreateOpen(true);
  };

  const filtered = (produk ?? []).filter((w) => {
    const matchStatus = statusFilter === "all" || w.status === statusFilter;
    const matchSearch = w.nama.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  const statusBadge = (status: string) => {
    switch (status) {
      case "published": return <Badge className="bg-green-500 text-white">Published</Badge>;
      case "unpublished": return <Badge className="bg-yellow-500 text-white">Unpublished</Badge>;
      case "unlisted": return <Badge className="bg-gray-500 text-white">Unlisted</Badge>;
      default: return <Badge>Unknown</Badge>;
    }
  };

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
    if (!formData.nama.trim()) return alert("Nama Produk tidak boleh kosong");
    if (!formData.deskripsi.trim()) return alert("Deskripsi tidak boleh kosong");
    if (!formData.sumber_file) return alert("Sumber File harus dipilih");
    
    setIsSubmitting(true);

    const payload = new FormData();
    payload.append("nama", formData.nama);
    payload.append("url", formData.url);
    payload.append("tipe_pembayaran", formData.tipe_pembayaran);
    
    if (formData.tipe_pembayaran !== "gratis") {
        const rawHarga = formData.harga.replace(/\./g, "");
        payload.append("harga", rawHarga || "0");
        
        const rawHargaCoret = formData.harga_coret.replace(/\./g, "");
        if (rawHargaCoret) payload.append("harga_coret", rawHargaCoret);
    }

    payload.append("max_pembayaran", formData.max_pembayaran);
    payload.append("deskripsi", formData.deskripsi);
    payload.append("catatan", formData.catatan);
    payload.append("sumber_file", formData.sumber_file);
    if (formData.sumber_file === "upload" && sourceFile) {
      payload.append("file", sourceFile);
    } else if (formData.sumber_file === "link") {
      payload.append("file_url", formData.file_url);
    }
    payload.append("bisa_didownload", formData.bisa_didownload ? "1" : "0");
    
    payload.append("author", formData.author);
    payload.append("isbn", formData.isbn);
    payload.append("format", formData.format);
    payload.append("bahasa", formData.bahasa);
    payload.append("jumlah_halaman", formData.jumlah_halaman);

    if (tanggalMulaiJual) payload.append("tanggal_mulai_jual", format(tanggalMulaiJual, "yyyy-MM-dd HH:mm:ss"));
    if (tanggalKadaluarsa) payload.append("tanggal_kadaluarsa", format(tanggalKadaluarsa, "yyyy-MM-dd HH:mm:ss"));
    if (tanggalPublish) payload.append("tanggal_publish", format(tanggalPublish, "yyyy-MM-dd"));
    if (coverFile) payload.append("cover", coverFile);

    router.post("/ebook", payload, {
      forceFormData: true,
      onSuccess: () => { setCreateOpen(false); setIsSubmitting(false); },
      onError: () => { setIsSubmitting(false); },
    });
  };

  return (
    <DashboardLayout title="Ebook">
      <div className="flex gap-0 min-h-screen">
        {/* ── MAIN CONTENT ── */}
        <div className="flex-1 p-6">
          <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">PROJEK</p>
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-800">Ebook</h1>
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="border-blue-500 text-blue-600 hover:bg-blue-50"
                onClick={() => window.open("/ebook/catalog", "_blank")}
              >
                PRODUK
              </Button>
              <Button className="bg-blue-600 hover:bg-blue-700 text-white" onClick={openCreate}>
                + BUAT
              </Button>
            </div>
          </div>

          {/* Table Panel */}
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="font-semibold text-gray-700">Semua Ebook</h2>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Input
                    placeholder="Filter Halaman"
                    className="pl-8 w-48 text-sm"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                  <ShoppingBag className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
                </div>
                <button className="text-gray-400 hover:text-gray-600"><Printer className="h-5 w-5" /></button>
                <button className="text-gray-400 hover:text-gray-600"><Download className="h-5 w-5" /></button>
              </div>
            </div>
            <div className="p-6">
              {filtered.length === 0 ? (
                <p className="text-center text-gray-400 py-12 text-sm">There are no records to display</p>
              ) : (
                <div className="space-y-3">
                  {filtered.map((w) => (
                    <div
                      key={w.id}
                      className="flex items-center justify-between p-4 border border-gray-100 rounded-lg hover:bg-gray-50 transition"
                    >
                      <div>
                        <p className="font-semibold text-gray-800">{w.nama}</p>
                        <p className="text-sm text-gray-500">
                          {w.terjual} terjual
                        </p>
                        <p className="text-sm font-medium text-blue-600">
                          {w.harga === 0 ? "Gratis" : `Rp ${w.harga.toLocaleString("id-ID")}`}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        {statusBadge(w.status)}
                        <Button size="sm" onClick={() => router.visit(`/ebook/${w.id}`)}>
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
          <Popover open={dateOpen} onOpenChange={setDateOpen}>
            <PopoverTrigger asChild>
              <button className={cn(
                "w-full flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-md bg-white text-sm text-left text-gray-500 hover:border-gray-300 transition",
                dateFilter && "text-gray-800"
              )}>
                <CalendarIcon className="h-4 w-4 text-gray-400 shrink-0" />
                {dateFilter ? format(dateFilter, "dd MMM yyyy") : "Filter Berdasarkan Tanggal..."}
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                mode="single"
                selected={dateFilter}
                onSelect={(date) => { setDateFilter(date); setDateOpen(false); }}
                initialFocus
              />
              {dateFilter && (
                <div className="p-2 border-t">
                  <Button
                    variant="ghost" size="sm"
                    className="w-full text-xs text-gray-500"
                    onClick={() => { setDateFilter(undefined); setDateOpen(false); }}
                  >
                    Reset Tanggal
                  </Button>
                </div>
              )}
            </PopoverContent>
          </Popover>

          <Input
            placeholder="Cari Ebook"
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
            onClick={() => window.open("/ebook/catalog", "_blank")}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gray-800 hover:bg-gray-900 text-white text-sm font-semibold rounded-md transition mt-2"
          >
            KATALOG EBOOK
            <ExternalLink className="h-4 w-4" />
          </button>
          <p className="text-xs text-gray-500 text-center leading-relaxed">
            Katalog adalah halaman online dimana semua Ebook Anda yang aktif ditampilkan.
          </p>

          <button
            onClick={openCreate}
            className="w-full px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-md transition"
          >
            + Buat Ebook Baru
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
                <Book className="h-6 w-6 text-white" />
              </div>
              <DialogTitle className="text-white text-xl font-bold">
                Buat E-Book
              </DialogTitle>
            </div>
            <p className="text-blue-100 text-sm leading-relaxed">
              Penjualan e-book semakin mudah dengan otomasi download dan halaman produk keren
            </p>
          </div>

          <div className="p-6 space-y-5">
            {/* Judul */}
            <div className="space-y-1">
              <Label className="text-sm font-medium text-gray-700">
                Nama Produk <span className="text-red-500">*</span>
              </Label>
              <Input
                placeholder="Masukkan nama produk"
                value={formData.nama}
                onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
              />
            </div>

            {/* URL */}
            <div className="space-y-1">
              <Label className="text-sm font-medium text-gray-700">
                https://web.mayar.id/ebook <span className="text-gray-400 font-normal">(Opsional)</span>
              </Label>
              <div className="relative">
                <Globe className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                <Input
                  className="pl-9"
                  type="text"
                  placeholder="custom-url-path"
                  value={formData.url}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                />
              </div>
            </div>

            {/* Tipe Pembayaran */}
            <div className="space-y-1">
              <Label className="text-sm font-medium text-gray-700">Tipe Pembayaran</Label>
              <Select
                value={formData.tipe_pembayaran}
                onValueChange={(v) => setFormData({ ...formData, tipe_pembayaran: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih tipe pembayaran..." />
                </SelectTrigger>
                <SelectContent className="z-[200]">
                  <SelectItem value="berbayar">Produk Berbayar</SelectItem>
                  <SelectItem value="gratis">Gratis</SelectItem>
                  <SelectItem value="bayar_semaunya">Bayar Semaunya</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {(formData.tipe_pembayaran === "berbayar" || formData.tipe_pembayaran === "bayar_semaunya") && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label className="text-sm font-medium text-gray-700">Harga <span className="text-red-500">*</span></Label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-sm text-gray-500">Rp</span>
                    <Input
                      className="pl-9"
                      type="text"
                      value={formData.harga ? formatRupiah(formData.harga) : ""}
                      onChange={(e) => {
                          const val = e.target.value.replace(/\D/g, "");
                          setFormData({ ...formData, harga: val })
                      }}
                    />
                  </div>
                  <p className="text-xs text-gray-400">Penagihan ini menggunakan mata uang IDR (Rupiah)</p>
                </div>
                <div className="space-y-1">
                  <Label className="text-sm font-medium text-gray-700">Harga Coret (opsional)</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-sm text-gray-500">Rp</span>
                    <Input
                      className="pl-9"
                      type="text"
                      value={formData.harga_coret ? formatRupiah(formData.harga_coret) : ""}
                      onChange={(e) => {
                          const val = e.target.value.replace(/\D/g, "");
                          setFormData({ ...formData, harga_coret: val })
                      }}
                    />
                  </div>
                  <p className="text-xs text-gray-400">Harga coret harus lebih besar dari harga utama.</p>
                </div>
              </div>
            )}

            {/* Deskripsi */}
            <div className="space-y-1">
              <Label className="text-sm font-medium text-gray-700">Deskripsi <span className="text-red-500">*</span></Label>
              <Textarea
                placeholder="Tuliskan deskripsi..."
                rows={4}
                value={formData.deskripsi}
                onChange={(e) => setFormData({ ...formData, deskripsi: e.target.value })}
              />
            </div>

            {/* Cover */}
            <div className="space-y-1">
              <Label className="text-sm font-medium text-gray-700">Cover (gambar untuk promo)</Label>
              <div
                className="border-2 border-dashed border-gray-200 rounded-lg p-6 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition"
                onClick={() => fileInputRef.current?.click()}
              >
                {coverPreview ? (
                  <img src={coverPreview} alt="preview" className="max-h-40 mx-auto rounded-md object-cover" />
                ) : (
                  <div className="space-y-2">
                    <Upload className="h-8 w-8 text-gray-400 mx-auto" />
                    <p className="text-sm text-gray-500">Drag & drop image</p>
                    <p className="text-xs text-gray-400">urutan dari image pada saat "Add File" mengikuti nama file image</p>
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
              {coverFile && <p className="text-xs text-green-600">✓ {coverFile.name}</p>}
            </div>

            {/* Sales Control */}
            <div className="grid grid-cols-2 gap-4">
              <DateTimePickerField
                label="Waktu Mulai Penjualan"
                value={tanggalMulaiJual}
                onChange={setTanggalMulaiJual}
                optional
              />
              <DateTimePickerField
                label="Tanggal Kadaluarsa"
                value={tanggalKadaluarsa}
                onChange={setTanggalKadaluarsa}
                optional
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <p className="text-xs text-gray-500 leading-relaxed">Kami akan membuka link pembayaran pada tanggal dan waktu yang anda pilih. Opsional, kosongkan untuk langsung membuka penjualan.</p>
              <p className="text-xs text-gray-500 leading-relaxed">Kami akan menutup link pembayaran pada tanggal ini (opsional).</p>
            </div>

            {/* Catatan */}
            <div className="space-y-1">
              <Label className="text-sm font-medium text-gray-700">Catatan</Label>
              <p className="text-xs text-gray-500 leading-relaxed">
                Catatan akan dilihat oleh pendaftar/pembeli setelah melakukan pendaftaran/membayar (opsional).
              </p>
              <Textarea
                placeholder="Tambahkan catatan khusus..."
                rows={2}
                value={formData.catatan}
                onChange={(e) => setFormData({ ...formData, catatan: e.target.value })}
              />
            </div>

            {/* Max Pembayaran */}
            <div className="space-y-1">
              <Label className="text-sm font-medium text-gray-700">Maksimum Jumlah Pembayaran (Kuota / QTY)</Label>
              <Input
                type="number"
                placeholder="Kosongkan untuk tanpa limit jumlah (unlimited)"
                min={1}
                value={formData.max_pembayaran}
                onChange={(e) => setFormData({ ...formData, max_pembayaran: e.target.value })}
              />
              <p className="text-xs text-gray-400">
                Kami akan menutup link pembayaran setelah melewati batas jumlah maksimal. Kosongkan untuk tanpa limit jumlah (unlimited)
              </p>
            </div>

            <div className="space-y-1">
                <Label className="text-sm font-medium text-gray-700">Sumber File <span className="text-red-500">*</span></Label>
                <Select
                  value={formData.sumber_file}
                  onValueChange={(v) => setFormData({ ...formData, sumber_file: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="-- Pilih Sumber File --" />
                  </SelectTrigger>
                  <SelectContent className="z-[200]">
                    <SelectItem value="upload">Upload File</SelectItem>
                    <SelectItem value="link">Gunakan Link External</SelectItem>
                  </SelectContent>
                </Select>

                {formData.sumber_file === "upload" && (
                  <div className="mt-2">
                    <Input type="file" onChange={(e) => setSourceFile(e.target.files?.[0] || null)} />
                  </div>
                )}
                {formData.sumber_file === "link" && (
                  <div className="mt-2">
                    <Input 
                      placeholder="https://..." 
                      value={formData.file_url} 
                      onChange={(e) => setFormData({ ...formData, file_url: e.target.value })} 
                    />
                  </div>
                )}
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div>
                  <Label className="text-sm font-medium text-gray-700">Bisa didownload ?</Label>
                  <p className="text-xs text-gray-400">Aktif / tidak aktif</p>
                </div>
                <Switch
                  checked={formData.bisa_didownload}
                  onCheckedChange={(v) => setFormData({ ...formData, bisa_didownload: v })}
                />
            </div>

            {/* Detail Tambahan */}
            <div className="pt-4 border-t border-gray-100">
              <h3 className="font-semibold text-gray-700 mb-3">Detail Tambahan (opsional)</h3>
              
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
                    placeholder="ISBN"
                    value={formData.isbn}
                    onChange={(e) => setFormData({ ...formData, isbn: e.target.value })}
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-sm font-medium text-gray-700">Format</Label>
                  <Select
                    value={formData.format}
                    onValueChange={(v) => setFormData({ ...formData, format: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="-- Pilih Opsi --" />
                    </SelectTrigger>
                    <SelectContent className="z-[200]">
                      <SelectItem value="pdf">PDF</SelectItem>
                      <SelectItem value="epub">EPUB</SelectItem>
                      <SelectItem value="mobi">MOBI</SelectItem>
                      <SelectItem value="azw">AZW</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1">
                  <Label className="text-sm font-medium text-gray-700">Bahasa</Label>
                  <Input
                    placeholder="Bahasa"
                    value={formData.bahasa}
                    onChange={(e) => setFormData({ ...formData, bahasa: e.target.value })}
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-sm font-medium text-gray-700">Jumlah Halaman</Label>
                  <Input
                    type="number"
                    placeholder="Jumlah Halaman"
                    value={formData.jumlah_halaman}
                    onChange={(e) => setFormData({ ...formData, jumlah_halaman: e.target.value })}
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-sm font-medium text-gray-700">Tanggal Publish</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <button
                        className={cn(
                          "w-full flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-md bg-white text-sm text-left hover:border-gray-300 transition",
                          tanggalPublish ? "text-gray-800" : "text-gray-400"
                        )}
                      >
                        <CalendarIcon className="h-4 w-4 shrink-0 text-gray-400" />
                        {tanggalPublish
                          ? format(tanggalPublish, "dd MMMM yyyy", { locale: idLocale })
                          : "Pilih tanggal atau kosongkan"}
                      </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 z-[200]" align="start">
                      <Calendar
                        mode="single"
                        selected={tanggalPublish}
                        onSelect={(d) => setTanggalPublish(d)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

              </div>
            </div>

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
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                onClick={handleSubmit}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Menyimpan..." : "Buat E-book"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
