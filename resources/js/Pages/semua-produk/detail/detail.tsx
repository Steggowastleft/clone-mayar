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
import { type ProdukDigitalData } from "../../produk-digital/show";

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
  ];

  return (
    <>
      {/* Share Links */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-5 mb-5">
        <h3 className="font-semibold text-gray-800 mb-4">
          Share Link untuk Menerima Pembayaran
        </h3>
        <div className="grid grid-cols-2 gap-4">
          {[
            {
              label: "COPY LINK PEMBAYARAN",
              url: `${baseUrl}/p/${produk.id}/digital`,
              openable: false,
            },
            {
              label: "COPY HALAMAN PRODUK",
              url: `${baseUrl}/produk/${produk.slug}`,
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
          Share link diatas ke sosial media, whatsapp, telegram, tiktok, landing page,
          email atau channel penjualan lainnya untuk menerima pembayaran.
        </p>
      </div>

      {/* Detail Table */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
        <table className="w-full">
          <tbody>
            {rows.map((row, i) => (
              <tr key={i} className="border-b border-gray-50 last:border-0">
                <td className="px-5 py-3 text-sm text-gray-500 w-56 align-top">
                  {row.label}
                </td>
                <td className="px-5 py-3 text-sm text-gray-800">{row.value}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="px-5 py-3 border-t border-gray-100">
          <p className="text-xs text-gray-400">Dibuat Tanggal: {produk.created_at}</p>
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
    </>
  );
}

function basename(path: string) {
  return path.split(/[\\/]/).pop() || "";
}