import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Copy, Code2, ChevronDown, Download, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import { type ProdukDigitalData } from "../show";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

function formatRupiah(value: number): string {
  return "Rp " + new Intl.NumberFormat("id-ID").format(value);
}

export default function TabDetail({ produk }: { produk: ProdukDigitalData }) {
  const [deskOpen, setDeskOpen] = useState(false);
  const baseUrl = window.location.origin;

  const rows = [
    {
      label: "Status",
      value: (
        <Badge
          className={cn(
            "text-white text-xs",
            produk.status === "published"
              ? "bg-green-500"
              : produk.status === "unlisted"
              ? "bg-gray-500"
              : "bg-yellow-500"
          )}
        >
          {produk.status}
        </Badge>
      ),
    },
    { label: "Nama Produk", value: produk.nama },
    {
      label: "Kategori",
      value: produk.kategori ? (
        <Badge className="bg-purple-100 text-purple-700 border border-purple-200 capitalize">
          {produk.kategori}
        </Badge>
      ) : (
        "-"
      ),
    },
  ];

  // Specific details based on Kategori
  if (produk.kategori === "novel") {
    rows.push(
      { label: "Genre Novel", value: produk.genre || "-" },
      { label: "Penulis Novel", value: produk.author || "-" },
      { label: "Tag Novel", value: produk.isbn || "-" },
      { label: "Umur Pembaca Novel", value: produk.format ? `${produk.format} Tahun` : "-" },
      { label: "Bahasa Novel", value: produk.bahasa || "-" },
      {
        label: "Tipe Penulisan Novel",
        value: produk.tipe_tulisan ? (
          <Badge className="bg-blue-100 text-blue-700 border border-blue-200 capitalize font-semibold">
            {produk.tipe_tulisan === "one_shot" ? "One-Shot" : produk.tipe_tulisan === "chapter" ? "Chapter" : produk.tipe_tulisan}
          </Badge>
        ) : (
          "-"
        ),
      }
    );
  } else if (produk.kategori === "komik") {
    rows.push(
      { label: "Genre Komik", value: produk.genre || "-" },
      { label: "Author Komik", value: produk.author || "-" },
      { label: "Penulis Komik", value: produk.pembicara || "-" },
      { label: "Artis Komik", value: produk.artis || "-" },
      { label: "ISBN Komik", value: produk.isbn || "-" },
      { label: "Bahasa Komik", value: produk.bahasa || "-" },
      { label: "Jumlah Halaman Komik", value: produk.jumlah_halaman ? String(produk.jumlah_halaman) : "-" },
      {
        label: "Tipe Penulisan Komik",
        value: produk.tipe_tulisan ? (
          <Badge className="bg-blue-100 text-blue-700 border border-blue-200 capitalize font-semibold">
            {produk.tipe_tulisan === "one_shot" ? "One-Shot" : produk.tipe_tulisan === "chapter" ? "Chapter" : produk.tipe_tulisan}
          </Badge>
        ) : (
          "-"
        ),
      }
    );
  } else if (produk.kategori === "e-book") {
    rows.push(
      { label: "Author E-Book", value: produk.author || "-" },
      { label: "ISBN E-Book", value: produk.isbn || "-" },
      { label: "Format File E-Book", value: produk.format || "-" },
      { label: "Bahasa E-Book", value: produk.bahasa || "-" },
      { label: "Jumlah Halaman E-Book", value: produk.jumlah_halaman ? String(produk.jumlah_halaman) : "-" }
    );
  } else if (produk.kategori === "tulisan") {
    rows.push(
      { label: "Genre Tulisan", value: produk.genre || "-" },
      { label: "Author Tulisan", value: produk.author || "-" },
      { label: "Bahasa Tulisan", value: produk.bahasa || "-" },
      { label: "Jumlah Halaman Tulisan", value: produk.jumlah_halaman ? String(produk.jumlah_halaman) : "-" }
    );
  } else if (produk.kategori === "video") {
    rows.push(
      { label: "Pembicara / Narator", value: produk.pembicara || "-" },
      { label: "Durasi Video", value: produk.durasi || "-" },
      { label: "Tag Video", value: produk.genre || "-" },
      { label: "Umur Pembaca Video", value: produk.isbn ? `${produk.isbn} Tahun` : "-" },
      { label: "Bahasa Video", value: produk.bahasa || "-" }
    );
  }

  // Push remaining standard rows
  rows.push(
    {
      label: "Tipe Pembayaran",
      value: (
        <Badge
          className={
            produk.tipe_pembayaran === "berbayar"
              ? "bg-green-100 text-green-700 border border-green-200"
              : "bg-blue-100 text-blue-700 border border-blue-200"
          }
        >
          {produk.tipe_pembayaran === "berbayar" ? "Berbayar" : "Gratis"}
        </Badge>
      ),
    },
    {
      label: "Harga",
      value:
        produk.tipe_pembayaran === "berbayar" ? (
          <div className="flex items-center gap-2">
            <span className="font-semibold text-gray-800">
              {formatRupiah(produk.harga)}
            </span>
            {produk.harga_coret && (
              <span className="line-through text-gray-400 text-sm">
                {formatRupiah(produk.harga_coret)}
              </span>
            )}
          </div>
        ) : (
          <span className="text-blue-600 font-medium">Gratis</span>
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
    {
      label: "Sumber File",
      value: (
        <Badge className="bg-gray-100 text-gray-700 border border-gray-200 capitalize">
          {produk.sumber_file === "upload"
            ? "Upload File"
            : produk.sumber_file === "file_lama"
            ? "File Lama"
            : "Link / Redirect URL"}
        </Badge>
      ),
    },
    {
      label: "File / Konten",
      value: (() => {
        if (!produk.file_url) {
          return produk.redirect_url ? (
            <a
              href={produk.redirect_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 underline text-sm flex items-center gap-1"
            >
              <ExternalLink className="h-3 w-3" /> {produk.redirect_url}
            </a>
          ) : (
            <span className="text-gray-400 text-sm">-</span>
          );
        }

        // Check if JSON array
        let isJson = false;
        let pageUrls: string[] = [];
        try {
          if (produk.file_url.startsWith('[') || produk.file_url.startsWith('{')) {
            const parsed = JSON.parse(produk.file_url);
            if (Array.isArray(parsed)) {
              isJson = true;
              pageUrls = parsed;
            }
          }
        } catch (e) {}

        if (isJson) {
          return (
            <div className="flex flex-col gap-2">
              <p className="text-sm font-semibold text-gray-700">File Halaman Komik ({pageUrls.length} Halaman):</p>
              <div className="grid grid-cols-2 gap-2 max-w-md">
                {pageUrls.map((url, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2 border rounded-md bg-gray-50">
                    <span className="text-xs font-semibold text-gray-600">Halaman {idx + 1}</span>
                    <a
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 text-xs font-medium underline flex items-center gap-0.5"
                    >
                      <ExternalLink className="h-3 w-3" /> Lihat Gambar
                    </a>
                  </div>
                ))}
              </div>
            </div>
          );
        }

        return (
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-3">
              <a
                href={produk.file_url}
                download
                className="text-blue-600 underline text-sm flex items-center gap-1 font-semibold w-fit"
              >
                <Download className="h-3.5 w-3.5" /> Download File
              </a>
              {(produk.file_url.toLowerCase().endsWith(".pdf") || (produk.format && produk.format.toUpperCase() === "PDF")) && (
                <a
                  href={produk.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-green-600 underline text-sm flex items-center gap-1 font-semibold w-fit"
                >
                  <ExternalLink className="h-3.5 w-3.5" /> Lihat PDF
                </a>
              )}
            </div>
            <span className="text-xs text-gray-500 font-mono select-all">
              Sumber: {basename(produk.file_url)} {produk.file_lama_id ? `(File Lama ID: ${produk.file_lama_id})` : ""}
            </span>
          </div>
        );
      })(),
    },
    {
      label: "Cover",
      value: produk.cover_url ? (
        <img
          src={produk.cover_url}
          alt="cover"
          className="h-20 w-32 object-cover rounded-md"
        />
      ) : (
        <span className="text-gray-400 text-sm">Tidak ada gambar</span>
      ),
    },
    {
      label: "Waktu Mulai Penjualan",
      value: produk.waktu_mulai_jual || "-",
    },
    {
      label: "Tanggal Kadaluarsa",
      value: produk.tanggal_kadaluarsa || "-",
    },
    {
      label: "Kuota / Max Pembayaran",
      value: produk.max_pembayaran
        ? `${produk.max_pembayaran} pembeli`
        : "Unlimited",
    },
    { label: "Catatan", value: produk.catatan || "-" },
    {
      label: "Total Penjualan",
      value: (
        <span className="font-semibold text-gray-800">
          {produk.total_penjualan} penjualan
        </span>
      ),
    },
  );

  const getKategoriDisplay = (kategori?: string) => {
    switch (kategori) {
      case "novel": return "Novel";
      case "komik": return "Komik";
      case "e-book": return "E-Book";
      case "tulisan": return "Tulisan / Artikel";
      case "video": return "Video / Podcast";
      default: return "Produk Digital";
    }
  };

  const detailRows = [
    {
      label: "Status",
      value: (
        <span className={cn("font-bold text-sm", produk.status === "published" ? "text-green-600" : "text-red-500")}>
          {produk.status === "published" ? "Publik" : "Tidak Publik"}
        </span>
      )
    },
    {
      label: "Kategori Produk",
      value: getKategoriDisplay(produk.kategori)
    },
    {
      label: "Nama Produk",
      value: produk.nama
    },
    {
      label: "Harga",
      value: produk.tipe_pembayaran === "berbayar" ? `Rp. ${new Intl.NumberFormat("id-ID").format(produk.harga)}` : "Gratis"
    },
    {
      label: "Harga Coret",
      value: produk.harga_coret ? `Rp. ${new Intl.NumberFormat("id-ID").format(produk.harga_coret)}` : "-"
    },
    {
      label: "Deskripsi",
      value: (
        <button onClick={() => setDeskOpen(true)} className="text-blue-600 font-semibold hover:underline">
          Lihat Deskripsi
        </button>
      )
    },
    {
      label: "Maksimum Jumlah Pembelian",
      value: produk.max_pembayaran || "-"
    },
    {
      label: "Waktu Mulai Penjualan",
      value: produk.waktu_mulai_jual || "-"
    },
    {
      label: "Waktu Selesai Penjualan",
      value: produk.tanggal_kadaluarsa || "-"
    },
    {
      label: "Catatan",
      value: produk.catatan || "-"
    },
    {
      label: "Redirect URL",
      value: produk.redirect_url ? (
        <a href={produk.redirect_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline break-all font-semibold">
          {produk.redirect_url}
        </a>
      ) : "-"
    }
  ];

  const linkPembayaran = `${baseUrl}/p/${produk.id}/digital`;
  const linkHalamanProduk = `${baseUrl}/produk/${produk.slug}`;

  return (
    <div className="space-y-6">
      {/* Share Links Card */}
      <div className="bg-white border border-blue-100 rounded-xl shadow-sm p-6 space-y-4">
        <h3 className="text-base font-extrabold text-slate-800 tracking-tight">
          Bagi Tautan untuk Menerima Order
        </h3>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Input
              readOnly
              value={linkPembayaran}
              className="bg-slate-50/50 border-slate-200 text-xs font-semibold text-slate-600"
            />
          </div>
          <div className="space-y-1.5">
            <Input
              readOnly
              value={linkHalamanProduk}
              className="bg-slate-50/50 border-slate-200 text-xs font-semibold text-slate-600"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Button
            onClick={() => {
              navigator.clipboard.writeText(linkPembayaran);
              toast.success("Tautan pembayaran berhasil disalin!");
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs tracking-wider"
          >
            Salin Tautan Pembayaran
          </Button>
          <Button
            onClick={() => {
              navigator.clipboard.writeText(linkHalamanProduk);
              toast.success("Tautan halaman produk berhasil disalin!");
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs tracking-wider"
          >
            Salin Tautan Halaman Produk
          </Button>
        </div>
      </div>

      {/* Detail Table Card */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden p-6">
        <div className="border border-slate-200 rounded-lg overflow-hidden">
          <table className="w-full text-left border-collapse">
            <tbody className="divide-y divide-slate-200">
              {detailRows.map((row, i) => (
                <tr key={i} className="hover:bg-slate-50/20 transition">
                  <td className="px-5 py-4 text-xs font-bold text-slate-550 w-56 border-r border-slate-200 bg-slate-50/30">
                    {row.label}
                  </td>
                  <td className="px-5 py-4 text-xs font-medium text-slate-700">
                    {row.value}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Centered Bottom Dibuat Box */}
        <div className="text-center py-3 border border-blue-150 rounded-lg text-blue-650 font-bold bg-white mt-5 text-xs">
          Dibuat {produk.created_at}
        </div>
      </div>

      {/* Deskripsi Dialog */}
      <Dialog open={deskOpen} onOpenChange={setDeskOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Deskripsi</DialogTitle>
            <DialogDescription>Deskripsi lengkap produk digital ini.</DialogDescription>
          </DialogHeader>
          <div className="text-sm text-gray-700 leading-relaxed max-h-96 overflow-y-auto prose prose-slate">
            {produk.deskripsi ? (
              <div dangerouslySetInnerHTML={{ __html: produk.deskripsi }} />
            ) : (
              "Tidak ada deskripsi."
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function basename(path: string) {
  return path.split(/[\\/]/).pop() || "";
}