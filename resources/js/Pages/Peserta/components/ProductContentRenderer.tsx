import React from "react";
import ComicViewer from "./ComicViewer";
import TextViewer from "./TextViewer";
import VideoViewer from "./VideoViewer";
import PdfViewer from "./PdfViewer";
import { Download, AlertCircle } from "lucide-react";

type Product = {
  id: number;
  nama: string;
  cover?: string;
  deskripsi: string | null;
  created_at: string;
  content_type?: string | null;
  content?: string | null;
  file_url?: string | null;
  file_urls?: string[];
  instruksi?: string | null;
};

type Props = {
  product: Product;
};

export default function ProductContentRenderer({ product }: Props) {
  const contentType = product.content_type?.toLowerCase() || "";

  switch (contentType) {
    case "comic":
    case "komik":
      return <ComicViewer fileUrls={product.file_urls || []} title={product.nama} />;

    case "text":
    case "tulisan":
      return (
        <TextViewer
          title={product.nama}
          content={product.content || product.deskripsi || ""}
          createdAt={product.created_at}
        />
      );

    case "video":
      return (
        <VideoViewer
          url={product.file_url || ""}
          title={product.nama}
          productId={product.id}
        />
      );

    case "pdf":
    case "e-book":
    case "ebook":
      return <PdfViewer url={product.file_url || ""} title={product.nama} />;

    default:
      // Fallback display if content_type is unknown or generic
      return (
        <div className="space-y-6 max-w-4xl mx-auto">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
            <div className="space-y-2">
              <span className="bg-slate-100 text-slate-800 text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border border-slate-200/50">
                PRODUK DIGITAL
              </span>
              <h1 className="text-xl sm:text-2xl font-black text-slate-850 mt-2">{product.nama}</h1>
            </div>

            <div className="flex flex-col md:flex-row gap-8 items-start">
              {product.cover && (
                <img src={product.cover} alt={product.nama} className="w-full md:w-1/3 rounded-2xl object-cover border border-slate-100 shadow-sm" />
              )}
              <div className="flex-1 space-y-4">
                {product.file_url ? (
                  <div className="p-5 bg-blue-50/50 border border-blue-100 rounded-2xl space-y-3">
                    <div>
                      <p className="text-xs font-bold text-blue-800">Unduhan File Produk</p>
                      <p className="text-[10px] text-blue-600 font-semibold mt-0.5">Berkas digital milik Anda siap untuk diunduh secara instan.</p>
                    </div>
                    <a
                      href={product.file_url}
                      download
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-extrabold rounded-xl shadow transition"
                    >
                      <Download size={14} /> UNDUH SEKARANG
                    </a>
                  </div>
                ) : (
                  <div className="p-4 bg-slate-50 border border-slate-150 rounded-2xl text-center py-6 text-slate-400">
                    <AlertCircle className="mx-auto text-slate-300 mb-1" size={24} />
                    <p className="text-xs font-bold">File tidak tersedia</p>
                    <p className="text-[10px] mt-0.5">Silakan hubungi administrator terkait penyediaan file produk.</p>
                  </div>
                )}

                {product.deskripsi && (
                  <div className="space-y-1">
                    <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wide">Deskripsi Produk</h4>
                    <div
                      className="text-xs text-slate-500 leading-relaxed whitespace-pre-wrap"
                      dangerouslySetInnerHTML={{ __html: product.deskripsi }}
                    />
                  </div>
                )}
              </div>
            </div>

            {product.instruksi && (
              <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl space-y-1.5">
                <h4 className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <AlertCircle size={14} /> Petunjuk Instalasi / Pemakaian
                </h4>
                <p className="text-xs text-slate-550 leading-relaxed whitespace-pre-wrap">{product.instruksi}</p>
              </div>
            )}
          </div>
        </div>
      );
  }
}
