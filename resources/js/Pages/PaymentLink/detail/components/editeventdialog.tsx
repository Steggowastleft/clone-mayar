import { useState, useEffect } from "react";
import { router } from "@inertiajs/react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

type PaymentLink = {
  id: number;
  nama: string;
  harga: number;
  harga_coret?: number;
  deskripsi?: string;
  pesan_setelah_bayar?: string;
  maksimum_pembayaran?: number;
  redirect_url?: string;
  bisa_affiliate: boolean;
};

const formatRupiah = (val: string | number): string => {
  if (val === undefined || val === null || val === "") return "";
  const num = typeof val === "string" ? parseInt(val.replace(/\D/g, ""), 10) : val;
  if (isNaN(num)) return "";
  return num.toLocaleString("id-ID");
};

export function EditEventDialog({
  open,
  onOpenChange,
  event
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  event: any;
}) {
  const link = event as PaymentLink;

  const [form, setForm] = useState({
    nama: "",
    harga: "",
    harga_coret: "",
    deskripsi: "",
    pesan_setelah_bayar: "",
    maksimum_pembayaran: "",
    redirect_url: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (link) {
      setForm({
        nama: link.nama || "",
        harga: link.harga ? String(link.harga) : "",
        harga_coret: link.harga_coret ? String(link.harga_coret) : "",
        deskripsi: link.deskripsi || "",
        pesan_setelah_bayar: link.pesan_setelah_bayar || "",
        maksimum_pembayaran: link.maksimum_pembayaran ? String(link.maksimum_pembayaran) : "",
        redirect_url: link.redirect_url || "",
      });
    }
  }, [link]);

  const handleClose = (v: boolean) => {
    onOpenChange(v);
  };

  const handleHargaChange = (field: "harga" | "harga_coret", val: string) => {
    const clean = val.replace(/\D/g, "");
    setForm(prev => ({ ...prev, [field]: clean }));
  };

  const handleSave = () => {
    if (!form.nama.trim()) {
      toast.error("Nama link pembayaran wajib diisi");
      return;
    }
    if (!form.harga) {
      toast.error("Harga wajib diisi");
      return;
    }

    const hargaNum = parseInt(form.harga, 10);
    const hargaCoretNum = form.harga_coret ? parseInt(form.harga_coret, 10) : null;

    if (hargaCoretNum !== null && hargaCoretNum <= hargaNum) {
      toast.error("Harga coret harus lebih besar dari harga utama");
      return;
    }

    setIsSubmitting(true);

    const payload = {
      nama: form.nama,
      harga: hargaNum,
      harga_coret: hargaCoretNum,
      deskripsi: form.deskripsi,
      pesan_setelah_bayar: form.pesan_setelah_bayar || null,
      maksimum_pembayaran: form.maksimum_pembayaran ? parseInt(form.maksimum_pembayaran, 10) : null,
      redirect_url: form.redirect_url || null,
    };

    router.put(`/payment-link/${link.id}`, payload, {
      preserveScroll: true,
      onSuccess: () => {
        setIsSubmitting(false);
        onOpenChange(false);
        toast.success("Link pembayaran berhasil diperbarui");
        router.reload();
      },
      onError: (err) => {
        setIsSubmitting(false);
        toast.error("Gagal memperbarui link pembayaran");
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-xl max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Link Pembayaran</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          {/* Nama */}
          <div className="space-y-1">
            <Label htmlFor="edit-nama">Nama Link Pembayaran <span className="text-red-500">*</span></Label>
            <Input
              id="edit-nama"
              placeholder="Contoh: Pembayaran Seminar UI/UX 2025"
              value={form.nama}
              onChange={(e) => setForm({ ...form, nama: e.target.value })}
            />
          </div>

          {/* Harga */}
          <div className="space-y-1">
            <Label htmlFor="edit-harga">Harga <span className="text-red-500">*</span></Label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-sm text-gray-500 font-medium">Rp</span>
              <Input
                id="edit-harga"
                className="pl-9"
                placeholder="0"
                value={formatRupiah(form.harga)}
                onChange={(e) => handleHargaChange("harga", e.target.value)}
                inputMode="numeric"
              />
            </div>
          </div>

          {/* Harga Coret */}
          <div className="space-y-1">
            <Label htmlFor="edit-harga-coret">Harga Coret (Opsional)</Label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-sm text-gray-500 font-medium">Rp</span>
              <Input
                id="edit-harga-coret"
                className="pl-9"
                placeholder="0"
                value={formatRupiah(form.harga_coret)}
                onChange={(e) => handleHargaChange("harga_coret", e.target.value)}
                inputMode="numeric"
              />
            </div>
          </div>

          {/* Deskripsi */}
          <div className="space-y-1">
            <Label htmlFor="edit-deskripsi">Deskripsi <span className="text-red-500">*</span></Label>
            <Textarea
              id="edit-deskripsi"
              placeholder="Tuliskan deskripsi..."
              rows={4}
              value={form.deskripsi}
              onChange={(e) => setForm({ ...form, deskripsi: e.target.value })}
            />
          </div>

          {/* Pesan setelah bayar */}
          <div className="space-y-1">
            <Label htmlFor="edit-pesan">Pesan Setelah Bayar / Catatan</Label>
            <Textarea
              id="edit-pesan"
              placeholder="Pesan yang akan dilihat pembeli..."
              rows={3}
              value={form.pesan_setelah_bayar}
              onChange={(e) => setForm({ ...form, pesan_setelah_bayar: e.target.value })}
            />
          </div>

          {/* Maksimum Pembayaran */}
          <div className="space-y-1">
            <Label htmlFor="edit-maksimum">Maksimum Jumlah Pembayaran (Kuota)</Label>
            <Input
              id="edit-maksimum"
              type="number"
              min={1}
              placeholder="Unlimited"
              value={form.maksimum_pembayaran}
              onChange={(e) => setForm({ ...form, maksimum_pembayaran: e.target.value })}
            />
          </div>

          {/* Redirect URL */}
          <div className="space-y-1">
            <Label htmlFor="edit-redirect">Redirect URL</Label>
            <Input
              id="edit-redirect"
              type="url"
              placeholder="https://..."
              value={form.redirect_url}
              onChange={(e) => setForm({ ...form, redirect_url: e.target.value })}
            />
          </div>

          <div className="flex gap-2 justify-end pt-2">
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
              Batal
            </Button>
            <Button onClick={handleSave} disabled={isSubmitting} className="bg-blue-600 hover:bg-blue-700 text-white">
              {isSubmitting ? "Menyimpan..." : "Simpan Perubahan"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}