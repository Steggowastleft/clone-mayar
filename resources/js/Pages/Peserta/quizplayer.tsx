import { useState } from "react";
import { router } from "@inertiajs/react";
import { CheckCircle2, XCircle, RotateCcw, Award, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────
export type SoalItem = {
  id: number;
  pertanyaan: string;
  tipe_soal: "pilihan_ganda" | "essay";
  pilihan?: string[];
  urutan: number;
};

export type QuizResult = {
  nilai: number;
  nilai_tertinggi: number;
  benar: number;
  total_pilgan: number;
  attempt_ke: number;
  jawaban_benar: Record<number, string>;
};

type Props = {
  assignmentId: number;
  soals: SoalItem[];
  nilaiTertinggi?: number | null;
  attemptKe?: number;
  onSelesai?: (result: QuizResult) => void;
};

const OPSI_LABELS = ["A", "B", "C", "D", "E"];

// ─────────────────────────────────────────────
// Hasil Quiz
// ─────────────────────────────────────────────
function HasilQuiz({ result, soals, jawaban, onRetake }: {
  result: QuizResult;
  soals: SoalItem[];
  jawaban: Record<number, string>;
  onRetake: () => void;
}) {
  const [showDetail, setShowDetail] = useState(false);
  const lulus = result.nilai >= 70;

  return (
    <div className="space-y-5">
      {/* Score card */}
      <div className={`rounded-2xl p-8 text-center ${lulus ? "bg-gradient-to-br from-green-50 to-emerald-100 border border-green-200" : "bg-gradient-to-br from-orange-50 to-amber-100 border border-orange-200"}`}>
        <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 ${lulus ? "bg-green-100" : "bg-orange-100"}`}>
          {lulus ? <Award className="h-10 w-10 text-green-600" /> : <RotateCcw className="h-10 w-10 text-orange-500" />}
        </div>
        <p className={`text-6xl font-black mb-2 ${lulus ? "text-green-600" : "text-orange-600"}`}>{result.nilai}</p>
        <p className="text-base font-bold text-gray-700 mb-1">{lulus ? "🎉 Selamat! Kamu Lulus" : "Belum Lulus — Coba Lagi!"}</p>
        <p className="text-sm text-gray-500">{result.benar} dari {result.total_pilgan} soal benar</p>
        {result.nilai >= result.nilai_tertinggi && result.attempt_ke > 1 && (
          <div className="mt-3 inline-flex items-center gap-1.5 bg-yellow-100 text-yellow-700 text-xs font-bold px-3 py-1.5 rounded-full">✨ Nilai Baru Tertinggi!</div>
        )}
        <p className="text-xs text-gray-400 mt-2">
          Nilai tertinggi: <span className="font-bold text-gray-600">{result.nilai_tertinggi}</span> · Attempt ke-{result.attempt_ke}
        </p>
      </div>

      <div className="flex gap-2">
        <Button variant="outline" className="flex-1" onClick={() => setShowDetail(!showDetail)}>
          {showDetail ? "Tutup Pembahasan" : "Lihat Pembahasan"}
        </Button>
        <Button className="flex-1 bg-blue-600 hover:bg-blue-700" onClick={onRetake}>
          <RotateCcw className="h-4 w-4 mr-1.5" /> Coba Lagi
        </Button>
      </div>

      {/* Pembahasan */}
      {showDetail && (
        <div className="space-y-4">
          {soals.filter(s => s.tipe_soal === "pilihan_ganda").map((soal, idx) => {
            const jp = jawaban[soal.id];
            const jb = result.jawaban_benar[soal.id];
            const benar = jp === jb;
            return (
              <div key={soal.id} className={`rounded-xl border p-4 ${benar ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}`}>
                <div className="flex items-start gap-2 mb-3">
                  {benar
                    ? <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                    : <XCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
                  }
                  <p className="text-sm font-semibold text-gray-800">{idx + 1}. {soal.pertanyaan}</p>
                </div>
                <div className="ml-7 space-y-1.5">
                  {soal.pilihan?.map((p, i) => {
                    const label = OPSI_LABELS[i];
                    return (
                      <div key={i} className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm ${
                        label === jb ? "bg-green-200 text-green-800 font-semibold"
                        : label === jp && !benar ? "bg-red-200 text-red-800"
                        : "text-gray-600"
                      }`}>
                        <span className="font-bold w-5 shrink-0">{label}.</span>
                        <span className="flex-1">{p}</span>
                        {label === jb && <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0" />}
                        {label === jp && !benar && <XCircle className="h-4 w-4 text-red-500 shrink-0" />}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// Main QuizPlayer — CodingStudio style
// semua soal tampil sekaligus, scroll ke bawah
// ─────────────────────────────────────────────
export default function QuizPlayer({ assignmentId, soals, nilaiTertinggi, attemptKe = 0, onSelesai }: Props) {
  const [jawaban,    setJawaban]    = useState<Record<number, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [result,     setResult]     = useState<QuizResult | null>(null);
  const [errors,     setErrors]     = useState("");
  const [started,    setStarted]    = useState(false);

  const pilganSoals = soals.filter(s => s.tipe_soal === "pilihan_ganda");
  const essaySoals  = soals.filter(s => s.tipe_soal === "essay");
  const answered    = pilganSoals.filter(s => jawaban[s.id]).length;

  const handleRetake = () => {
    setJawaban({});
    setResult(null);
    setErrors("");
    setStarted(false);
  };

  const handleSubmit = () => {
    const unanswered = pilganSoals.filter(s => !jawaban[s.id]);
    if (unanswered.length > 0) {
      setErrors(`${unanswered.length} soal pilihan ganda belum dijawab.`);
      // Scroll ke soal pertama yang belum dijawab
      const el = document.getElementById(`soal-${unanswered[0].id}`);
      el?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    setErrors("");
    setSubmitting(true);
    router.post(`/peserta/assignments/${assignmentId}/quiz`, { jawaban }, {
      preserveScroll: true,
      onSuccess: (page) => {
        setSubmitting(false);
        const r = (page.props as any).quizResult as QuizResult;
        if (r) { setResult(r); onSelesai?.(r); window.scrollTo({ top: 0, behavior: "smooth" }); }
      },
      onError: () => { setSubmitting(false); setErrors("Gagal mengirim jawaban. Coba lagi."); },
    });
  };

  if (result) return <HasilQuiz result={result} soals={soals} jawaban={jawaban} onRetake={handleRetake} />;

  if (submitting) return (
    <div className="flex flex-col items-center justify-center py-16 gap-3">
      <Loader2 className="h-10 w-10 text-blue-500 animate-spin" />
      <p className="text-sm text-gray-500 font-medium">Menghitung nilai...</p>
    </div>
  );

  // Start screen
  if (!started) return (
    <div className="text-center space-y-5 py-6">
      <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto text-3xl">📝</div>
      <div>
        <p className="text-xl font-bold text-gray-800">{soals.length} Soal</p>
        <p className="text-sm text-gray-500 mt-1">
          {pilganSoals.length} pilihan ganda
          {essaySoals.length > 0 && ` · ${essaySoals.length} essay`}
        </p>
        {nilaiTertinggi != null && (
          <div className="mt-3 inline-flex items-center gap-2 bg-blue-50 text-blue-700 text-sm font-semibold px-4 py-2 rounded-full">
            <Award className="h-4 w-4" /> Nilai tertinggimu: {nilaiTertinggi}
          </div>
        )}
      </div>
      <p className="text-xs text-gray-400">Pilih jawaban yang benar · Bisa dikerjakan berkali-kali</p>
      <Button className="bg-blue-600 hover:bg-blue-700 px-8 py-2.5 font-bold rounded-xl text-sm" onClick={() => setStarted(true)}>
        {attemptKe > 0 ? "🔄 Coba Lagi" : "▶ Mulai Quiz"}
      </Button>
    </div>
  );

  return (
    <div className="space-y-1">

      {/* Header progress */}
      <div className="flex items-center justify-between mb-4 sticky top-0 bg-white/95 backdrop-blur py-2 z-10 border-b border-gray-100">
        <p className="text-xs font-semibold text-gray-500">
          {answered} / {pilganSoals.length} dijawab
        </p>
        <div className="flex-1 mx-4 h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-500 rounded-full transition-all duration-300"
            style={{ width: `${pilganSoals.length > 0 ? (answered / pilganSoals.length) * 100 : 0}%` }}
          />
        </div>
        <p className="text-xs font-bold text-blue-600">
          {pilganSoals.length > 0 ? Math.round((answered / pilganSoals.length) * 100) : 0}%
        </p>
      </div>

      {/* Semua soal */}
      {soals.map((soal, idx) => (
        <div
          key={soal.id}
          id={`soal-${soal.id}`}
          className={`rounded-xl border p-5 transition-all ${
            soal.tipe_soal === "pilihan_ganda" && !jawaban[soal.id]
              ? "border-gray-200 bg-white"
              : "border-gray-100 bg-white"
          }`}
        >
          {/* Nomor + pertanyaan */}
          <div className="flex items-start gap-3 mb-4">
            <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black shrink-0 mt-0.5 ${
              soal.tipe_soal === "pilihan_ganda" && jawaban[soal.id]
                ? "bg-blue-500 text-white"
                : "bg-gray-100 text-gray-500"
            }`}>
              {idx + 1}
            </span>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-800 leading-relaxed">{soal.pertanyaan}</p>
              {soal.tipe_soal === "essay" && (
                <span className="text-xs text-purple-600 font-semibold mt-1 inline-block">Essay</span>
              )}
            </div>
            {soal.tipe_soal === "pilihan_ganda" && jawaban[soal.id] && (
              <CheckCircle2 className="h-5 w-5 text-blue-400 shrink-0 mt-0.5" />
            )}
          </div>

          {/* Pilihan Ganda */}
          {soal.tipe_soal === "pilihan_ganda" && soal.pilihan && (
            <div className="space-y-2 ml-10">
              {soal.pilihan.map((p, i) => {
                const label = OPSI_LABELS[i];
                const isSelected = jawaban[soal.id] === label;
                return (
                  <button
                    key={i}
                    onClick={() => setJawaban(prev => ({ ...prev, [soal.id]: label }))}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-left text-sm transition-all duration-150 ${
                      isSelected
                        ? "border-blue-400 bg-blue-50 text-blue-800 font-semibold shadow-sm"
                        : "border-gray-200 bg-gray-50 text-gray-700 hover:border-blue-200 hover:bg-blue-50/50"
                    }`}
                  >
                    <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                      isSelected ? "bg-blue-500 text-white" : "bg-white border border-gray-300 text-gray-500"
                    }`}>
                      {label}
                    </span>
                    <span className="flex-1">{p}</span>
                    {isSelected && <CheckCircle2 className="h-4 w-4 text-blue-500 shrink-0" />}
                  </button>
                );
              })}
            </div>
          )}

          {/* Essay */}
          {soal.tipe_soal === "essay" && (
            <div className="ml-10">
              <Textarea
                rows={4}
                placeholder="Tulis jawabanmu di sini..."
                value={jawaban[soal.id] ?? ""}
                onChange={(e) => setJawaban(prev => ({ ...prev, [soal.id]: e.target.value }))}
                className="resize-none rounded-xl text-sm"
              />
            </div>
          )}
        </div>
      ))}

      {/* Error */}
      {errors && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600 font-medium">
          {errors}
        </div>
      )}

      {/* Submit */}
      <div className="pt-4 sticky bottom-0 bg-white/95 backdrop-blur border-t border-gray-100 py-3">
        <div className="flex items-center justify-between">
          <p className="text-xs text-gray-400">
            {answered < pilganSoals.length
              ? `${pilganSoals.length - answered} soal belum dijawab`
              : "✅ Semua soal sudah dijawab"
            }
          </p>
          <Button
            onClick={handleSubmit}
            disabled={submitting || answered < pilganSoals.length}
            className={`px-6 font-bold rounded-xl transition-all ${
              answered === pilganSoals.length
                ? "bg-blue-600 hover:bg-blue-700 text-white"
                : "bg-gray-200 text-gray-400 cursor-not-allowed"
            }`}
          >
            {submitting
              ? <><Loader2 className="h-4 w-4 animate-spin mr-1.5" /> Mengirim...</>
              : "Kumpulkan Jawaban"
            }
          </Button>
        </div>
      </div>
    </div>
  );
}