import { useState } from "react";
import { router } from "@inertiajs/react";
import { Edit, Trash2, Copy, ChevronDown, Megaphone } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { ConfirmDialog } from "./confirmdialog";
import { Dialog, DialogContent, DialogTitle, DialogHeader, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

type PenggalanganDana = {
  id: number;
  nama: string;
  status: "published" | "unpublished" | "unlisted";
};

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
  published:   "Penggalangan Dana berhasil dipublikasikan! ✅",
  unpublished: "Penggalangan Dana berhasil dinonaktifkan.",
  unlisted:    "Penggalangan Dana berhasil disembunyikan.",
};

export function SidebarPanel({ produk }: { produk: PenggalanganDana }) {
  const btnClass =
    "w-full flex items-center justify-center gap-2 px-4 py-2.5 border border-gray-200 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition bg-white";

  const [statusOpen, setStatusOpen] = useState(false);
  const [dupOpen, setDupOpen] = useState(false);
  const [tutupOpen, setTutupOpen] = useState(false);
  const [hapusOpen, setHapusOpen] = useState(false);
  const [kabarOpen, setKabarOpen] = useState(false);

  const [kabarForm, setKabarForm] = useState({ judul: "", deskripsi: "" });
  const [isSubmittingKabar, setIsSubmittingKabar] = useState(false);

  const handleStatusChange = (newStatus: string) => {
    if (newStatus === produk.status) {
      setStatusOpen(false);
      return;
    }

    router.patch(
      `/penggalangan-dana/${produk.id}/status`,
      { status: newStatus },
      {
        preserveScroll: true,
        onSuccess: () => {
          setStatusOpen(false);
          toast.success(statusToastMsg[newStatus]);
          router.reload({ only: ["produk"] });
        },
        onError: () => {
          toast.error("Gagal mengubah status.");
        },
      }
    );
  };

  const handleDuplicate = () => {
    router.post(`/penggalangan-dana/${produk.id}/duplicate`, {}, {
      onSuccess: () => toast.success("Penggalangan Dana berhasil diduplikat!"),
      onError: () => toast.error("Gagal duplicate."),
    });
  };

  const handleTutup = () => {
    router.patch(`/penggalangan-dana/${produk.id}/status`, { status: "unpublished" }, {
      onSuccess: () => {
        toast.success("Penggalangan Dana berhasil ditutup.");
        router.reload({ only: ["produk"] });
      },
      onError: () => toast.error("Gagal menutup."),
    });
  };

  const handleHapus = () => {
    router.delete(`/penggalangan-dana/${produk.id}`, {
      onSuccess: () => {
        toast.success("Penggalangan Dana berhasil dihapus.");
        router.visit("/penggalangan-dana");
      },
      onError: () => toast.error("Gagal hapus."),
    });
  };

  const handleKabarSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!kabarForm.judul.trim() || !kabarForm.deskripsi.trim()) {
      toast.error("Judul dan deskripsi wajib diisi");
      return;
    }
    
    setIsSubmittingKabar(true);
    // Kita arahkan POST ini ke endpoint yang akan memproses kabar terbaru
    // Nanti endpoint ini harus dibuat di backend
    router.post(`/penggalangan-dana/${produk.id}/kabar`, kabarForm, {
      onSuccess: () => {
        toast.success("Kabar Terbaru berhasil dikirim!");
        setKabarOpen(false);
        setKabarForm({ judul: "", deskripsi: "" });
        setIsSubmittingKabar(false);
      },
      onError: () => {
        toast.error("Gagal mengirim Kabar Terbaru.");
        setIsSubmittingKabar(false);
      }
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
                produk.status && statusBgMap[produk.status] || "bg-gray-500"
              )}
            >
              {produk.status?.toUpperCase() || "UNKNOWN"}
              <ChevronDown className={cn("h-4 w-4", statusOpen && "rotate-180")} />
            </button>

            {statusOpen && (
              <div className="absolute z-10 w-full bg-white border mt-1 rounded shadow">
                {statusOptions.map(opt => (
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
          
          <button 
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 border border-blue-200 rounded-md text-sm font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 transition mt-2"
            onClick={() => setKabarOpen(true)}
          >
            <Megaphone className="h-4 w-4" /> BUAT KABAR TERBARU
          </button>
        </div>
      </div>

      {/* DIALOGS */}
      <ConfirmDialog open={dupOpen} onOpenChange={setDupOpen} onConfirm={handleDuplicate} title="Duplicate?" />
      <ConfirmDialog open={tutupOpen} onOpenChange={setTutupOpen} onConfirm={handleTutup} title="Tutup Penggalangan Dana?" />
      <ConfirmDialog open={hapusOpen} onOpenChange={setHapusOpen} onConfirm={handleHapus} title="Hapus Penggalangan Dana?" />

      {/* DIALOG KABAR TERBARU */}
      <Dialog open={kabarOpen} onOpenChange={setKabarOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Buat Kabar Terbaru</DialogTitle>
          </DialogHeader>
          
          <div className="bg-blue-50 p-3 rounded-lg border border-blue-100 mb-4">
            <p className="text-sm text-blue-800 font-semibold mb-1">Anda dapat membuat kabar terbaru hanya untuk:</p>
            <ul className="list-disc list-inside text-sm text-blue-700 space-y-1">
              <li>Memberi ucapan terima kasih dari penggalang dana / penerima manfaat.</li>
              <li>Memberi tahu progres, bukti & dokumentasi penggunaan dana yang terkumpul.</li>
            </ul>
          </div>

          <form onSubmit={handleKabarSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="judul">Judul Kabar Terbaru <span className="text-red-500">*</span></Label>
              <Input 
                id="judul"
                placeholder="Contoh: Penyaluran Dana Kepada Warga Pengungsi Bencana Alam"
                value={kabarForm.judul}
                onChange={(e) => setKabarForm({ ...kabarForm, judul: e.target.value })}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="deskripsi">Deskripsi Kabar Terbaru <span className="text-red-500">*</span></Label>
              <Textarea 
                id="deskripsi"
                placeholder="Tuliskan detail kabar terbaru di sini..."
                className="min-h-[120px]"
                value={kabarForm.deskripsi}
                onChange={(e) => setKabarForm({ ...kabarForm, deskripsi: e.target.value })}
                required
              />
            </div>

            <p className="text-xs text-amber-600 bg-amber-50 p-2 rounded border border-amber-100">
              <span className="font-bold">Penting!</span> ketika kabar sudah terkirim kamu hanya dapat menghapusnya melalui detail kabar terbaru.
            </p>

            <DialogFooter className="mt-6">
              <Button type="button" variant="outline" onClick={() => setKabarOpen(false)} disabled={isSubmittingKabar}>
                Batal
              </Button>
              <Button type="submit" disabled={isSubmittingKabar} className="bg-blue-600 hover:bg-blue-700 text-white">
                {isSubmittingKabar ? "Mengirim..." : "Kirim Kabar Terbaru"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}