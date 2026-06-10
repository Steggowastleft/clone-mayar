import { useState, useEffect, useRef } from "react";
import { router, usePage } from "@inertiajs/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { DateRange } from "react-day-picker";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Plus, Eye, Pencil, Trash2, Loader2,
  Calendar, FileText, Paperclip, X,
  Upload, AlertCircle, CheckCircle2,
  Link, Send, Medal, ChevronRight
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import SoalEditor, { type Soal } from "../components/soaleditor";
import { id as idLocale } from "date-fns/locale";
import QuizPlayer from "../../Peserta/quizplayer";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────
export type AssignmentFile = {
  id?: number;
  name: string;
  url?: string;
  size?: number;
};

export type Assignment = {
  id: number;
  judul: string;
  tugas: string; // HTML content dari rich text
  files?: AssignmentFile[];
  tanggal_mulai?: string;
  tanggal_akhir?: string;
  is_wajib: boolean;
  is_tugas_akhir?: boolean;
  tipe?: "upload" | "quiz";
  soals?: Soal[];
  submissions?: any[];
  submission?: any;
};

const emptyForm = {
  judul:          "",
  tugas:          "",
  rangeTanggal: undefined as DateRange | undefined,
  is_wajib:       false,
  is_tugas_akhir: false,
  tipe:           "upload" as "upload" | "quiz",
  jam_pengumpulan: "23:59",
};

function formatTanggal(dateStr?: string, showTime: boolean = false): string {
  if (!dateStr) return "";
  try {
    const d = new Date(dateStr);
    if (showTime) {
      return format(d, "dd MMM yyyy HH:mm", { locale: idLocale });
    }
    return format(d, "dd MMM yyyy", { locale: idLocale });
  } catch {
    return dateStr;
  }
}

// ─────────────────────────────────────────────
// Simple Rich Text Toolbar
// ─────────────────────────────────────────────
function RichTextEditor({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  const editorRef = useRef<HTMLDivElement>(null);
  const isInternalChange = useRef(false);

  useEffect(() => {
    if (editorRef.current && !isInternalChange.current) {
      if (editorRef.current.innerHTML !== value) {
        editorRef.current.innerHTML = value;
      }
    }
    isInternalChange.current = false;
  }, [value]);

  const execCmd = (cmd: string, val?: string) => {
    editorRef.current?.focus();
    document.execCommand(cmd, false, val);
  };

  const handleInput = () => {
    isInternalChange.current = true;
    onChange(editorRef.current?.innerHTML || "");
  };

  const fontSizes = ["Normal", "H1", "H2", "H3"];
  const fonts = ["Default", "Arial", "Georgia", "Courier New", "Verdana"];

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center gap-1 px-2 py-1.5 bg-gray-50 border-b border-gray-200 flex-wrap">
        {/* Format buttons */}
        {[
          { cmd: "bold",          label: <span className="font-bold text-sm">B</span> },
          { cmd: "italic",        label: <span className="italic text-sm">I</span> },
          { cmd: "underline",     label: <span className="underline text-sm">U</span> },
          { cmd: "strikeThrough", label: <span className="line-through text-sm">S</span> },
        ].map(({ cmd, label }) => (
          <button
            key={cmd}
            type="button"
            onMouseDown={(e) => { e.preventDefault(); execCmd(cmd); }}
            className="w-7 h-7 flex items-center justify-center rounded hover:bg-gray-200 text-gray-700 transition"
          >
            {label}
          </button>
        ))}

        <div className="w-px h-5 bg-gray-300 mx-1" />

        {/* Heading select */}
        <select
          className="text-xs border border-gray-200 rounded px-1.5 py-1 bg-white text-gray-700"
          onChange={(e) => {
            const v = e.target.value;
            if (v === "Normal") execCmd("formatBlock", "p");
            else execCmd("formatBlock", v.toLowerCase());
            e.target.value = "Normal";
          }}
          defaultValue="Normal"
        >
          {fontSizes.map(s => <option key={s} value={s}>{s}</option>)}
        </select>

        {/* Font select */}
        <select
          className="text-xs border border-gray-200 rounded px-1.5 py-1 bg-white text-gray-700"
          onChange={(e) => {
            execCmd("fontName", e.target.value);
            e.target.value = "Default";
          }}
          defaultValue="Default"
        >
          {fonts.map(f => <option key={f} value={f}>{f}</option>)}
        </select>

        <div className="w-px h-5 bg-gray-300 mx-1" />

        {/* List buttons */}
        {[
          { cmd: "insertUnorderedList", label: "≡•" },
          { cmd: "insertOrderedList",   label: "≡1" },
        ].map(({ cmd, label }) => (
          <button
            key={cmd}
            type="button"
            onMouseDown={(e) => { e.preventDefault(); execCmd(cmd); }}
            className="w-7 h-7 flex items-center justify-center rounded hover:bg-gray-200 text-gray-700 text-xs transition"
          >
            {label}
          </button>
        ))}

        <div className="w-px h-5 bg-gray-300 mx-1" />

        {/* Link */}
        <button
          type="button"
          onMouseDown={(e) => {
            e.preventDefault();
            const url = window.prompt("Masukkan URL:");
            if (url) execCmd("createLink", url);
          }}
          className="w-7 h-7 flex items-center justify-center rounded hover:bg-gray-200 text-gray-700 transition text-xs"
          title="Tambah Link"
        >
          🔗
        </button>

        {/* Unlink */}
        <button
          type="button"
          onMouseDown={(e) => { e.preventDefault(); execCmd("unlink"); }}
          className="w-7 h-7 flex items-center justify-center rounded hover:bg-gray-200 text-gray-700 transition text-xs"
          title="Hapus Link"
        >
          🔗✕
        </button>

        {/* Image URL */}
        <button
          type="button"
          onMouseDown={(e) => {
            e.preventDefault();
            const url = window.prompt("Masukkan URL gambar:");
            if (url) execCmd("insertImage", url);
          }}
          className="w-7 h-7 flex items-center justify-center rounded hover:bg-gray-200 text-gray-700 transition text-xs"
          title="Tambah Gambar"
        >
          🖼
        </button>
      </div>

      {/* Editable area */}
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        data-placeholder={placeholder || "Tulis instruksi tugas di sini..."}
        className={cn(
          "min-h-[160px] p-3 text-sm text-gray-800 outline-none",
          "empty:before:content-[attr(data-placeholder)] empty:before:text-gray-400"
        )}
        style={{ lineHeight: 1.6 }}
        suppressContentEditableWarning
      />
    </div>
  );
}

