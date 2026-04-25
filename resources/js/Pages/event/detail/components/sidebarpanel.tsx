import { useState } from "react";
import { router } from "@inertiajs/react";
import { Button } from "@/components/ui/button";
import {
  ShieldCheck, Star, Award,
  Settings, UserCircle, BookOpen, Users2, CheckSquare,
  BarChart3, ChevronDown, Edit, Trash2, Copy,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { ConfirmDialog } from "./confirmdialog";
import { EditEventDialog } from "./editeventdialog";
import { KustomFormDialog } from "./kustomformdialog";
import {
  InstrukturDialog,
  SilabusDialog,
  CocokUntukDialog,
  OutcomeDialog,
  FaqDialog,
  TestimoniDialog,
} from "./landingdialog";

/* =========================
   TYPES
========================= */

type Event = {
  id: number;
  nama: string;
  status: "published" | "unpublished" | "unlisted";
};

/* =========================
   CONSTANT
========================= */

const statusOptions = [
  { value: "published",   label: "Published",   dot: "bg-green-500",  text: "text-green-700"  },
  { value: "unpublished", label: "Unpublished", dot: "bg-yellow-500", text: "text-yellow-700" },
  { value: "unlisted",    label: "Unlisted",    dot: "bg-gray-400",   text: "text-gray-700"   },
];

const statusBgMap: Record<string, string> = {
  published:   "bg-green-600  hover:bg-green-700",
  unpublished: "bg-yellow-500 hover:bg-yellow-600",
  unlisted:    "bg-gray-500   hover:bg-gray-600",
};

const statusToastMsg: Record<string, string> = {
  published:   "Event berhasil dipublikasikan! ✅",
  unpublished: "Event berhasil dinonaktifkan.",
  unlisted:    "Event berhasil disembunyikan.",
};

/* =========================
   COMPONENT
========================= */

export function SidebarPanel({ event }: { event: Event }) {
  const eventId = event.id;

  const btnClass =
    "w-full flex items-center justify-center gap-2 px-4 py-2.5 border border-gray-200 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition bg-white";

  const [statusOpen, setStatusOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [dupOpen, setDupOpen] = useState(false);
  const [tutupOpen, setTutupOpen] = useState(false);
  const [hapusOpen, setHapusOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [kustomFormOpen, setKustomFormOpen] = useState(false);

  const [instrukturOpen, setInstrukturOpen] = useState(false);
  const [silabusOpen, setSilabusOpen] = useState(false);
  const [cocokOpen, setCocokOpen] = useState(false);
  const [outcomeOpen, setOutcomeOpen] = useState(false);
  const [faqOpen, setFaqOpen] = useState(false);
  const [testimoniOpen, setTestimoniOpen] = useState(false);

  /* =========================
     ACTIONS
  ========================= */

  const handleStatusChange = (newStatus: string) => {
    if (newStatus === event.status) {
      setStatusOpen(false);
      return;
    }

    setIsLoading(true);
    router.patch(
      `/events/${event.id}/status`,
      { status: newStatus },
      {
        preserveScroll: true,
        onSuccess: () => {
          setStatusOpen(false);
          setIsLoading(false);
          toast.success(statusToastMsg[newStatus]);
          router.reload({ only: ["event"] });
        },
        onError: () => {
          setIsLoading(false);
          toast.error("Gagal mengubah status.");
        },
      }
    );
  };

  const handleDuplicate = () => {
    router.post(`/events/${event.id}/duplicate`, {}, {
      onSuccess: () => toast.success("Event berhasil diduplikat!"),
      onError: () => toast.error("Gagal duplicate."),
    });
  };

  const handleTutup = () => {
    router.patch(`/events/${event.id}/status`, { status: "unpublished" }, {
      onSuccess: () => {
        toast.success("Event berhasil ditutup.");
        router.reload({ only: ["event"] });
      },
      onError: () => toast.error("Gagal menutup."),
    });
  };

  const handleHapus = () => {
    router.delete(`/events/${event.id}`, {
      onSuccess: () => {
        toast.success("Event berhasil dihapus.");
        router.visit("/events");
      },
      onError: () => toast.error("Gagal hapus."),
    });
  };

  /* =========================
     UI BUTTONS
  ========================= */



  /* =========================
     RENDER
  ========================= */

  return (
    <>
      <div className="space-y-3">

        {/* PANEL */}
        <div className="bg-white border rounded-lg p-3 space-y-2">

          {/* STATUS */}
          <div className="relative">
            <button
              onClick={() => setStatusOpen(v => !v)}
              className={cn(
                "w-full py-2.5 text-white font-bold rounded-md flex items-center justify-center gap-2",
                event.status && statusBgMap[event.status] || "bg-gray-500"
              )}
            >
              {event.status?.toUpperCase() || "UNKNOWN"}
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
      <EditEventDialog open={editOpen} onOpenChange={setEditOpen} event={event} />

      <ConfirmDialog open={dupOpen} onOpenChange={setDupOpen} onConfirm={handleDuplicate} title="Duplicate?" />
      <ConfirmDialog open={tutupOpen} onOpenChange={setTutupOpen} onConfirm={handleTutup} title="Tutup Event?" />
      <ConfirmDialog open={hapusOpen} onOpenChange={setHapusOpen} onConfirm={handleHapus} title="Hapus Event?" />
    </>
  );
}