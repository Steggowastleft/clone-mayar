import { Head, router } from "@inertiajs/react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Ticket, Search, Plus, Edit2, Trash2, Power, Copy, Sparkles, Eye } from "lucide-react";
import { cn } from "@/lib/utils";
import DashboardLayout from "@/components/dashboard/dashboardlayout";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
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
  tipe_diskon: "persentase" | "nominal";
  besaran: number;
  status: "aktif" | "nonaktif";
  is_aktif: boolean;
  untuk_produk: "semua" | "pilih";
  jumlah_dipakai: number;
  batas_pemakaian: number | null;
  tanggal_kadaluarsa: string | null;
  created_at: string;
  penjual?: string;
};

type Produk = {
  id: string;
  nama: string;
  tipe: string;
  harga: number;
};

type Props = {
  diskons: Diskon[];
  produk: Produk[];
};

const formatRupiahInput = (value: string | number) => {
  if (value === undefined || value === null || value === "") return "";
  const clean = String(value).replace(/\D/g, "");
  return clean ? new Intl.NumberFormat("id-ID").format(Number(clean)) : "";
};

export default function DiskonKuponIndex({ diskons = [], produk = [] }: Props) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [openDialog, setOpenDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
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
    nama: "",
    untuk_produk: "semua" as "semua" | "pilih",
    produk_ids: [] as string[],
    tipe_diskon: "persentase" as "persentase" | "nominal",
    besaran: "",
    minimum_pembelian: "",
    tipe_kupon: "berulang" as "berulang" | "sekali",
    untuk_pelanggan: "semua" as "semua" | "pilih",
    kode_kupon: "",
    batas_pemakaian: "",
    batas_per_orang: "1",
    waktu_mulai: "",
    tanggal_kadaluarsa: "",
  });

  const filtered = diskons.filter((d) => {
    const matchSearch =
      d.nama.toLowerCase().includes(search.toLowerCase()) ||
      d.kode_kupon.toLowerCase().includes(search.toLowerCase());
    const matchStatus =
      statusFilter === "all" ||
      (statusFilter === "aktif" && d.is_aktif) ||
      (statusFilter === "nonaktif" && !d.is_aktif);
    return matchSearch && matchStatus;
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.nama.trim() || !form.kode_kupon.trim() || !form.besaran.trim()) {
      toast.error("Nama Diskon, Kode Kupon, dan Besaran wajib diisi");
      return;
    }

    if (diskons.some((d) => d.kode_kupon.toUpperCase() === form.kode_kupon.toUpperCase())) {
      toast.error("Kode Kupon sudah digunakan, silakan masukkan kode lain");
      return;
    }

    setIsSubmitting(true);

    const data = {
      ...form,
      besaran: Number(form.besaran),
      minimum_pembelian: form.minimum_pembelian ? Number(form.minimum_pembelian) : null,
      batas_pemakaian: form.batas_pemakaian ? Number(form.batas_pemakaian) : null,
      batas_per_orang: form.batas_per_orang ? Number(form.batas_per_orang) : null,
      waktu_mulai: form.waktu_mulai || null,
      tanggal_kadaluarsa: form.tanggal_kadaluarsa || null,
      produk_ids: form.untuk_produk === "pilih" ? form.produk_ids : null,
    };

    router.post("/diskon-kupon", data, {
      onSuccess: () => {
        toast.success("Diskon berhasil dibuat!");
        setOpenDialog(false);
        resetForm();
        setDateRange(undefined);
        setIsSubmitting(false);
      },
      onError: () => {
        toast.error("Gagal membuat diskon");
        setIsSubmitting(false);
      },
    });
  };

  const resetForm = () => {
    setForm({
      nama: "",
      untuk_produk: "semua",
      produk_ids: [],
      tipe_diskon: "persentase",
      besaran: "",
      minimum_pembelian: "",
      tipe_kupon: "berulang",
      untuk_pelanggan: "semua",
      kode_kupon: "",
      batas_pemakaian: "",
      batas_per_orang: "1",
      waktu_mulai: "",
      tanggal_kadaluarsa: "",
    });
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

  const toggleStatus = (id: number) => {
    router.patch(`/diskon-kupon/${id}/status`, {}, {
      onSuccess: () => toast.success("Status diperbarui"),
      onError: () => toast.error("Gagal memperbarui status"),
    });
  };

  const deleteDiskon = (id: number) => {
    if (confirm("Hapus diskon ini?")) {
      router.delete(`/diskon-kupon/${id}`, {
        onSuccess: () => toast.success("Diskon dihapus"),
        onError: () => toast.error("Gagal menghapus diskon"),
      });
    }
  };

  const copyKode = (kode: string) => {
    navigator.clipboard.writeText(kode);
    toast.success("Kode kupon disalin!");
  };

  const statusBadge = (diskon: Diskon) => {
    if (diskon.is_aktif) {
      return <Badge className="bg-green-500 text-white">Aktif</Badge>;
    }
    return <Badge className="bg-gray-400 text-white">Nonaktif</Badge>;
  };

  const filterBtns = [
    { label: "SEMUA", value: "all" },
    { label: "AKTIF", value: "aktif" },
    { label: "NONAKTIF", value: "nonaktif" },
  ];

  return (
    <DashboardLayout>
      <Head title="Diskon dan Kupon" />
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">PEMASARAN</p>
            <h1 className="text-2xl font-bold text-gray-800">Diskon dan Kupon</h1>
          </div>
          <Button
            onClick={() => setOpenDialog(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Plus className="h-4 w-4 mr-1" />
            Buat Diskon
          </Button>
        </div>

        {/* Filters */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4 mb-5">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            <div className="relative w-full md:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Cari diskon atau kode kupon..."
                className="pl-10"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              {filterBtns.map((btn) => (
                <button
                  key={btn.value}
                  onClick={() => setStatusFilter(btn.value)}
                  className={cn(
                    "px-4 py-2 rounded-md text-sm font-semibold transition",
                    statusFilter === btn.value
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  )}
                >
                  {btn.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* List */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
          {filtered.length === 0 ? (
            <div className="p-12 text-center">
              <Ticket className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-400">Belum ada diskon</p>
              <p className="text-sm text-gray-400 mt-1">
                Buat diskon atau kupon untuk menarik pelanggan
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
                    {/* Table Header */}
                    <div className="grid grid-cols-6 gap-4 px-6 py-3 bg-slate-50 border-y border-slate-100 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      <div className="col-span-2">Info Kupon</div>
                      <div>Penjual</div>
                      <div>Nilai Diskon</div>
                      <div>Pemakaian</div>
                      <div className="text-right">Aksi</div>
                    </div>
              {filtered.map((d) => (
                          <div key={d.id} className="grid grid-cols-6 gap-4 px-6 py-4 items-center hover:bg-slate-50/50 transition-colors">
                            {/* Info */}
                            <div className="col-span-2">
                    <div className="flex items-center gap-3 mb-1">
                      <button
                        onClick={() => router.visit(`/diskon-kupon/${d.id}`)}
                        className="font-semibold text-gray-800 hover:text-blue-650 text-left transition-colors"
                      >
                        {d.nama}
                      </button>
                      {statusBadge(d)}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <Ticket className="h-3 w-3" />
                        <code className="bg-gray-100 px-2 py-0.5 rounded text-xs font-mono">
                          {d.kode_kupon}
                        </code>
                        <button
                          onClick={() => copyKode(d.kode_kupon)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <Copy className="h-3 w-3" />
                        </button>
                      </span>
                    </div>
                  </div>
                            {/* Penjual */}
                            <div>
                              <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                                {d.penjual ?? "Admin"}
                              </span>
                            </div>

                            {/* Nilai Diskon */}
                            <div>
                      <span>
                        {d.tipe_diskon === "persentase" ? `${d.besaran}%` : `Rp ${Number(d.besaran).toLocaleString("id-ID")}`}
                      </span>
                    </div>
                            {/* Pemakaian */}
                            <div>
                      <span>
                        {d.jumlah_dipakai}
                        {d.batas_pemakaian ? ` / ${d.batas_pemakaian}` : " / ∞"}
                      </span>
                    </div>
                  <div className="flex items-center gap-2 justify-end">
                    <button
                      onClick={() => toggleStatus(d.id)}
                      className={cn(
                        "p-2 rounded-md transition",
                        d.is_aktif
                          ? "text-green-600 hover:bg-green-50"
                          : "text-gray-400 hover:bg-gray-100"
                      )}
                      title={d.is_aktif ? "Nonaktifkan" : "Aktifkan"}
                    >
                      <Power className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => router.visit(`/diskon-kupon/${d.id}`)}
                      className="p-2 text-slate-500 hover:bg-slate-100 rounded-md transition"
                      title="Lihat Detail"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => router.visit(`/diskon-kupon/${d.id}`)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-md transition"
                      title="Edit"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => deleteDiskon(d.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-md transition"
                      title="Hapus"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Dialog Buat Diskon */}
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Ticket className="h-5 w-5 text-blue-600" /> Buat Diskon
            </DialogTitle>
            <DialogDescription>
              Buat kupon diskon untuk menarik pelanggan
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-5 mt-2">
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

            {/* Produk Selection */}
            {form.untuk_produk === "pilih" && (
              <div className="space-y-1.5">
                <Label className="text-slate-700 font-semibold">Pilih Produk</Label>
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
                              setForm({ ...form, produk_ids: [...form.produk_ids, p.id] });
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

            {/* Tipe Diskon & Besaran (Grid untuk keringkasan) */}
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
                  onChange={(e) => setForm({ ...form, minimum_pembelian: e.target.value.replace(/\D/g, "") })}
                  className="pl-10 rounded-xl border-slate-200 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <p className="text-[11px] text-slate-400">Kosongkan jika tidak ada minimum pembelian</p>
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

            {/* Limit Pemakaian Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Batas Pemakaian */}
              <div className="space-y-1.5">
                <Label htmlFor="batas_pemakaian" className="text-slate-700 font-semibold">Batas Pemakaian / Limit</Label>
                <Input
                  id="batas_pemakaian"
                  type="number"
                  placeholder="Kosongkan jika tidak terbatas"
                  value={form.batas_pemakaian}
                  onChange={(e) => setForm({ ...form, batas_pemakaian: e.target.value })}
                  className="rounded-xl border-slate-200 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              {/* Batas Per Orang */}
              <div className="space-y-1.5">
                <Label htmlFor="batas_per_orang" className="text-slate-700 font-semibold">Batas Pemakaian Per Orang</Label>
                <Input
                  id="batas_per_orang"
                  type="number"
                  placeholder="1"
                  min="1"
                  value={form.batas_per_orang}
                  onChange={(e) => setForm({ ...form, batas_per_orang: e.target.value })}
                  className="rounded-xl border-slate-200 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
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

            <DialogFooter className="mt-6 pt-4 border-t flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setOpenDialog(false);
                  resetForm();
                  setDateRange(undefined);
                }}
                disabled={isSubmitting}
                className="rounded-xl"
              >
                Batal
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl"
              >
                {isSubmitting ? "Menyimpan..." : "Simpan Diskon"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
