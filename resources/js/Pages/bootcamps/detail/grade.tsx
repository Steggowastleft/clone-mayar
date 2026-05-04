import { useState } from "react";
import { router } from "@inertiajs/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
    Select, SelectContent, SelectItem,
    SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
    Printer, Download, MessageCircle, ChevronLeft,
    ChevronRight, ChevronsLeft, ChevronsRight, Loader2,
    FileText, CheckCircle2,
} from "lucide-react";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────
export type SubmissionItem = {
  id: number;
  assignment_id: number;
  assignment_judul: string;
  peserta_id: number;
  peserta_nama: string;
  peserta_email: string;
  peserta_no_hp?: string;
  waktu_kirim: string;        // ISO string
  submission_url?: string;    // link file/text submission
  submission_teks?: string;   // teks submission
  submission_file?: string;
  submission_file_name?: string;
  file_url?: string;
  grade?: number | null;      // null = belum dinilai
};

export type AssignmentOption = {
  id: number;
  judul: string;
};

type Props = {
  bootcampId: number;
  assignments: AssignmentOption[];
  submissions: SubmissionItem[];
};

// ─────────────────────────────────────────────
// Beri Nilai Dialog
// ─────────────────────────────────────────────
function BeriNilaiDialog({
  submission,
  onClose,
  onSaved,
}: {
  submission: SubmissionItem;
  onClose: () => void;
  onSaved: (id: number, grade: number) => void;
}) {
  const [nilai, setNilai]     = useState(submission.grade?.toString() || "");
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");

  const handleSave = () => {
    const n = Number(nilai);
    if (!nilai || isNaN(n) || n < 0 || n > 100) {
      setError("Nilai harus antara 0 – 100");
      return;
    }
    setError("");
    setLoading(true);
    router.post(
      `/submissions/${submission.id}/grade`,
      { grade: n },
      {
        preserveScroll: true,
        onSuccess: () => {
          onSaved(submission.id, n);
          onClose();
        },
        onError:   () => setError("Gagal menyimpan, coba lagi."),
        onFinish:  () => setLoading(false),
      }
    );
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-base font-bold">Beri Nilai</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-1">
          {/* Info peserta */}
          <div className="bg-gray-50 rounded-lg p-3 space-y-1 text-sm">
            <p><span className="text-gray-400">Assignment:</span> <span className="font-semibold text-gray-800">{submission.assignment_judul}</span></p>
            <p><span className="text-gray-400">Peserta:</span> <span className="font-semibold text-gray-800">{submission.peserta_nama}</span></p>
            <p><span className="text-gray-400">Waktu kirim:</span> <span className="text-gray-700">{format(new Date(submission.waktu_kirim), "d MMM yyyy HH:mm", { locale: idLocale })}</span></p>
          </div>

          {/* Lihat submission */}
          {(submission.submission_url || submission.submission_teks || submission.submission_file) && (
            <div className="space-y-1">
              <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Submission</Label>
              {submission.submission_url && (
                <a href={submission.submission_url} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm font-medium underline mb-1">
                  <FileText className="h-4 w-4" /> Lihat File / Link Submission
                </a>
              )}
              {submission.submission_file && (
                <a href={submission.file_url} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 text-emerald-600 hover:text-emerald-700 text-sm font-medium underline mb-1">
                  <Upload className="h-4 w-4" /> Download/Lihat File: {submission.submission_file_name}
                </a>
              )}
              {submission.submission_teks && (
                <div className="bg-white border border-gray-200 rounded-md p-3 text-sm text-gray-700 max-h-32 overflow-y-auto">
                  {submission.submission_teks}
                </div>
              )}
            </div>
          )}

          {/* Input nilai */}
          <div className="space-y-1.5">
            <Label className="text-sm font-medium text-gray-700">
              Nilai <span className="text-gray-400 font-normal">(0 – 100)</span>
            </Label>
            <Input
              type="number" min={0} max={100}
              placeholder="Contoh: 85"
              value={nilai}
              onChange={(e) => setNilai(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSave()}
              className={error ? "border-red-400" : ""}
            />
            {error && <p className="text-xs text-red-500">{error}</p>}
          </div>

          <div className="flex gap-2 pt-1">
            <Button variant="outline" className="flex-1" onClick={onClose} disabled={loading}>
              Batal
            </Button>
            <Button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white" onClick={handleSave} disabled={loading}>
              {loading ? <><Loader2 className="h-4 w-4 animate-spin mr-1" /> Menyimpan...</> : "Simpan Nilai"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─────────────────────────────────────────────
// Lihat Submission Dialog
// ─────────────────────────────────────────────
function LihatSubmissionDialog({
  submission,
  onClose,
}: {
  submission: SubmissionItem;
  onClose: () => void;
}) {
  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-base font-bold">Detail Submission</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-1 text-sm">
          <div className="bg-gray-50 rounded-lg p-3 space-y-1">
            <p><span className="text-gray-400">Assignment:</span> <span className="font-semibold">{submission.assignment_judul}</span></p>
            <p><span className="text-gray-400">Peserta:</span> <span className="font-semibold">{submission.peserta_nama}</span></p>
            <p><span className="text-gray-400">Email:</span> {submission.peserta_email}</p>
            {submission.peserta_no_hp && <p><span className="text-gray-400">No HP:</span> {submission.peserta_no_hp}</p>}
            <p><span className="text-gray-400">Waktu kirim:</span> {format(new Date(submission.waktu_kirim), "d MMMM yyyy, HH:mm", { locale: idLocale })} WIB</p>
            {submission.grade !== null && submission.grade !== undefined && (
              <p><span className="text-gray-400">Nilai:</span> <span className="font-bold text-blue-600">{submission.grade}</span></p>
            )}
          </div>

          {submission.submission_teks && (
            <div className="space-y-1.5">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">Jawaban Teks</p>
              <div className="bg-white border border-gray-200 rounded-md p-3 text-gray-700 max-h-48 overflow-y-auto leading-relaxed whitespace-pre-wrap">
                {submission.submission_teks}
              </div>
            </div>
          )}

          {submission.submission_url && (
            <a href={submission.submission_url} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium underline">
              <FileText className="h-4 w-4" /> Buka File / Link Submission
            </a>
          )}

          {submission.submission_file && (
            <a href={submission.file_url} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-2 text-emerald-600 hover:text-emerald-700 font-medium underline">
              <Upload className="h-4 w-4" /> Download File: {submission.submission_file_name}
            </a>
          )}

          <Button variant="outline" className="w-full" onClick={onClose}>Tutup</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─────────────────────────────────────────────
// Main Tab
// ─────────────────────────────────────────────
const ROWS_PER_PAGE_OPTIONS = [10, 25, 50];

export default function TabGrade({ bootcampId, assignments, submissions: initialSubmissions }: Props) {
  const [selectedAssignment, setSelectedAssignment] = useState<string>("all");
  const [search, setSearch]                         = useState("");
  const [rowsPerPage, setRowsPerPage]               = useState(10);
  const [page, setPage]                             = useState(1);
  const [submissions, setSubmissions]               = useState<SubmissionItem[]>(initialSubmissions);

  // Dialog state
  const [gradeTarget, setGradeTarget]   = useState<SubmissionItem | null>(null);
  const [lihatTarget, setLihatTarget]   = useState<SubmissionItem | null>(null);

  // ── Filter ──────────────────────────────────
  const filtered = submissions.filter((s) => {
    const matchAssignment = selectedAssignment === "all" || s.assignment_id === Number(selectedAssignment);
    const q = search.toLowerCase();
    const matchSearch = !q
      || s.peserta_nama.toLowerCase().includes(q)
      || s.peserta_email.toLowerCase().includes(q)
      || s.assignment_judul.toLowerCase().includes(q);
    return matchAssignment && matchSearch;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / rowsPerPage));
  const safePage   = Math.min(page, totalPages);
  const paginated  = filtered.slice((safePage - 1) * rowsPerPage, safePage * rowsPerPage);

  // ── After grading, update local state ───────
  const handleGradeSaved = (id: number, grade: number) => {
    setSubmissions((prev) => prev.map((s) => s.id === id ? { ...s, grade } : s));
  };

  return (
    <div className="p-6 space-y-5">

      {/* Dropdown pilih assignment */}
      <div className="bg-white border border-gray-200 rounded-lg">
        <Select value={selectedAssignment} onValueChange={(v) => { setSelectedAssignment(v); setPage(1); }}>
          <SelectTrigger className="h-11 border-0 shadow-none text-sm focus:ring-0">
            <SelectValue placeholder="Pilih Assignment..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Assignment</SelectItem>
            {assignments.map((a) => (
              <SelectItem key={a.id} value={String(a.id)}>{a.judul}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Table card */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm">

        {/* Table header */}
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h2 className="font-semibold text-gray-700">Daftar Submission</h2>
            <span className="bg-blue-600 text-white text-xs font-bold px-2.5 py-0.5 rounded-full">
              {filtered.length} Entri Data
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button className="text-gray-400 hover:text-gray-600 transition p-1"><Printer className="h-4 w-4" /></button>
            <button className="text-gray-400 hover:text-gray-600 transition p-1"><Download className="h-4 w-4" /></button>
          </div>
        </div>

        {/* Search */}
        <div className="px-5 py-3 border-b border-gray-50">
          <div className="relative max-w-xs">
            <svg className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <Input placeholder="Filter Halaman" className="pl-9 text-sm h-9"
              value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                {["Assignment", "Nama", "Email", "No HP", "Waktu Kirim", "Submission", "Grade"].map((h) => (
                  <th key={h} className="text-left px-5 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-gray-400 text-sm">
                    There are no records to display
                  </td>
                </tr>
              ) : (
                paginated.map((s) => (
                  <tr key={s.id} className="border-b border-gray-50 hover:bg-gray-50 transition">
                    {/* Assignment */}
                    <td className="px-5 py-3.5 text-gray-700 font-medium whitespace-nowrap">
                      {s.assignment_judul}
                    </td>

                    {/* Nama */}
                    <td className="px-5 py-3.5">
                      <span className="text-blue-600 hover:text-blue-700 font-medium cursor-pointer">
                        {s.peserta_nama}
                      </span>
                    </td>

                    {/* Email */}
                    <td className="px-5 py-3.5 text-gray-600 max-w-[140px]">
                      <span className="truncate block" title={s.peserta_email}>
                        {s.peserta_email.length > 18
                          ? s.peserta_email.slice(0, 15) + "..."
                          : s.peserta_email}
                      </span>
                    </td>

                    {/* No HP */}
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-1.5 text-gray-600">
                        <span>{s.peserta_no_hp || "-"}</span>
                        {s.peserta_no_hp && (
                          <a href={`https://wa.me/${s.peserta_no_hp?.replace(/\D/g, "")}`}
                            target="_blank" rel="noopener noreferrer"
                            className="text-green-500 hover:text-green-600 transition">
                            <MessageCircle className="h-4 w-4" />
                          </a>
                        )}
                      </div>
                    </td>

                    {/* Waktu kirim */}
                    <td className="px-5 py-3.5 text-gray-600 whitespace-nowrap">
                      {format(new Date(s.waktu_kirim), "d MMM yyyy HH:mm", { locale: idLocale })}
                    </td>

                    {/* Submission */}
                    <td className="px-5 py-3.5">
                      {s.submission_url || s.submission_teks ? (
                        <button onClick={() => setLihatTarget(s)}
                          className="text-blue-600 hover:text-blue-700 font-bold text-sm transition">
                          LIHAT
                        </button>
                      ) : (
                        <span className="text-gray-300 text-sm">—</span>
                      )}
                    </td>

                    {/* Grade */}
                    <td className="px-5 py-3.5">
                      {s.grade !== null && s.grade !== undefined ? (
                        <div className="flex items-center gap-2">
                          <span className="flex items-center gap-1 bg-green-50 text-green-700 font-bold text-sm px-2.5 py-1 rounded-full">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            {s.grade}
                          </span>
                          <button onClick={() => setGradeTarget(s)}
                            className="text-xs text-gray-400 hover:text-blue-600 transition underline">
                            ubah
                          </button>
                        </div>
                      ) : (
                        <button onClick={() => setGradeTarget(s)}
                          className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-1.5 rounded-md transition">
                          BERI NILAI
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-5 py-3 border-t border-gray-100 flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center gap-2">
            <span>Rows per page:</span>
            <Select value={String(rowsPerPage)} onValueChange={(v) => { setRowsPerPage(Number(v)); setPage(1); }}>
              <SelectTrigger className="h-7 w-16 text-xs border-gray-200">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ROWS_PER_PAGE_OPTIONS.map((n) => (
                  <SelectItem key={n} value={String(n)}>{n}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-1">
            <span className="mr-2 text-xs">
              {filtered.length === 0 ? "0-0 of 0" : `${(safePage - 1) * rowsPerPage + 1}-${Math.min(safePage * rowsPerPage, filtered.length)} of ${filtered.length}`}
            </span>
            <button onClick={() => setPage(1)} disabled={safePage === 1}
              className="p-1 hover:bg-gray-100 rounded disabled:opacity-30 transition">
              <ChevronsLeft className="h-4 w-4" />
            </button>
            <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={safePage === 1}
              className="p-1 hover:bg-gray-100 rounded disabled:opacity-30 transition">
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={safePage === totalPages}
              className="p-1 hover:bg-gray-100 rounded disabled:opacity-30 transition">
              <ChevronRight className="h-4 w-4" />
            </button>
            <button onClick={() => setPage(totalPages)} disabled={safePage === totalPages}
              className="p-1 hover:bg-gray-100 rounded disabled:opacity-30 transition">
              <ChevronsRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Dialogs */}
      {gradeTarget && (
        <BeriNilaiDialog
          submission={gradeTarget}
          onClose={() => setGradeTarget(null)}
          onSaved={handleGradeSaved}
        />
      )}
      {lihatTarget && (
        <LihatSubmissionDialog
          submission={lihatTarget}
          onClose={() => setLihatTarget(null)}
        />
      )}
    </div>
  );
}