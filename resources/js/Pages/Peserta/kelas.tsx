import { Head, router } from "@inertiajs/react";
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
};

type Bab = {
  id: number;
  judul: string;
  urutan: number;
  materis: Materi[];
};

type Assignment = {
  id: number;
  judul: string;
  tugas: string;
  is_wajib: boolean;
  tanggal_mulai?: string;
  tanggal_akhir?: string;
};

type Props = {
  peserta: { id: number; nama: string };
  bootcamp: { id: number; name: string; batch: string };
  babList: Bab[];
  assignments: Assignment[];
};

// ─────────────────────────────────────────────
// Sidebar
// ─────────────────────────────────────────────
function Sidebar({
  bootcamp, babList, assignments, activeMateriId, onSelectMateri, onSelectAssignment, activeSection, sidebarOpen, onClose,
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
                      onClick={() => onSelectMateri(m)}
                      className={`w-full flex items-center gap-2.5 pl-7 pr-4 py-2.5 text-left transition text-xs ${
                        activeMateriId === m.id && activeSection === "materi"
                          ? "bg-blue-50 text-blue-700 font-semibold border-r-2 border-blue-600"
                          : "text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      <Play className="h-3 w-3 shrink-0 opacity-60" />
                      <span className="flex-1 line-clamp-2">{m.judul}</span>
                      {m.durasi && <span className="text-gray-400 text-xs shrink-0">{m.durasi}</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}

          {/* Assignment */}
          {assignments.length > 0 && (
            <>
              <div className="px-3 mt-3 mb-1">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide px-2 py-1">
                  Assignment
                </p>
              </div>
              {assignments.map((a) => (
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
export default function PesertaKelas({ peserta, bootcamp, babList, assignments }: Props) {
  const firstMateri = babList[0]?.materis[0] ?? null;
  const [activeMateri,     setActiveMateri]     = useState<Materi | null>(firstMateri);
  const [activeAssignment, setActiveAssignment] = useState<Assignment | null>(null);
  const [activeSection,    setActiveSection]    = useState<"materi" | "assignment">("materi");
  const [sidebarOpen,      setSidebarOpen]      = useState(false);

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
          <div className="flex items-center gap-2 shrink-0">
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
                  {activeMateri.konten ? (
                    <div
                      className="prose prose-sm max-w-none text-gray-700"
                      dangerouslySetInnerHTML={{ __html: activeMateri.konten }}
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12 text-gray-300">
                      <FileText className="h-12 w-12 mb-3" />
                      <p className="text-sm">Konten materi belum tersedia</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeSection === "assignment" && activeAssignment && (
              <div className="max-w-3xl mx-auto">
                <div className="mb-6 flex items-start gap-3">
                  <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center shrink-0">
                    <ClipboardList className="h-5 w-5 text-orange-500" />
                  </div>
                  <div>
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
                </div>

                {/* Area submit (placeholder — akan dikembangkan) */}
                <div className="bg-white rounded-xl border border-dashed border-gray-200 p-6 text-center">
                  <ClipboardList className="h-10 w-10 text-gray-200 mx-auto mb-2" />
                  <p className="text-sm text-gray-500 font-medium">Submit Jawaban</p>
                  <p className="text-xs text-gray-400 mt-1">Fitur submission akan segera hadir</p>
                </div>
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