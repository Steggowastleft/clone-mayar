import { useState } from "react";
import { Badge } from "@/components/ui/badge";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Copy, Loader2, Code2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { router, usePage } from "@inertiajs/react";

type CoachingMentoring = {
  id: number;
  nama: string;
  deskripsi: string;
  booking_url: string;
  tipe_pembayaran: "berbayar" | "gratis";
  harga: number | null;
  harga_coret: number | null;
  cover: string | null;
  waktu_mulai_jual: string | null;
  tanggal_kadaluarsa: string | null;
  max_pembayaran: number | null;
  instruksi: string | null;
  syarat_ketentuan: string | null;
  bisa_affiliate: boolean;
  status: "published" | "unpublished" | "unlisted";
  total_penjualan: number;
  user_id: number;
  created_at: string;
  updated_at: string;
};

const formatRupiahInput = (value: string | number) => {
  if (value === undefined || value === null || value === "") return "";
  const clean = String(value).replace(/\D/g, "");
  return clean ? new Intl.NumberFormat("id-ID").format(Number(clean)) : "";
};

type Props = {
  coaching: CoachingMentoring;
  onUpdate?: (coaching: CoachingMentoring) => void;
};

export default function DetailTab({ coaching, onUpdate }: Props) {
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [deskOpen, setDeskOpen] = useState(false);
  const baseUrl = window.location.origin;

  const [formData, setFormData] = useState({
    nama: coaching.nama,
    deskripsi: coaching.deskripsi,
    booking_url: coaching.booking_url,
    tipe_pembayaran: coaching.tipe_pembayaran,
    harga: coaching.harga?.toString() || "",
    harga_coret: coaching.harga_coret?.toString() || "",
    waktu_mulai_jual: coaching.waktu_mulai_jual || "",
    tanggal_kadaluarsa: coaching.tanggal_kadaluarsa || "",
    max_pembayaran: coaching.max_pembayaran?.toString() || "",
    instruksi: coaching.instruksi || "",
    syarat_ketentuan: coaching.syarat_ketentuan || "",
    bisa_affiliate: coaching.bisa_affiliate,
  });

  const handleSave = () => {
    setIsLoading(true);
    const cleanedData = {
      ...formData,
      harga: formData.harga ? formData.harga.replace(/\D/g, "") : "0",
      harga_coret: formData.harga_coret ? formData.harga_coret.replace(/\D/g, "") : null,
    };
    router.put(`/coaching-mentoring/${coaching.id}`, cleanedData, {
      onSuccess: (page: any) => {
        setIsEditing(false);
        if (page.props?.coaching && onUpdate) {
          onUpdate(page.props.coaching);
        }
      },
      onError: () => {
        alert("Gagal menyimpan data");
      },
      onFinish: () => {
        setIsLoading(false);
      },
      preserveScroll: true,
    });
  };

  const rows = [
    {
      label: "Status",
      value: (
        <Badge
          className={cn(
            "text-white text-xs",
            coaching.status === "published"
              ? "bg-green-500"
              : coaching.status === "unlisted"
              ? "bg-gray-500"
              : "bg-yellow-500"
          )}
        >
          {coaching.status}
        </Badge>
      ),
    },
    { label: "Nama", value: coaching.nama },
    {
      label: "Tipe Pembayaran",
      value: coaching.tipe_pembayaran === "berbayar" ? "Berbayar" : "Gratis",
    },
    {
      label: "Harga",
      value:
        coaching.tipe_pembayaran === "berbayar"
          ? `Rp ${new Intl.NumberFormat("id-ID").format(coaching.harga || 0)}`
          : "-",
    },
    {
      label: "Harga Coret",
      value:
        coaching.tipe_pembayaran === "berbayar" && coaching.harga_coret
          ? `Rp ${new Intl.NumberFormat("id-ID").format(coaching.harga_coret)}`
          : "-",
    },
    {
      label: "Booking URL",
      value: coaching.booking_url ? (
        <a
          href={coaching.booking_url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 underline text-sm"
        >
          {coaching.booking_url}
        </a>
      ) : (
        "-"
      ),
    },
    {
      label: "Waktu Mulai Jual",
      value: coaching.waktu_mulai_jual || "-",
    },
    {
      label: "Tanggal Kadaluarsa",
      value: coaching.tanggal_kadaluarsa || "-",
    },
    {
      label: "Maks. Pembayaran",
      value: coaching.max_pembayaran ?? "Unlimited",
    },
    {
      label: "Total Penjualan",
      value: coaching.total_penjualan,
    },
    {
      label: "Bisa Affiliate",
      value: coaching.bisa_affiliate ? (
        <Badge className="bg-green-100 text-green-700 border border-green-200">
          Ya
        </Badge>
      ) : (
        <Badge className="bg-gray-100 text-gray-600 border border-gray-200">
          Tidak
        </Badge>
      ),
    },
    {
      label: "Deskripsi",
      value: (
        <button
          onClick={() => setDeskOpen(true)}
          className="text-blue-600 text-sm underline hover:text-blue-800"
        >
          Lihat Deskripsi
        </button>
      ),
    },
    {
      label: "Cover",
      value: coaching.cover ? (
        <img
          src={coaching.cover}
          alt="cover"
          className="h-20 w-32 object-cover rounded-md"
        />
      ) : (
        <span className="text-gray-400 text-sm">Tidak ada gambar</span>
      ),
    },
  ];

  if (isEditing) {
    return (
      <div className="space-y-6">
        <div className="bg-white border rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">Edit Detail</h2>

          <div className="space-y-4">
            <div>
              <Label htmlFor="nama">Nama Sesi</Label>
              <Input
                id="nama"
                value={formData.nama}
                onChange={(e) =>
                  setFormData({ ...formData, nama: e.target.value })
                }
                placeholder="Nama sesi coaching/mentoring"
              />
            </div>

            <div>
              <Label htmlFor="booking_url">Booking URL</Label>
              <Input
                id="booking_url"
                type="url"
                value={formData.booking_url}
                onChange={(e) =>
                  setFormData({ ...formData, booking_url: e.target.value })
                }
                placeholder="https://..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="tipe_pembayaran">Tipe Pembayaran</Label>
                <Select
                  value={formData.tipe_pembayaran}
                  onValueChange={(value: "gratis" | "berbayar") =>
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
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-sm text-gray-500 font-medium">Rp</span>
                    <Input
                      id="harga"
                      className="pl-9"
                      type="text"
                      value={formatRupiahInput(formData.harga)}
                      onChange={(e) =>
                        setFormData({ ...formData, harga: e.target.value.replace(/\D/g, "") })
                      }
                      placeholder="0"
                      inputMode="numeric"
                    />
                  </div>
                </div>
              )}
            </div>

            {formData.tipe_pembayaran === "berbayar" && (
              <div>
                <Label htmlFor="harga_coret">Harga Coret (Opsional)</Label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-sm text-gray-500 font-medium">Rp</span>
                  <Input
                    id="harga_coret"
                    className="pl-9"
                    type="text"
                    value={formatRupiahInput(formData.harga_coret)}
                    onChange={(e) =>
                      setFormData({ ...formData, harga_coret: e.target.value.replace(/\D/g, "") })
                    }
                    placeholder="0"
                    inputMode="numeric"
                  />
                </div>
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
              <Label htmlFor="max_pembayaran">Maks. Pembayaran (Quota)</Label>
              <Input
                id="max_pembayaran"
                type="number"
                value={formData.max_pembayaran}
                onChange={(e) =>
                  setFormData({ ...formData, max_pembayaran: e.target.value })
                }
                placeholder="Biarkan kosong untuk unlimited"
              />
            </div>

            <div>
              <Label htmlFor="deskripsi">Deskripsi</Label>
              <Textarea
                id="deskripsi"
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
              <Label htmlFor="syarat_ketentuan">Syarat &amp; Ketentuan</Label>
              <Textarea
                id="syarat_ketentuan"
                value={formData.syarat_ketentuan}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    syarat_ketentuan: e.target.value,
                  })
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
                  setFormData({
                    ...formData,
                    bisa_affiliate: e.target.checked,
                  })
                }
              />
              <Label htmlFor="bisa_affiliate" className="mb-0 cursor-pointer">
                Aktifkan Affiliate
              </Label>
            </div>
          </div>

          <div className="flex gap-2 mt-6">
            <Button
              onClick={handleSave}
              disabled={isLoading}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Simpan
            </Button>
            <Button
              onClick={() => setIsEditing(false)}
              variant="outline"
              disabled={isLoading}
            >
              Batal
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* SHARE */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-5 mb-5">
        <h3 className="font-semibold text-gray-800 mb-4">Share Link</h3>

        <div className="grid grid-cols-2 gap-4">
          {[
            {
              label: "COPY LINK PENDAFTARAN",
              url: `${baseUrl}/coaching-mentoring/${coaching.id}/p`,
              openable: true,
            },
            {
              label: "COPY HALAMAN",
              url: `${baseUrl}/coaching-mentoring/${coaching.id}/p`,
              openable: true,
            },
          ].map((item) => (
            <div key={item.label}>
              <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-t-md text-xs text-gray-500 truncate">
                {item.url}
              </div>
              <div className="flex">
                <button
                  onClick={() => navigator.clipboard.writeText(item.url)}
                  className="flex-1 py-2 bg-white border border-t-0 border-gray-200 text-xs font-semibold text-gray-700 hover:bg-gray-50 flex items-center justify-center gap-2"
                >
                  <Copy className="h-3 w-3" />
                  {item.label}
                </button>
                {item.openable ? (
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-2 bg-gray-800 border border-t-0 border-gray-800 text-white hover:bg-gray-700 flex items-center"
                    title="Buka di tab baru"
                  >
                    <Code2 className="h-4 w-4" />
                  </a>
                ) : (
                  <button
                    onClick={() => navigator.clipboard.writeText(item.url)}
                    className="px-3 py-2 bg-gray-800 border border-t-0 border-gray-800 text-white hover:bg-gray-700"
                  >
                    <Code2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        <p className="text-xs text-gray-400 text-center mt-3">
          Share link di atas ke sosial media, WhatsApp, Telegram, TikTok,
          landing page, email, atau channel penjualan lainnya.
        </p>
      </div>

      {/* TABLE */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
        <table className="w-full">
          <tbody>
            {rows.map((row, i) => (
              <tr key={i} className="border-b border-gray-50 last:border-0">
                <td className="px-5 py-3 text-sm text-gray-500 w-56 align-top">
                  {row.label}
                </td>
                <td className="px-5 py-3 text-sm text-gray-800">
                  {row.value}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="px-5 py-3 border-t border-gray-100">
          <p className="text-xs text-gray-400">
            Dibuat: {coaching.created_at}
          </p>
        </div>
      </div>

      <Button
        onClick={() => setIsEditing(true)}
        className="bg-blue-600 hover:bg-blue-700 text-white mt-5"
      >
        Edit Detail
      </Button>

      {/* MODAL DESKRIPSI */}
      <Dialog open={deskOpen} onOpenChange={setDeskOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Deskripsi</DialogTitle>
          </DialogHeader>
          <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap max-h-96 overflow-y-auto">
            {coaching.deskripsi || "Tidak ada deskripsi."}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}