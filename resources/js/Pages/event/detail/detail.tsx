import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Copy, Code2, ChevronDown, MapPin, Plus, Ticket } from "lucide-react";
import { cn } from "@/lib/utils";
import { type EventData } from "../show";
import { router } from "@inertiajs/react";
import { toast } from "sonner";

export default function TabDetail({ event }: { event: EventData }) {
  const [deskOpen, setDeskOpen] = useState(false);
  const [tiketOpen, setTiketOpen] = useState(false);
  const [isSubmittingTiket, setIsSubmittingTiket] = useState(false);

  const [tiketForm, setTiketForm] = useState({
    tipe: "berbayar",
    nama: "",
    harga: "",
    kuota: "",
    deskripsi: "",
    waktu_mulai: "",
    waktu_selesai: "",
  });

  const baseUrl = window.location.origin;

  const handleTiketSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tiketForm.nama.trim() || !tiketForm.harga.trim() || !tiketForm.kuota.trim() || !tiketForm.waktu_mulai.trim()) {
      toast.error("Nama Tiket, Harga, Jumlah Tiket, dan Waktu Mulai Penjualan wajib diisi");
      return;
    }

    setIsSubmittingTiket(true);

    router.post(`/events/${event.id}/tiket`, tiketForm, {
      onSuccess: () => {
        toast.success("Tiket berhasil dibuat!");
        setTiketOpen(false);
        setTiketForm({
          tipe: "berbayar",
          nama: "",
          harga: "",
          kuota: "",
          deskripsi: "",
          waktu_mulai: "",
          waktu_selesai: "",
        });
        setIsSubmittingTiket(false);
      },
      onError: () => {
        toast.error("Gagal membuat tiket.");
        setIsSubmittingTiket(false);
      }
    });
  };

  const rows = [
    {
      label: "Status",
      value: (
        <Badge
          className={cn(
            "text-white text-xs",
            event.status === "published"
              ? "bg-green-500"
              : event.status === "unlisted"
              ? "bg-gray-500"
              : "bg-yellow-500"
          )}
        >
          {event.status}
        </Badge>
      ),
    },
    { label: "Nama Event", value: event.name },
    {
      label: "Tipe",
      value: (
        <Badge
          className={
            event.tipe === "online"
              ? "bg-blue-100 text-blue-700 border border-blue-200"
              : "bg-orange-100 text-orange-700 border border-orange-200"
          }
        >
          {event.tipe === "online" ? "Online" : "Offline"}
        </Badge>
      ),
    },
    {
      label: "Deskripsi",
      value: (
        <button
          onClick={() => setDeskOpen(true)}
          className="text-blue-600 text-sm underline hover:text-blue-800 flex items-center gap-1"
        >
          <ChevronDown className="h-3 w-3" /> Lihat Deskripsi
        </button>
      ),
    },
    { label: "Lokasi", value: event.lokasi || "-" },
    {
      label: "Lokasi Map",
      value: event.lokasi_map ? (
        <a
          href={`https://maps.google.com/?q=${encodeURIComponent(event.lokasi_map)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 underline text-sm flex items-center gap-1"
        >
          <MapPin className="h-3 w-3" /> Lihat di Google Maps
        </a>
      ) : (
        "-"
      ),
    },
    { label: "Waktu Mulai", value: event.waktu_mulai || "-" },
    {
      label: "Waktu Selesai",
      value: event.waktu_selesai || "-",
    },
    {
      label: "Waktu Mulai Penjualan",
      value: event.waktu_mulai_jual || "-",
    },
    {
      label: "Tanggal Tutup Pendaftaran",
      value: event.tanggal_tutup_daftar || "-",
    },
    {
      label: "Maks. Tiket/Transaksi",
      value: event.max_tiket_per_transaksi
        ? `${event.max_tiket_per_transaksi} Tiket`
        : "1 Tiket",
    },
    { label: "Instruksi", value: event.instruksi || "-" },
    {
      label: "Syarat Ketentuan",
      value: event.syarat_ketentuan || "-",
    },
    {
      label: "Bisa Affiliate",
      value: event.bisa_affiliate ? (
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
      label: "Cover",
      value: event.cover_url ? (
        <img
          src={event.cover_url}
          alt="cover"
          className="h-20 w-32 object-cover rounded-md"
        />
      ) : (
        <span className="text-gray-400 text-sm">Tidak ada gambar</span>
      ),
    },
  ];

  return (
    <>
      {/* Share Links */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-5 mb-5">
        <h3 className="font-semibold text-gray-800 mb-4">
          Share Link untuk Menerima Pendaftaran
        </h3>
        <div className="grid grid-cols-2 gap-4">
          {[
            {
              label: "COPY LINK PENDAFTARAN",
              url: `${baseUrl}/p/${event.id}/event`,
              openable: false,
            },
            {
              label: "COPY HALAMAN EVENT",
              url: `${baseUrl}/event/${event.id}`,
              openable: true,
            },
          ].map((item) => (
            <div key={item.label}>
              <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-t-md text-xs text-gray-500 truncate">
                {item.url}
              </div>
              <div className="flex">
                <button
                  onClick={() =>
                    navigator.clipboard.writeText(item.url)
                  }
                  className="flex-1 py-2 bg-white border border-t-0 border-gray-200 text-xs font-semibold text-gray-700 hover:bg-gray-50 flex items-center justify-center gap-2"
                >
                  <Copy className="h-3 w-3" /> {item.label}
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
                  <button className="px-3 py-2 bg-gray-800 border border-t-0 border-gray-800 text-white hover:bg-gray-700">
                    <Code2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-400 text-center mt-3">
          Share link diatas ke sosial media, whatsapp, telegram,
          tiktok, landing page, email atau channel penjualan lainnya
          untuk menerima order dan pembayaran.
        </p>
      </div>

      {/* Buat Tiket Section */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-5 mb-5">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h3 className="font-semibold text-gray-800 flex items-center gap-2">
              <Ticket className="h-5 w-5 text-blue-600" /> Tiket Event
            </h3>
            <p className="text-xs text-gray-500 mt-1">
              Buat dan kelola tiket untuk event ini.
            </p>
          </div>
          <Button onClick={() => setTiketOpen(true)} className="bg-blue-600 hover:bg-blue-700 text-white shrink-0">
            <Plus className="h-4 w-4 mr-1" />
            Buat Tiket
          </Button>
        </div>
      </div>

      {/* Detail Table */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
        <table className="w-full">
          <tbody>
            {rows.map((row, i) => (
              <tr
                key={i}
                className="border-b border-gray-50 last:border-0"
              >
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
            Dibuat Tanggal: {event.date}
          </p>
        </div>
      </div>

      {/* Deskripsi Dialog */}
      <Dialog open={deskOpen} onOpenChange={setDeskOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Deskripsi</DialogTitle>
            <DialogDescription>
              Deskripsi lengkap event ini.
            </DialogDescription>
          </DialogHeader>
          <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap max-h-96 overflow-y-auto">
            {event.deskripsi || "Tidak ada deskripsi."}
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal Buat Tiket */}
      <Dialog open={tiketOpen} onOpenChange={setTiketOpen}>
        <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Ticket className="h-5 w-5 text-blue-600" /> Buat Tiket
            </DialogTitle>
            <DialogDescription>
              Isi informasi tiket untuk event ini.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleTiketSubmit} className="space-y-4 mt-2">
            {/* Tipe Tiket */}
            <div className="space-y-1">
              <Label htmlFor="tipe">Tipe Tiket <span className="text-red-500">*</span></Label>
              <div className="flex items-center gap-2 p-2 bg-gray-50 border rounded-md">
                <input
                  type="radio"
                  id="tipe"
                  name="tipe"
                  value="berbayar"
                  checked={tiketForm.tipe === "berbayar"}
                  onChange={(e) => setTiketForm({ ...tiketForm, tipe: e.target.value })}
                  className="w-4 h-4 text-blue-600"
                />
                <Label htmlFor="tipe" className="text-sm font-normal cursor-pointer mb-0">Tiket Berbayar</Label>
              </div>
            </div>

            {/* Nama Tiket */}
            <div className="space-y-1">
              <Label htmlFor="nama">Nama Tiket <span className="text-red-500">*</span></Label>
              <Input
                id="nama"
                placeholder="Contoh: Tiket Early Bird"
                value={tiketForm.nama}
                onChange={(e) => setTiketForm({ ...tiketForm, nama: e.target.value })}
                required
              />
            </div>

            {/* Harga */}
            <div className="space-y-1">
              <Label htmlFor="harga">Harga <span className="text-red-500">*</span></Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">Rp</span>
                <Input
                  id="harga"
                  type="number"
                  placeholder="0"
                  value={tiketForm.harga}
                  onChange={(e) => setTiketForm({ ...tiketForm, harga: e.target.value })}
                  className="pl-10"
                  required
                />
              </div>
              <p className="text-[10px] text-gray-500">Penagihan ini menggunakan mata uang IDR (Rupiah)</p>
            </div>

            {/* Kuota */}
            <div className="space-y-1">
              <Label htmlFor="kuota">Jumlah Tiket (Kuota) <span className="text-red-500">*</span></Label>
              <Input
                id="kuota"
                type="number"
                placeholder="Contoh: 100"
                value={tiketForm.kuota}
                onChange={(e) => setTiketForm({ ...tiketForm, kuota: e.target.value })}
                required
              />
            </div>

            {/* Deskripsi Tiket */}
            <div className="space-y-1">
              <Label htmlFor="deskripsi">Deskripsi Tiket</Label>
              <Textarea
                id="deskripsi"
                placeholder="Deskripsikan benefit atau ketentuan tiket ini..."
                className="min-h-[80px]"
                value={tiketForm.deskripsi}
                onChange={(e) => setTiketForm({ ...tiketForm, deskripsi: e.target.value })}
              />
            </div>

            {/* Waktu Mulai Penjualan */}
            <div className="space-y-1">
              <Label htmlFor="waktu_mulai">Waktu Mulai Penjualan <span className="text-red-500">*</span></Label>
              <Input
                id="waktu_mulai"
                type="datetime-local"
                value={tiketForm.waktu_mulai}
                onChange={(e) => setTiketForm({ ...tiketForm, waktu_mulai: e.target.value })}
                required
              />
              <p className="text-xs text-gray-500">Pilih Tanggal dan Jam</p>
            </div>

            {/* Waktu Selesai Penjualan */}
            <div className="space-y-1">
              <Label htmlFor="waktu_selesai">Waktu Selesai Penjualan</Label>
              <Input
                id="waktu_selesai"
                type="datetime-local"
                value={tiketForm.waktu_selesai}
                onChange={(e) => setTiketForm({ ...tiketForm, waktu_selesai: e.target.value })}
              />
              <p className="text-xs text-gray-500">Pilih Tanggal dan Jam (Opsional)</p>
            </div>

            {/* Timezone Info */}
            <p className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
              Timezone menggunakan WIB (GMT+07:00) - Asia/Jakarta
            </p>

            <DialogFooter className="mt-6 pt-4 border-t">
              <Button type="button" variant="outline" onClick={() => setTiketOpen(false)} disabled={isSubmittingTiket}>
                Batal
              </Button>
              <Button type="submit" disabled={isSubmittingTiket} className="bg-blue-600 hover:bg-blue-700 text-white">
                {isSubmittingTiket ? "Menyimpan..." : "Simpan Tiket"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}