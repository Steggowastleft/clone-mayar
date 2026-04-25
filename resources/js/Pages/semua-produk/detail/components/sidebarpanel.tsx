import { useState } from "react";
import { router } from "@inertiajs/react";
import { Edit, Trash2, Copy, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { type ProdukDigitalData } from "../../show";
import { EditProdukDigitalDialog } from "./editprodukdigitaldialog";

// ─── Helpers ─────────────────────────────────────────────────────────

const statusOptions = [
  { value: "published",   label: "Published",   bg: "bg-green-600 hover:bg-green-700" },
  { value: "unpublished", label: "Unpublished", bg: "bg-yellow-500 hover:bg-yellow-600" },
  { value: "unlisted",    label: "Unlisted",    bg: "bg-gray-500 hover:bg-gray-600" },
];

const statusBgMap: Record<string, string> = {
  published:   "bg-green-600 hover:bg-green-700",
  unpublished: "bg-yellow-500 hover:bg-yellow-600",
  unlisted:    "bg-gray-500 hover:bg-gray-600",
};

const statusToastMsg: Record<string, string> = {
  published:   "Produk berhasil dipublikasikan! ✅",
  unpublished: "Produk berhasil dinonaktifkan.",
  unlisted:    "Produk berhasil disembunyikan.",
};

// ─── ConfirmDialog sederhana ─────────────────────────────────────────

function ConfirmDialog({
  open,
  title,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl shadow-xl p-6 w-80">
        <h3 className="font-semibold text-gray-800 mb-4">{title}</h3>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-2 border border-gray-200 rounded-md text-sm text-gray-700 hover:bg-gray-50"
          >
            Batal
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-2 bg-red-500 hover:bg-red-600 text-white rounded-md text-sm font-semibold"
          >
            Ya, Lanjutkan
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── SidebarPanel ────────────────────────────────────────────────────

export function SidebarPanel({ produk }: { produk: ProdukDigitalData }) {
  const [statusOpen, setStatusOpen] = useState(false);
  const [dupOpen, setDupOpen] = useState(false);
  const [hapusOpen, setHapusOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);

  const btnClass =
    "w-full flex items-center justify-center gap-2 px-4 py-2.5 border border-gray-200 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition bg-white";

  const handleStatusChange = (newStatus: string) => {
    if (newStatus === produk.status) {
      setStatusOpen(false);
      return;
    }
    router.patch(
      `/produk-digital/${produk.id}/status`,
      { status: newStatus },
      {
        preserveScroll: true,
        onSuccess: () => {
          setStatusOpen(false);
          toast.success(statusToastMsg[newStatus]);
          router.reload({ only: ["produk"] });
        },
        onError: () => toast.error("Gagal mengubah status."),
      }
    );
  };

  const handleDuplicate = () => {
    router.post(
      `/produk-digital/${produk.id}/duplicate`,
      {},
      {
        onSuccess: () => toast.success("Produk berhasil diduplikat!"),
        onError: () => toast.error("Gagal menduplikat."),
      }
    );
    setDupOpen(false);
  };

  const handleHapus = () => {
    router.delete(`/produk-digital/${produk.id}`, {
      onSuccess: () => {
        toast.success("Produk berhasil dihapus.");
        router.visit("/produk-digital");
      },
      onError: () => toast.error("Gagal menghapus."),
    });
    setHapusOpen(false);
  };

  return (
    <>
      <div className="space-y-3">
        <div className="bg-white border rounded-lg p-3 space-y-2">
          {/* Status Dropdown */}
          <div className="relative">
            <button
              onClick={() => setStatusOpen((v) => !v)}
              className={cn(
                "w-full py-2.5 text-white font-bold rounded-md flex items-center justify-center gap-2",
                produk.status && statusBgMap[produk.status] || "bg-gray-500"
              )}
            >
              {produk.status?.toUpperCase() || "UNKNOWN"}
              <ChevronDown
                className={cn("h-4 w-4 transition", statusOpen && "rotate-180")}
              />
            </button>

            {statusOpen && (
              <div className="absolute w-full bg-white border mt-1 rounded shadow z-20">
                {statusOptions.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => handleStatusChange(opt.value)}
                    className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50"
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            className={btnClass}
            onClick={() => setEditOpen(true)}
          >
            <Edit className="h-4 w-4" /> EDIT
          </button>

          <button className={btnClass} onClick={() => setDupOpen(true)}>
            <Copy className="h-4 w-4" /> DUPLICATE
          </button>

          <button
            className={cn(btnClass, "text-red-600 hover:bg-red-50")}
            onClick={() => setHapusOpen(true)}
          >
            <Trash2 className="h-4 w-4" /> HAPUS
          </button>
        </div>

        {/* Info Panel */}
        <div className="bg-white border rounded-lg p-3 space-y-2 text-xs text-gray-500">
          <div className="flex justify-between">
            <span>Total Penjualan</span>
            <span className="font-semibold text-gray-800">
              {produk.total_penjualan}
            </span>
          </div>
          {produk.max_pembayaran && (
            <div className="flex justify-between">
              <span>Kuota</span>
              <span className="font-semibold text-gray-800">
                {produk.max_pembayaran}
              </span>
            </div>
          )}
          <div className="flex justify-between">
            <span>Affiliate</span>
            <span
              className={cn(
                "font-semibold",
                produk.bisa_affiliate ? "text-green-600" : "text-gray-400"
              )}
            >
              {produk.bisa_affiliate ? "Aktif" : "Nonaktif"}
            </span>
          </div>
        </div>
      </div>

      {/* Confirms */}
      <ConfirmDialog
        open={dupOpen}
        title="Duplikat produk ini?"
        onConfirm={handleDuplicate}
        onCancel={() => setDupOpen(false)}
      />
      <ConfirmDialog
        open={hapusOpen}
        title="Hapus produk ini secara permanen?"
        onConfirm={handleHapus}
        onCancel={() => setHapusOpen(false)}
      />

      <EditProdukDigitalDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        produk={produk}
      />
    </>
  );
}