import { useState } from "react";
import { router } from "@inertiajs/react";
import { Button } from "@/components/ui/button";
import { ChevronDown, Trash2, Copy } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { ConfirmDialog } from "./confirmdialog";
import type { Tulisan } from "../../detail";

const statusOptions = [
  {
    value: "published",
    label: "Published",
    dot: "bg-green-500",
    text: "text-green-700",
  },
  {
    value: "unpublished",
    label: "Unpublished",
    dot: "bg-yellow-500",
    text: "text-yellow-700",
  },
  {
    value: "unlisted",
    label: "Unlisted",
    dot: "bg-gray-400",
    text: "text-gray-700",
  },
];

const statusBgMap: Record<string, string> = {
  published: "bg-green-600 hover:bg-green-700",
  unpublished: "bg-yellow-500 hover:bg-yellow-600",
  unlisted: "bg-gray-500 hover:bg-gray-600",
};

const statusToastMsg: Record<string, string> = {
  published: "Tulisan berhasil dipublikasikan! ✅",
  unpublished: "Tulisan berhasil dinonaktifkan.",
  unlisted: "Tulisan berhasil disembunyikan.",
};

export function SidebarPanel({ tulisan }: { tulisan: Tulisan }) {
  const btnClass =
    "w-full flex items-center justify-center gap-2 px-4 py-2.5 border border-gray-200 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition bg-white";

  const [statusOpen, setStatusOpen] = useState(false);
  const [dupOpen, setDupOpen] = useState(false);
  const [tutupOpen, setTutupOpen] = useState(false);
  const [hapusOpen, setHapusOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleStatusChange = (newStatus: string) => {
    if (newStatus === tulisan.status) {
      setStatusOpen(false);
      return;
    }

    setIsLoading(true);
    router.patch(
      `/tulisan/${tulisan.id}/status`,
      { status: newStatus },
      {
        preserveScroll: true,
        onSuccess: () => {
          setStatusOpen(false);
          setIsLoading(false);
          toast.success(statusToastMsg[newStatus]);
        },
        onError: () => {
          setIsLoading(false);
          toast.error("Gagal mengubah status.");
        },
      }
    );
  };

  const handleDuplicate = () => {
    router.post(
      `/tulisan/${tulisan.id}/duplicate`,
      {},
      {
        onSuccess: () => toast.success("Tulisan berhasil diduplikat!"),
        onError: () => toast.error("Gagal duplicate."),
      }
    );
  };

  const handleTutup = () => {
    router.patch(
      `/tulisan/${tulisan.id}/status`,
      { status: "unpublished" },
      {
        onSuccess: () => {
          toast.success("Tulisan berhasil ditutup.");
        },
        onError: () => toast.error("Gagal menutup."),
      }
    );
  };

  const handleHapus = () => {
    router.delete(`/tulisan/${tulisan.id}`, {
      onSuccess: () => {
        toast.success("Tulisan berhasil dihapus.");
        router.visit("/tulisan");
      },
      onError: () => toast.error("Gagal hapus."),
    });
  };

  return (
    <>
      <div className="space-y-3 w-64">
        {/* PANEL */}
        <div className="bg-white border rounded-lg p-3 space-y-2">
          {/* STATUS */}
          <div className="relative">
            <button
              onClick={() => setStatusOpen((v) => !v)}
              className={cn(
                "w-full py-2.5 text-white font-bold rounded-md flex items-center justify-center gap-2",
                (tulisan.status && statusBgMap[tulisan.status]) || "bg-gray-500"
              )}
              disabled={isLoading}
            >
              {tulisan.status?.toUpperCase() || "UNKNOWN"}
              <ChevronDown
                className={cn("h-4 w-4", statusOpen && "rotate-180")}
              />
            </button>

            {statusOpen && (
              <div className="absolute w-full bg-white border mt-1 rounded shadow z-10">
                {statusOptions.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => handleStatusChange(opt.value)}
                    className="w-full text-left px-3 py-2 hover:bg-gray-50 text-sm"
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button className={btnClass} onClick={() => setDupOpen(true)}>
            <Copy className="h-4 w-4" /> DUPLICATE
          </button>

          <button className={btnClass} onClick={() => setTutupOpen(true)}>
            TUTUP
          </button>

          <button className={btnClass} onClick={() => setHapusOpen(true)}>
            <Trash2 className="h-4 w-4" /> HAPUS
          </button>
        </div>
      </div>

      {/* DIALOGS */}
      <ConfirmDialog
        open={dupOpen}
        onOpenChange={setDupOpen}
        onConfirm={handleDuplicate}
        title="Duplicate Tulisan?"
      />
      <ConfirmDialog
        open={tutupOpen}
        onOpenChange={setTutupOpen}
        onConfirm={handleTutup}
        title="Tutup Tulisan?"
      />
      <ConfirmDialog
        open={hapusOpen}
        onOpenChange={setHapusOpen}
        onConfirm={handleHapus}
        title="Hapus Tulisan?"
      />
    </>
  );
}