import { useState } from "react";
import { router } from "@inertiajs/react";
import { Edit, Trash2, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/dashboard/confirmdialog";
import { EditKelasOnlineDialog } from "@/components/dashboard/editkelasonlinedialog";

const statusOptions = [
  { value: "aktif",      label: "Aktif",      dot: "bg-emerald-500", text: "text-emerald-700" },
  { value: "draft",      label: "Draft",      dot: "bg-gray-500",    text: "text-gray-700" },
  { value: "selesai",    label: "Selesai",    dot: "bg-blue-500",    text: "text-blue-700" },
  { value: "dibatalkan", label: "Dibatalkan", dot: "bg-red-500",     text: "text-red-700" },
];

const statusBgMap: Record<string, string> = {
  aktif:      "bg-emerald-600 hover:bg-emerald-700",
  draft:      "bg-gray-500 hover:bg-gray-600",
  selesai:    "bg-blue-600 hover:bg-blue-700",
  dibatalkan: "bg-red-600 hover:bg-red-700",
};

export function SidebarPanel({ kelas }: { kelas: any }) {
  const btnClass =
    "w-full flex items-center justify-center gap-2 px-4 py-2.5 border border-gray-200 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition bg-white";

  const [statusOpen, setStatusOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [hapusOpen, setHapusOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleStatusChange = (newStatus: string) => {
    if (newStatus === kelas.status) {
      setStatusOpen(false);
      return;
    }

    setIsLoading(true);
    router.patch(
      `/kelas-online/${kelas.id}/status`,
      { status: newStatus },
      {
        preserveScroll: true,
        onSuccess: () => {
          setStatusOpen(false);
          setIsLoading(false);
          toast.success("Status kelas berhasil diperbarui.");
          router.reload({ only: ["kelas"] });
        },
        onError: () => {
          setIsLoading(false);
          toast.error("Gagal mengubah status kelas.");
        },
      }
    );
  };

  const handleHapus = () => {
    router.delete(`/kelas-online/${kelas.id}`, {
      onSuccess: () => {
        toast.success("Kelas berhasil dihapus.");
        router.visit("/kelas-online");
      },
      onError: () => toast.error("Gagal menghapus kelas."),
    });
  };

  return (
    <>
      <div className="space-y-3">
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-3 space-y-2">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide px-1">
            Edit & Kustom
          </h3>

          <div className="relative">
            <button
              onClick={() => setStatusOpen((v) => !v)}
              disabled={isLoading}
              className={cn(
                "w-full py-2.5 text-white text-sm font-bold rounded-md flex items-center justify-center gap-2 transition",
                statusBgMap[kelas.status] ?? "bg-gray-600 hover:bg-gray-700",
                isLoading && "opacity-70 cursor-not-allowed"
              )}
            >
              <span className={cn(
                "w-2 h-2 rounded-full shrink-0",
                statusOptions.find(o => o.value === kelas.status)?.dot || "bg-gray-300"
              )} />
              <span className="uppercase">
                {isLoading ? "Menyimpan..." : kelas.status}
              </span>
              <ChevronDown className={cn(
                "h-4 w-4 transition-transform duration-200",
                statusOpen && "rotate-180"
              )} />
            </button>

            {statusOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setStatusOpen(false)} />
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-xl z-50 overflow-hidden">
                  {statusOptions.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => handleStatusChange(opt.value)}
                      className={cn(
                        "w-full px-4 py-2.5 text-sm font-medium text-left hover:bg-gray-50 transition flex items-center gap-2",
                        opt.text,
                        opt.value === kelas.status && "bg-gray-50"
                      )}
                    >
                      <span className={cn("w-2 h-2 rounded-full shrink-0", opt.dot)} />
                      {opt.label}
                      {opt.value === kelas.status && (
                        <span className="ml-auto text-xs text-gray-400">Aktif</span>
                      )}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Edit */}
          <button className={btnClass} onClick={() => setEditOpen(true)}>
            <Edit className="h-4 w-4" /> EDIT KELAS
          </button>

          {/* Hapus */}
          <button
            className={cn(btnClass, "text-red-600 border-red-200 hover:bg-red-50")}
            onClick={() => setHapusOpen(true)}
          >
            <Trash2 className="h-4 w-4" /> HAPUS
          </button>
        </div>
      </div>

      <EditKelasOnlineDialog open={editOpen} onOpenChange={setEditOpen} kelas={kelas} />

      <ConfirmDialog
        open={hapusOpen}
        onOpenChange={setHapusOpen}
        title="Hapus Kelas?"
        description="Apakah Anda yakin akan menghapus kelas online ini?"
        warning="Kelas yang dihapus tidak dapat dikembalikan."
        confirmLabel="Ya, Hapus Kelas"
        confirmClass="bg-red-600 hover:bg-red-700 text-white"
        onConfirm={handleHapus}
      />
    </>
  );
}
