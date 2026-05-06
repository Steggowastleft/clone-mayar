import { Head, router } from "@inertiajs/react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Ticket, Search, Plus, Edit2, Trash2, Power, Copy } from "lucide-react";
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

export default function DiskonKuponIndex({ diskons = [], produk = [] }: Props) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [openDialog, setOpenDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

    setIsSubmitting(true);

    const data = {
      ...form,
      besaran: Number(form.besaran),
      minimum_pembelian: form.minimum_pembelian ? Number(form.minimum_pembelian) : null,
      batas_pemakaian: form.batas_pemakaian ? Number(form.batas_pemakaian) : null,
      produk_ids: form.untuk_produk === "pilih" ? form.produk_ids : null,
    };

    router.post("/diskon-kupon", data, {
      onSuccess: () => {
        toast.success("Diskon berhasil dibuat!");
        setOpenDialog(false);
        resetForm();
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
      waktu_mulai: "",
      tanggal_kadaluarsa: "",
    });
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
              {filtered.map((d) => (
                <div
                  key={d.id}
                  className="p-4 flex items-center justify-between hover:bg-gray-50 transition"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="font-semibold text-gray-800">{d.nama}</h3>
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
                      <span>
                        {d.tipe_diskon === "persentase" ? `${d.besaran}%` : `Rp ${Number(d.besaran).toLocaleString("id-ID")}`}
                      </span>
                      <span>
                        {d.untuk_produk === "semua" ? "Semua Produk" : "Produk Tertentu"}
                      </span>
                      <span>
                        Dipakai: {d.jumlah_dipakai}
                        {d.batas_pemakaian ? ` / ${d.batas_pemakaian}` : " / ∞"}
                      </span>
                      {d.tanggal_kadaluarsa && (
                        <span className="text-orange-500">
                          Exp: {d.tanggal_kadaluarsa}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
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

          <form onSubmit={handleSubmit} className="space-y-4 mt-2">
            {/* Nama Diskon */}
            <div className="space-y-1">
              <Label htmlFor="nama">
                Nama Diskon <span className="text-red-500">*</span>
              </Label>
              <Input
                id="nama"
                placeholder="Contoh: Diskon Akhir Tahun"
                value={form.nama}
                onChange={(e) => setForm({ ...form, nama: e.target.value })}
                required
              />
            </div>

            {/* Untuk Produk */}
            <div className="space-y-1">
              <Label>
                Untuk Produk <span className="text-red-500">*</span>
              </Label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="untuk_produk"
                    value="semua"
                    checked={form.untuk_produk === "semua"}
                    onChange={(e) =>
                      setForm({ ...form, untuk_produk: e.target.value as "semua" | "pilih" })
                    }
                    className="w-4 h-4 text-blue-600"
                  />
                  <span className="text-sm">Semua Produk</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="untuk_produk"
                    value="pilih"
                    checked={form.untuk_produk === "pilih"}
                    onChange={(e) =>
                      setForm({ ...form, untuk_produk: e.target.value as "semua" | "pilih" })
                    }
                    className="w-4 h-4 text-blue-600"
                  />
                  <span className="text-sm">Pilih Produk</span>
                </label>
              </div>
            </div>

            {/* Produk Selection */}
            {form.untuk_produk === "pilih" && (
              <div className="space-y-1">
                <Label>Pilih Produk</Label>
                <div className="border rounded-md p-3 max-h-40 overflow-y-auto space-y-2">
                  {produk.length === 0 ? (
                    <p className="text-sm text-gray-500">Tidak ada produk tersedia</p>
                  ) : (
                    produk.map((p) => (
                      <label key={p.id} className="flex items-center gap-2 cursor-pointer">
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
                          className="w-4 h-4 rounded border-gray-300 text-blue-600"
                        />
                        <span className="text-sm">
                          {p.nama} <span className="text-gray-500">({p.tipe})</span>
                        </span>
                      </label>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* Tipe Diskon */}
            <div className="space-y-1">
              <Label>
                Tipe Diskon <span className="text-red-500">*</span>
              </Label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="tipe_diskon"
                    value="persentase"
                    checked={form.tipe_diskon === "persentase"}
                    onChange={(e) =>
                      setForm({ ...form, tipe_diskon: e.target.value as "persentase" | "nominal" })
                    }
                    className="w-4 h-4 text-blue-600"
                  />
                  <span className="text-sm">Persentase (%)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="tipe_diskon"
                    value="nominal"
                    checked={form.tipe_diskon === "nominal"}
                    onChange={(e) =>
                      setForm({ ...form, tipe_diskon: e.target.value as "persentase" | "nominal" })
                    }
                    className="w-4 h-4 text-blue-600"
                  />
                  <span className="text-sm">Nominal (Rp)</span>
                </label>
              </div>
            </div>

            {/* Besaran */}
            <div className="space-y-1">
              <Label htmlFor="besaran">
                Besaran <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                  {form.tipe_diskon === "persentase" ? "%" : "Rp"}
                </span>
                <Input
                  id="besaran"
                  type="number"
                  placeholder="0"
                  value={form.besaran}
                  onChange={(e) => setForm({ ...form, besaran: e.target.value })}
                  className={form.tipe_diskon === "persentase" ? "pl-8" : "pl-10"}
                  required
                />
              </div>
            </div>

            {/* Minimum Pembelian */}
            <div className="space-y-1">
              <Label htmlFor="minimum_pembelian">Minimum Pembelian</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">
                  Rp
                </span>
                <Input
                  id="minimum_pembelian"
                  type="number"
                  placeholder="0"
                  value={form.minimum_pembelian}
                  onChange={(e) => setForm({ ...form, minimum_pembelian: e.target.value })}
                  className="pl-10"
                />
              </div>
              <p className="text-xs text-gray-500">Kosongkan jika tidak ada minimum pembelian</p>
            </div>

            {/* Tipe Kupon */}
            <div className="space-y-1">
              <Label>
                Tipe Kupon <span className="text-red-500">*</span>
              </Label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="tipe_kupon"
                    value="berulang"
                    checked={form.tipe_kupon === "berulang"}
                    onChange={(e) =>
                      setForm({ ...form, tipe_kupon: e.target.value as "berulang" | "sekali" })
                    }
                    className="w-4 h-4 text-blue-600"
                  />
                  <span className="text-sm">Berulang</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="tipe_kupon"
                    value="sekali"
                    checked={form.tipe_kupon === "sekali"}
                    onChange={(e) =>
                      setForm({ ...form, tipe_kupon: e.target.value as "berulang" | "sekali" })
                    }
                    className="w-4 h-4 text-blue-600"
                  />
                  <span className="text-sm">Sekali Pakai</span>
                </label>
              </div>
            </div>

            {/* Untuk Pelanggan */}
            <div className="space-y-1">
              <Label>
                Untuk Pelanggan <span className="text-red-500">*</span>
              </Label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="untuk_pelanggan"
                    value="semua"
                    checked={form.untuk_pelanggan === "semua"}
                    onChange={(e) =>
                      setForm({ ...form, untuk_pelanggan: e.target.value as "semua" | "pilih" })
                    }
                    className="w-4 h-4 text-blue-600"
                  />
                  <span className="text-sm">Semua Pelanggan</span>
                </label>
              </div>
            </div>

            {/* Kode Kupon */}
            <div className="space-y-1">
              <Label htmlFor="kode_kupon">
                Kode Kupon <span className="text-red-500">*</span>
              </Label>
              <Input
                id="kode_kupon"
                placeholder="Contoh: DISKON50"
                value={form.kode_kupon}
                onChange={(e) =>
                  setForm({ ...form, kode_kupon: e.target.value.toUpperCase() })
                }
                required
              />
              <p className="text-xs text-gray-500">Kode unik untuk kupon ini</p>
            </div>

            {/* Batas Pemakaian */}
            <div className="space-y-1">
              <Label htmlFor="batas_pemakaian">Batas Pemakaian / Limit</Label>
              <Input
                id="batas_pemakaian"
                type="number"
                placeholder="Kosongkan jika tidak terbatas"
                value={form.batas_pemakaian}
                onChange={(e) => setForm({ ...form, batas_pemakaian: e.target.value })}
              />
              <p className="text-xs text-gray-500">Kosongkan jika tidak terbatas</p>
            </div>

            {/* Waktu Mulai */}
            <div className="space-y-1">
              <Label htmlFor="waktu_mulai">Waktu Mulai Penggunaan</Label>
              <Input
                id="waktu_mulai"
                type="datetime-local"
                value={form.waktu_mulai}
                onChange={(e) => setForm({ ...form, waktu_mulai: e.target.value })}
              />
              <p className="text-xs text-gray-500">
                Kode diskon akan berlaku pada tanggal dan waktu yang anda pilih.
                Opsional, kosongkan untuk langsung membuka penggunaan kode kupon.
              </p>
            </div>

            {/* Tanggal Kadaluarsa */}
            <div className="space-y-1">
              <Label htmlFor="tanggal_kadaluarsa">Tanggal Kadaluarsa</Label>
              <Input
                id="tanggal_kadaluarsa"
                type="datetime-local"
                value={form.tanggal_kadaluarsa}
                onChange={(e) => setForm({ ...form, tanggal_kadaluarsa: e.target.value })}
              />
              <p className="text-xs text-gray-500">
                Pilih tanggal atau kosongkan. Kosongkan jika kode kupon ingin aktif selamanya.
              </p>
            </div>

            <DialogFooter className="mt-6 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpenDialog(false)}
                disabled={isSubmitting}
              >
                Batal
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-blue-600 hover:bg-blue-700 text-white"
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
