import DashboardLayout from "@/components/dashboard/dashboardlayout";
import { Head, router } from "@inertiajs/react";
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Printer,
  Download,
  ExternalLink,
  Users2,
  Wallet,
  Upload,
  Globe,
} from "lucide-react";
import { cn } from "@/lib/utils";

type Coaching = {
  id: number;
  nama: string;
  status: "published" | "unpublished" | "unlisted";
  tipe_pembayaran: "berbayar" | "gratis";
  harga: number;
  booking_url: string;
  total_penjualan: number;
};

type Props = {
  coachings: Coaching[];
};

const defaultForm = {
  nama: "",
  deskripsi: "",
  booking_url: "",
  harga: "",
  harga_coret: "",
  waktu_mulai_jual: "",
  tanggal_kadaluarsa: "",
  max_pembayaran: "",
  instruksi: "",
  syarat_ketentuan: "",
  redirect_url: "",
  bisa_affiliate: false,
};

export default function CoachingMentoringIndex({ coachings = [] }: Props) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [createOpen, setCreateOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pricingType, setPricingType] = useState<"gratis" | "berbayar" | "donation">("gratis");
  const [formData, setFormData] = useState({ ...defaultForm });
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const openCreate = () => {
    setFormData({ ...defaultForm });
    setCoverFile(null);
    setCoverPreview(null);
    setPricingType("gratis");
    setCreateOpen(true);
  };

  const filtered = coachings.filter((c) => {
    const matchSearch = c.nama.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || c.status === statusFilter;
    return matchSearch && matchStatus;
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
        return <Badge>-</Badge>;
    }
  };

  const tipeBadge = (tipe: string) =>
    tipe === "berbayar" ? (
      <Badge className="bg-blue-100 text-blue-700 border border-blue-200">Berbayar</Badge>
    ) : (
      <Badge className="bg-green-100 text-green-700 border border-green-200">Gratis</Badge>
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
    if (!formData.nama.trim()) return alert("Nama tidak boleh kosong");
    setIsSubmitting(true);

    const payload = new FormData();
    payload.append("nama", formData.nama);
    payload.append("deskripsi", formData.deskripsi);
    payload.append("booking_url", formData.booking_url);
    payload.append("tipe_pembayaran", pricingType === "berbayar" ? "berbayar" : "gratis");
    payload.append("harga", formData.harga || "0");
    payload.append("harga_coret", formData.harga_coret);
    payload.append("waktu_mulai_jual", formData.waktu_mulai_jual);
    payload.append("tanggal_kadaluarsa", formData.tanggal_kadaluarsa);
    payload.append("max_pembayaran", formData.max_pembayaran);
    payload.append("instruksi", formData.instruksi);
    payload.append("syarat_ketentuan", formData.syarat_ketentuan);
    payload.append("redirect_url", formData.redirect_url);
    payload.append("bisa_affiliate", formData.bisa_affiliate ? "1" : "0");
    if (coverFile) payload.append("cover", coverFile);

    router.post("/coaching-mentoring", payload, {
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
    <DashboardLayout>
      <Head title="Coaching & Mentoring" />

      <div className="flex gap-0 min-h-screen">
        {/* ── MAIN CONTENT ── */}
        <div className="flex-1 p-6">
          <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">PRODUK</p>
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-800">Coaching & Mentoring</h1>
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="border-blue-500 text-blue-600 hover:bg-blue-50"
                onClick={() => window.open("/coaching-mentoring/catalog", "_blank")}
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
              <h2 className="font-semibold text-gray-700">
                Semua Coaching ({filtered.length})
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
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
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
                  {filtered.map((c) => (
                    <div
                      key={c.id}
                      onClick={() => router.visit(`/coaching-mentoring/${c.id}`)}
                      className="flex items-center justify-between p-4 border border-gray-100 rounded-lg hover:bg-gray-50 transition cursor-pointer"
                    >
                      <div className="flex gap-3">
                        <Wallet className="text-blue-500 mt-1 shrink-0" />
                        <div>
                          <p className="font-semibold text-gray-800">{c.nama}</p>
                          <p className="text-sm text-gray-500 flex items-center gap-1">
                            <Users2 className="h-3 w-3" />
                            {c.total_penjualan} peserta
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {tipeBadge(c.tipe_pembayaran)}
                        {statusBadge(c.status)}
                        <Button size="sm" onClick={(e) => { e.stopPropagation(); router.visit(`/coaching-mentoring/${c.id}`); }}>
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
          <Input
            placeholder="Cari Coaching"
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
            onClick={() => window.open("/coaching-mentoring/catalog", "_blank")}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gray-800 hover:bg-gray-900 text-white text-sm font-semibold rounded-md transition mt-2"
          >
            KATALOG COACHING
            <ExternalLink className="h-4 w-4" />
          </button>
          <p className="text-xs text-gray-500 text-center leading-relaxed">
            Katalog Coaching adalah halaman katalog online dimana semua sesi coaching anda yang aktif ditampilkan.
          </p>

          <button className="w-full px-4 py-2.5 border border-gray-200 rounded-md text-sm font-semibold text-gray-700 hover:bg-gray-100 transition bg-white">
            INFO & TUTORIAL
          </button>

          <button
            onClick={openCreate}
            className="w-full px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-md transition"
          >
            + Buat Coaching Baru
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
                <Wallet className="h-6 w-6 text-white" />
              </div>
              <DialogTitle className="text-white text-xl font-bold">
                Buat Sesi Coaching & Mentoring
              </DialogTitle>
            </div>
            <p className="text-blue-100 text-sm leading-relaxed">
              Buat dan kelola sesi coaching/mentoring Anda dengan mudah
            </p>
          </div>

          <div className="p-6 space-y-5">
            {/* Nama */}
            <div className="space-y-1">
              <Label className="text-sm font-medium text-gray-700">
                Nama Sesi <span className="text-red-500">*</span>
              </Label>
              <Input
                required
                placeholder="Nama sesi coaching/mentoring"
                value={formData.nama}
                onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
              />
            </div>

            {/* Booking URL */}
            <div className="space-y-1">
              <Label className="text-sm font-medium text-gray-700">
                Booking URL <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <Globe className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                <Input
                  className="pl-9"
                  type="url"
                  required
                  placeholder="https://calendly.com/... atau link booking lainnya"
                  value={formData.booking_url}
                  onChange={(e) => setFormData({ ...formData, booking_url: e.target.value })}
                />
              </div>
              <p className="text-xs text-gray-400">Link Calendly, TidyCal, atau platform booking lainnya.</p>
            </div>

            {/* Tipe Harga */}
            <div className="space-y-1">
              <Label className="text-sm font-medium text-gray-700">Tipe Harga</Label>
              <select
                className="w-full border rounded-md p-2 text-sm"
                value={pricingType}
                onChange={(e) => setPricingType(e.target.value as any)}
              >
                <option value="gratis">Gratis</option>
                <option value="berbayar">Berbayar</option>
                <option value="donation">Bayar Seikhlasnya</option>
              </select>
            </div>

            {pricingType === "berbayar" && (
              <>
                <div className="space-y-1">
                  <Label className="text-sm font-medium text-gray-700">Harga (Rp)</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-sm text-gray-500">Rp</span>
                    <Input
                      className="pl-9"
                      type="number"
                      min={0}
                      value={formData.harga}
                      onChange={(e) => setFormData({ ...formData, harga: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <Label className="text-sm font-medium text-gray-700">
                    Harga Coret (Rp) <span className="text-gray-400">(Opsional)</span>
                  </Label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-sm text-gray-500">Rp</span>
                    <Input
                      className="pl-9"
                      type="number"
                      min={0}
                      value={formData.harga_coret}
                      onChange={(e) => setFormData({ ...formData, harga_coret: e.target.value })}
                    />
                  </div>
                  {formData.harga && formData.harga_coret &&
                    Number(formData.harga_coret) <= Number(formData.harga) && (
                      <p className="text-xs text-red-500">Harga coret harus lebih besar dari harga awal</p>
                    )}
                </div>
              </>
            )}

            {pricingType === "gratis" && (
              <p className="text-sm text-gray-500">Sesi ini gratis.</p>
            )}

            {pricingType === "donation" && (
              <div className="space-y-1">
                <Label className="text-sm font-medium text-gray-700">
                  Minimum Bayar (Opsional)
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-sm text-gray-500">Rp</span>
                  <Input
                    className="pl-9"
                    type="number"
                    min={0}
                    placeholder="Kosongkan kalau bebas"
                    value={formData.harga}
                    onChange={(e) => setFormData({ ...formData, harga: e.target.value })}
                  />
                </div>
                <p className="text-xs text-gray-500">User nanti bebas isi nominal saat checkout</p>
              </div>
            )}

            {/* Sales Control */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label className="text-sm font-medium text-gray-700">
                  Waktu Mulai Jual <span className="text-gray-400 font-normal">(Opsional)</span>
                </Label>
                <Input
                  type="date"
                  value={formData.waktu_mulai_jual}
                  onChange={(e) => setFormData({ ...formData, waktu_mulai_jual: e.target.value })}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-sm font-medium text-gray-700">
                  Tanggal Kadaluarsa <span className="text-gray-400 font-normal">(Opsional)</span>
                </Label>
                <Input
                  type="date"
                  value={formData.tanggal_kadaluarsa}
                  onChange={(e) => setFormData({ ...formData, tanggal_kadaluarsa: e.target.value })}
                />
              </div>
            </div>

            {/* Max Pembayaran */}
            <div className="space-y-1">
              <Label className="text-sm font-medium text-gray-700">Max Pembayaran (Quota)</Label>
              <Input
                type="number"
                placeholder="Biarkan kosong untuk unlimited"
                min={1}
                value={formData.max_pembayaran}
                onChange={(e) => setFormData({ ...formData, max_pembayaran: e.target.value })}
              />
              <p className="text-xs text-gray-400">Pendaftaran akan ditutup otomatis setelah batas tercapai.</p>
            </div>

            {/* Deskripsi */}
            <div className="space-y-1">
              <Label className="text-sm font-medium text-gray-700">
                Deskripsi <span className="text-red-500">*</span>
              </Label>
              <Textarea
                required
                placeholder="Jelaskan tentang sesi coaching/mentoring Anda"
                rows={4}
                value={formData.deskripsi}
                onChange={(e) => setFormData({ ...formData, deskripsi: e.target.value })}
              />
            </div>

            {/* Cover */}
            <div className="space-y-1">
              <Label className="text-sm font-medium text-gray-700">Cover Gambar</Label>
              <div
                className="border-2 border-dashed border-gray-200 rounded-lg p-6 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition"
                onClick={() => fileInputRef.current?.click()}
              >
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
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleCoverChange}
              />
              {coverFile && <p className="text-xs text-green-600">✓ {coverFile.name}</p>}
            </div>

            {/* Instruksi */}
            <div className="space-y-1">
              <Label className="text-sm font-medium text-gray-700">Instruksi Setelah Daftar</Label>
              <p className="text-xs text-gray-500 leading-relaxed">
                Catatan yang akan dilihat peserta setelah membayar. Bisa berisi link, password, grup WA, dsb.
              </p>
              <Textarea
                placeholder="Contoh: Silakan bergabung ke grup WhatsApp melalui link berikut..."
                rows={3}
                value={formData.instruksi}
                onChange={(e) => setFormData({ ...formData, instruksi: e.target.value })}
              />
            </div>

            {/* Syarat & Ketentuan */}
            <div className="space-y-1">
              <Label className="text-sm font-medium text-gray-700">Syarat & Ketentuan</Label>
              <Textarea
                placeholder="Tuliskan syarat dan ketentuan yang berlaku..."
                rows={3}
                value={formData.syarat_ketentuan}
                onChange={(e) => setFormData({ ...formData, syarat_ketentuan: e.target.value })}
              />
            </div>

            {/* Redirect URL */}
            <div className="space-y-1">
              <Label className="text-sm font-medium text-gray-700">
                Redirect URL <span className="text-gray-400 font-normal">(Opsional)</span>
              </Label>
              <Input
                type="url"
                placeholder="https://example.com/thank-you"
                value={formData.redirect_url}
                onChange={(e) => setFormData({ ...formData, redirect_url: e.target.value })}
              />
              <p className="text-xs text-gray-400">Pelanggan akan dibawa ke halaman ini setelah membayar.</p>
            </div>

            {/* Affiliate Toggle */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div>
                <Label className="text-sm font-medium text-gray-700">Produk Bisa Diaffiliate</Label>
                <p className="text-xs text-gray-400">Izinkan affiliate untuk mempromosikan sesi ini</p>
              </div>
              <Switch
                checked={formData.bisa_affiliate}
                onCheckedChange={(v) => setFormData({ ...formData, bisa_affiliate: v })}
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
                {isSubmitting ? "Menyimpan..." : "Buat Sesi"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}