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
  cover?: string;
  cover_url?: string;
};

const statusOptions = [
  { value: "published",   label: "Published",   dot: "bg-green-500",  text: "text-green-700"  },
  { value: "unpublished", label: "Unpublished",  dot: "bg-yellow-500", text: "text-yellow-700" },
  { value: "unlisted",    label: "Unlisted",     dot: "bg-gray-400",   text: "text-gray-700"   },
];

const statusBgMap: Record<string, string> = {
  published:   "bg-green-600  hover:bg-green-700",
  unpublished: "bg-yellow-500 hover:bg-yellow-600",
  unlisted:    "bg-gray-500   hover:bg-gray-600",
};

export function SidebarPanel({ webinar }: { webinar: any }) {
  const btnClass =
    "w-full flex items-center justify-center gap-2 px-4 py-2.5 border border-gray-200 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition bg-white";

  const [statusOpen, setStatusOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [dupOpen, setDupOpen] = useState(false);
  const [tutupOpen, setTutupOpen] = useState(false);
  const [hapusOpen, setHapusOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleStatusChange = (status: string) => {
    if (status === webinar.status) {
      setStatusOpen(false);
      return;
    }

    setIsLoading(true);
    router.patch(`/webinars/${webinar.id}/status`, { status }, {
      onSuccess: () => {
        toast.success("Status berhasil diubah");
        setStatusOpen(false);
        setIsLoading(false);
        router.reload({ only: ["webinar"] });
      },
      onError: () => {
        toast.error("Gagal ubah status");
        setIsLoading(false);
      },
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
        router.reload({ only: ["webinar"] });
      },
      onError: () => toast.error("Gagal"),
    });
  };

  const handleHapus = () => {
    router.delete(`/webinars/${webinar.id}`, {
      onSuccess: () => {
        toast.success("Webinar berhasil dihapus.");
        router.visit("/webinar");
      },
      onError: () => toast.error("Gagal hapus"),
    });
  };

  const coverUrl = webinar.cover ? `/storage/${webinar.cover}` : (webinar.cover_url || null);

  return (
    <>
      <div className="space-y-3">
        {/* Cover Image */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
          <div className="aspect-video w-full bg-slate-100 flex items-center justify-center relative overflow-hidden border-b">
            {coverUrl ? (
              <img src={coverUrl} className="w-full h-full object-cover" alt={webinar.nama} />
            ) : (
              <span className="text-4xl">💻</span>
            )}
          </div>
          <div className="p-3 bg-slate-50/50">
            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wide">Cover Webinar</h4>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-3 space-y-2">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide px-1">
            Edit & Kustom
          </h3>

          {/* STATUS */}
          <div className="relative">
            <button
              onClick={() => setStatusOpen((v) => !v)}
              disabled={isLoading}
              className={cn(
                "w-full py-2.5 text-white text-sm font-bold rounded-md flex items-center justify-center gap-2 transition",
                statusBgMap[webinar.status] ?? "bg-gray-600 hover:bg-gray-700",
                isLoading && "opacity-70 cursor-not-allowed"
              )}
            >
              {/* dot indikator */}
              <span className={cn(
                "w-2 h-2 rounded-full shrink-0",
                webinar.status === "published"   ? "bg-green-300"  :
                webinar.status === "unpublished" ? "bg-yellow-300" : "bg-gray-300"
              )} />
              <span className="uppercase">
                {isLoading ? "Menyimpan..." : webinar.status}
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
                        opt.value === webinar.status && "bg-gray-50"
                      )}
                    >
                      <span className={cn("w-2 h-2 rounded-full shrink-0", opt.dot)} />
                      {opt.label}
                      {opt.value === webinar.status && (
                        <span className="ml-auto text-xs text-gray-400">Aktif</span>
                      )}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* EDIT */}
          <button className={btnClass} onClick={() => setEditOpen(true)}>
            <Edit className="h-4 w-4" /> EDIT WEBINAR
          </button>

          {/* DUPLICATE */}
          <button className={btnClass} onClick={() => setDupOpen(true)}>
            <Copy className="h-4 w-4" /> DUPLICATE PRODUCT
          </button>

          {/* TUTUP */}
          <button
            className={cn(btnClass, "text-red-600 border-red-200 hover:bg-red-50")}
            onClick={() => setTutupOpen(true)}
          >
            TUTUP
          </button>

          {/* DELETE */}
          <button
            className={cn(btnClass, "text-red-600 border-red-200 hover:bg-red-50")}
            onClick={() => setHapusOpen(true)}
          >
            <Trash2 className="h-4 w-4" /> HAPUS
          </button>
        </div>
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
        title="Duplikat Webinar?"
        description="Apakah Anda yakin untuk menduplikat webinar ini?"
        confirmLabel="Ya, Duplikat"
        confirmClass="bg-blue-600 hover:bg-blue-700 text-white"
        onConfirm={handleDuplicate}
      />

      {/* TUTUP CONFIRM */}
      <ConfirmDialog
        open={tutupOpen}
        onOpenChange={setTutupOpen}
        title="Tutup Webinar?"
        description="Apakah Anda yakin akan menutup webinar ini?"
        warning="Webinar yang telah ditutup tidak akan bisa diakses/dibeli oleh pelanggan Anda."
        confirmLabel="Ya, Tutup"
        confirmClass="bg-red-600 hover:bg-red-700 text-white"
        onConfirm={handleTutup}
      />

      {/* DELETE CONFIRM */}
      <ConfirmDialog
        open={hapusOpen}
        onOpenChange={setHapusOpen}
        title="Hapus Webinar?"
        description="Apakah Anda yakin akan menghapus webinar ini?"
        warning="Webinar yang dihapus tidak dapat dikembalikan."
        confirmLabel="Ya, Hapus"
        confirmClass="bg-red-600 hover:bg-red-700 text-white"
        onConfirm={handleHapus}
      />
    </>
  );
}