// ─────────────────────────────────────────────
// Date Picker field
// ─────────────────────────────────────────────
function DateField({
  label, value, onChange, placeholder,
}: {
  label: string;
  value: Date | undefined;
  onChange: (d: Date | undefined) => void;
  placeholder?: string;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="space-y-1">
      <Label className="text-sm font-medium text-gray-700">{label}</Label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button className={cn(
            "w-full flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-md text-sm text-left transition hover:border-gray-300",
            value ? "text-gray-800" : "text-gray-400"
          )}>
            <Calendar className="h-4 w-4 text-gray-400 shrink-0" />
            {value ? format(value, "dd MMMM yyyy", { locale: idLocale }) : (placeholder || "Pilih tanggal")}
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0 z-[600]" align="start">
          <CalendarComponent
            mode="single"
            selected={value}
            onSelect={(d) => { onChange(d); setOpen(false); }}
            locale={idLocale}
            initialFocus
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}

// ─────────────────────────────────────────────
// File Dropzone
// ─────────────────────────────────────────────
function FileDropzone({
  files,
  onAdd,
  onRemove,
}: {
  files: File[];
  onAdd: (f: File[]) => void;
  onRemove: (i: number) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const added = Array.from(e.dataTransfer.files).slice(0, 5 - files.length);
    if (added.length) onAdd(added);
  };

  const handleSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const added = Array.from(e.target.files || []).slice(0, 5 - files.length);
    if (added.length) onAdd(added);
    e.target.value = "";
  };

  const fmtSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="space-y-2">
      {/* Drop area */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={cn(
          "border-2 border-dashed rounded-lg py-8 flex flex-col items-center justify-center cursor-pointer transition",
          dragging ? "border-blue-400 bg-blue-50" : "border-gray-200 hover:border-blue-300 hover:bg-gray-50"
        )}
      >
        <Upload className="h-6 w-6 text-blue-500 mb-2" />
        <p className="text-sm font-medium text-blue-600">Drag Files or Click to Browse</p>
        <input ref={inputRef} type="file" multiple className="hidden" onChange={handleSelect} />
      </div>
      <p className="text-xs text-gray-400">Ukuran file maksimal 1GB. Maksimal 5 file pendukung.</p>

      {/* File list */}
      {files.length > 0 && (
        <div className="space-y-1.5">
          {files.map((f, i) => (
            <div key={i} className="flex items-center gap-2 bg-gray-50 border border-gray-100 rounded-md px-3 py-2">
              <Paperclip className="h-3.5 w-3.5 text-gray-400 shrink-0" />
              <span className="text-xs text-gray-700 flex-1 truncate">{f.name}</span>
              <span className="text-xs text-gray-400 shrink-0">{fmtSize(f.size)}</span>
              <button onClick={() => onRemove(i)} className="text-gray-400 hover:text-red-500 transition shrink-0">
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// Assignment Card
// ─────────────────────────────────────────────
function AssignmentCard({
  assignment,
  kelasId,
  isOwner,
  onEdit,
  onView,
}: {
  assignment: Assignment;
  kelasId: number;
  isOwner: boolean;
  onEdit: (a: Assignment) => void;
  onView: (a: Assignment) => void;
}) {
  const [hapusOpen, setHapusOpen] = useState(false);

  const handleHapus = () => {
    router.delete(`/kelas-online/${kelasId}/assignment/${assignment.id}`, {
      preserveScroll: true,
      onSuccess: () => {
        toast.success("Tugas berhasil dihapus.");
        
      },
      onError: () => toast.error("Gagal menghapus tugas."),
    });
  };

  return (
    <>
      <div className="border border-gray-200 rounded-lg p-4 bg-white hover:shadow-sm transition">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="font-semibold text-gray-800 text-sm">{assignment.judul}</h4>
            </div>

            {/* Preview teks (strip HTML) */}
            <p
  className="text-xs text-gray-400 mt-1 line-clamp-2"
  dangerouslySetInnerHTML={{
    __html:
      ((assignment.tugas ?? "")
        .replace(/<[^>]*>/g, " ")
        .trim()
        .slice(0, 120) || "Belum ada deskripsi tugas") +
      "..."
  }}
/>

            {/* Tanggal */}
            <div className="flex items-center gap-3 mt-2 flex-wrap">
              {assignment.tanggal_mulai && (
                <span className="text-xs text-gray-500 flex items-center gap-1">
                  <Calendar className="h-3 w-3" /> Mulai: {formatTanggal(assignment.tanggal_mulai)}
                </span>
              )}
              {assignment.tanggal_akhir && (
                <span className="text-xs text-orange-500 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" /> Deadline: {formatTanggal(assignment.tanggal_akhir, true)}
                </span>
              )}
            </div>

            {/* Files */}
            {assignment.files && assignment.files.length > 0 && (
              <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                <Paperclip className="h-3 w-3" /> {assignment.files.length} file pendukung
              </p>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex items-start gap-1 shrink-0">
            {assignment.tipe === "quiz" && (
              <span className="text-xs bg-blue-100 text-blue-700 font-bold px-2 py-0.5 rounded-full border border-blue-200 self-center mr-1">
                📝 Quiz
              </span>
            )}
            <button
              onClick={() => onView(assignment)}
              className="p-1.5 rounded-md hover:bg-blue-50 text-gray-400 hover:text-blue-600 transition"
              title="Lihat"
            >
              <Eye className="h-3.5 w-3.5" />
            </button>
            {isOwner && (
              <>
                <button
                  onClick={() => onEdit(assignment)}
                  className="p-1.5 rounded-md hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition"
                  title="Edit"
                >
                  <Pencil className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => setHapusOpen(true)}
                  className="p-1.5 rounded-md hover:bg-red-50 text-gray-400 hover:text-red-600 transition"
                  title="Hapus"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* SoalEditor untuk quiz & upload (uraian) */}
      {isOwner && (assignment.tipe === "quiz" || assignment.tipe === "upload") && (
        <div className="border border-blue-100 rounded-lg p-4 bg-blue-50/50 mt-2">
          <SoalEditor
            assignmentId={assignment.id}
            initialSoals={assignment.soals ?? []}
            onReload={() => router.reload({ only: ["kelas"], preserveScroll: true } as any)}
          />
        </div>
      )}

      {/* Confirm hapus */}
      <Dialog open={hapusOpen} onOpenChange={setHapusOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Hapus Tugas?</DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin menghapus tugas <strong>{assignment.judul}</strong>?
              Tindakan ini tidak dapat dibatalkan.
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-3 pt-2">
            <Button variant="outline" className="flex-1" onClick={() => setHapusOpen(false)}>
              Batal
            </Button>
            <Button
              className="flex-1 bg-red-600 hover:bg-red-700 text-white"
              onClick={() => { handleHapus(); setHapusOpen(false); }}
            >
              Ya, Hapus
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

// ─────────────────────────────────────────────
// View Dialog
// ─────────────────────────────────────────────
function ViewDialog({ assignment, open, onClose }: { assignment: Assignment | null; open: boolean; onClose: () => void }) {
  if (!assignment) return null;
  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2 flex-wrap">
            <DialogTitle className="text-lg">{assignment.judul}</DialogTitle>
          </div>
          <div className="flex gap-4 flex-wrap pt-1">
            {assignment.tanggal_mulai && (
              <span className="text-xs text-gray-500 flex items-center gap-1">
                <Calendar className="h-3 w-3" /> Mulai: {formatTanggal(assignment.tanggal_mulai)}
              </span>
            )}
            {assignment.tanggal_akhir && (
              <span className="text-xs text-orange-500 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" /> Deadline: {formatTanggal(assignment.tanggal_akhir, true)}
              </span>
            )}
          </div>
        </DialogHeader>

        {/* Konten tugas */}
        <div
          className="prose prose-sm max-w-none text-gray-700 border border-gray-100 rounded-lg p-4 bg-gray-50"
          dangerouslySetInnerHTML={{ __html: assignment.tugas }}
        />

        {/* Files */}
        {assignment.files && assignment.files.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-700">Files Pendukung</p>
            <div className="space-y-1.5">
              {assignment.files.map((f, i) => (
                <a
                  key={i}
                  href={f.url || "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 bg-white border border-gray-200 rounded-md px-3 py-2 hover:bg-blue-50 hover:border-blue-200 transition"
                >
                  <Paperclip className="h-3.5 w-3.5 text-blue-500 shrink-0" />
                  <span className="text-xs text-gray-700 flex-1 truncate">{f.name}</span>
                  <span className="text-xs text-blue-500">Unduh</span>
                </a>
              ))}
            </div>
          </div>
        )}

        <Button variant="outline" className="w-full" onClick={onClose}>Tutup</Button>
      </DialogContent>
    </Dialog>
  );
}

// ─────────────────────────────────────────────
// Section: Participant Submission
// ─────────────────────────────────────────────
function ParticipantSubmission({ 
  assignment, 
  submission,
  onSelesai 
}: { 
  assignment: Assignment; 
  submission?: any;
  onSelesai?: () => void;
}) {
  const [showSubmission, setShowSubmission] = useState(false);
  const [teks, setTeks] = useState("");
  const [url, setUrl] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const isQuiz = assignment.tipe === "quiz";
  const isSubmitted = !!submission;

  const handleSubmitEssay = () => {
    if (!teks.trim()) {
        toast.error("Jawaban tidak boleh kosong.");
        return;
    }
    setLoading(true);

    const fd = new FormData();
    fd.append("submission_teks", teks.trim());
    if (url.trim()) fd.append("submission_url", url.trim());
    if (file) fd.append("submission_file", file);

    router.post(`/peserta/assignments/${assignment.id}/submit`, fd, {
      preserveScroll: true,
      onSuccess: (page) => {
        toast.success("Jawaban berhasil dikirim!");
        setShowSubmission(false);
        onSelesai?.();

        // Sync status ke parent jika perlu
        const newSub = (page.props as any).newSubmission;
        if (newSub) {
            assignment.submission = newSub;
        }
      },
      onError: (e) => {
        const msg = Object.values(e).join(", ");
        toast.error("Gagal mengirim tugas: " + msg);
      },
      onFinish: () => setLoading(false)
    });
  };

  if (isSubmitted) {
    const grade = submission.grade;
    return (
      <div className="mt-4 p-5 bg-emerald-50 rounded-2xl border border-emerald-100 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-600">
                <CheckCircle2 className="h-6 w-6" />
            </div>
            <div>
                <p className="text-sm font-bold text-emerald-800">Tugas Sudah Dikerjakan</p>
                <p className="text-xs text-emerald-600/80">Dikirim pada {format(new Date(submission.waktu_kirim), "dd MMMM yyyy HH:mm", { locale: idLocale })}</p>
            </div>
        </div>
        
        {grade !== null && (
            <div className="bg-white px-6 py-3 rounded-xl border-2 border-emerald-200 text-center min-w-[120px]">
                <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">NILAI</p>
                <p className="text-3xl font-black text-emerald-700 leading-none mt-1">{grade}</p>
            </div>
        )}

        {grade === null && !isQuiz && (
            <div className="bg-white/50 px-4 py-2 rounded-lg border border-emerald-200 text-xs text-emerald-600 font-medium italic">
                Menunggu penilaian...
            </div>
        )}

        {(submission as any).submission_file && (
          <div className="mt-4 md:mt-0 w-full md:w-auto">
            <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-1.5">FILE JAWABAN</p>
            <a 
                href={(submission as any).file_url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-2 p-2.5 bg-white border border-emerald-100 rounded-xl text-xs text-emerald-700 hover:bg-emerald-50 transition"
            >
                <FileText className="h-4 w-4 text-emerald-500" />
                <span className="max-w-[150px] truncate">{(submission as any).submission_file_name}</span>
            </a>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="mt-4">
      {!showSubmission ? (
        <Button 
            onClick={() => setShowSubmission(true)}
            className={`w-full py-6 rounded-2xl font-bold uppercase tracking-wide text-sm shadow-sm transition-all ${
                isQuiz ? "bg-indigo-600 hover:bg-indigo-700" : "bg-emerald-600 hover:bg-emerald-700"
            }`}
        >
          {isQuiz ? "▶ Mulai Kerjakan Quiz" : "📝 Isi Jawaban Tugas"}
        </Button>
      ) : (
        <div className="p-6 bg-white border-2 border-indigo-100 rounded-3xl shadow-sm space-y-5 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="flex items-center justify-between">
            <h4 className="text-lg font-black text-gray-900">{isQuiz ? "Quiz Session" : "Jawaban Tugas"}</h4>
            <button onClick={() => setShowSubmission(false)} className="text-gray-400 hover:text-gray-600">
                <X className="h-5 w-5" />
            </button>
          </div>

          {isQuiz ? (
            <QuizPlayer 
                assignmentId={assignment.id}
                soals={assignment.soals ?? []}
                onSelesai={() => {
                    setShowSubmission(false);
                    onSelesai?.();
                }}
            />
          ) : (
            <div className="space-y-4">
              {/* Daftar Soal Uraian jika ada */}
              {assignment.soals && assignment.soals.length > 0 && (
                <div className="space-y-4 mb-6">
                    <p className="text-sm font-bold text-gray-500 uppercase tracking-widest border-b pb-2">Daftar Pertanyaan</p>
                    {assignment.soals.map((s, i) => (
                        <div key={s.id} className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                            <p className="text-xs font-bold text-indigo-600 mb-2">SOAL #{i + 1}</p>
                            {s.show_image && s.image_url && (
                                <div className="mb-3 rounded-xl overflow-hidden border border-gray-200 bg-white">
                                    <img src={s.image_url} className="max-h-64 mx-auto object-contain" />
                                </div>
                            )}
                            <p className="text-sm text-gray-800 font-medium whitespace-pre-wrap">{s.pertanyaan}</p>
                        </div>
                    ))}
                </div>
              )}

              <div className="space-y-2">
                <Label className="text-sm font-bold text-gray-700">Jawaban Teks / Essay</Label>
                <Textarea 
                    rows={6}
                    placeholder="Tuliskan jawaban lengkapmu di sini..."
                    value={teks}
                    onChange={(e) => setTeks(e.target.value)}
                    className="rounded-2xl border-gray-200 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-bold text-gray-700">Link Pendukung (Opsional)</Label>
                <div className="relative">
                    <Link className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input 
                        placeholder="https://google-drive-link-atau-github"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        className="pl-10 rounded-xl border-gray-200"
                    />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-bold text-gray-700">Upload File / Gambar (Opsional)</Label>
                <div 
                    onClick={() => document.getElementById('submit-file-input')?.click()}
                    className="border-2 border-dashed border-gray-200 rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer hover:border-emerald-300 hover:bg-emerald-50/30 transition group"
                >
                    <Upload className="h-8 w-8 text-gray-400 group-hover:text-emerald-500 mb-2" />
                    <p className="text-sm font-medium text-gray-500 group-hover:text-emerald-600">
                        {file ? file.name : "Klik untuk pilih file"}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">PDF, ZIP, atau Gambar (Max 10MB)</p>
                    <input 
                        id="submit-file-input"
                        type="file" 
                        className="hidden" 
                        onChange={(e) => {
                            const f = e.target.files?.[0];
                            if (f) setFile(f);
                        }}
                    />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <Button variant="outline" className="flex-1 rounded-xl h-11" onClick={() => setShowSubmission(false)}>Batal</Button>
                <Button 
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 rounded-xl h-11 font-bold"
                    onClick={handleSubmitEssay}
                    disabled={loading}
                >
                    {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Send className="h-4 w-4 mr-2" />}
                    Kirim Jawaban
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// Main Tab
// ─────────────────────────────────────────────
export default function TabAssignment({
  kelasId,
  initialAssignmentList = [],
  isOwner = false,
}: {
  kelasId: number;
  initialAssignmentList?: Assignment[];
  isOwner?: boolean;
}) {
  const [createOpen,    setCreateOpen]    = useState(false);
  const [isSubmitting,  setIsSubmitting]  = useState(false);
  const [editingItem,   setEditingItem]   = useState<Assignment | null>(null);
  const [viewingItem,   setViewingItem]   = useState<Assignment | null>(null);
  const [assignmentList, setAssignmentList] = useState<Assignment[]>(initialAssignmentList);
  const [errors,        setErrors]        = useState<Record<string, string>>({});

  // Form state
  const [form, setForm] = useState(emptyForm);
  const tipeRef = useRef<"upload" | "quiz">("upload"); // track tipe via ref to avoid stale closure
  const [newFiles, setNewFiles]           = useState<File[]>([]);
  const [existingFiles, setExistingFiles] = useState<AssignmentFile[]>([]);

  // Sync dari Inertia reload
  const page = usePage<any>();
  useEffect(() => {
    if (page.props.assignmentList) setAssignmentList(page.props.assignmentList);
  }, [page.props.assignmentList]);

  // ── Buka edit ──
  const handleOpenEdit = (a: Assignment) => {
    setEditingItem(a);
    let jam = "23:59";
    if (a.tanggal_akhir) {
      const d = new Date(a.tanggal_akhir);
      const h = String(d.getHours()).padStart(2, '0');
      const m = String(d.getMinutes()).padStart(2, '0');
      jam = `${h}:${m}`;
    }
    setForm({
      judul:         a.judul,
      tugas:         a.tugas,
      rangeTanggal: {
        from: a.tanggal_mulai ? new Date(a.tanggal_mulai) : undefined,
        to: a.tanggal_akhir ? new Date(a.tanggal_akhir) : undefined,
      },
      is_wajib:      a.is_wajib,
      is_tugas_akhir: a.is_tugas_akhir ?? false,
      tipe:           a.tipe ?? "upload",
      jam_pengumpulan: jam,
    });
    setExistingFiles(a.files || []);
    setNewFiles([]);
    setCreateOpen(true);
  };

  // Sync tipeRef whenever form.tipe changes
  useEffect(() => {
    tipeRef.current = form.tipe;
  }, [form.tipe]);

  const handleClose = () => {
    setCreateOpen(false);
    setEditingItem(null);
    setForm(emptyForm);
    setNewFiles([]);
    setExistingFiles([]);
    setErrors({});
  };

  // ── Validasi ──
  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.judul.trim()) e.judul = "Judul wajib diisi.";
    if (!form.tugas.replace(/<[^>]*>/g, "").trim()) e.tugas = "Konten tugas wajib diisi.";
    if (!form.rangeTanggal?.from) e.tanggal_mulai = "Tanggal mulai wajib diisi.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // ── Submit ──
  const handleSubmit = () => {
    if (!validate()) return;
    setIsSubmitting(true);

    const isEdit = !!editingItem;
    const url = isEdit
      ? `/kelas-online/${kelasId}/assignment/${editingItem!.id}`
      : `/kelas-online/${kelasId}/assignment`;

    // Gunakan FormData agar bisa kirim files
    const fd = new FormData();
    // Inject CSRF token
    const csrfMeta = document.head.querySelector('meta[name="csrf-token"]') as HTMLMetaElement;
    if (csrfMeta) fd.append("_token", csrfMeta.content);
    fd.append("judul",         form.judul);
    fd.append("tugas",         form.tugas);
    fd.append("is_wajib",      form.is_wajib ? "1" : "0");
    fd.append("is_tugas_akhir", form.is_tugas_akhir ? "1" : "0");
    fd.append("tipe", tipeRef.current); // use ref to avoid stale closure
    if (form.rangeTanggal?.from) {
      fd.append("tanggal_mulai", format(form.rangeTanggal.from, "yyyy-MM-dd 00:00:00"));
    }
    if (form.rangeTanggal?.to) {
      const toDate = new Date(form.rangeTanggal.to);
      const timeParts = (form.jam_pengumpulan || "23:59").split(":");
      const hours = parseInt(timeParts[0] || "23", 10);
      const minutes = parseInt(timeParts[1] || "59", 10);
      toDate.setHours(hours, minutes, 0, 0);
      fd.append("tanggal_akhir", format(toDate, "yyyy-MM-dd HH:mm:ss"));
    }
    newFiles.forEach((f, i) => fd.append(`files[${i}]`, f));
    // Kirim id file yang masih dipertahankan (edit mode)
    existingFiles.forEach((f, i) => { if (f.id) fd.append(`existing_files[${i}]`, String(f.id)); });

    const routerOptions = {
      preserveScroll: true as const,
      forceFormData: true as const,
      onSuccess: () => {
        setIsSubmitting(false);
        toast.success(isEdit ? "Tugas berhasil diperbarui!" : "Tugas berhasil dibuat!");
        handleClose();
        router.reload({ only: ["assignmentList"] });
      },
      onError: (e: Record<string, string>) => {
        setIsSubmitting(false);
        toast.error("Gagal menyimpan tugas.");
        setErrors(e);
      },
    };

    router.post(url, fd, routerOptions);
  };

  // ─────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
      {/* Header */}
      <div className="p-5 border-b border-gray-100 flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-gray-800">Assignment</h3>
          <p className="text-xs text-gray-400 mt-0.5">Kelola tugas untuk peserta kelas</p>
        </div>
        {isOwner && (
          <Button className="bg-blue-600 hover:bg-blue-700 text-white text-sm" onClick={() => setCreateOpen(true)}>
            <Plus className="h-4 w-4 mr-1" /> Buat Tugas
          </Button>
        )}
      </div>

      {/* List */}
      <div className="p-5">
        {assignmentList.length === 0 ? (
          <div className="text-center py-10">
            <FileText className="h-10 w-10 text-gray-200 mx-auto mb-3" />
            <p className="text-sm text-gray-400">Belum ada tugas assignment</p>
          </div>
        ) : (
          <div className="space-y-3">
            {assignmentList.map((a) => (
              <div key={a.id} className="space-y-3">
                <AssignmentCard
                  assignment={a}
                  kelasId={kelasId}
                  isOwner={isOwner}
                  onEdit={handleOpenEdit}
                  onView={(a) => setViewingItem(a)}
                />
                
                {!isOwner && (
                  <ParticipantSubmission 
                    assignment={a} 
                    submission={a.submissions?.[0]}
                    onSelesai={() => router.reload({ only: ["kelas"] })}
                  />
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── View Dialog ── */}
      <ViewDialog
        assignment={viewingItem}
        open={!!viewingItem}
        onClose={() => setViewingItem(null)}
      />

      {/* ── Create / Edit Dialog ── */}
      <Dialog open={createOpen} onOpenChange={(v) => { if (!v) handleClose(); }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingItem ? "Edit Tugas" : "Buat Tugas (Assignment)"}</DialogTitle>
            <DialogDescription>
              {editingItem ? "Perbarui detail tugas." : "Isi detail untuk tugas baru."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 pt-1">
            {/* Judul */}
            <div className="space-y-1">
              <Label className="text-sm font-medium text-gray-700">
                Judul <span className="text-red-500">*</span>
              </Label>
              <Input
                placeholder="Contoh: Tugas 1 - Membuat CRUD Laravel"
                value={form.judul}
                onChange={(e) => setForm({ ...form, judul: e.target.value })}
                className={errors.judul ? "border-red-400" : ""}
              />
              {errors.judul && <p className="text-xs text-red-500">{errors.judul}</p>}
            </div>

            {/* Tugas rich text */}
            <div className="space-y-1">
              <Label className="text-sm font-medium text-gray-700">
                Tugas <span className="text-red-500">*</span>
              </Label>
              <RichTextEditor
                value={form.tugas}
                onChange={(v) => setForm({ ...form, tugas: v })}
                placeholder="Tulis instruksi tugas di sini..."
              />
              {errors.tugas && <p className="text-xs text-red-500">{errors.tugas}</p>}
            </div>

            {/* Files pendukung */}
            <div className="space-y-1">
              <Label className="text-sm font-medium text-gray-700">Files Pendukung</Label>

              {/* Existing files (edit mode) */}
              {existingFiles.length > 0 && (
                <div className="space-y-1.5 mb-2">
                  {existingFiles.map((f, i) => (
                    <div key={f.id ?? i} className="flex items-center gap-2 bg-blue-50 border border-blue-100 rounded-md px-3 py-2">
                      <Paperclip className="h-3.5 w-3.5 text-blue-500 shrink-0" />
                      <span className="text-xs text-gray-700 flex-1 truncate">{f.name}</span>
                      <button
                        onClick={() => setExistingFiles(existingFiles.filter((_, j) => j !== i))}
                        className="text-gray-400 hover:text-red-500 transition"
                        title="Hapus file ini"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <FileDropzone
                files={newFiles}
                onAdd={(f) => setNewFiles((prev) => [...prev, ...f].slice(0, 5))}
                onRemove={(i) => setNewFiles(newFiles.filter((_, j) => j !== i))}
              />
            </div>

            {/* Tanggal */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="space-y-1">
                  <Label className="text-sm font-medium text-gray-700">
                    Periode Tugas <span className="text-red-500">*</span>
                  </Label>

                  <Popover>
                    <PopoverTrigger asChild>
                      <button className="w-full px-3 py-2 border border-gray-200 rounded-md text-left text-sm bg-white">
                        {form.rangeTanggal?.from && form.rangeTanggal?.to
                          ? `${format(form.rangeTanggal.from, "dd MMM yyyy")} - ${format(form.rangeTanggal.to, "dd MMM yyyy")}`
                          : "Pilih rentang tanggal"}
                      </button>
                    </PopoverTrigger>

                    <PopoverContent className="w-auto p-0">
                      <CalendarComponent
                        mode="range"
                        selected={form.rangeTanggal}
                        onSelect={(range) => setForm({ ...form, rangeTanggal: range })}
                        numberOfMonths={2}
                      />
                    </PopoverContent>
                  </Popover>

                  {errors.tanggal_mulai && (
                    <p className="text-xs text-red-500">{errors.tanggal_mulai}</p>
                  )}
                </div>
                <p className="text-xs text-gray-400 mt-1">Pilih tanggal mulai & batas akhir tugas</p>
              </div>

              <div>
                <div className="space-y-1">
                  <Label className="text-sm font-medium text-gray-700">
                    Jam Pengumpulan (Deadline) <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    type="time"
                    value={form.jam_pengumpulan || "23:59"}
                    onChange={(e) => setForm({ ...form, jam_pengumpulan: e.target.value })}
                  />
                </div>
                <p className="text-xs text-gray-400 mt-1">Batas jam pengumpulan (WIB)</p>
              </div>
            </div>

                       {/* Tipe Assignment */}
            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-gray-700">
                Tipe Assignment
              </Label>

              <div className="flex gap-2">
                {(["upload", "quiz"] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => {
                      tipeRef.current = t;
                      setForm((prev) => ({ ...prev, tipe: t }));
                    }}
                    className={`flex-1 py-2 rounded-xl text-sm font-semibold border transition ${
                      form.tipe === t
                        ? "bg-blue-600 text-white border-blue-600"
                        : "bg-white text-gray-500 border-gray-200 hover:border-blue-300"
                    }`}
                  >
                    {t === "upload"
                      ? "📎 Upload / Teks"
                      : "📝 Quiz (Pilihan Ganda)"}
                  </button>
                ))}
              </div>

              <p className="text-xs text-gray-400">
                {form.tipe === "quiz"
                  ? "Soal bisa ditambahkan setelah assignment dibuat."
                  : "Peserta mengumpulkan jawaban berupa link atau teks."}
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-1">
              <Button
                variant="outline"
                className="flex-1"
                onClick={handleClose}
                disabled={isSubmitting}
              >
                Batal
              </Button>

              <Button
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white uppercase font-semibold tracking-wide"
                onClick={handleSubmit}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Menyimpan...
                  </>
                ) : editingItem ? (
                  "Simpan Perubahan"
                ) : (
                  "Buat Tugas (Assignment)"
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}