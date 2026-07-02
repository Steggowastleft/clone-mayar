import { Head, router } from "@inertiajs/react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Download, CalendarIcon, Package } from "lucide-react";
import { cn } from "@/lib/utils";
import DashboardLayout from "@/components/dashboard/dashboardlayout";
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

type Produk = {
  id: string;
  product_id: number;
  type: string;
  nama: string;
  kategori: string;
  harga: number;
  status: "published" | "unpublished" | "unlisted" | "aktif" | "draft" | "selesai" | "dibatalkan";
  terjual: number;
  tanggal: string;
  cover_url?: string | null;
};

type Props = { produk?: Produk[] };

export default function SemuaProduk({ produk = [] }: Props) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState<Date | undefined>(undefined);
  const [dateFilterOpen, setDateFilterOpen] = useState(false);

  const categories = [...new Set(produk.map((p) => p.kategori).filter(Boolean))];

  const filtered = produk.filter((p) => {
    const nama = p.nama ?? "";
    const kategori = p.kategori ?? "";

    const matchSearch = nama.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || p.status === statusFilter;
    const matchCategory = categoryFilter === "all" || kategori === categoryFilter;
    
    let matchDate = true;
    if (dateFilter) {
      matchDate = p.tanggal.toLowerCase().includes(format(dateFilter, "d").toLowerCase());
    }

    return matchSearch && matchStatus && matchCategory && matchDate;
  });

  const formatRupiah = (value: number) =>
    new Intl.NumberFormat("id-ID").format(value);

  // Stats
  const totalProduk = produk.length;
  const aktifCount = produk.filter((p) => p.status === "published" || p.status === "aktif").length;
  const unlistedCount = produk.filter((p) => p.status === "unlisted").length;
  const tidakAktifCount = totalProduk - aktifCount - unlistedCount;
  const totalPendapatan = produk.reduce((acc, p) => acc + p.terjual * p.harga, 0);

  return (
    <DashboardLayout>
      <Head title="Semua Produk" />

      <div className="p-6 space-y-6 bg-slate-50/50 min-h-screen">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Semua Produk</h1>
            <div className="space-y-1.5 mt-3">
              {/* Baris 1: Status Produk */}
              <div className="flex items-center gap-2 text-sm text-slate-500 font-medium flex-wrap">
                <span>Total Produk: <span className="font-bold text-slate-800">{totalProduk}</span></span>
                <span className="bg-green-50 text-green-655 border border-green-100 text-[11px] font-bold px-2 py-0.5 rounded-full">
                  +{aktifCount} Aktif
                </span>
                <span className="bg-red-50 text-red-655 border border-red-100 text-[11px] font-bold px-2 py-0.5 rounded-full">
                  +{tidakAktifCount} Tidak Aktif
                </span>
                <span className="bg-blue-50 text-blue-655 border border-blue-100 text-[11px] font-bold px-2 py-0.5 rounded-full">
                  +{unlistedCount} Tidak Terdaftar (Unlisted)
                </span>
              </div>
              {/* Baris 2: Pendapatan */}
              <div className="flex items-center gap-2 text-sm text-slate-500 font-medium flex-wrap">
                <span>Total Pendapatan: <span className="font-bold text-slate-800">Rp. {formatRupiah(totalPendapatan)}</span></span>
                <span className="bg-emerald-50 text-emerald-655 border border-emerald-100 text-[11px] font-bold px-2 py-0.5 rounded-full">
                  +6% Dari bulan kemarin
                </span>
              </div>
            </div>
          </div>

          <div className="flex gap-2.5">
            <Button
              variant="outline"
              className="border-gray-200 text-slate-600 hover:bg-slate-50 hover:text-slate-800 text-sm font-semibold flex items-center gap-1.5"
              onClick={() => window.open("/pengaturan/ekspor?type=all", "_blank")}
            >
              <Download className="h-4 w-4" /> Ekspor Data
            </Button>
            <Button
              className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold flex items-center gap-1.5"
              onClick={() => router.visit("/semua-produk/create")}
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
              placeholder="Cari Produk..."
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
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Status Select */}
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-45 bg-white border-slate-250 rounded-lg text-xs font-semibold text-slate-600">
                <SelectValue placeholder="Semua Status" />
              </SelectTrigger>
              <SelectContent className="z-[200]">
                <SelectItem value="all">Semua Status</SelectItem>
                <SelectItem value="published">Publik (Published)</SelectItem>
                <SelectItem value="aktif">Publik (Aktif)</SelectItem>
                <SelectItem value="unpublished">Tidak Publik (Unpublished)</SelectItem>
                <SelectItem value="unlisted">Tidak Publik (Unlisted)</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="selesai">Selesai</SelectItem>
                <SelectItem value="dibatalkan">Dibatalkan</SelectItem>
              </SelectContent>
            </Select>

            {/* Date Filter */}
            <Popover open={dateFilterOpen} onOpenChange={setDateFilterOpen}>
              <PopoverTrigger asChild>
                <button
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 border border-slate-250 rounded-lg bg-white text-xs font-semibold hover:border-slate-355 transition text-slate-605",
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
                <tr className="border-b border-slate-200 bg-blue-50/80">
                  <th className="px-5 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">No</th>
                  <th className="px-5 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Tampilan</th>
                  <th className="px-5 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Kategori</th>
                  <th className="px-5 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Nama Produk</th>
                  <th className="px-5 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Harga</th>
                  <th className="px-5 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Terjual</th>
                  <th className="px-5 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Pendapatan</th>
                  <th className="px-5 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="px-5 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Dibuat</th>
                  <th className="px-5 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dashed divide-slate-200">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="text-center text-slate-400 py-16 text-sm">
                      Tidak ada produk
                    </td>
                  </tr>
                ) : (
                  filtered.map((p, index) => {
                    const statusIsPublik = p.status === "published" || p.status === "aktif";
                    const itemRevenue = p.terjual * p.harga;
                    return (
                      <tr key={p.id} className="hover:bg-slate-50/40 transition">
                        <td className="px-5 py-5 text-sm text-slate-550 font-semibold">{index + 1}</td>
                        <td className="px-5 py-5">
                          {p.cover_url ? (
                            <img
                              src={p.cover_url}
                              alt={p.nama}
                              className="h-10 w-14 object-cover rounded-lg border border-slate-100 shadow-sm"
                            />
                          ) : (
                            <div className="h-10 w-14 bg-slate-100 rounded-lg flex items-center justify-center border border-slate-200">
                              <Package className="h-5 w-5 text-slate-455" />
                            </div>
                          )}
                        </td>
                        <td className="px-5 py-5 text-sm font-semibold text-slate-655 capitalize">
                          {p.kategori || "-"}
                        </td>
                        <td className="px-5 py-5 text-sm font-bold text-slate-800 select-all max-w-[200px] truncate">
                          {p.nama}
                        </td>
                        <td className="px-5 py-5 text-sm text-slate-655 font-semibold whitespace-nowrap">
                          Rp. {formatRupiah(p.harga)}
                        </td>
                        <td className="px-5 py-5 text-sm text-slate-550 font-semibold">{p.terjual}</td>
                        <td className="px-5 py-5 text-sm text-slate-800 font-bold whitespace-nowrap">
                          Rp. {formatRupiah(itemRevenue)}
                        </td>
                        <td className="px-5 py-5">
                          <span
                            className={cn(
                              "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border",
                              statusIsPublik
                                ? "bg-green-50 text-green-700 border-green-200"
                                : p.status === "draft"
                                ? "bg-blue-50 text-blue-700 border-blue-200"
                                : "bg-red-50 text-red-750 border-red-200"
                            )}
                          >
                            <span
                              className={cn(
                                "h-1.5 w-1.5 rounded-full mr-1.5",
                                statusIsPublik ? "bg-green-500" : p.status === "draft" ? "bg-blue-500" : "bg-red-500"
                              )}
                            />
                            {statusIsPublik ? "Publik" : p.status === "draft" ? "Draft" : "Tidak Publik"}
                          </span>
                        </td>
                        <td className="px-5 py-5 text-xs text-slate-400 font-semibold whitespace-nowrap">
                          {p.tanggal}
                        </td>
                        <td className="px-5 py-5 text-center whitespace-nowrap">
                          <button
                            onClick={() => router.visit(`/semua-produk/${p.id}`)}
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
    </DashboardLayout>
  );
}