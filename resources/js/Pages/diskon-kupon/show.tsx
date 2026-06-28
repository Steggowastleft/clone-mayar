import { Head, router } from "@inertiajs/react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Ticket, ArrowLeft, Copy, Power, Trash2, Sparkles } from "lucide-react";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import DashboardLayout from "@/components/dashboard/dashboardlayout";
import { cn } from "@/lib/utils";
import { DateRangePicker } from "@/components/dashboard/datepickers";
import { DateRange } from "react-day-picker";
import { format } from "date-fns";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Diskon = {
  id: number;
  nama: string;
  kode_kupon: string;
  untuk_produk: "semua" | "pilih";
  produk_ids: string[];
  produk_terpilih: { id: string; nama: string; tipe: string }[];
  tipe_diskon: "persentase" | "nominal";
  besaran: number;
  minimum_pembelian: number | null;
  tipe_kupon: "berulang" | "sekali";
  untuk_pelanggan: "semua" | "pilih";
  batas_pemakaian: number | null;
  waktu_mulai: string | null;
  tanggal_kadaluarsa: string | null;
  status: "aktif" | "nonaktif";
  jumlah_dipakai: number;
  is_aktif: boolean;
  created_at: string;
  riwayat_penggunaan?: { nama: string; tipe: string; kali_dipakai: number }[];
};

type Produk = {
  id: string;
  nama: string;
  tipe: string;
  harga: number;
};

type Props = {
  diskon: Diskon;
  produk: Produk[];
};

const formatRupiahInput = (value: string | number) => {
  if (value === undefined || value === null || value === "") return "";
  const clean = String(value).replace(/\D/g, "");
  return clean ? new Intl.NumberFormat("id-ID").format(Number(clean)) : "";
};

