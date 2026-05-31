import { useState } from "react";
import { router } from "@inertiajs/react";
import { Edit, Trash2, Copy, ChevronDown, Package } from "lucide-react";
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

export function SidebarPanel({ produk, oldFiles }: { produk: ProdukDigitalData; oldFiles: any[] }) {
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
      <div className="space-y-4">
        {/* Cover Image Section */}
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
          {produk.cover_url ? (
            <img
              src={produk.cover_url}
              alt={produk.nama}
              className="w-full h-auto object-cover aspect-[3/4]"
            />
          ) : (
            <div className="w-full aspect-[3/4] bg-slate-100 flex flex-col items-center justify-center text-slate-400 border-b p-4">
              <Package className="h-10 w-10 text-slate-300 mb-2 animate-pulse" />
              <span className="text-[11px] font-semibold">Belum Ada Cover</span>
            </div>
          )}
        </div>

        {/* Edit & Kustom Card Panel */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-4 space-y-3">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider pb-2 border-b border-slate-100">
            Edit & Kustom
          </h3>
          
          {/* Status Dropdown */}
          <div className="relative">
            <button
              onClick={() => setStatusOpen((v) => !v)}
              className="w-full py-2 bg-white border border-blue-500 text-blue-600 font-extrabold text-xs tracking-wider rounded-lg flex items-center justify-center gap-1.5 uppercase hover:bg-blue-50 transition"
            >
              {produk.status === "published" ? "PUBLIK" : "TIDAK PUBLIK"}
              <span className="text-[10px] text-blue-500 font-bold">↕</span>
            </button>

            {statusOpen && (
              <div className="absolute w-full bg-white border border-slate-200 mt-1 rounded-lg shadow-lg z-30 overflow-hidden divide-y divide-slate-100">
                <button
                  onClick={() => handleStatusChange("published")}
                  className="w-full text-center px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
                >
                  PUBLIK
                </button>
                <button
                  onClick={() => handleStatusChange("unpublished")}
                  className="w-full text-center px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
                >
                  TIDAK PUBLIK (UNPUBLISHED)
                </button>
                <button
                  onClick={() => handleStatusChange("unlisted")}
                  className="w-full text-center px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
                >
                  ARSIP (UNLISTED)
                </button>
              </div>
            )}
          </div>

          {/* EDIT Button */}
          <button
            onClick={() => setEditOpen(true)}
            className="w-full py-2 bg-white border border-blue-500 text-blue-600 font-extrabold text-xs tracking-wider rounded-lg hover:bg-blue-50 transition uppercase"
          >
            EDIT
          </button>

          {/* DUPLIKAT PRODUK Button */}
          <button
            onClick={() => setDupOpen(true)}
            className="w-full py-2 bg-white border border-slate-800 text-slate-800 font-extrabold text-xs tracking-wider rounded-lg hover:bg-slate-50 transition uppercase"
          >
            DUPLIKAT PRODUK
          </button>

          {/* KUSTOM FORM Button */}
          <button
            onClick={() => toast.info("Fitur Kustom Form untuk Produk Digital akan segera hadir!")}
            className="w-full py-2 bg-white border border-slate-800 text-slate-800 font-extrabold text-xs tracking-wider rounded-lg hover:bg-slate-50 transition uppercase"
          >
            KUSTOM FORM
          </button>

          {/* ARSIP Button */}
          <button
            onClick={() => handleStatusChange("unlisted")}
            className="w-full py-2 bg-white border border-slate-800 text-slate-800 font-extrabold text-xs tracking-wider rounded-lg hover:bg-slate-50 transition uppercase"
          >
            ARSIP
          </button>

          {/* TUTUP Button */}
          <button
            onClick={() => handleStatusChange("unpublished")}
            className="w-full py-2 bg-white border border-red-500 text-red-600 font-extrabold text-xs tracking-wider rounded-lg hover:bg-red-50 transition uppercase"
          >
            TUTUP
          </button>

          {/* HAPUS Button */}
          <button
            onClick={() => setHapusOpen(true)}
            className="w-full py-2 bg-white border border-red-500 text-red-600 font-extrabold text-xs tracking-wider rounded-lg hover:bg-red-50 transition uppercase"
          >
            HAPUS
          </button>
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
        oldFiles={oldFiles}
      />
    </>
  );
}