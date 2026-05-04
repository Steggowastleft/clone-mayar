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

interface KelasOnline {
  id: number;
  nama: string;
  deskripsi: string | null;
  thumbnail: string | null;
  harga: number;
  is_gratis: boolean;
  status: "draft" | "aktif" | "selesai" | "dibatalkan";
  tanggal_mulai: string | null;
  peserta_terdaftar_count: number;
  require_quiz_sertifikat: boolean;
  nilai_minimum_quiz: number | null;
  has_assignment: boolean;
  tanggal_selesai: string | null;
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
      case "aktif":
        return <Badge className="bg-green-500 hover:bg-green-600 text-white">Aktif</Badge>;
      case "draft":
        return <Badge className="bg-yellow-500 hover:bg-yellow-600 text-white">Draft</Badge>;
      case "selesai":
        return <Badge className="bg-blue-500 hover:bg-blue-600 text-white">Selesai</Badge>;
      case "dibatalkan":
        return <Badge className="bg-red-500 hover:bg-red-600 text-white">Dibatalkan</Badge>;
      default:
        return <Badge>Unknown</Badge>;
    }
  };

  const filterButtons = [
    { label: "SEMUA", value: "all" },
    { label: "AKTIF", value: "aktif" },
    { label: "DRAFT", value: "draft" },
    { label: "SELESAI", value: "selesai" },
    { label: "DIBATALKAN", value: "dibatalkan" },
  ];

  return (
    <DashboardLayout title="Kelas Online">
      <div className="flex gap-0 min-h-screen">
        {/* MAIN CONTENT */}
        <div className="flex-1 p-6">
          <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">
            PROJEK
          </p>
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-800">Kelas Online</h1>
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="border-blue-500 text-blue-600 hover:bg-blue-50"
                onClick={() => window.open("/kelas-online/katalog")}
              >
                PRODUK
              </Button>
              <Button
                className="bg-blue-600 hover:bg-blue-700 text-white"
                onClick={() => setCreateOpen(true)}
              >
                + BUAT
              </Button>
            </div>
          </div>

          {/* Table Panel */}
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="font-semibold text-gray-700">Semua Kelas Online</h2>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Input
                    placeholder="Filter Halaman"
                    className="pl-8 w-48 text-sm"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                  <svg
                    className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
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
              {filteredKelas.length === 0 ? (
                <p className="text-center text-gray-400 py-12 text-sm">
                  There are no records to display
                </p>
              ) : (
                <div className="space-y-3">
                  {filteredKelas.map((kelas) => (
                    <div
                      key={kelas.id}
                      className="flex items-center justify-between p-4 border border-gray-100 rounded-lg hover:bg-gray-50 transition"
                    >
                      <div className="flex gap-4 items-center">
                        <div className="w-16 h-12 bg-gray-100 rounded flex items-center justify-center overflow-hidden shrink-0">
                          {kelas.thumbnail ? (
                            <img src={`/storage/${kelas.thumbnail}`} alt={kelas.nama} className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-xl">🎓</span>
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800">
                            {kelas.nama}
                          </p>
                          <p className="text-sm text-gray-500">
                            {kelas.is_gratis ? "Gratis" : `Rp ${Number(kelas.harga).toLocaleString("id-ID")}`}
                            {kelas.tanggal_mulai && ` · ${new Date(kelas.tanggal_mulai).toLocaleDateString("id-ID")}`} 
                            {kelas.peserta_terdaftar_count > 0 && ` · ${kelas.peserta_terdaftar_count} peserta`}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {statusBadge(kelas.status)}
                        <Button
                          size="sm"
                          onClick={() => router.visit(`/kelas-online/${kelas.id}/manage`)}
                        >
                          Detail
                        </Button>
                        <button
                          onClick={() => handleEdit(kelas)}
                          className="text-gray-400 hover:text-blue-600 transition"
                          title="Edit"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(kelas)}
                          className="text-gray-400 hover:text-red-600 transition"
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
            
            {/* Pagination */}
            {produk.last_page > 1 && (
              <div className="px-6 py-4 border-t border-gray-100 flex justify-center gap-2">
                {Array.from({ length: produk.last_page }, (_, i) => i + 1).map(
                  (page) => (
                    <button
                      key={page}
                      onClick={() => router.get("/kelas-online", { page })}
                      className={`w-8 h-8 rounded-md text-sm font-medium transition-colors ${
                        page === produk.current_page
                          ? "bg-blue-600 text-white"
                          : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
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

        {/* RIGHT SIDEBAR */}
        <div className="w-72 border-l border-gray-200 bg-gray-50 p-4 space-y-3 shrink-0">
          <Popover open={dateOpen} onOpenChange={setDateOpen}>
            <PopoverTrigger asChild>
              <button
                className={cn(
                  "w-full flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-md bg-white text-sm text-left text-gray-500 hover:border-gray-300 transition",
                  dateFilter && "text-gray-800"
                )}
              >
                <CalendarIcon className="h-4 w-4 text-gray-400 shrink-0" />
                {dateFilter
                  ? format(dateFilter, "dd MMM yyyy", { locale: idLocale })
                  : "Filter Berdasarkan Tanggal..."}
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                mode="single"
                selected={dateFilter}
                onSelect={(date) => {
                  setDateFilter(date);
                  setDateOpen(false);
                }}
                initialFocus
              />
              {dateFilter && (
                <div className="p-2 border-t">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full text-xs text-gray-500"
                    onClick={() => {
                      setDateFilter(undefined);
                      setDateOpen(false);
                    }}
                  >
                    Reset Tanggal
                  </Button>
                </div>
              )}
            </PopoverContent>
          </Popover>

          <Input
            placeholder="Cari Kelas Online"
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
            onClick={() => window.open("/kelas-online/katalog", "_blank")}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gray-800 hover:bg-gray-900 text-white text-sm font-semibold rounded-md transition mt-2"
          >
            KATALOG KELAS ONLINE
            <ExternalLink className="h-4 w-4" />
          </button>
          <p className="text-xs text-gray-500 text-center leading-relaxed">
            Katalog Kelas adalah halaman katalog online dimana semua Kelas
            Online anda yang aktif ditampilkan.
          </p>

          <Dialog>
            <button className="w-full px-4 py-2.5 border border-gray-200 rounded-md text-sm font-semibold text-gray-700 hover:bg-gray-100 transition bg-white">
              INFO & TUTORIAL
            </button>
          </Dialog>

          <button
            onClick={() => setCreateOpen(true)}
            className="w-full px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-md transition"
          >
            + Buat Kelas Online Baru
          </button>
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