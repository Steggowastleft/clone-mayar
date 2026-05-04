import DashboardLayout from "@/components/dashboard/dashboardlayout";
import { Head, router, useForm } from "@inertiajs/react";
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
  DialogHeader,
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
  GraduationCap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { DateRange } from "react-day-picker";

type Bootcamp = {
  id: number;
  name: string;
  batch: string;
  status: "published" | "unpublished" | "unlisted";
  date: string;
  participants: number;
};

type IndexProps = {
  bootcamps: Bootcamp[];
};

// ─── DatePickerField ───
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
            {value ? format(value, "dd MMMM yyyy", { locale: idLocale }) : "Pilih tanggal..."}
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0 z-[200]" align="start">
          <Calendar
            mode="single"
            selected={value}
            onSelect={(d) => { onChange(d); setOpen(false); }}
            initialFocus
          />
          {value && optional && (
            <div className="p-2 border-t">
              <Button variant="ghost" size="sm" className="w-full text-xs text-gray-500"
                onClick={() => { onChange(undefined); setOpen(false); }}>
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
  judul: "",
  kategori: "",
  tipePembayaran: "",
  harga: "",
  hargaCoret: "",
  deskripsi: "",
  instruksi: "",
  syaratKetentuan: "",
  maxPeserta: "",
  batasNilaiQuiz: "",
  redirectUrl: "",
  bisaAffiliate: false,
};

// ─── Main ───
export default function Index({ bootcamps }: IndexProps) {
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [dateFilter, setDateFilter] = useState<Date | undefined>(undefined);
  const [dateOpen, setDateOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({ ...defaultForm });
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [rangePenjualan, setRangePenjualan] = useState<DateRange | undefined>();
  const [rangePembelajaran, setRangePembelajaran] = useState<DateRange | undefined>();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Reset form setiap kali dialog dibuka
  const openCreate = () => {
    setFormData({ ...defaultForm });
    setCoverFile(null);
    setCoverPreview(null);
    setRangePenjualan(undefined);
    setRangePembelajaran(undefined);
    setCreateOpen(true);
  };

  const filteredBootcamps = bootcamps.filter((b) => {
    const matchStatus = statusFilter === "all" || b.status === statusFilter;
    const matchSearch = b.name.toLowerCase().includes(search.toLowerCase());
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
    if (!formData.judul.trim()) return alert("Judul tidak boleh kosong");
    setIsSubmitting(true);

    // Kirim ke backend via Inertia
    const payload = new FormData();
    payload.append("judul", formData.judul);
    payload.append("kategori", formData.kategori);
    payload.append("tipePembayaran", formData.tipePembayaran);
    payload.append("harga", formData.harga);
    payload.append("hargaCoret", formData.hargaCoret);
    payload.append("deskripsi", formData.deskripsi);
    payload.append("instruksi", formData.instruksi);
    payload.append("syaratKetentuan", formData.syaratKetentuan);
    payload.append("maxPeserta", formData.maxPeserta);
    payload.append("batasNilaiQuiz", formData.batasNilaiQuiz);
    payload.append("redirectUrl", formData.redirectUrl);
    payload.append("bisaAffiliate", formData.bisaAffiliate ? "1" : "0");
    if (rangePenjualan?.from)
  payload.append("tanggalMulaiJual", format(rangePenjualan.from, "yyyy-MM-dd"));

    if (rangePenjualan?.to)
  payload.append("tanggalTutupDaftar", format(rangePenjualan.to, "yyyy-MM-dd"));

    if (rangePembelajaran?.from)
  payload.append("tanggalMulaiPembelajaran", format(rangePembelajaran.from, "yyyy-MM-dd"));

    if (rangePembelajaran?.to)
  payload.append("tanggalBatasPembelajaran", format(rangePembelajaran.to, "yyyy-MM-dd"));
    if (coverFile) payload.append("cover", coverFile);

    router.post("/bootcamps", payload, {
      forceFormData: true,
      onSuccess: (page) => {
        // Backend harus return redirect ke /bootcamps/{id}
        setCreateOpen(false);
        setIsSubmitting(false);
      },
      onError: () => {
        setIsSubmitting(false);
      },
    });
  };

  const kategoriOptions = [
    "Teknologi & Pemrograman", "Desain & Kreatif", "Bisnis & Kewirausahaan",
    "Pemasaran Digital", "Data Science & AI", "Bahasa & Komunikasi",
    "Keuangan & Akuntansi", "Kesehatan & Kebugaran", "Pendidikan & Pengajaran", "Lainnya",
  ];

  return (
    <DashboardLayout title="Kelas Cohort / Bootcamp">

      <div className="flex gap-0 min-h-screen">
        {/* MAIN CONTENT */}
        <div className="flex-1 p-6">
          <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">PROJEK</p>
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-800">Kelas Cohort / Bootcamp (Batch)</h1>
            <div className="flex gap-2">
              <Button variant="outline" className="border-blue-500 text-blue-600 hover:bg-blue-50"
                onClick={() => window.open("/bootcamps/catalog",)}>
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
              <h2 className="font-semibold text-gray-700">Semua Kelas Cohort / Bootcamp</h2>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Input placeholder="Filter Halaman" className="pl-8 w-48 text-sm"
                    value={search} onChange={(e) => setSearch(e.target.value)} />
                  <svg className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <button className="text-gray-400 hover:text-gray-600"><Printer className="h-5 w-5" /></button>
                <button className="text-gray-400 hover:text-gray-600"><Download className="h-5 w-5" /></button>
              </div>
            </div>
            <div className="p-6">
              {filteredBootcamps.length === 0 ? (
                <p className="text-center text-gray-400 py-12 text-sm">There are no records to display</p>
              ) : (
                <div className="space-y-3">
                  {filteredBootcamps.map((bootcamp) => (
                    <div key={bootcamp.id} className="flex items-center justify-between p-4 border border-gray-100 rounded-lg hover:bg-gray-50 transition">
                      <div>
                        <p className="font-semibold text-gray-800">{bootcamp.name}</p>
                        <p className="text-sm text-gray-500">{bootcamp.batch} · {bootcamp.date} · {bootcamp.participants} peserta</p>
                      </div>
                      <div className="flex items-center gap-3">
                        {statusBadge(bootcamp.status)}
                        <Button size="sm" onClick={() => router.visit(`/bootcamps/${bootcamp.id}`)}>Detail</Button>
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
              <button className={cn(
                "w-full flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-md bg-white text-sm text-left text-gray-500 hover:border-gray-300 transition",
                dateFilter && "text-gray-800"
              )}>
                <CalendarIcon className="h-4 w-4 text-gray-400 shrink-0" />
                {dateFilter ? format(dateFilter, "dd MMM yyyy") : "Filter Berdasarkan Tanggal..."}
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar mode="single" selected={dateFilter}
                onSelect={(date) => { setDateFilter(date); setDateOpen(false); }} initialFocus />
              {dateFilter && (
                <div className="p-2 border-t">
                  <Button variant="ghost" size="sm" className="w-full text-xs text-gray-500"
                    onClick={() => { setDateFilter(undefined); setDateOpen(false); }}>
                    Reset Tanggal
                  </Button>
                </div>
              )}
            </PopoverContent>
          </Popover>

          <Input placeholder="Cari Kelas Cohort / Bootcamp" className="bg-white text-sm"
            value={search} onChange={(e) => setSearch(e.target.value)} />

          <div className="space-y-2">
            {filterButtons.map((btn) => (
              <button key={btn.value} onClick={() => setStatusFilter(btn.value)}
                className={cn("w-full px-4 py-2.5 rounded-md text-sm font-semibold tracking-wide transition",
                  statusFilter === btn.value
                    ? "bg-blue-600 text-white"
                    : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-100"
                )}>
                {btn.label}
              </button>
            ))}
          </div>

          <button onClick={() => window.open("/bootcamps/katalog", "_blank")}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gray-800 hover:bg-gray-900 text-white text-sm font-semibold rounded-md transition mt-2">
            KATALOG KELAS COHORT / BOOTCAMP
            <ExternalLink className="h-4 w-4" />
          </button>
          <p className="text-xs text-gray-500 text-center leading-relaxed">
            Katalog Kelas adalah halaman katalog online dimana semua Kelas Cohort / Bootcamp anda yang aktif ditampilkan.
          </p>

          <Dialog>
            <button className="w-full px-4 py-2.5 border border-gray-200 rounded-md text-sm font-semibold text-gray-700 hover:bg-gray-100 transition bg-white">
              INFO & TUTORIAL
            </button>
          </Dialog>

          <button onClick={openCreate}
            className="w-full px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-md transition">
            + Buat Bootcamp Baru
          </button>
        </div>
      </div>

      {/* CREATE DIALOG */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0">
          <div className="bg-gradient-to-br from-blue-600 to-blue-700 p-6 rounded-t-lg sticky top-0 z-10">
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-white/20 rounded-lg p-2">
                <GraduationCap className="h-6 w-6 text-white" />
              </div>
              <DialogTitle className="text-white text-xl font-bold">
                Buat Kelas Cohort / Bootcamp
              </DialogTitle>
            </div>
            <p className="text-blue-100 text-sm leading-relaxed">
              Mengadakan kelas berkelompok (batch / cohort-based) dengan banyak sesi semakin mudah dengan Mayar
            </p>
          </div>

          <div className="p-6 space-y-5">
            {/* Judul */}
            <div className="space-y-1">
              <Label className="text-sm font-medium text-gray-700">Judul / Nama Bootcamp <span className="text-red-500">*</span></Label>
              <Input placeholder="Contoh: Web Development Bootcamp Batch 5"
                value={formData.judul} onChange={(e) => setFormData({ ...formData, judul: e.target.value })} />
            </div>

            {/* Kategori */}
            <div className="space-y-1">
              <Label className="text-sm font-medium text-gray-700">Kategori <span className="text-red-500">*</span></Label>
              <Select value={formData.kategori} onValueChange={(v) => setFormData({ ...formData, kategori: v })}>
                <SelectTrigger><SelectValue placeholder="Pilih kategori bootcamp..." /></SelectTrigger>
                <SelectContent className="z-[200]">
                  {kategoriOptions.map((k) => <SelectItem key={k} value={k}>{k}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            {/* Tipe Pembayaran */}
            <div className="space-y-1">
              <Label className="text-sm font-medium text-gray-700">Tipe Pembayaran <span className="text-red-500">*</span></Label>
              <Select value={formData.tipePembayaran} onValueChange={(v) => setFormData({ ...formData, tipePembayaran: v })}>
                <SelectTrigger><SelectValue placeholder="Pilih tipe pembayaran..." /></SelectTrigger>
                <SelectContent className="z-[200]">
                  <SelectItem value="berbayar">Produk Berbayar</SelectItem>
                  <SelectItem value="gratis">Produk Gratis</SelectItem>
                  <SelectItem value="bayar_semaunya">Produk Bayar Semaunya</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {formData.tipePembayaran !== "gratis" && (
  <>
    {/* Harga */}
    <div className="space-y-1">
      <Label className="text-sm font-medium text-gray-700">Harga (Rp)</Label>
      <div className="relative">
        <span className="absolute left-3 top-2.5 text-sm text-gray-500">Rp</span>
        <Input
          className="pl-9"
          placeholder="0"
          type="number"
          value={formData.harga}
          onChange={(e) =>
            setFormData({ ...formData, harga: e.target.value })
          }
        />
      </div>
    </div>

    {/* Harga Coret */}
    <div className="space-y-1">
      <Label className="text-sm font-medium text-gray-700">
        Harga Coret (Rp){" "}
        <span className="text-gray-400 font-normal">(Opsional)</span>
      </Label>
      <div className="relative">
        <span className="absolute left-3 top-2.5 text-sm text-gray-500">Rp</span>
        <Input
          className="pl-9"
          placeholder="Harus lebih besar dari harga awal"
          type="number"
          value={formData.hargaCoret}
          onChange={(e) =>
            setFormData({ ...formData, hargaCoret: e.target.value })
          }
        />
      </div>

      {formData.harga &&
        formData.hargaCoret &&
        Number(formData.hargaCoret) <= Number(formData.harga) && (
          <p className="text-xs text-red-500">
            Harga coret harus lebih besar dari harga awal
          </p>
        )}
    </div>
  </>
)}

            {/* Deskripsi */}
            <div className="space-y-1">
              <Label className="text-sm font-medium text-gray-700">Deskripsi</Label>
              <Textarea placeholder="Tuliskan deskripsi bootcamp kamu..." rows={4}
                value={formData.deskripsi} onChange={(e) => setFormData({ ...formData, deskripsi: e.target.value })} />
            </div>

            {/* Cover */}
            <div className="space-y-1">
              <Label className="text-sm font-medium text-gray-700">Cover Gambar</Label>
              <div className="border-2 border-dashed border-gray-200 rounded-lg p-6 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition"
                onClick={() => fileInputRef.current?.click()}>
                {coverPreview ? (
                  <img src={coverPreview} alt="preview" className="max-h-40 mx-auto rounded-md object-cover" />
                ) : (
                  <div className="space-y-2">
                    <Upload className="h-8 w-8 text-gray-400 mx-auto" />
                    <p className="text-sm text-gray-500">Klik untuk unggah gambar cover</p>
                    <p className="text-xs text-gray-400">PNG, JPG, WEBP (maks. 5MB)</p>
                  </div>
                )}
              </div>
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleCoverChange} />
              {coverFile && <p className="text-xs text-green-600">✓ {coverFile.name}</p>}
            </div>

            {/* Instruksi */}
            <div className="space-y-1">
              <Label className="text-sm font-medium text-gray-700">Instruksi</Label>
              <p className="text-xs text-gray-500 leading-relaxed">
                Instruksi adalah catatan yang akan dilihat oleh pendaftar setelah melakukan pendaftaran/membayar.
                Anda bisa memasukkan instruksi masuk ke zoom, passwordnya, link gabung grup WA, formulir google, kontak cs dll disini.
              </p>
              <Textarea placeholder="Contoh: Silakan bergabung ke grup WhatsApp melalui link berikut..." rows={3}
                value={formData.instruksi} onChange={(e) => setFormData({ ...formData, instruksi: e.target.value })} />
            </div>

            {/* Syarat & Ketentuan */}
            <div className="space-y-1">
              <Label className="text-sm font-medium text-gray-700">Syarat & Ketentuan</Label>
              <Textarea placeholder="Tuliskan syarat dan ketentuan bootcamp..." rows={3}
                value={formData.syaratKetentuan} onChange={(e) => setFormData({ ...formData, syaratKetentuan: e.target.value })} />
            </div>

           {/* Dates */}
<div className="space-y-4">

  {/* Penjualan */}
  <div className="space-y-1">
    <Label className="text-sm font-medium text-gray-700">
      Periode Penjualan
    </Label>

    <Popover>
      <PopoverTrigger asChild>
        <button className="w-full px-3 py-2 border border-gray-200 rounded-md text-left text-sm hover:border-gray-300 transition">
          {rangePenjualan?.from && rangePenjualan?.to
            ? `${format(rangePenjualan.from, "dd MMM yyyy")} - ${format(rangePenjualan.to, "dd MMM yyyy")}`
            : "Pilih periode penjualan..."}
        </button>
      </PopoverTrigger>

      <PopoverContent className="w-auto p-0 z-[200]" align="start">
        <Calendar
          mode="range"
          selected={rangePenjualan}
          onSelect={setRangePenjualan}
          numberOfMonths={2}
        />
      </PopoverContent>
    </Popover>
  </div>

  {/* Pembelajaran */}
  <div className="space-y-1">
    <Label className="text-sm font-medium text-gray-700">
      Periode Pembelajaran
    </Label>

    <Popover>
      <PopoverTrigger asChild>
        <button className="w-full px-3 py-2 border border-gray-200 rounded-md text-left text-sm hover:border-gray-300 transition">
          {rangePembelajaran?.from && rangePembelajaran?.to
            ? `${format(rangePembelajaran.from, "dd MMM yyyy")} - ${format(rangePembelajaran.to, "dd MMM yyyy")}`
            : "Pilih periode pembelajaran..."}
        </button>
      </PopoverTrigger>

      <PopoverContent className="w-auto p-0 z-[200]" align="start">
        <Calendar
          mode="range"
          selected={rangePembelajaran}
          onSelect={setRangePembelajaran}
          numberOfMonths={2}
        />
      </PopoverContent>
    </Popover>
  </div>

</div>

            {/* Max Peserta */}
            <div className="space-y-1">
              <Label className="text-sm font-medium text-gray-700">Jumlah Maksimum Peserta</Label>
              <Input type="number" placeholder="Kosongkan untuk unlimited"
                value={formData.maxPeserta} onChange={(e) => setFormData({ ...formData, maxPeserta: e.target.value })} />
              <p className="text-xs text-gray-400">Kami akan menutup pendaftaran setelah melewati batas jumlah maksimal. Kosongkan untuk tanpa limit jumlah (unlimited).</p>
            </div>

            {/* Batas Nilai Quiz */}
            <div className="space-y-1">
              <Label className="text-sm font-medium text-gray-700">Batas Nilai Quiz untuk Sertifikat</Label>
              <Input type="number" placeholder="Kosongkan jika tidak dibatasi nilai" min={0} max={100}
                value={formData.batasNilaiQuiz} onChange={(e) => setFormData({ ...formData, batasNilaiQuiz: e.target.value })} />
              <p className="text-xs text-gray-400">Kami akan menutup akses sertifikat sebelum customer mencapai batas minimal nilai rata-rata quiz. Kosongkan jika akses sertifikat tidak dibatasi nilai rata-rata quiz.</p>
            </div>

            {/* Redirect URL */}
            <div className="space-y-1">
              <Label className="text-sm font-medium text-gray-700">Redirect URL <span className="text-gray-400 font-normal">(Opsional)</span></Label>
              <Input type="url" placeholder="https://example.com/thank-you"
                value={formData.redirectUrl} onChange={(e) => setFormData({ ...formData, redirectUrl: e.target.value })} />
              <p className="text-xs text-gray-400">Pelanggan akan dibawa ke halaman ini setelah membayar (opsional / bisa dikosongkan).</p>
            </div>

            {/* Affiliate Toggle */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div>
                <Label className="text-sm font-medium text-gray-700">Produk Bisa Diaffiliate</Label>
                <p className="text-xs text-gray-400">Izinkan affiliate untuk mempromosikan bootcamp ini</p>
              </div>
              <Switch checked={formData.bisaAffiliate}
                onCheckedChange={(v) => setFormData({ ...formData, bisaAffiliate: v })} />
            </div>

            {/* Buttons */}
            <div className="flex gap-3 pt-2">
              <Button variant="outline" className="flex-1" onClick={() => setCreateOpen(false)} disabled={isSubmitting}>
                Batal
              </Button>
              <Button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white" onClick={handleSubmit} disabled={isSubmitting}>
                {isSubmitting ? "Menyimpan..." : "Buat Kelas Bootcamp"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}