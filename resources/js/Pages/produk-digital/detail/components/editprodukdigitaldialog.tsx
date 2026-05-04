import { useState, useEffect } from "react";
import { router } from "@inertiajs/react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

type ProdukDigital = {
  id: number;
  nama: string;
  deskripsi?: string;
  kategori?: "e-book" | "novel" | "komik" | "template" | "tulisan" | "video";
  tipe_pembayaran: "berbayar" | "gratis";
  harga: number;
  harga_coret: number | null;
  sumber_file: "upload" | "file_lama" | "link";
  cover_url: string | null;
  total_penjualan: number;
  created_at: string;
};

const KATEGORI_OPTIONS = [
  { value: "e-book", label: "E-Book" },
  { value: "novel", label: "Novel" },
  { value: "komik", label: "Komik" },
  { value: "template", label: "Template" },
  { value: "tulisan", label: "Tulisan / Artikel" },
  { value: "video", label: "Video" },
] as const;

export function EditProdukDigitalDialog({
  open,
  onOpenChange,
  produk,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  produk: ProdukDigital;
}) {
  const [form, setForm] = useState({
    nama: "",
    deskripsi: "",
    kategori: "" as "" | "e-book" | "novel" | "komik" | "template" | "tulisan" | "video",
    harga: 0,
    harga_coret: 0,
    tipe_pembayaran: "gratis" as "berbayar" | "gratis",
    sumber_file: "upload" as "upload" | "file_lama" | "link",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  // ✅ sync semua field dari produk
  useEffect(() => {
    if (produk) {
      setForm({
        nama: produk.nama || "",
        deskripsi: produk.deskripsi || "",
        kategori: produk.kategori || "",
        harga: produk.harga || 0,
        harga_coret: produk.harga_coret || 0,
        tipe_pembayaran: produk.tipe_pembayaran || "gratis",
        sumber_file: produk.sumber_file || "upload",
      });
    }
  }, [produk]);

  const handleClose = (v: boolean) => {
    onOpenChange(v);

    if (!v && produk) {
      setForm({
        nama: produk.nama || "",
        deskripsi: produk.deskripsi || "",
        kategori: produk.kategori || "",
        harga: produk.harga || 0,
        harga_coret: produk.harga_coret || 0,
        tipe_pembayaran: produk.tipe_pembayaran || "gratis",
        sumber_file: produk.sumber_file || "upload",
      });
    }
  };

  const handleSave = () => {
    if (!form.nama.trim()) {
      toast.error("Nama produk wajib diisi");
      return;
    }

    setIsSubmitting(true);

    router.post(`/produk-digital/${produk.id}`, form, {
      preserveScroll: true,
      onSuccess: () => {
        setIsSubmitting(false);
        onOpenChange(false);
        toast.success("Produk berhasil diperbarui!");
      },
      onError: (errors) => {
        setIsSubmitting(false);
        const errorMsg = Object.values(errors)[0] as string || "Gagal memperbarui produk";
        toast.error(errorMsg);
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Produk Digital</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Nama */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              Nama Produk
            </label>
            <Input
              placeholder="Nama produk"
              value={form.nama}
              onChange={(e) =>
                setForm({ ...form, nama: e.target.value })
              }
            />
          </div>

          {/* Kategori */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              Kategori <span className="text-gray-400 font-normal">(Opsional)</span>
            </label>
            <select
              value={form.kategori}
              onChange={(e) =>
                setForm({ ...form, kategori: e.target.value as typeof form.kategori })
              }
              className="w-full px-3 py-2 border border-gray-200 rounded-md bg-white text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Pilih Kategori...</option>
              {KATEGORI_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Harga */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              Harga
            </label>
            <Input
              type="number"
              placeholder="0"
              value={form.harga}
              onChange={(e) =>
                setForm({ ...form, harga: Number(e.target.value) })
              }
            />
          </div>

          {/* Deskripsi */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              Deskripsi
            </label>
            <Textarea
              placeholder="Deskripsi produk..."
              rows={3}
              value={form.deskripsi}
              onChange={(e) =>
                setForm({ ...form, deskripsi: e.target.value })
              }
            />
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => handleClose(false)}
              disabled={isSubmitting}
            >
              Batal
            </Button>

            <Button
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
              onClick={handleSave}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Menyimpan..." : "Simpan"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}