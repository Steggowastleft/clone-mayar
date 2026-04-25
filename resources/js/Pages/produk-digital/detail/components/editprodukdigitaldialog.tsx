import { useState, useEffect } from "react";
import { router } from "@inertiajs/react";
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
  deskripsi?: string; // ✅ tambahin ini
  tipe_pembayaran: "berbayar" | "gratis";
  harga: number;
  harga_coret: number | null;
  sumber_file: "upload" | "file_lama" | "link";
  cover_url: string | null;
  total_penjualan: number;
  created_at: string;
};

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
        harga: produk.harga || 0,
        harga_coret: produk.harga_coret || 0,
        tipe_pembayaran: produk.tipe_pembayaran || "gratis",
        sumber_file: produk.sumber_file || "upload",
      });
    }
  };

  const handleSave = () => {
    if (!form.nama.trim()) {
      alert("Nama produk wajib diisi");
      return;
    }

    setIsSubmitting(true);

    router.post(`/produk-digital/${produk.id}`, form, {
      preserveScroll: true,
      onSuccess: () => {
        setIsSubmitting(false);
        onOpenChange(false);
      },
      onError: () => {
        setIsSubmitting(false);
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