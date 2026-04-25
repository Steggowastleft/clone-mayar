import { useState } from "react";
import { router } from "@inertiajs/react";
import { Edit, Trash2, Copy, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { ConfirmDialog } from "./confirmdialog";
import { EditWebinarDialog } from "./editwebinardialog";

type Webinar = {
  id: number;
  nama: string;
  status: "published" | "unpublished" | "unlisted";
};

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

export function SidebarPanel({ webinar }: { webinar: Webinar }) {
  const [statusOpen, setStatusOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [dupOpen, setDupOpen] = useState(false);
  const [tutupOpen, setTutupOpen] = useState(false);
  const [hapusOpen, setHapusOpen] = useState(false);

  const handleStatusChange = (status: string) => {
    router.patch(`/webinars/${webinar.id}/status`, { status }, {
      onSuccess: () => {
        toast.success("Status berhasil diubah");
        setStatusOpen(false);
      },
      onError: () => toast.error("Gagal ubah status"),
    });
  };

  const handleDuplicate = () => {
    router.post(`/webinars/${webinar.id}/duplicate`, {}, {
      onSuccess: () => {
        toast.success("Webinar berhasil diduplicate");
        setDupOpen(false);
      },
      onError: () => toast.error("Duplicate gagal"),
    });
  };

  const handleTutup = () => {
    router.patch(`/webinars/${webinar.id}/status`, {
      status: "unpublished",
    }, {
      onSuccess: () => {
        toast.success("Event ditutup");
        setTutupOpen(false);
      },
      onError: () => toast.error("Gagal"),
    });
  };

  const handleHapus = () => {
    router.delete(`/webinars/${webinar.id}`, {
      onSuccess: () => router.visit("/webinar"),
      onError: () => toast.error("Gagal hapus"),
    });
  };

  return (
    <>
      <div className="bg-white border rounded-lg p-3 space-y-2">

        {/* STATUS */}
        <div className="relative">
          <button
            onClick={() => setStatusOpen(v => !v)}
            className={cn(
              "w-full py-2.5 text-white font-bold rounded-md flex items-center justify-center gap-2",
              webinar.status && statusBgMap[webinar.status] || "bg-gray-500"
            )}
          >
            {webinar.status?.toUpperCase() || "UNKNOWN"}
            <ChevronDown className={cn("h-4 w-4", statusOpen && "rotate-180")} />
          </button>

          {statusOpen && (
            <div className="absolute w-full bg-white border mt-1 rounded shadow z-10">
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

        {/* EDIT */}
        <button
          onClick={() => setEditOpen(true)}
          className="w-full border py-2 flex gap-2 justify-center"
        >
          <Edit className="h-4 w-4" /> EDIT
        </button>

        {/* DUPLICATE */}
        <button
          onClick={() => setDupOpen(true)}
          className="w-full border py-2 flex gap-2 justify-center"
        >
          <Copy className="h-4 w-4" /> DUPLICATE
        </button>

        {/* TUTUP */}
        <button
          onClick={() => setTutupOpen(true)}
          className="w-full border py-2"
        >
          TUTUP
        </button>

        {/* DELETE */}
        <button
          onClick={() => setHapusOpen(true)}
          className="w-full border py-2 text-red-600"
        >
          <Trash2 className="h-4 w-4 inline" /> HAPUS
        </button>

      </div>

      {/* EDIT DIALOG */}
      <EditWebinarDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        event={webinar}
      />

      {/* DUPLICATE CONFIRM */}
      <ConfirmDialog
        open={dupOpen}
        onOpenChange={setDupOpen}
        onConfirm={handleDuplicate}
        title="Duplikat Webinar?"
        description="Webinar akan disalin menjadi data baru"
      />

      {/* TUTUP CONFIRM */}
      <ConfirmDialog
        open={tutupOpen}
        onOpenChange={setTutupOpen}
        onConfirm={handleTutup}
        title="Tutup Webinar?"
        description="Webinar akan di-unpublish"
      />

      {/* DELETE CONFIRM */}
      <ConfirmDialog
        open={hapusOpen}
        onOpenChange={setHapusOpen}
        onConfirm={handleHapus}
        title="Hapus Webinar?"
        description="Data akan dihapus permanen"
        confirmClass="bg-red-600 text-white"
      />
    </>
  );
}