export default function DiskonShow({ diskon, produk }: Props) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isToggling, setIsToggling] = useState(false);
  const [dateRange, setDateRange] = useState<DateRange | undefined>(() => {
    const from = diskon.waktu_mulai ? new Date(diskon.waktu_mulai) : undefined;
    const to = diskon.tanggal_kadaluarsa ? new Date(diskon.tanggal_kadaluarsa) : undefined;
    return { from, to };
  });
  const [productSearch, setProductSearch] = useState("");
  const [productTypeFilter, setProductTypeFilter] = useState("all");

  const filteredProducts = produk.filter((p) => {
    const nama = p.nama ?? "";
    const tipe = p.tipe ?? "";
    const matchSearch = nama.toLowerCase().includes(productSearch.toLowerCase());
    const matchType =
      productTypeFilter === "all" ||
      tipe.toLowerCase() === productTypeFilter.toLowerCase() ||
      (productTypeFilter.toLowerCase().includes("coaching") && tipe.toLowerCase().includes("coaching"));
    return matchSearch && matchType;
  });

  const [form, setForm] = useState({
    nama: diskon.nama,
    untuk_produk: diskon.untuk_produk,
    produk_ids: diskon.produk_ids || [],
    tipe_diskon: diskon.tipe_diskon,
    besaran: String(diskon.besaran),
    minimum_pembelian: diskon.minimum_pembelian ? String(diskon.minimum_pembelian) : "",
    tipe_kupon: diskon.tipe_kupon,
    untuk_pelanggan: diskon.untuk_pelanggan,
    kode_kupon: diskon.kode_kupon,
    batas_pemakaian: diskon.batas_pemakaian ? String(diskon.batas_pemakaian) : "",
    waktu_mulai: diskon.waktu_mulai || "",
    tanggal_kadaluarsa: diskon.tanggal_kadaluarsa || "",
    status: diskon.status,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.nama.trim() || !form.kode_kupon.trim() || !form.besaran.trim()) {
      toast.error("Nama Diskon, Kode Kupon, dan Besaran wajib diisi");
      return;
    }

    setIsSubmitting(true);

    const data = {
      ...form,
      besaran: Number(form.besaran),
      minimum_pembelian: form.minimum_pembelian ? Number(form.minimum_pembelian) : null,
      batas_pemakaian: form.batas_pemakaian ? Number(form.batas_pemakaian) : null,
      produk_ids: form.untuk_produk === "pilih" ? form.produk_ids : null,
    };

    router.put(`/diskon-kupon/${diskon.id}`, data, {
      onSuccess: () => {
        toast.success("Diskon berhasil diperbarui!");
        setIsSubmitting(false);
      },
      onError: () => {
        toast.error("Gagal memperbarui diskon");
        setIsSubmitting(false);
      },
    });
  };

  const toggleStatus = () => {
    setIsToggling(true);
    router.patch(
      `/diskon-kupon/${diskon.id}/status`,
      {},
      {
        onSuccess: () => {
          toast.success("Status diperbarui");
          setIsToggling(false);
        },
        onError: () => {
          toast.error("Gagal memperbarui status");
          setIsToggling(false);
        },
      }
    );
  };

  const deleteDiskon = () => {
    if (confirm("Hapus diskon ini?")) {
      router.delete(`/diskon-kupon/${diskon.id}`, {
        onSuccess: () => toast.success("Diskon dihapus"),
        onError: () => toast.error("Gagal menghapus diskon"),
      });
    }
  };

  const copyKode = () => {
    navigator.clipboard.writeText(diskon.kode_kupon);
    toast.success("Kode kupon disalin!");
  };

  const generateRandomCode = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let code = "";
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setForm((prev) => ({ ...prev, kode_kupon: code }));
    toast.success(`Kode kupon acak dibuat: ${code}`);
  };

  return (
    <DashboardLayout>
      <Head title={`Diskon: ${diskon.nama}`} />
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.visit("/diskon-kupon")}
              className="p-2 hover:bg-gray-100 rounded-md transition"
            >
              <ArrowLeft className="h-5 w-5 text-gray-600" />
            </button>
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">
                PEMASARAN / DISKON DAN KUPON
              </p>
              <h1 className="text-2xl font-bold text-gray-800">{diskon.nama}</h1>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={toggleStatus}
              disabled={isToggling}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-md font-semibold text-sm transition",
                diskon.is_aktif
                  ? "bg-green-100 text-green-700 hover:bg-green-200"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              )}
            >
              <Power className="h-4 w-4" />
              {diskon.is_aktif ? "Aktif" : "Nonaktif"}
            </button>
            <button
              onClick={deleteDiskon}
              className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 hover:bg-red-200 rounded-md font-semibold text-sm transition"
            >
              <Trash2 className="h-4 w-4" />
              Hapus
            </button>
          </div>
        </div>

        {/* Stats Card */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">
                Kode Kupon
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <code className="text-lg font-mono font-bold text-gray-800">
                  {diskon.kode_kupon}
                </code>
                <button
                  onClick={copyKode}
                  className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                >
                  <Copy className="h-4 w-4" />
                </button>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">
                Total Dipakai
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-gray-800">
                {diskon.jumlah_dipakai}
                <span className="text-sm font-normal text-gray-500 ml-1">
                  / {diskon.batas_pemakaian || "∞"}
                </span>
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">
                Tipe Diskon
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg font-bold text-gray-800">
                {diskon.tipe_diskon === "persentase"
                  ? `${diskon.besaran}%`
                  : `Rp ${Number(diskon.besaran).toLocaleString("id-ID")}`}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Status</CardTitle>
            </CardHeader>
            <CardContent>
              <Badge
                className={
                  diskon.is_aktif
                    ? "bg-green-500 text-white"
                    : "bg-gray-400 text-white"
                }
              >
                {diskon.is_aktif ? "Aktif" : "Nonaktif"}
              </Badge>
            </CardContent>
          </Card>
        </div>

        {/* Grid Layout for Form & Details */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          <div className="lg:col-span-2">
            {/* Edit Form */}
            <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 space-y-5">
              <h2 className="font-bold text-slate-800 flex items-center gap-2 mb-4">
                <Ticket className="h-5 w-5 text-blue-600" /> Edit Diskon
              </h2>

              {/* Nama Diskon */}
              <div className="space-y-1.5">
                <Label htmlFor="nama" className="text-slate-700 font-semibold">
                  Nama Diskon <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="nama"
                  placeholder="Contoh: Diskon Akhir Tahun"
                  value={form.nama}
                  onChange={(e) => setForm({ ...form, nama: e.target.value })}
                  className="rounded-xl border-slate-200 focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>

              {/* Untuk Produk */}
              <div className="space-y-1.5">
                <Label className="text-slate-700 font-semibold">
                  Untuk Produk <span className="text-red-500">*</span>
                </Label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, untuk_produk: "semua" })}
                    className={cn(
                      "flex flex-col items-center justify-center p-3 border rounded-xl text-center transition hover:bg-slate-50",
                      form.untuk_produk === "semua"
                        ? "border-blue-600 bg-blue-50/50 text-blue-700 ring-2 ring-blue-600/10"
                        : "border-slate-200 text-slate-600"
                    )}
                  >
                    <span className="text-sm font-semibold">Semua Produk</span>
                    <span className="text-[11px] text-slate-400 mt-0.5">Kupon berlaku untuk seluruh produk</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, untuk_produk: "pilih" })}
                    className={cn(
                      "flex flex-col items-center justify-center p-3 border rounded-xl text-center transition hover:bg-slate-50",
                      form.untuk_produk === "pilih"
                        ? "border-blue-600 bg-blue-50/50 text-blue-700 ring-2 ring-blue-600/10"
                        : "border-slate-200 text-slate-600"
                    )}
                  >
                    <span className="text-sm font-semibold">Pilih Produk</span>
                    <span className="text-[11px] text-slate-400 mt-0.5">Batasi kupon pada produk tertentu</span>
                  </button>
                </div>
              </div>

              {/* Selected Products Display */}
              {diskon.untuk_produk === "pilih" && diskon.produk_terpilih.length > 0 && (
                <div className="bg-slate-50 p-4 border border-slate-100 rounded-xl">
                  <Label className="text-xs text-slate-500 mb-2 block font-semibold">
                    Produk Terpilih Saat Ini:
                  </Label>
                  <div className="flex flex-wrap gap-2">
                    {diskon.produk_terpilih.map((p) => (
                      <Badge key={p.id} variant="secondary" className="rounded-lg bg-white border border-slate-200 text-slate-700 font-medium px-2 py-0.5">
                        {p.nama} ({p.tipe})
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Produk Selection */}
              {form.untuk_produk === "pilih" && (
                <div className="space-y-1.5">
                  <Label className="text-slate-700 font-semibold">Pilih Produk Baru (opsional)</Label>
                  <div className="flex gap-2 mb-2 items-center">
                    <Input
                      placeholder="Cari produk..."
                      value={productSearch}
                      onChange={(e) => setProductSearch(e.target.value)}
                      className="h-8 text-xs rounded-lg flex-1"
                    />
                    <Select
                      value={productTypeFilter}
                      onValueChange={(val) => setProductTypeFilter(val)}
                    >
                      <SelectTrigger className="h-8 text-xs w-36 rounded-lg bg-white border border-slate-200">
                        <SelectValue placeholder="Semua Tipe" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Semua Tipe</SelectItem>
                        <SelectItem value="Event">Event</SelectItem>
                        <SelectItem value="Webinar">Webinar</SelectItem>
                        <SelectItem value="Bootcamp">Bootcamp</SelectItem>
                        <SelectItem value="Ebook">Ebook</SelectItem>
                        <SelectItem value="Produk Digital">Produk Digital</SelectItem>
                        <SelectItem value="Coaching / Mentoring">Coaching</SelectItem>
                        <SelectItem value="Tulisan">Tulisan</SelectItem>
                        <SelectItem value="Kelas Online">Kelas Online</SelectItem>
                        <SelectItem value="Link Pembayaran">Payment Link</SelectItem>
                        <SelectItem value="Bundling">Bundling</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="border border-slate-200 rounded-xl p-3 max-h-48 overflow-y-auto divide-y divide-slate-100 bg-slate-50/50">
                    {filteredProducts.length === 0 ? (
                      <p className="text-xs text-slate-400 text-center py-4">Tidak ada produk cocok</p>
                    ) : (
                      filteredProducts.map((p) => (
                        <label key={p.id} className="flex items-center gap-2.5 py-2 first:pt-0 last:pb-0 cursor-pointer select-none">
                          <input
                            type="checkbox"
                            value={p.id}
                            checked={form.produk_ids.includes(p.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setForm({
                                  ...form,
                                  produk_ids: [...form.produk_ids, p.id],
                                });
                              } else {
                                setForm({
                                  ...form,
                                  produk_ids: form.produk_ids.filter((id) => id !== p.id),
                                });
                              }
                            }}
                            className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-slate-700 truncate">{p.nama}</p>
                            <p className="text-[10px] text-slate-400">{p.tipe}</p>
                          </div>
                        </label>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* Tipe Diskon & Besaran (Grid) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Tipe Diskon */}
                <div className="space-y-1.5">
                  <Label className="text-slate-700 font-semibold">
                    Tipe Diskon <span className="text-red-500">*</span>
                  </Label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setForm({ ...form, tipe_diskon: "persentase" })}
                      className={cn(
                        "flex items-center justify-center gap-2 p-2.5 border rounded-xl font-medium text-sm transition hover:bg-slate-50",
                        form.tipe_diskon === "persentase"
                          ? "border-blue-600 bg-blue-50/50 text-blue-700"
                          : "border-slate-200 text-slate-600"
                      )}
                    >
                      Persentase (%)
                    </button>
                    <button
                      type="button"
                      onClick={() => setForm({ ...form, tipe_diskon: "nominal" })}
                      className={cn(
                        "flex items-center justify-center gap-2 p-2.5 border rounded-xl font-medium text-sm transition hover:bg-slate-50",
                        form.tipe_diskon === "nominal"
                          ? "border-blue-600 bg-blue-50/50 text-blue-700"
                          : "border-slate-200 text-slate-600"
                      )}
                    >
                      Nominal (Rp)
                    </button>
                  </div>
                </div>

                {/* Besaran */}
                <div className="space-y-1.5">
                  <Label htmlFor="besaran" className="text-slate-700 font-semibold">
                    Besaran <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-semibold text-sm">
                      {form.tipe_diskon === "persentase" ? "%" : "Rp"}
                    </span>
                    <Input
                      id="besaran"
                      type={form.tipe_diskon === "persentase" ? "number" : "text"}
                      placeholder="0"
                      value={form.tipe_diskon === "persentase" ? form.besaran : formatRupiahInput(form.besaran)}
                      onChange={(e) => {
                        const raw = form.tipe_diskon === "persentase" ? e.target.value : e.target.value.replace(/\D/g, "");
                        setForm({ ...form, besaran: raw });
                      }}
                      className={cn(
                        "rounded-xl border-slate-200 focus:border-blue-500 focus:ring-blue-500",
                        form.tipe_diskon === "persentase" ? "pl-8" : "pl-10"
                      )}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Minimum Pembelian */}
              <div className="space-y-1.5">
                <Label htmlFor="minimum_pembelian" className="text-slate-700 font-semibold">Minimum Pembelian</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-semibold text-sm">
                    Rp
                  </span>
                  <Input
                    id="minimum_pembelian"
                    type="text"
                    placeholder="0"
                    value={formatRupiahInput(form.minimum_pembelian)}
                    onChange={(e) =>
                      setForm({ ...form, minimum_pembelian: e.target.value.replace(/\D/g, "") })
                    }
                    className="pl-10 rounded-xl border-slate-200 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <p className="text-[11px] text-slate-400">
                  Kosongkan jika tidak ada minimum pembelian
                </p>
              </div>

              {/* Tipe Kupon */}
              <div className="space-y-1.5">
                <Label className="text-slate-700 font-semibold">
                  Tipe Kupon <span className="text-red-500">*</span>
                </Label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, tipe_kupon: "berulang" })}
                    className={cn(
                      "flex flex-col items-center justify-center p-3 border rounded-xl text-center transition hover:bg-slate-50",
                      form.tipe_kupon === "berulang"
                        ? "border-blue-600 bg-blue-50/50 text-blue-700 ring-2 ring-blue-600/10"
                        : "border-slate-200 text-slate-600"
                    )}
                  >
                    <span className="text-sm font-semibold">Berulang</span>
                    <span className="text-[11px] text-slate-400 mt-0.5">Bisa digunakan berkali-kali</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, tipe_kupon: "sekali" })}
                    className={cn(
                      "flex flex-col items-center justify-center p-3 border rounded-xl text-center transition hover:bg-slate-50",
                      form.tipe_kupon === "sekali"
                        ? "border-blue-600 bg-blue-50/50 text-blue-700 ring-2 ring-blue-600/10"
                        : "border-slate-200 text-slate-600"
                    )}
                  >
                    <span className="text-sm font-semibold">Sekali Pakai</span>
                    <span className="text-[11px] text-slate-400 mt-0.5">Hanya dapat digunakan 1x pemakaian</span>
                  </button>
                </div>
              </div>

              {/* Kode Kupon */}
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <Label htmlFor="kode_kupon" className="text-slate-700 font-semibold">
                    Kode Kupon <span className="text-red-500">*</span>
                  </Label>
                  <button
                    type="button"
                    onClick={generateRandomCode}
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100/80 px-2 py-0.5 rounded-md transition"
                  >
                    <Sparkles className="h-3 w-3 text-blue-500" />
                    Buat Kode Acak
                  </button>
                </div>
                <Input
                  id="kode_kupon"
                  placeholder="Contoh: DISKON50"
                  value={form.kode_kupon}
                  onChange={(e) =>
                    setForm({ ...form, kode_kupon: e.target.value.toUpperCase() })
                  }
                  className="rounded-xl border-slate-200 focus:border-blue-500 focus:ring-blue-500 font-mono font-bold"
                  required
                />
                <p className="text-[11px] text-slate-400">Kode unik untuk kupon ini</p>
              </div>

              {/* Batas Pemakaian */}
              <div className="space-y-1.5">
                <Label htmlFor="batas_pemakaian" className="text-slate-700 font-semibold">Batas Pemakaian / Limit</Label>
                <Input
                  id="batas_pemakaian"
                  type="number"
                  placeholder="Kosongkan jika tidak terbatas"
                  value={form.batas_pemakaian}
                  onChange={(e) =>
                    setForm({ ...form, batas_pemakaian: e.target.value })
                  }
                  className="rounded-xl border-slate-200 focus:border-blue-500 focus:ring-blue-500"
                />
                <p className="text-[11px] text-slate-400">Kosongkan jika tidak terbatas</p>
              </div>

              {/* Masa Berlaku Kupon (DateRangePicker) */}
              <div className="space-y-1.5 bg-slate-50 p-4 border border-slate-100 rounded-2xl">
                <DateRangePicker
                  label="Masa Berlaku Kupon (Mulai - Kadaluarsa)"
                  value={dateRange}
                  onChange={(range) => {
                    setDateRange(range);
                    setForm((prev) => ({
                      ...prev,
                      waktu_mulai: range?.from ? format(range.from, "yyyy-MM-dd 00:00:00") : "",
                      tanggal_kadaluarsa: range?.to ? format(range.to, "yyyy-MM-dd 23:59:59") : "",
                    }));
                  }}
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Pilih rentang tanggal kupon berlaku. Kosongkan jika ingin kupon langsung aktif mulai sekarang dan berlaku selamanya.
                </p>
              </div>

              {/* Submit */}
              <div className="pt-4 border-t flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.visit("/diskon-kupon")}
                  className="rounded-xl"
                >
                  Kembali
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl"
                >
                  {isSubmitting ? "Menyimpan..." : "Simpan Perubahan"}
                </Button>
              </div>
            </form>
          </div>

          {/* Right Column: Usage Stats & Details */}
          <div className="space-y-6">
            <Card className="rounded-2xl border-slate-200 shadow-sm overflow-hidden bg-white">
              <CardHeader className="border-b border-slate-100 bg-slate-50/50 pb-3 pt-4 px-5">
                <CardTitle className="text-sm font-bold text-slate-800 uppercase tracking-wider">
                  Detail Penggunaan Produk
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 px-5 pb-5">
                {(!diskon.riwayat_penggunaan || diskon.riwayat_penggunaan.length === 0) ? (
                  <div className="text-center py-8">
                    <p className="text-xs text-slate-400 italic">Kupon ini belum pernah digunakan pada produk apa pun.</p>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {diskon.riwayat_penggunaan.map((item, idx) => (
                      <div key={idx} className="py-3.5 flex justify-between items-center first:pt-0 last:pb-0">
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-bold text-slate-850 truncate" title={item.nama}>
                            {item.nama}
                          </p>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1">
                            {item.tipe}
                          </p>
                        </div>
                        <div className="text-right pl-4">
                          <span className="inline-flex items-center justify-center px-3 py-1 text-xs font-black bg-blue-50 text-blue-700 border border-blue-100 rounded-full">
                            {item.kali_dipakai}x Pakai
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
