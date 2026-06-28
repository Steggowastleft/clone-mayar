import DashboardLayout from "@/components/dashboard/dashboardlayout";
import { Head, router } from "@inertiajs/react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";

const formatRupiahInput = (value: string | number) => {
  if (value === undefined || value === null || value === "") return "";
  const clean = String(value).replace(/\D/g, "");
  return clean ? new Intl.NumberFormat("id-ID").format(Number(clean)) : "";
};

export default function CoachingMentoringCreate() {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    nama: "",
    deskripsi: "",
    booking_url: "",
    tipe_pembayaran: "gratis" as "gratis" | "berbayar",
    harga: "",
    harga_coret: "",
    waktu_mulai_jual: "",
    tanggal_kadaluarsa: "",
    max_pembayaran: "",
    instruksi: "",
    syarat_ketentuan: "",
    bisa_affiliate: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      router.post("/coaching-mentoring", formData, {
        onSuccess: () => {
          // Redirect to index after success
        },
        onError: () => {
          alert("Gagal membuat sesi coaching/mentoring");
        },
        onFinish: () => setIsLoading(false),
      });
    } catch (error) {
      alert("Terjadi kesalahan");
      setIsLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <Head title="Buat Coaching & Mentoring" />
      <div className="p-6 max-w-4xl">
        <div className="mb-6">
          <button
            onClick={() => router.visit("/coaching-mentoring")}
            className="text-blue-600 hover:text-blue-700 flex items-center gap-2 mb-4"
          >
            ← Kembali
          </button>
          <h1 className="text-2xl font-bold text-gray-800">
            Buat Sesi Coaching & Mentoring
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="bg-white border rounded-lg p-6 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="nama">Nama Sesi *</Label>
              <Input
                id="nama"
                required
                value={formData.nama}
                onChange={(e) =>
                  setFormData({ ...formData, nama: e.target.value })
                }
                placeholder="Nama sesi coaching/mentoring"
              />
            </div>

            <div>
              <Label htmlFor="booking_url">Booking URL *</Label>
              <Input
                id="booking_url"
                type="url"
                required
                value={formData.booking_url}
                onChange={(e) =>
                  setFormData({ ...formData, booking_url: e.target.value })
                }
                placeholder="https://..."
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="tipe_pembayaran">Tipe Pembayaran *</Label>
              <Select
                value={formData.tipe_pembayaran}
                onValueChange={(value: any) =>
                  setFormData({ ...formData, tipe_pembayaran: value })
                }
              >
                <SelectTrigger id="tipe_pembayaran">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gratis">Gratis</SelectItem>
                  <SelectItem value="berbayar">Berbayar</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {formData.tipe_pembayaran === "berbayar" && (
              <div>
                <Label htmlFor="harga">Harga</Label>
                <Input
                  id="harga"
                  type="text"
                  value={formData.harga ? formatRupiahInput(formData.harga) : ""}
                  onChange={(e) =>
                    setFormData({ ...formData, harga: e.target.value.replace(/\D/g, "") })
                  }
                  placeholder="0"
                />
              </div>
            )}
          </div>

          {formData.tipe_pembayaran === "berbayar" && (
            <div>
              <Label htmlFor="harga_coret">Harga Coret (Opsional)</Label>
              <Input
                id="harga_coret"
                type="text"
                value={formData.harga_coret ? formatRupiahInput(formData.harga_coret) : ""}
                onChange={(e) =>
                  setFormData({ ...formData, harga_coret: e.target.value.replace(/\D/g, "") })
                }
                placeholder="0"
              />
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="waktu_mulai_jual">Waktu Mulai Jual</Label>
              <Input
                id="waktu_mulai_jual"
                type="date"
                value={formData.waktu_mulai_jual}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    waktu_mulai_jual: e.target.value,
                  })
                }
              />
            </div>

            <div>
              <Label htmlFor="tanggal_kadaluarsa">Tanggal Kadaluarsa</Label>
              <Input
                id="tanggal_kadaluarsa"
                type="date"
                value={formData.tanggal_kadaluarsa}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    tanggal_kadaluarsa: e.target.value,
                  })
                }
              />
            </div>
          </div>

          <div>
            <Label htmlFor="max_pembayaran">Max Pembayaran (Quota)</Label>
            <Input
              id="max_pembayaran"
              type="number"
              value={formData.max_pembayaran}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  max_pembayaran: e.target.value,
                })
              }
              placeholder="Biarkan kosong untuk unlimited"
            />
          </div>

          <div>
            <Label htmlFor="deskripsi">Deskripsi *</Label>
            <Textarea
              id="deskripsi"
              required
              value={formData.deskripsi}
              onChange={(e) =>
                setFormData({ ...formData, deskripsi: e.target.value })
              }
              placeholder="Jelaskan tentang sesi coaching/mentoring Anda"
              rows={4}
            />
          </div>

          <div>
            <Label htmlFor="instruksi">Instruksi</Label>
            <Textarea
              id="instruksi"
              value={formData.instruksi}
              onChange={(e) =>
                setFormData({ ...formData, instruksi: e.target.value })
              }
              placeholder="Instruksi untuk peserta"
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="syarat_ketentuan">Syarat & Ketentuan</Label>
            <Textarea
              id="syarat_ketentuan"
              value={formData.syarat_ketentuan}
              onChange={(e) =>
                setFormData({ ...formData, syarat_ketentuan: e.target.value })
              }
              placeholder="Syarat dan ketentuan yang berlaku"
              rows={3}
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              id="bisa_affiliate"
              type="checkbox"
              checked={formData.bisa_affiliate}
              onChange={(e) =>
                setFormData({ ...formData, bisa_affiliate: e.target.checked })
              }
            />
            <Label htmlFor="bisa_affiliate" className="mb-0 cursor-pointer">
              Aktifkan Affiliate
            </Label>
          </div>

          <div className="flex gap-2 pt-4">
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Buat Sesi
            </Button>
            <Button
              type="button"
              onClick={() => router.visit("/coaching-mentoring")}
              variant="outline"
              disabled={isLoading}
            >
              Batal
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
