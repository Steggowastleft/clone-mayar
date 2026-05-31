import { Head, router } from "@inertiajs/react";
import axios from "axios";
import QuizPlayer, { type SoalItem } from "./quizplayer";
import { useState } from "react";
import {
  BookOpen, ChevronDown, ChevronUp, Play, FileText,
  ClipboardList, Award, LogOut, User, CheckCircle2,
  ChevronLeft, Lock, Menu, X,
} from "lucide-react";

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────
type Materi = {
  id: number;
  judul: string;
  tipe: string;
  konten?: string;
  durasi?: string;
  urutan: number;
  is_selesai?: boolean;
  assignment_id?: number | null; // tugas wajib untuk materi ini
};

type Bab = {
  id: number;
  judul: string;
  urutan: number;
  materis: Materi[];
};

type Submission = {
  id: number;
  submission_url?: string;
  submission_teks?: string;
  grade?: number | null;
  waktu_kirim?: string;
};

type Assignment = {
  id: number;
  judul: string;
  tugas: string;
  is_wajib: boolean;
  is_tugas_akhir?: boolean;
  tipe?: "upload" | "quiz";
  soals?: SoalItem[];
  nilai_tertinggi?: number | null;
  attempt_ke?: number;
  tanggal_mulai?: string;
  tanggal_akhir?: string;
  submission?: Submission | null;
};

type Props = {
  peserta: { id: number; nama: string };
  bootcamp: { id: number; name: string; batch: string };
  babList: Bab[];
  assignments: Assignment[];
  progressPersen: number; // 0-100
};

type SubmitForm = {
  tipe: "url" | "teks" | "file";
  url: string;
  teks: string;
  file?: File;
};

