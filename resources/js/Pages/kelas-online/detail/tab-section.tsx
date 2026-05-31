import { useState, useRef } from "react";
import { router, usePage } from "@inertiajs/react";
import { Button } from "@/components/ui/button";
import {
  BookOpen,
  Loader2,
  FileText,
  Upload,
  Download,
  CheckCircle2,
  AlertCircle,
  File,
} from "lucide-react";
import { toast } from "sonner";

interface Props {
  kelasId: number;
  isOwner?: boolean;
}

export default function TabSection({
  kelasId,
  isOwner = false,
}: Props) {
  const { materi } = usePage<any>().props;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check size (50MB)
    if (file.size > 50 * 1024 * 1024) {
      toast.error("Ukuran file terlalu besar (maksimal 50MB)");
      return;
    }

    setIsSubmitting(true);
    const formData = new FormData();
    formData.append("file", file);

    router.post(`/kelas-online/${kelasId}/upload-materi`, formData, {
      preserveScroll: true,
      onSuccess: () => {
        setIsSubmitting(false);
        toast.success("Materi berhasil diunggah.");
        if (fileInputRef.current) fileInputRef.current.value = "";
      },
      onError: (errors) => {
        setIsSubmitting(false);
        toast.error(errors.file || "Gagal mengunggah materi.");
      },
    });
  };

  if (!isOwner) {
    return (
      <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm text-center">
        <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <BookOpen className="h-8 w-8 text-indigo-600" />
        </div>
        <h3 className="text-lg font-bold text-gray-800 mb-2">Materi Kelas Online</h3>
        <p className="text-gray-500 text-sm max-w-md mx-auto mb-8">
          Unduh file materi kelas di bawah ini. File ini sudah mencakup seluruh bab dan materi pembelajaran.
        </p>

        {materi?.file ? (
          <div className="flex flex-col items-center">
            <div className="flex items-center gap-3 bg-gray-50 border border-gray-100 rounded-xl p-4 mb-6 w-full max-w-sm">
              <FileText className="h-6 w-6 text-indigo-500" />
              <div className="text-left overflow-hidden">
                <p className="text-sm font-semibold text-gray-700 truncate">{materi.name}</p>
                <p className="text-xs text-gray-400">File Dokumen</p>
              </div>
            </div>
            <a
              href={materi.file}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition shadow-md hover:shadow-lg active:scale-95"
            >
              <Download className="h-5 w-5" /> UNDUH MATERI
            </a>
          </div>
        ) : (
          <div className="bg-amber-50 border border-amber-100 rounded-xl p-6 text-amber-700 inline-block">
            <div className="flex items-center gap-2 justify-center mb-1">
              <AlertCircle className="h-5 w-5" />
              <p className="font-semibold">Materi Belum Tersedia</p>
            </div>
            <p className="text-xs">Penyelenggara belum mengunggah file materi untuk kelas ini.</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
      <div className="p-6 border-b border-gray-50 bg-gradient-to-r from-white to-indigo-50/30">
        <h3 className="font-bold text-gray-800">Kelola Materi</h3>
        <p className="text-xs text-gray-500 mt-0.5">
          Unggah satu file materi yang sudah mencakup seluruh isi kelas.
        </p>
      </div>

      <div className="p-8">
        <div className="max-w-xl mx-auto">
          {materi?.file && (
            <div className="mb-8 p-5 border border-emerald-100 bg-emerald-50/50 rounded-2xl flex items-center gap-4">
              <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm text-emerald-600">
                <File className="h-6 w-6" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-emerald-600 font-bold uppercase tracking-wider mb-0.5">FILE SAAT INI</p>
                <p className="text-sm font-semibold text-gray-800 truncate">{materi.name}</p>
              </div>
              <a
                href={materi.file}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 text-gray-400 hover:text-indigo-600 transition"
                title="Lihat file"
              >
                <FileText className="h-5 w-5" />
              </a>
            </div>
          )}

          <div 
            className="border-2 border-dashed border-gray-200 rounded-3xl p-10 text-center hover:border-indigo-300 hover:bg-indigo-50/20 transition group cursor-pointer"
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleUpload}
              className="hidden"
              accept=".pdf,.zip,.rar,.doc,.docx,.ppt,.pptx"
            />
            
            <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-indigo-100 group-hover:scale-110 transition duration-300">
              {isSubmitting ? (
                <Loader2 className="h-8 w-8 text-indigo-600 animate-spin" />
              ) : (
                <Upload className="h-8 w-8 text-gray-400 group-hover:text-indigo-600 transition" />
              )}
            </div>

            <h4 className="text-base font-bold text-gray-800 mb-1">
              {materi?.file ? "Ganti File Materi" : "Unggah File Materi"}
            </h4>
            <p className="text-sm text-gray-500 mb-6">
              Seret dan letakkan file di sini atau klik untuk memilih file dari komputer Anda.
            </p>

            <div className="flex flex-wrap justify-center gap-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              <span className="flex items-center gap-1"><CheckCircle2 className="h-3 w-3 text-emerald-500" /> MAX 50MB</span>
              <span className="flex items-center gap-1"><CheckCircle2 className="h-3 w-3 text-emerald-500" /> PDF, ZIP, DOCX, PPT</span>
            </div>
          </div>

          <div className="mt-8 bg-amber-50 rounded-xl p-4 border border-amber-100">
            <div className="flex gap-3">
              <AlertCircle className="h-5 w-5 text-amber-500 shrink-0" />
              <div className="text-xs text-amber-800 leading-relaxed">
                <p className="font-bold mb-1">PENTING:</p>
                <p>Setiap kali Anda mengunggah file baru, file materi lama akan digantikan secara otomatis. Pastikan file yang diunggah adalah versi terbaru dan sudah mencakup seluruh modul pembelajaran.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

