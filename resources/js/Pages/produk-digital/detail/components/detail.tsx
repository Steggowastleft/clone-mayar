import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Copy, Code2, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

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

export default function TabDetail({ bootcamp }: { bootcamp: Bootcamp }) {
  const [deskOpen, setDeskOpen] = useState(false);
  const baseUrl = window.location.origin;

  const rows = [
    {
      label: "Status",
      value: (
        <Badge
          className={cn(
            "text-white text-xs",
            bootcamp.status === "published"
              ? "bg-green-500"
              : bootcamp.status === "unlisted"
              ? "bg-gray-500"
              : "bg-yellow-500"
          )}
        >
          {bootcamp.status}
        </Badge>
      ),
    },
    { label: "Nama",      value: bootcamp.name },
    { label: "Kategori",  value: bootcamp.kategori || "-" },
    {
      label: "Harga",
      value: bootcamp.harga
        ? `Rp ${Number(bootcamp.harga).toLocaleString("id-ID")}`
        : "Rp 0",
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
    { label: "Waktu Mulai Penjualan",     value: bootcamp.tanggal_mulai_jual         || bootcamp.date || "-" },
    { label: "Tanggal Kadaluarsa",         value: bootcamp.tanggal_tutup_daftar       || "-" },
    { label: "Tanggal Mulai Pembelajaran", value: bootcamp.tanggal_mulai_pembelajaran || "-" },
    { label: "Tanggal Akhir Pembelajaran", value: bootcamp.tanggal_batas_pembelajaran || "-" },
    { label: "Instruksi",                  value: bootcamp.instruksi                  || "-" },
    { label: "Syarat Ketentuan",           value: bootcamp.syarat_ketentuan           || "-" },
    {
      label: "Gambar/Cover",
      value: bootcamp.cover_url ? (
        <img
          src={bootcamp.cover_url}
          alt="cover"
          className="h-16 w-16 object-cover rounded-md"
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
            { label: "COPY LINK PENDAFTARAN", url: `${baseUrl}/p/${bootcamp.id}/bootcamp`,  openable: false },
            { label: "COPY HALAMAN KELAS",    url: `${baseUrl}/bootcamp/${bootcamp.id}`,   openable: true  },
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
          Share link diatas ke sosial media, whatsapp, telegram, tiktok, landing page, email atau
          channel penjualan lainnya untuk menerima order dan pembayaran.
        </p>
      </div>

      {/* Detail Table */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
        <table className="w-full">
          <tbody>
            {rows.map((row, i) => (
              <tr key={i} className="border-b border-gray-50 last:border-0">
                <td className="px-5 py-3 text-sm text-gray-500 w-56 align-top">{row.label}</td>
                <td className="px-5 py-3 text-sm text-gray-800">{row.value}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="px-5 py-3 border-t border-gray-100">
          <p className="text-xs text-gray-400">Dibuat Tanggal: {bootcamp.date}</p>
        </div>
      </div>

      {/* Deskripsi Dialog */}
      <Dialog open={deskOpen} onOpenChange={setDeskOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Deskripsi</DialogTitle>
            <DialogDescription>Deskripsi lengkap bootcamp ini.</DialogDescription>
          </DialogHeader>
          <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap max-h-96 overflow-y-auto">
            {bootcamp.deskripsi || "Tidak ada deskripsi."}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}