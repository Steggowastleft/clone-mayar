import React from "react";
import { Download, ExternalLink, Eye } from "lucide-react";

type Props = {
  url: string;
  title: string;
};

export default function PdfViewer({ url, title }: Props) {
  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
        {/* Header */}
        <div className="flex justify-between items-center px-2">
          <div>
            <h2 className="text-sm font-extrabold text-slate-800 line-clamp-1">{title}</h2>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">Penampil Dokumen PDF</p>
          </div>

          <a
            href={url}
            download
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-black rounded-xl shadow transition flex items-center gap-1.5"
          >
            <Download size={14} /> Unduh PDF
          </a>
        </div>

        {/* Embedded Iframe/Embed Tag */}
        <div className="relative aspect-[3/4] sm:h-[800px] w-full rounded-2xl overflow-hidden border border-slate-100 bg-slate-50 shadow-inner">
          <embed
            src={`${url}#toolbar=0&navpanes=0`}
            type="application/pdf"
            className="w-full h-full"
          />
        </div>

        {/* Mobile helper notice */}
        <div className="sm:hidden text-center py-2 text-[10px] font-bold text-slate-400 bg-slate-50 border border-slate-150 rounded-xl">
          Format layar terlalu kecil? Gunakan tombol <strong>Unduh PDF</strong> untuk membaca secara penuh.
        </div>
      </div>
    </div>
  );
}
