import { useState } from "react";
import { router } from "@inertiajs/react";
import { Button } from "@/components/ui/button";
import {
  ChevronDown, Edit, Trash2, Copy,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { ConfirmDialog } from "./confirmdialog";
import { EditEventDialog } from "./editeventdialog";

/* =========================
   TYPES
========================= */

type PaymentLink = {
  id: number;
  nama: string;
  status: "published" | "unpublished" | "unlisted";
};

/* =========================
   CONSTANT
========================= */

const statusOptions = [
  { value: "published", label: "Published" },
  { value: "unpublished", label: "Unpublished" },
  { value: "unlisted", label: "Unlisted" },
];

const statusBgMap: Record<string, string> = {
  published: "bg-green-600 hover:bg-green-700",
  unpublished: "bg-yellow-500 hover:bg-yellow-600",
  unlisted: "bg-gray-500 hover:bg-gray-600",
};

const statusToastMsg: Record<string, string> = {
  published: "Link berhasil dipublikasikan! ✅",
  unpublished: "Link berhasil dinonaktifkan.",
  unlisted: "Link berhasil disembunyikan.",
};

/* =========================
   COMPONENT
========================= */

export function SidebarPanel({ link }: { link?: PaymentLink }) {
  if (!link) return null; // 🔥 anti crash

  const btnClass =
    "w-full flex items-center justify-center gap-2 px-4 py-2.5 border border-gray-200 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition bg-white";

  const [statusOpen, setStatusOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [dupOpen, setDupOpen] = useState(false);
  const [tutupOpen, setTutupOpen] = useState(false);
  const [hapusOpen, setHapusOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleStatusChange = (newStatus: string) => {
    if (newStatus === link.status) {
      setStatusOpen(false);
      return;
    }

    setIsLoading(true);
    router.patch(
      `/payment-link/${link.id}/status`,
      { status: newStatus },
      {
        preserveScroll: true,
        onSuccess: () => {
          setStatusOpen(false);
          setIsLoading(false);
          toast.success(statusToastMsg[newStatus]);
          router.reload({ only: ["link"] });
        },
        onError: () => {
          setIsLoading(false);
          toast.error("Gagal mengubah status.");
        },
      }
    );
  };

  const handleDuplicate = () => {
    router.post(`/payment-link/${link.id}/duplicate`, {}, {
      preserveScroll: true,
      onSuccess: () => toast.success("Link berhasil diduplikat!"),
      onError: () => toast.error("Gagal duplicate."),
    });
  };

  const handleTutup = () => {
    router.patch(`/payment-link/${link.id}/status`, { status: "unpublished" }, {
      preserveScroll: true,
      onSuccess: () => {
        toast.success("Link berhasil ditutup.");
        router.reload({ only: ["link"] });
      },
      onError: () => toast.error("Gagal menutup."),
    });
  };

  const handleHapus = () => {
    router.delete(`/payment-link/${link.id}`, {
      preserveScroll: true,
      onSuccess: () => {
        toast.success("Link berhasil dihapus.");
        router.visit("/payment-link");
      },
      onError: () => toast.error("Gagal hapus."),
    });
  };

  return (
    <>
      <div className="space-y-3">
        <div className="bg-white border rounded-lg p-3 space-y-2">

          {/* STATUS */}
          <div className="relative">
            <button
              onClick={() => setStatusOpen(v => !v)}
              className={cn(
                "w-full py-2.5 text-white font-bold rounded-md flex items-center justify-center gap-2",
                link.status && statusBgMap[link.status] || "bg-gray-500"
              )}
            >
              {link.status?.toUpperCase() || "UNKNOWN"}
              <ChevronDown className={cn("h-4 w-4", statusOpen && "rotate-180")} />
            </button>

            {statusOpen && (
              <div className="absolute w-full bg-white border mt-1 rounded shadow">
                {statusOptions.map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => handleStatusChange(opt.value)}
                    className="w-full text-left px-3 py-2 hover:bg-gray-50"
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button className={btnClass} onClick={() => setEditOpen(true)}>
            <Edit className="h-4 w-4" /> EDIT
          </button>

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

      {/* DIALOG */}
      <EditEventDialog open={editOpen} onOpenChange={setEditOpen} event={link} />

      <ConfirmDialog open={dupOpen} onOpenChange={setDupOpen} onConfirm={handleDuplicate} title="Duplicate?" />
      <ConfirmDialog open={tutupOpen} onOpenChange={setTutupOpen} onConfirm={handleTutup} title="Tutup Link?" />
      <ConfirmDialog open={hapusOpen} onOpenChange={setHapusOpen} onConfirm={handleHapus} title="Hapus Link?" />
    </>
  );
}