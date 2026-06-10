import { useState } from "react";
import { router, Head } from "@inertiajs/react";
import DashboardLayout from "@/components/dashboard/dashboardlayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CreateKelasOnlineDialog } from "@/components/dashboard/createkelasonlinedialog";
import { EditKelasOnlineDialog } from "@/components/dashboard/editkelasonlinedialog";
import { ConfirmDialog } from "@/components/dashboard/confirmdialog";
import {
  Printer,
  Download,
  ExternalLink,
  CalendarIcon,
  Edit,
  Trash2,
  Package,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { Dialog } from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface KelasOnline {
  id: number;
  nama: string;
  deskripsi: string | null;
  thumbnail: string | null;
  harga: number;
  is_gratis: boolean;
  status: "published" | "unpublished" | "unlisted";
  tanggal_mulai: string | null;
  peserta_terdaftar_count: number;
  require_quiz_sertifikat: boolean;
  nilai_minimum_quiz: number | null;
  has_assignment: boolean;
  tanggal_selesai: string | null;
  created_at?: string | null;
}

interface Props {
  produk: {
    data: KelasOnline[];
    current_page: number;
    last_page: number;
    total: number;
  };
}

export default function KelasOnlineIndex({ produk }: Props) {
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [dateFilter, setDateFilter] = useState<Date | undefined>(undefined);
  const [dateOpen, setDateOpen] = useState(false);
  
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedKelas, setSelectedKelas] = useState<KelasOnline | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const filteredKelas = produk.data.filter((kelas) => {
    const matchStatus = statusFilter === "all" || kelas.status === statusFilter;
    const matchSearch = kelas.nama.toLowerCase().includes(search.toLowerCase());
    
    let matchDate = true;
    if (dateFilter) {
      if (!kelas.tanggal_mulai) {
        matchDate = false;
      } else {
        const kelasDate = new Date(kelas.tanggal_mulai);
        matchDate =
          kelasDate.getFullYear() === dateFilter.getFullYear() &&
          kelasDate.getMonth() === dateFilter.getMonth() &&
          kelasDate.getDate() === dateFilter.getDate();
      }
    }

    return matchStatus && matchSearch && matchDate;
  });

  const handleEdit = (kelas: KelasOnline) => {
    setSelectedKelas(kelas);
    setEditOpen(true);
  };

  const handleDeleteClick = (kelas: KelasOnline) => {
    setSelectedKelas(kelas);
    setDeleteOpen(true);
  };

  const handleConfirmDelete = () => {
    if (!selectedKelas) return;
    setIsDeleting(true);
    router.delete(`/kelas-online/${selectedKelas.id}`, {
      onSuccess: () => {
        setIsDeleting(false);
        setDeleteOpen(false);
        setSelectedKelas(null);
        toast.success("Kelas berhasil dihapus");
      },
      onError: () => {
        setIsDeleting(false);
        toast.error("Gagal menghapus kelas");
      },
    });
  };

  const statusBadge = (status: string) => {
    switch (status) {
      case "published":
        return <Badge className="bg-green-500 hover:bg-green-600 text-white">Published</Badge>;
      case "unpublished":
        return <Badge className="bg-yellow-500 hover:bg-yellow-600 text-white">Unpublished</Badge>;
      case "unlisted":
        return <Badge className="bg-blue-500 hover:bg-blue-600 text-white">Unlisted</Badge>;
      default:
        return <Badge>Unknown</Badge>;
    }
  };

  const filterButtons = [
    { label: "SEMUA", value: "all" },
    { label: "PUBLISHED", value: "published" },
    { label: "UNPUBLISHED", value: "unpublished" },
    { label: "UNLISTED", value: "unlisted" },
  ];

  const totalKelas = produk.total;
  const aktifCount = produk.data.filter((k) => k.status === "published").length;
  const unlistedCount = produk.data.filter((k) => k.status === "unlisted").length;
  const tidakAktifCount = totalKelas - aktifCount - unlistedCount;
  const totalPendapatan = produk.data.reduce((acc, k) => acc + (k.peserta_terdaftar_count || 0) * (k.harga || 0), 0);

  return (
    <DashboardLayout title="Kelas Online">
      <Head title="Kelas Online" />
      <div className="p-6 space-y-6 bg-slate-50/50 min-h-screen">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Kelas Online</h1>
            <div className="flex items-center gap-6 mt-3 text-sm text-slate-500 font-medium flex-wrap">
              {/* Baris 1: Status Produk */}
              <div className="flex items-center gap-2 text-sm text-slate-500 font-medium flex-wrap">
                <span>Total Kelas: <span className="font-bold text-slate-800">{totalKelas}</span></span>
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
                <span>Total Pendapatan: <span className="font-bold text-slate-800">Rp. {new Intl.NumberFormat("id-ID").format(totalPendapatan)}</span></span>
                <span className="bg-emerald-50 text-emerald-655 border border-emerald-100 text-[11px] font-bold px-2 py-0.5 rounded-full">
                  +12% Dari bulan kemarin
                </span>
              </div>
            </div>
          </div>

          <div className="flex gap-2.5">
            <Button
              variant="outline"
              className="border-gray-200 text-slate-600 hover:bg-slate-50 hover:text-slate-800 text-sm font-semibold flex items-center gap-1.5"
              onClick={() => window.open("/kelas-online/katalog", "_blank")}
            >
              Katalog Publik
            </Button>
            <Button
              variant="outline"
              className="border-gray-200 text-slate-655 hover:bg-slate-50 hover:text-slate-800 text-sm font-semibold flex items-center gap-1.5"
              onClick={() => window.open("/pengaturan/ekspor?type=kelas-online", "_blank")}
            >
              <Download className="h-4 w-4" /> Ekspor Data
            </Button>
            <Button
              className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold flex items-center gap-1.5"
              onClick={() => setCreateOpen(true)}
            >
              + Buat Kelas Online
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
              placeholder="Cari Nama Kelas..."
              className="pl-9 bg-slate-50/50 border-slate-250 rounded-lg text-sm w-full focus:bg-white transition"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Right Filters */}
          <div className="flex items-center gap-3.5 flex-wrap">
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
            <Popover open={dateOpen} onOpenChange={setDateOpen}>
              <PopoverTrigger asChild>
                <button
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 border border-slate-250 rounded-lg bg-white text-xs font-semibold hover:border-slate-350 transition text-slate-600",
                    dateFilter && "text-slate-800 border-slate-450"
                  )}
                >
                  <CalendarIcon className="h-4 w-4 text-slate-455 shrink-0" />
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
                    setDateOpen(false);
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
                        setDateOpen(false);
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
                  <th className="px-5 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Nama Kelas</th>
                  <th className="px-5 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Harga</th>
                  <th className="px-5 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="px-5 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Dibuat</th>
                  <th className="px-5 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dashed divide-slate-200">
                {filteredKelas.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center text-slate-400 py-16 text-sm">
                      There are no records to display
                    </td>
                  </tr>
                ) : (
                  filteredKelas.map((kelas, index) => {
                    const statusIsPublik = kelas.status === "published";
                    const formattedDate = kelas.created_at ? format(new Date(kelas.created_at), "dd MMM yyyy", { locale: idLocale }) : "-";
                    return (
                      <tr key={kelas.id} className="hover:bg-slate-50/40 transition">
                        <td className="px-5 py-5 text-sm text-slate-550 font-semibold">{(produk.current_page - 1) * 12 + index + 1}</td>
                        <td className="px-5 py-5">
                          {kelas.thumbnail ? (
                            <img
                              src={`/storage/${kelas.thumbnail}`}
                              alt={kelas.nama}
                              className="h-10 w-14 object-cover rounded-lg border border-slate-100 shadow-sm"
                            />
                          ) : (
                            <div className="h-10 w-14 bg-slate-100 rounded-lg flex items-center justify-center border border-slate-200">
                              <Package className="h-5 w-5 text-slate-455" />
                            </div>
                          )}
                        </td>
                        <td className="px-5 py-5 text-sm font-bold text-slate-800 select-all max-w-[250px] truncate">
                          {kelas.nama}
                        </td>
                        <td className="px-5 py-5 text-sm text-slate-800 font-semibold whitespace-nowrap">
                          {kelas.is_gratis ? "Gratis" : `Rp ${new Intl.NumberFormat("id-ID").format(kelas.harga)}`}
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
                            {statusIsPublik ? "Publik" : "Tidak Publik"}
                          </span>
                        </td>
                        <td className="px-5 py-5 text-xs text-slate-455 font-semibold whitespace-nowrap">
                          {formattedDate}
                        </td>
                        <td className="px-5 py-5 text-center whitespace-nowrap space-x-2">
                          <button
                            onClick={() => router.visit(`/kelas-online/${kelas.id}/manage`)}
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

          {/* Pagination */}
          {produk.last_page > 1 && (
            <div className="px-6 py-4 border-t border-slate-100 flex justify-center gap-2 bg-slate-50/30">
              {Array.from({ length: produk.last_page }, (_, i) => i + 1).map(
                (page) => (
                  <button
                    key={page}
                    onClick={() => router.get("/kelas-online", { page })}
                    className={`w-8 h-8 rounded-md text-sm font-medium transition-colors ${
                      page === produk.current_page
                        ? "bg-blue-600 text-white"
                        : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    {page}
                  </button>
                )
              )}
            </div>
          )}
        </div>
      </div>

      {/* Dialogs */}
      <CreateKelasOnlineDialog open={createOpen} onOpenChange={setCreateOpen} />
      <EditKelasOnlineDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        kelas={selectedKelas}
      />
      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Hapus Kelas Online?"
        description={`Apakah Anda yakin ingin menghapus kelas "${selectedKelas?.nama}"?`}
        warning="Aksi ini tidak dapat dibatalkan. Semua data terkait kelas akan dihapus."
        confirmLabel="Hapus"
        confirmClass="bg-red-600 hover:bg-red-700 text-white"
        onConfirm={handleConfirmDelete}
      />
    </DashboardLayout>
  );
}