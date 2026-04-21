  import { useState } from "react";
  import { router } from "@inertiajs/react";
  import { Button } from "@/components/ui/button";
  import {
    ShieldCheck, Tag, ArrowUpDown, Star, Award,
    Settings, UserCircle, BookOpen, Users2, CheckSquare,
    BarChart3, Mail, Puzzle, ChevronDown, Edit, Trash2, Handshake, Route, Copy,
  } from "lucide-react";
  import { cn } from "@/lib/utils";
  import { toast } from "sonner";
  import { ConfirmDialog } from "./confirmdialog";
  import { EditBootcampDialog } from "./editbootcampdialog";
  import { KustomFormDialog } from "./kustomformdialog";
  import {
    InstrukturDialog,
    SilabusDialog,
    CocokUntukDialog,
    OutcomeDialog,
    FaqDialog,
    TestimoniDialog,
  } from "./landingdialog";

  type Bootcamp = {
    id: number;
    name: string;
    batch: string;
    status: "published" | "unpublished" | "unlisted";
    date: string;
    participants: number;
    kategori?: string;
    harga?: number;
    deskripsi?: string;
    instruksi?: string;
    syarat_ketentuan?: string;
    cover?: string;
    cover_url?: string;
    tanggal_mulai_jual?: string;
    tanggal_tutup_daftar?: string;
    tanggal_mulai_pembelajaran?: string;
    tanggal_batas_pembelajaran?: string;
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

  const statusToastMsg: Record<string, string> = {
    published:   "Produk berhasil dipublikasikan! ✅",
    unpublished: "Produk berhasil dinonaktifkan.",
    unlisted:    "Produk berhasil disembunyikan.",
  };

  export function SidebarPanel({ bootcamp }: { bootcamp: Bootcamp }) {
    // Derive bootcampId for landing dialogs
    const bootcampId = bootcamp.id;
    const btnClass =
      "w-full flex items-center justify-center gap-2 px-4 py-2.5 border border-gray-200 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition bg-white";

    const [statusOpen, setStatusOpen] = useState(false);
    const [editOpen,   setEditOpen]   = useState(false);
    const [dupOpen,    setDupOpen]    = useState(false);
    const [tutupOpen,  setTutupOpen]  = useState(false);
    const [hapusOpen,  setHapusOpen]  = useState(false);
    const [isLoading,  setIsLoading]  = useState(false);

    const [kustomFormOpen, setKustomFormOpen] = useState(false);

    // Landing dialog states
    const [instrukturOpen,  setInstrukturOpen]  = useState(false);
    const [silabusOpen,     setSilabusOpen]     = useState(false);
    const [cocokOpen,       setCocokOpen]       = useState(false);
    const [outcomeOpen,     setOutcomeOpen]     = useState(false);
    const [faqOpen,         setFaqOpen]         = useState(false);
    const [testimoniOpen,   setTestimoniOpen]   = useState(false);

    // ── Ganti status ──
    const handleStatusChange = (newStatus: string) => {
      if (newStatus === bootcamp.status) {
        setStatusOpen(false);
        return;
      }

      setIsLoading(true);
      router.patch(
        `/bootcamps/${bootcamp.id}/status`,
        { status: newStatus },
        {
          preserveScroll: true,
          onSuccess: () => {
            setStatusOpen(false);
            setIsLoading(false);
            toast.success(statusToastMsg[newStatus] ?? "Status berhasil diubah.");
            // reload props dari server agar badge status & index ikut update
            router.reload({ only: ["bootcamp"] });
          },
          onError: () => {
            setIsLoading(false);
            toast.error("Gagal mengubah status. Silakan coba lagi.");
          },
        }
      );
    };

    // ── Duplicate ──
    const handleDuplicate = () => {
      router.post(
        `/bootcamps/${bootcamp.id}/duplicate`,
        {},
        {
          onSuccess: () => toast.success("Produk berhasil diduplikat!"),
          onError:   () => toast.error("Gagal menduplikat produk."),
        }
      );
    };

    // ── Tutup (set unpublished) ──
    const handleTutup = () => {
      router.patch(
        `/bootcamps/${bootcamp.id}/status`,
        { status: "unpublished" },
        {
          preserveScroll: true,
          onSuccess: () => {
            toast.success("Produk berhasil ditutup.");
            router.reload({ only: ["bootcamp"] });
          },
          onError: () => toast.error("Gagal menutup produk."),
        }
      );
    };

    // ── Hapus ──
    const handleHapus = () => {
      router.delete(`/bootcamps/${bootcamp.id}`, {
        onSuccess: () => {
          toast.success("Produk berhasil dihapus.");
          router.visit("/bootcamps");
        },
        onError: () => toast.error("Gagal menghapus produk."),
      });
    };

    const customButtons = [
      { icon: <ShieldCheck className="h-4 w-4" />, label: "KUSTOM FORM", onClick: () => setKustomFormOpen(true) },
      { icon: <Settings className="h-4 w-4" />,    label: "PENGATURAN CHECKOUT" },
    ];

    const landingButtons = [
      { icon: <UserCircle className="h-4 w-4" />,  label: "INSTRUKTUR",            onClick: () => setInstrukturOpen(true) },
      { icon: <BookOpen className="h-4 w-4" />,    label: "SILABUS",               onClick: () => setSilabusOpen(true) },
      { icon: <Users2 className="h-4 w-4" />,      label: "KELAS INI COCOK UNTUK", onClick: () => setCocokOpen(true) },
      { icon: <CheckSquare className="h-4 w-4" />, label: "OUTCOME",               onClick: () => setOutcomeOpen(true) },
      { icon: <BarChart3 className="h-4 w-4" />,   label: "FAQ",                   onClick: () => setFaqOpen(true) },
      { icon: <Star className="h-4 w-4" />,        label: "RATING & TESTIMONIALS", onClick: () => setTestimoniOpen(true) },
    ];

    return (
      <>
        <div className="space-y-3">
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-3 space-y-2">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide px-1">
              Edit & Kustom
            </h3>

            {/* ── Status Dropdown ── */}
            <div className="relative">
              <button
                onClick={() => setStatusOpen((v) => !v)}
                disabled={isLoading}
                className={cn(
                  "w-full py-2.5 text-white text-sm font-bold rounded-md flex items-center justify-center gap-2 transition",
                  statusBgMap[bootcamp.status] ?? "bg-blue-600 hover:bg-blue-700",
                  isLoading && "opacity-70 cursor-not-allowed"
                )}
              >
                {/* dot indikator */}
                <span className={cn(
                  "w-2 h-2 rounded-full shrink-0",
                  bootcamp.status === "published"   ? "bg-green-300"  :
                  bootcamp.status === "unpublished" ? "bg-yellow-300" : "bg-gray-300"
                )} />
                <span className="uppercase">
                  {isLoading ? "Menyimpan..." : bootcamp.status}
                </span>
                <ChevronDown className={cn(
                  "h-4 w-4 transition-transform duration-200",
                  statusOpen && "rotate-180"
                )} />
              </button>

              {statusOpen && (
                <>
                  {/* backdrop */}
                  <div className="fixed inset-0 z-40" onClick={() => setStatusOpen(false)} />
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-xl z-50 overflow-hidden">
                    {statusOptions.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => handleStatusChange(opt.value)}
                        className={cn(
                          "w-full px-4 py-2.5 text-sm font-medium text-left hover:bg-gray-50 transition flex items-center gap-2",
                          opt.text,
                          opt.value === bootcamp.status && "bg-gray-50"
                        )}
                      >
                        <span className={cn("w-2 h-2 rounded-full shrink-0", opt.dot)} />
                        {opt.label}
                        {opt.value === bootcamp.status && (
                          <span className="ml-auto text-xs text-gray-400">Aktif</span>
                        )}
                      </button>
                    ))}
                    <div className="border-t border-gray-100">
                      <button
                        onClick={() => { setHapusOpen(true); setStatusOpen(false); }}
                        className="w-full px-4 py-2.5 text-sm font-medium text-left hover:bg-red-50 text-red-600 transition flex items-center gap-2"
                      >
                        <Trash2 className="h-4 w-4" /> Hapus Produk
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Edit */}
            <button className={btnClass} onClick={() => setEditOpen(true)}>
              <Edit className="h-4 w-4" /> EDIT
            </button>

            {/* Duplicate */}
            <button className={btnClass} onClick={() => setDupOpen(true)}>
              <Copy className="h-4 w-4" /> DUPLICATE PRODUCT
            </button>

            {/* Tutup */}
            <button
              className={cn(btnClass, "text-red-600 border-red-200 hover:bg-red-50")}
              onClick={() => setTutupOpen(true)}
            >
              TUTUP
            </button>

            {/* Hapus */}
            <button
              className={cn(btnClass, "text-red-600 border-red-200 hover:bg-red-50")}
              onClick={() => setHapusOpen(true)}
            >
              <Trash2 className="h-4 w-4" /> HAPUS
            </button>

            <div className="border-t border-gray-100 pt-2 space-y-2">
              {customButtons.map((b) => (
                <button key={b.label} className={btnClass} onClick={b.onClick}>{b.icon} {b.label}</button>
              ))}
            </div>
          </div>

          {/* Landing Buttons */}
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-3 space-y-2">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide px-1">
              Landing / Promotion Page
            </h3>
            {landingButtons.map((b) => (
              <button key={b.label} className={btnClass} onClick={b.onClick}>{b.icon} {b.label}</button>
            ))}
          </div>
        </div>

        {/* ── Dialogs ── */}
        <EditBootcampDialog open={editOpen} onOpenChange={setEditOpen} bootcamp={bootcamp} />

        <ConfirmDialog
          open={dupOpen}
          onOpenChange={setDupOpen}
          title="Duplikat Produk?"
          description="Apakah Anda yakin untuk menduplikat produk ini?"
          confirmLabel="Ya, Duplikat"
          confirmClass="bg-blue-600 hover:bg-blue-700 text-white"
          onConfirm={handleDuplicate}
        />

        <ConfirmDialog
          open={tutupOpen}
          onOpenChange={setTutupOpen}
          title="Tutup Produk?"
          description="Apakah Anda yakin akan menutup produk ini?"
          warning="Produk yang telah ditutup tidak akan bisa dibeli oleh pelanggan Anda."
          confirmLabel="Ya, Tutup Produk"
          confirmClass="bg-red-600 hover:bg-red-700 text-white"
          onConfirm={handleTutup}
        />

        <ConfirmDialog
          open={hapusOpen}
          onOpenChange={setHapusOpen}
          title="Hapus Produk?"
          description="Apakah Anda yakin akan menghapus produk ini?"
          warning="Produk yang dihapus akan ditutup dan hilang dari daftar produk di dashboard Anda."
          confirmLabel="Ya, Hapus Produk"
          confirmClass="bg-red-600 hover:bg-red-700 text-white"
          onConfirm={handleHapus}
        />

        {/* Kustom Form Dialog */}
        <KustomFormDialog open={kustomFormOpen} onOpenChange={setKustomFormOpen} bootcampId={bootcampId} />

        {/* Landing Dialogs */}
        <InstrukturDialog  open={instrukturOpen}  onOpenChange={setInstrukturOpen}  bootcampId={bootcampId} />
        <SilabusDialog     open={silabusOpen}     onOpenChange={setSilabusOpen}     bootcampId={bootcampId} />
        <CocokUntukDialog  open={cocokOpen}       onOpenChange={setCocokOpen}       bootcampId={bootcampId} />
        <OutcomeDialog     open={outcomeOpen}     onOpenChange={setOutcomeOpen}     bootcampId={bootcampId} />
        <FaqDialog         open={faqOpen}         onOpenChange={setFaqOpen}         bootcampId={bootcampId} />
        <TestimoniDialog   open={testimoniOpen}   onOpenChange={setTestimoniOpen}   bootcampId={bootcampId} />
      </>
    );
  }