// ─────────────────────────────────────────────
// Sidebar
// ─────────────────────────────────────────────
function Sidebar({
  bootcamp, babList, assignments, activeMateriId, onSelectMateri, onSelectAssignment, activeSection, sidebarOpen, onClose,
  isMateriLocked, isMateriFullyDone, allMateriDone, tugasAkhir, regularAssignments,
}: {
  bootcamp: { id: number; name: string; batch: string };
  babList: Bab[];
  assignments: Assignment[];
  activeMateriId: number | null;
  onSelectMateri: (m: Materi) => void;
  onSelectAssignment: (a: Assignment) => void;
  activeSection: "materi" | "assignment";
  sidebarOpen: boolean;
  onClose: () => void;
  isMateriLocked: (m: Materi) => boolean;
  isMateriFullyDone: (m: Materi) => boolean;
  allMateriDone: boolean;
  tugasAkhir: Assignment | null;
  regularAssignments: Assignment[];
}) {
  const [expandedBab, setExpandedBab] = useState<Record<number, boolean>>(
    Object.fromEntries(babList.map((b) => [b.id, true]))
  );

  return (
    <>
      {/* Overlay mobile */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/40 z-40 lg:hidden" onClick={onClose} />
      )}

      <aside className={`
        fixed top-0 left-0 h-full w-72 bg-white border-r border-gray-200 z-50 flex flex-col
        transform transition-transform duration-300
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
        lg:relative lg:translate-x-0 lg:z-auto lg:flex
      `}>
        {/* Header sidebar */}
        <div className="px-4 py-4 border-b border-gray-100">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-blue-600 font-semibold uppercase tracking-wide">{bootcamp.batch}</span>
            <button onClick={onClose} className="lg:hidden p-1 rounded hover:bg-gray-100">
              <X className="h-4 w-4 text-gray-400" />
            </button>
          </div>
          <h2 className="text-sm font-bold text-gray-800 line-clamp-2">{bootcamp.name}</h2>
        </div>

        {/* Scrollable list */}
        <div className="flex-1 overflow-y-auto py-3">
          {/* Materi */}
          <div className="px-3 mb-1">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide px-2 py-1">Materi</p>
          </div>

          {babList.map((bab) => (
            <div key={bab.id} className="mb-1">
              <button
                onClick={() => setExpandedBab((p) => ({ ...p, [bab.id]: !p[bab.id] }))}
                className="w-full flex items-center justify-between px-5 py-2.5 text-left hover:bg-gray-50 transition"
              >
                <span className="text-xs font-semibold text-gray-700 flex-1">{bab.judul}</span>
                {expandedBab[bab.id]
                  ? <ChevronUp className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                  : <ChevronDown className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                }
              </button>

              {expandedBab[bab.id] && (
                <div>
                  {bab.materis.map((m) => (
                    <button
                      key={m.id}
                      onClick={() => !isMateriLocked(m) && onSelectMateri(m)}
                      className={`w-full flex items-center gap-2.5 pl-7 pr-4 py-2.5 text-left transition text-xs ${
                        activeMateriId === m.id && activeSection === "materi"
                          ? "bg-blue-50 text-blue-700 font-semibold border-r-2 border-blue-600"
                          : "text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      {isMateriLocked(m)
                        ? <Lock className="h-3 w-3 shrink-0 text-gray-300" />
                        : isMateriFullyDone(m)
                        ? <CheckCircle2 className="h-3 w-3 shrink-0 text-green-500" />
                        : <Play className="h-3 w-3 shrink-0 opacity-60" />
                      }
                      <span className={`flex-1 line-clamp-2 ${isMateriLocked(m) ? "text-gray-300" : ""}`}>{m.judul}</span>
                      {m.durasi && !isMateriLocked(m) && <span className="text-gray-400 text-xs shrink-0">{m.durasi}</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}

          {/* Tugas Akhir */}
          {tugasAkhir && (
            <div className="px-3 mt-3">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide px-2 py-1">Tugas Akhir</p>
              <button
                onClick={() => allMateriDone && onSelectAssignment(tugasAkhir)}
                className={`w-full flex items-center gap-2.5 px-5 py-2.5 text-left transition text-xs ${
                  !allMateriDone
                    ? "opacity-40 cursor-not-allowed"
                    : activeSection === "assignment" && activeMateriId === tugasAkhir.id
                    ? "bg-orange-50 text-orange-700 font-semibold border-r-2 border-orange-500"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                {tugasAkhir.submission
                  ? <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-green-500" />
                  : allMateriDone
                  ? <Award className="h-3.5 w-3.5 shrink-0 text-orange-500" />
                  : <Lock className="h-3.5 w-3.5 shrink-0 text-gray-300" />
                }
                <span className="flex-1 line-clamp-2">{tugasAkhir.judul}</span>
                {!allMateriDone && <span className="text-xs text-gray-300">Terkunci</span>}
              </button>
              {!allMateriDone && (
                <p className="text-xs text-gray-400 px-5 py-1.5 italic">
                  Selesaikan semua materi untuk membuka tugas ini
                </p>
              )}
            </div>
          )}

          {/* Assignment reguler */}
          {regularAssignments.length > 0 && (
            <>
              <div className="px-3 mt-3 mb-1">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide px-2 py-1">
                  Assignment
                </p>
              </div>
              {regularAssignments.map((a) => (
                <button
                  key={a.id}
                  onClick={() => onSelectAssignment(a)}
                  className={`w-full flex items-center gap-2.5 px-5 py-2.5 text-left transition text-xs ${
                    activeSection === "assignment" && activeMateriId === a.id
                      ? "bg-orange-50 text-orange-700 font-semibold border-r-2 border-orange-500"
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <ClipboardList className="h-3.5 w-3.5 shrink-0 opacity-60" />
                  <span className="flex-1 line-clamp-2">{a.judul}</span>
                  {a.is_wajib && (
                    <span className="text-xs text-red-500 bg-red-50 px-1.5 py-0.5 rounded shrink-0">Wajib</span>
                  )}
                </button>
              ))}
            </>
          )}
        </div>

        {/* Back to dashboard */}
        <div className="border-t border-gray-100 p-3">
          <button
            onClick={() => router.visit("/peserta/dashboard")}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-gray-500 hover:bg-gray-50 hover:text-gray-700 transition"
          >
            <ChevronLeft className="h-3.5 w-3.5" /> Kembali ke Dashboard
          </button>
        </div>
      </aside>
    </>
  );
}

// ─────────────────────────────────────────────
// Main Page
// ─────────────────────────────────────────────
export default function PesertaKelas({ peserta, bootcamp, babList: initialBabList, assignments: initialAssignments, progressPersen: initialProgress }: Props) {
  const firstMateri = initialBabList[0]?.materis[0] ?? null;
  const [activeMateri,     setActiveMateri]     = useState<Materi | null>(firstMateri);
  const [activeAssignment, setActiveAssignment] = useState<Assignment | null>(null);
  const [activeSection,    setActiveSection]    = useState<"materi" | "assignment">("materi");
  const [sidebarOpen,      setSidebarOpen]      = useState(false);
  const [assignments,      setAssignments]      = useState<Assignment[]>(initialAssignments);
  const [submitForm,       setSubmitForm]       = useState<SubmitForm>({ tipe: "url", url: "", teks: "" });
  const [submitErrors,     setSubmitErrors]     = useState<Record<string, string>>({});
  const [isSubmitting,     setIsSubmitting]     = useState(false);
  const [submitSuccess,    setSubmitSuccess]    = useState(false);
  const [progress,         setProgress]         = useState(initialProgress);
  const [babList,          setBabList]          = useState(initialBabList);

  const handleSelectMateri = (m: Materi) => {
    setActiveMateri(m);
    setActiveSection("materi");
    setActiveAssignment(null);
    setSidebarOpen(false);
  };

  const handleSelectAssignment = (a: Assignment) => {
    setActiveAssignment(a);
    setActiveSection("assignment");
    setSidebarOpen(false);
  };


  // ── Gated Learning Helpers ──────────────────────────────────

  // Flatten semua materi dari semua bab (berurutan)
  const allMateris = babList.flatMap((b) => b.materis ?? []);

  // Cek apakah tugas untuk materi tertentu sudah disubmit
  const isAssignmentSubmitted = (assignmentId?: number | null) => {
    if (!assignmentId) return true; // tidak ada tugas = otomatis pass
    const a = assignments.find((a) => a.id === assignmentId);
    return !!a?.submission;
  };

  // Cek apakah materi sudah benar-benar selesai (baca + submit tugas)
  const isMateriFullyDone = (m: Materi) =>
    !!m.is_selesai && isAssignmentSubmitted(m.assignment_id);

  // Cek apakah semua materi + tugas reguler selesai (syarat buka Tugas Akhir)
  const allMateriDone = allMateris.every((m) => isMateriFullyDone(m));

  // Tugas Akhir
  const tugasAkhir = assignments.find((a) => a.is_tugas_akhir) ?? null;

  // Cek apakah materi terkunci
  const isMateriLocked = (materi: Materi): boolean => {
    const idx = allMateris.findIndex((m) => m.id === materi.id);
    if (idx === 0) return false; // materi pertama selalu terbuka
    const prev = allMateris[idx - 1];
    return !isMateriFullyDone(prev);
  };

  // Assignment reguler (bukan tugas akhir, bukan tugas per materi)
  const regularAssignments = assignments.filter(
    (a) => !a.is_tugas_akhir && !allMateris.some((m) => m.assignment_id === a.id)
  );

  const handleTandaiSelesai = async (materi: Materi) => {
    if (materi.is_selesai || isMateriLocked(materi)) return;
    try {
      const res = await axios.post(`/peserta/bootcamp/${bootcamp.id}/materi/${materi.id}/selesai`);
      setProgress(res.data.progress ?? progress);
      // Update is_selesai di babList
      setBabList((prev) => prev.map((b) => ({
        ...b,
        materis: b.materis.map((m) => m.id === materi.id ? { ...m, is_selesai: true } : m),
      })));
      // Update activeMateri juga
      if (activeMateri?.id === materi.id) {
        setActiveMateri({ ...activeMateri, is_selesai: true });
      }
    } catch (e) {
      console.error("Gagal tandai selesai", e);
    }
  };

  return (
    <>
      <Head title={`${bootcamp.name} — Kelas`} />
      <div className="h-screen flex flex-col bg-gray-50 overflow-hidden">

        {/* Top navbar */}
        <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3 shrink-0 z-20">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
          >
            <Menu className="h-5 w-5 text-gray-600" />
          </button>
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <div className="w-7 h-7 bg-blue-600 rounded-md flex items-center justify-center shrink-0">
              <BookOpen className="h-4 w-4 text-white" />
            </div>
            <span className="text-sm font-semibold text-gray-800 truncate">{bootcamp.name}</span>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            {/* Progress bar */}
            <div className="hidden sm:flex items-center gap-2">
              <div className="w-24 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 rounded-full transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <span className="text-xs font-semibold text-gray-500">{progress}%</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-gray-600">
              <User className="h-3.5 w-3.5 text-gray-400" />
              <span className="hidden sm:block">{peserta.nama}</span>
            </div>
            <button
              onClick={() => router.post("/peserta/logout")}
              className="p-2 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition"
              title="Keluar"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Main layout */}
        <div className="flex flex-1 overflow-hidden">

          {/* Sidebar */}
          <Sidebar
            bootcamp={bootcamp}
            babList={babList}
            assignments={assignments}
            activeMateriId={activeSection === "materi" ? activeMateri?.id ?? null : activeAssignment?.id ?? null}
            onSelectMateri={handleSelectMateri}
            onSelectAssignment={handleSelectAssignment}
            activeSection={activeSection}
            sidebarOpen={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
            isMateriLocked={isMateriLocked}
            isMateriFullyDone={isMateriFullyDone}
            allMateriDone={allMateriDone}
            tugasAkhir={tugasAkhir}
            regularAssignments={regularAssignments}
          />

          {/* Konten area */}
          <main className="flex-1 overflow-y-auto p-6">
            {activeSection === "materi" && activeMateri && (
              <div className="max-w-3xl mx-auto">
                <div className="mb-6">
                  <h1 className="text-xl font-bold text-gray-900">{activeMateri.judul}</h1>
                  {activeMateri.durasi && (
                    <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                      <Play className="h-3 w-3" /> {activeMateri.durasi}
                    </p>
                  )}
                </div>

                {/* Konten materi */}
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  {!activeMateri.konten ? (
                    <div className="flex flex-col items-center justify-center py-12 text-gray-300">
                      <FileText className="h-12 w-12 mb-3" />
                      <p className="text-sm">Konten materi belum tersedia</p>
                    </div>
                  ) : activeMateri.tipe === "video" ? (
                    /* ── VIDEO: embed YouTube/Drive atau fallback link ── */
                    (() => {
                      const url = activeMateri.konten;
                      const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
                      const driveMatch = url.match(/drive\.google\.com\/file\/d\/([^/]+)/);
                      if (ytMatch) {
                        return (
                          <div className="aspect-video rounded-lg overflow-hidden bg-black">
                            <iframe
                              src={`https://www.youtube.com/embed/${ytMatch[1]}`}
                              className="w-full h-full"
                              allowFullScreen
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            />
                          </div>
                        );
                      }
                      if (driveMatch) {
                        return (
                          <div className="aspect-video rounded-lg overflow-hidden bg-black">
                            <iframe
                              src={`https://drive.google.com/file/d/${driveMatch[1]}/preview`}
                              className="w-full h-full"
                              allowFullScreen
                            />
                          </div>
                        );
                      }
                      // fallback: tampilkan sebagai link
                      return (
                        <div className="flex flex-col items-center justify-center py-10 gap-3">
                          <Play className="h-10 w-10 text-blue-400" />
                          <p className="text-sm text-gray-500">Video tidak dapat di-embed. Buka langsung:</p>
                          <a
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition"
                          >
                            <Play className="h-4 w-4" /> Tonton Video
                          </a>
                        </div>
                      );
                    })()
                  ) : activeMateri.tipe === "link" || activeMateri.tipe === "dokumen" ? (
                    /* ── LINK / DOKUMEN: tombol klik langsung ── */
                    <div className="flex flex-col items-center justify-center py-10 gap-4">
                      <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center">
                        {activeMateri.tipe === "dokumen"
                          ? <FileText className="h-7 w-7 text-blue-500" />
                          : <Play className="h-7 w-7 text-blue-500" />
                        }
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-medium text-gray-700 mb-1">
                          {activeMateri.tipe === "dokumen" ? "Dokumen tersedia" : "Link materi tersedia"}
                        </p>
                        <p className="text-xs text-gray-400 break-all max-w-sm">{activeMateri.konten}</p>
                      </div>
                      <a
                        href={activeMateri.konten}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition shadow-sm"
                      >
                        {activeMateri.tipe === "dokumen" ? <FileText className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                        {activeMateri.tipe === "dokumen" ? "Buka Dokumen" : "Buka Link"}
                      </a>
                    </div>
                  ) : (
                    /* ── TEKS: render biasa ── */
                    <div
                      className="prose prose-sm max-w-none text-gray-700"
                      dangerouslySetInnerHTML={{ __html: activeMateri.konten }}
                    />
                  )}
                </div>

                {/* Tandai Selesai */}
                <div className="mt-4 flex items-center justify-between gap-4">
                  <div className="flex-1">
                    {activeMateri.is_selesai ? (
                      <div className="flex items-center gap-2 text-green-600 text-sm font-semibold">
                        <CheckCircle2 className="h-4 w-4" />
                        Materi Sudah Dibaca
                      </div>
                    ) : (
                      <button
                        onClick={() => handleTandaiSelesai(activeMateri)}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition"
                      >
                        <CheckCircle2 className="h-4 w-4" />
                        Tandai Selesai Membaca
                      </button>
                    )}
                  </div>

                  {/* Status tugas wajib materi ini */}
                  {activeMateri.assignment_id && (() => {
                    const tugasMateri = assignments.find((a) => a.id === activeMateri.assignment_id);
                    if (!tugasMateri) return null;
                    const sudahSubmit = !!tugasMateri.submission;
                    return (
                      <button
                        onClick={() => { setActiveAssignment(tugasMateri); setActiveSection("assignment"); }}
                        className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl border transition ${
                          sudahSubmit
                            ? "bg-green-50 text-green-600 border-green-200"
                            : "bg-orange-50 text-orange-600 border-orange-200 hover:bg-orange-100"
                        }`}
                      >
                        {sudahSubmit
                          ? <><CheckCircle2 className="h-4 w-4" /> Tugas Selesai</>
                          : <><ClipboardList className="h-4 w-4" /> Kerjakan Tugas Wajib</>
                        }
                      </button>
                    );
                  })()}
                </div>

                {/* Warning: harus selesai tugas dulu sebelum lanjut */}
                {activeMateri.is_selesai && activeMateri.assignment_id && !isAssignmentSubmitted(activeMateri.assignment_id) && (
                  <div className="mt-3 p-3 bg-orange-50 border border-orange-200 rounded-xl flex items-start gap-2">
                    <Lock className="h-4 w-4 text-orange-500 shrink-0 mt-0.5" />
                    <p className="text-xs text-orange-700">
                      Selesaikan tugas wajib di atas untuk membuka materi berikutnya.
                    </p>
                  </div>
                )}
              </div>
            )}

            {activeSection === "assignment" && activeAssignment && (
              <div className="max-w-3xl mx-auto">
                <div className="mb-6 flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${activeAssignment.is_tugas_akhir ? "bg-purple-50" : "bg-orange-50"}`}>
                    {activeAssignment.is_tugas_akhir
                      ? <Award className="h-5 w-5 text-purple-500" />
                      : <ClipboardList className="h-5 w-5 text-orange-500" />
                    }
                  </div>
                  <div>
                    {activeAssignment.is_tugas_akhir && (
                      <span className="text-xs font-bold text-purple-600 bg-purple-50 border border-purple-200 px-2 py-0.5 rounded-full mb-1 inline-block">
                        🏆 TUGAS AKHIR
                      </span>
                    )}
                    <h1 className="text-xl font-bold text-gray-900">{activeAssignment.judul}</h1>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      {activeAssignment.is_wajib && (
                        <span className="text-xs text-red-500 bg-red-50 px-2 py-0.5 rounded font-medium">Wajib</span>
                      )}
                      {activeAssignment.tanggal_mulai && (
                        <span className="text-xs text-gray-400">
                          Mulai: {activeAssignment.tanggal_mulai}
                        </span>
                      )}
                      {activeAssignment.tanggal_akhir && (
                        <span className="text-xs text-gray-400">
                          Deadline: {activeAssignment.tanggal_akhir}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Deskripsi tugas */}
                <div className="bg-white rounded-xl border border-gray-200 p-6 mb-4">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">Instruksi Tugas</h3>
                  <div
                    className="prose prose-sm max-w-none text-gray-700"
                    dangerouslySetInnerHTML={{ __html: activeAssignment.tugas }}
                  />

                  {/* Daftar Soal Uraian jika ada */}
                  {activeAssignment.tipe === "upload" && activeAssignment.soals && activeAssignment.soals.length > 0 && (
                    <div className="mt-8 space-y-4 border-t pt-6">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Daftar Pertanyaan</p>
                        {activeAssignment.soals.map((s, i) => (
                            <div key={s.id} className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                                <p className="text-[10px] font-black text-blue-600 mb-2 uppercase tracking-wide">PERTANYAAN #{i + 1}</p>
                                {s.show_image && s.image_url && (
                                    <div className="mb-3 rounded-lg overflow-hidden border border-gray-200 bg-white">
                                        <img src={s.image_url} className="max-h-64 mx-auto object-contain" />
                                    </div>
                                )}
                                <p className="text-sm text-gray-800 font-medium whitespace-pre-wrap">{s.pertanyaan}</p>
                            </div>
                        ))}
                    </div>
                  )}
                </div>

                {/* ── Area Submit ── */}
                {activeAssignment.tipe === "quiz" && activeAssignment.soals
                  ? (
                    <div className="bg-white rounded-xl border border-gray-200 p-5">
                      <h3 className="text-sm font-semibold text-gray-700 mb-4">Quiz</h3>
                      <QuizPlayer
                        assignmentId={activeAssignment.id}
                        soals={activeAssignment.soals}
                        nilaiTertinggi={activeAssignment.nilai_tertinggi}
                        attemptKe={activeAssignment.attempt_ke ?? 0}
                        onSelesai={(result) => {
                          setAssignments((prev) => prev.map((a) =>
                            a.id === activeAssignment.id
                              ? { ...a, nilai_tertinggi: result.nilai_tertinggi, attempt_ke: result.attempt_ke,
                                  submission: { id: 0, submission_teks: "quiz", grade: result.nilai_tertinggi } }
                              : a
                          ));
                        }}
                      />
                    </div>
                  )
                  : (() => {
                  const sub = activeAssignment.submission;

                  // Sudah submit & sudah dinilai
                  if (sub && sub.grade !== null && sub.grade !== undefined) {
                    return (
                      <div className="bg-white rounded-xl border border-gray-200 p-6">
                        <h3 className="text-sm font-semibold text-gray-700 mb-4">Submission Kamu</h3>
                        <div className="flex items-center justify-between p-4 bg-green-50 rounded-xl border border-green-200 mb-4">
                          <div className="flex items-center gap-3">
                            <CheckCircle2 className="h-8 w-8 text-green-500" />
                            <div>
                              <p className="text-sm font-bold text-green-700">Sudah Dinilai</p>
                              <p className="text-xs text-green-600">Instruktur telah memberikan penilaian</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-3xl font-black text-green-600">{sub.grade}</p>
                            <p className="text-xs text-green-500">/ 100</p>
                          </div>
                        </div>
                        {sub.submission_url && (
                          <div className="mb-3">
                            <p className="text-xs text-gray-400 mb-1">Link yang dikumpulkan:</p>
                            <a href={sub.submission_url} target="_blank" rel="noopener noreferrer"
                              className="text-sm text-blue-600 hover:underline break-all">{sub.submission_url}</a>
                          </div>
                        )}
                        {sub.submission_teks && (
                          <div className="mb-3">
                            <p className="text-xs text-gray-400 mb-1">Jawaban yang dikumpulkan:</p>
                            <p className="text-sm text-gray-700 whitespace-pre-wrap">{sub.submission_teks}</p>
                          </div>
                        )}
                        {(sub as any).submission_file && (
                          <div>
                            <p className="text-xs text-gray-400 mb-1">File yang dikumpulkan:</p>
                            <a 
                                href={(sub as any).file_url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 p-2 bg-blue-50 border border-blue-100 rounded-lg text-sm text-blue-600 hover:bg-blue-100 transition"
                            >
                                <FileText className="h-4 w-4" />
                                <span className="flex-1 truncate">{(sub as any).submission_file_name}</span>
                            </a>
                          </div>
                        )}
                      </div>
                    );
                  }

                  // Sudah submit tapi belum dinilai
                  if (sub) {
                    return (
                      <div className="bg-white rounded-xl border border-gray-200 p-6">
                        <h3 className="text-sm font-semibold text-gray-700 mb-4">Submission Kamu</h3>
                        <div className="flex items-center gap-3 p-4 bg-yellow-50 rounded-xl border border-yellow-200 mb-4">
                          <ClipboardList className="h-8 w-8 text-yellow-500" />
                          <div>
                            <p className="text-sm font-bold text-yellow-700">Menunggu Penilaian</p>
                            <p className="text-xs text-yellow-600">Instruktur belum memberikan nilai</p>
                          </div>
                        </div>
                        {sub.submission_url && (
                          <div className="mb-3">
                            <p className="text-xs text-gray-400 mb-1">Link yang dikumpulkan:</p>
                            <a href={sub.submission_url} target="_blank" rel="noopener noreferrer"
                              className="text-sm text-blue-600 hover:underline break-all">{sub.submission_url}</a>
                          </div>
                        )}
                        {sub.submission_teks && (
                          <div className="mb-3">
                            <p className="text-xs text-gray-400 mb-1">Jawaban yang dikumpulkan:</p>
                            <p className="text-sm text-gray-700 whitespace-pre-wrap">{sub.submission_teks}</p>
                          </div>
                        )}
                        {(sub as any).submission_file && (
                          <div>
                            <p className="text-xs text-gray-400 mb-1">File yang dikumpulkan:</p>
                            <a 
                                href={(sub as any).file_url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 p-2 bg-blue-50 border border-blue-100 rounded-lg text-sm text-blue-600 hover:bg-blue-100 transition"
                            >
                                <FileText className="h-4 w-4" />
                                <span className="flex-1 truncate">{(sub as any).submission_file_name}</span>
                            </a>
                          </div>
                        )}
                      </div>
                    );
                  }

                  // Belum submit
                  return (
                    <div className="bg-white rounded-xl border border-gray-200 p-6">
                      <h3 className="text-sm font-semibold text-gray-700 mb-4">Kumpulkan Jawaban</h3>

                      {/* Toggle tipe */}
                      <div className="flex gap-2 mb-4">
                        {(["url", "teks", "file"] as const).map((t) => (
                          <button key={t}
                            onClick={() => { setSubmitForm({ ...submitForm, tipe: t }); setSubmitErrors({}); }}
                            className={`px-4 py-1.5 rounded-lg text-xs font-semibold border transition ${
                              submitForm.tipe === t
                                ? "bg-blue-600 text-white border-blue-600"
                                : "bg-white text-gray-500 border-gray-200 hover:border-blue-300"
                            }`}
                          >
                            {t === "url" ? "🔗 Link / URL" : t === "teks" ? "📝 Teks" : "📁 File / Gambar"}
                          </button>
                        ))}
                      </div>

                      {submitForm.tipe === "url" ? (
                        <div className="space-y-1.5 mb-4">
                          <label className="text-xs font-medium text-gray-600">Link Jawaban</label>
                          <input
                            type="url"
                            placeholder="https://drive.google.com/... atau link lainnya"
                            value={submitForm.url}
                            onChange={(e) => setSubmitForm({ ...submitForm, url: e.target.value })}
                            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                          {submitErrors.url && <p className="text-xs text-red-500">{submitErrors.url}</p>}
                        </div>
                      ) : submitForm.tipe === "teks" ? (
                        <div className="space-y-1.5 mb-4">
                          <label className="text-xs font-medium text-gray-600">Jawaban Kamu</label>
                          <textarea
                            rows={5}
                            placeholder="Tulis jawaban kamu di sini..."
                            value={submitForm.teks}
                            onChange={(e) => setSubmitForm({ ...submitForm, teks: e.target.value })}
                            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                          />
                          {submitErrors.teks && <p className="text-xs text-red-500">{submitErrors.teks}</p>}
                        </div>
                      ) : (
                        <div className="space-y-1.5 mb-4">
                          <label className="text-xs font-medium text-gray-600">Upload File / Gambar</label>
                          <div 
                            onClick={() => document.getElementById('submit-file-input')?.click()}
                            className="border-2 border-dashed border-gray-200 rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer hover:border-blue-300 hover:bg-blue-50/30 transition group"
                          >
                            <FileText className="h-8 w-8 text-gray-400 group-hover:text-blue-500 mb-2" />
                            <p className="text-sm font-medium text-gray-500 group-hover:text-blue-600">
                                {(submitForm as any).file ? (submitForm as any).file.name : "Klik untuk pilih file"}
                            </p>
                            <p className="text-xs text-gray-400 mt-1">PDF, ZIP, atau Gambar (Max 10MB)</p>
                            <input 
                                id="submit-file-input"
                                type="file" 
                                className="hidden" 
                                onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) setSubmitForm({ ...submitForm, file } as any);
                                }}
                            />
                          </div>
                          {submitErrors.submission_file && <p className="text-xs text-red-500 mt-1">{submitErrors.submission_file}</p>}
                        </div>
                      )}

                      {submitSuccess && (
                        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-xs text-green-700 font-medium">
                          ✅ Jawaban berhasil dikumpulkan!
                        </div>
                      )}

                      <button
                        disabled={isSubmitting}
                        onClick={() => {
                          // Validasi
                          const errs: Record<string, string> = {};
                          if (submitForm.tipe === "url" && !submitForm.url.trim()) errs.url = "Link wajib diisi.";
                          if (submitForm.tipe === "teks" && !submitForm.teks.trim()) errs.teks = "Jawaban wajib diisi.";
                          if (Object.keys(errs).length) { setSubmitErrors(errs); return; }
                          setSubmitErrors({});
                          setIsSubmitting(true);

                          const fd = new FormData();
                          if (submitForm.tipe === "url") fd.append("submission_url", submitForm.url.trim());
                          else if (submitForm.tipe === "teks") fd.append("submission_teks", submitForm.teks.trim());
                          else if ((submitForm as any).file) fd.append("submission_file", (submitForm as any).file);

                          router.post(`/peserta/assignments/${activeAssignment.id}/submit`, fd, {
                            preserveScroll: true,
                            onSuccess: (page) => {
                              setIsSubmitting(false);
                              setSubmitSuccess(true);
                              setSubmitForm({ tipe: "url", url: "", teks: "" });
                              // Update local assignments state
                              const newSub = (page.props as any).newSubmission;
                              if (newSub) {
                                setAssignments((prev) => prev.map((a) =>
                                  a.id === activeAssignment.id ? { ...a, submission: newSub } : a
                                ));
                                setActiveAssignment({ ...activeAssignment, submission: newSub });
                              }
                            },
                            onError: (e) => {
                              setIsSubmitting(false);
                              setSubmitErrors(e);
                            },
                          });
                        }}
                        className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-bold rounded-xl transition"
                      >
                        {isSubmitting ? "Mengumpulkan..." : "Kumpulkan Jawaban"}
                      </button>
                    </div>
                  );
                  })()
                }
              </div>
            )}

            {/* Empty state */}
            {!activeMateri && !activeAssignment && (
              <div className="flex flex-col items-center justify-center h-full text-gray-300">
                <BookOpen className="h-16 w-16 mb-4" />
                <p className="text-sm">Pilih materi dari sidebar untuk mulai belajar</p>
              </div>
            )}
          </main>
        </div>
      </div>
    </>
  );
}