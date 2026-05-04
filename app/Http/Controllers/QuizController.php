<?php

namespace App\Http\Controllers;

use App\Models\Quiz;
use App\Models\QuizQuestion;
use App\Models\QuizAttempt;
use App\Models\QuizAnswer;
use App\Models\OnlineClass;
use App\Services\CertificateValidationService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class QuizController extends Controller
{
    public function __construct(
        private CertificateValidationService $certService
    ) {}

    // ================================================================
    // PENYELENGGARA: Buat Quiz
    // POST /api/classes/{classId}/quiz
    // ================================================================
    public function store(Request $request, int $classId): JsonResponse
    {
        $this->authorizeOwner($classId);

        $request->validate([
            'title'            => 'required|string|max:255',
            'description'      => 'nullable|string',
            'duration_minutes' => 'nullable|integer|min:1',
            'max_attempts'     => 'integer|min:1|max:10',
            'questions'        => 'required|array|min:1',
            'questions.*.question'       => 'required|string',
            'questions.*.type'           => 'required|in:multiple_choice,true_false,essay',
            'questions.*.options'        => 'required_if:questions.*.type,multiple_choice|array',
            'questions.*.correct_answer' => 'required|string',
            'questions.*.points'         => 'integer|min:1',
        ]);

        return DB::transaction(function () use ($request, $classId) {
            $quiz = Quiz::create([
                'online_class_id'  => $classId,
                'title'            => $request->title,
                'description'      => $request->description,
                'duration_minutes' => $request->duration_minutes,
                'max_attempts'     => $request->max_attempts ?? 1,
                'is_active'        => false,
            ]);

            foreach ($request->questions as $index => $q) {
                QuizQuestion::create([
                    'quiz_id'        => $quiz->id,
                    'question'       => $q['question'],
                    'type'           => $q['type'],
                    'options'        => $q['options'] ?? null,
                    'correct_answer' => $q['correct_answer'],
                    'points'         => $q['points'] ?? 1,
                    'order'          => $index + 1,
                ]);
            }

            // Aktifkan quiz di kelas
            OnlineClass::where('id', $classId)->update(['has_assignment' => true]);

            return response()->json([
                'message' => 'Quiz berhasil dibuat.',
                'data'    => $quiz->load('questions'),
            ], 201);
        });
    }

    // ================================================================
    // PESERTA: Mulai mengerjakan quiz
    // POST /api/classes/{classId}/quiz/{quizId}/start
    // ================================================================
    public function start(int $classId, int $quizId): JsonResponse
    {
        $user = Auth::user();
        $quiz = Quiz::where('online_class_id', $classId)
            ->where('is_active', true)
            ->findOrFail($quizId);

        // Cek batas percobaan
        $attemptCount = QuizAttempt::where('quiz_id', $quizId)
            ->where('user_id', $user->id)
            ->count();

        if ($attemptCount >= $quiz->max_attempts) {
            return response()->json([
                'message' => "Anda sudah mencapai batas maksimal percobaan ({$quiz->max_attempts}x).",
            ], 422);
        }

        // Cek apakah ada attempt yang sedang berjalan
        $ongoingAttempt = QuizAttempt::where('quiz_id', $quizId)
            ->where('user_id', $user->id)
            ->where('status', 'in_progress')
            ->first();

        if ($ongoingAttempt) {
            return response()->json([
                'message' => 'Anda sudah memiliki attempt yang sedang berjalan.',
                'data'    => $ongoingAttempt->load('quiz.questions'),
            ]);
        }

        $questions = QuizQuestion::where('quiz_id', $quizId)->orderBy('order')->get();

        $attempt = QuizAttempt::create([
            'quiz_id'         => $quizId,
            'user_id'         => $user->id,
            'online_class_id' => $classId,
            'attempt_number'  => $attemptCount + 1,
            'total_questions' => $questions->count(),
            'status'          => 'in_progress',
            'started_at'      => now(),
        ]);

        // Return soal tanpa correct_answer
        $questionsForDisplay = $questions->map(fn($q) => [
            'id'       => $q->id,
            'question' => $q->question,
            'type'     => $q->type,
            'options'  => $q->options,
            'points'   => $q->points,
            'order'    => $q->order,
        ]);

        return response()->json([
            'attempt_id'       => $attempt->id,
            'quiz_title'       => $quiz->title,
            'duration_minutes' => $quiz->duration_minutes,
            'deadline'         => $quiz->duration_minutes
                ? now()->addMinutes($quiz->duration_minutes)->toISOString()
                : null,
            'questions'        => $questionsForDisplay,
        ], 201);
    }

    // ================================================================
    // PESERTA: Submit jawaban quiz (auto-grading)
    // POST /api/classes/{classId}/quiz/{quizId}/submit/{attemptId}
    // ================================================================
    public function submit(Request $request, int $classId, int $quizId, int $attemptId): JsonResponse
    {
        $user = Auth::user();

        $attempt = QuizAttempt::where('id', $attemptId)
            ->where('user_id', $user->id)
            ->where('quiz_id', $quizId)
            ->where('status', 'in_progress')
            ->firstOrFail();

        $request->validate([
            'answers'            => 'required|array',
            'answers.*.question_id' => 'required|integer|exists:quiz_questions,id',
            'answers.*.answer'      => 'required|string',
        ]);

        return DB::transaction(function () use ($request, $attempt, $classId) {
            $questions = QuizQuestion::where('quiz_id', $attempt->quiz_id)
                ->get()
                ->keyBy('id');

            $totalPoints   = 0;
            $earnedPoints  = 0;
            $correctCount  = 0;
            $hasEssay      = false;

            foreach ($request->answers as $ans) {
                $question = $questions->get($ans['question_id']);
                if (!$question) continue;

                $isCorrect   = null;
                $pointsEarned = 0;
                $totalPoints += $question->points;

                if ($question->type !== 'essay') {
                    // Auto-grade untuk MC dan true/false
                    $isCorrect = strtolower(trim($ans['answer'])) === strtolower(trim($question->correct_answer));
                    $pointsEarned = $isCorrect ? $question->points : 0;
                    if ($isCorrect) $correctCount++;
                    $earnedPoints += $pointsEarned;
                } else {
                    $hasEssay = true; // Essay perlu grading manual
                }

                QuizAnswer::create([
                    'quiz_attempt_id'  => $attempt->id,
                    'quiz_question_id' => $question->id,
                    'answer'           => $ans['answer'],
                    'is_correct'       => $isCorrect,
                    'points_earned'    => $pointsEarned,
                ]);
            }

            // Hitung nilai (0-100)
            $score = $totalPoints > 0
                ? round(($earnedPoints / $totalPoints) * 100, 2)
                : 0;

            $attempt->update([
                'score'           => $score,
                'correct_answers' => $correctCount,
                'status'          => $hasEssay ? 'submitted' : 'graded',
                'submitted_at'    => now(),
            ]);

            // Jika tidak ada essay, langsung validasi sertifikat
            if (!$hasEssay) {
                $this->certService->validateAndUpdateCertificate($classId, $attempt->user_id);
            }

            return response()->json([
                'message'         => $hasEssay
                    ? 'Jawaban berhasil dikirim. Essay akan dinilai oleh penyelenggara.'
                    : 'Quiz selesai! Nilai Anda telah dihitung.',
                'score'           => $score,
                'correct_answers' => $correctCount,
                'total_questions' => $attempt->total_questions,
                'status'          => $attempt->status,
                'has_essay'       => $hasEssay,
            ]);
        });
    }

    // ================================================================
    // PESERTA: Lihat riwayat attempt saya
    // GET /api/classes/{classId}/quiz/{quizId}/my-attempts
    // ================================================================
    public function myAttempts(int $classId, int $quizId): JsonResponse
    {
        $attempts = QuizAttempt::where('quiz_id', $quizId)
            ->where('user_id', Auth::id())
            ->where('online_class_id', $classId)
            ->orderBy('attempt_number')
            ->get(['id', 'attempt_number', 'score', 'status', 'started_at', 'submitted_at']);

        $quiz = Quiz::findOrFail($quizId);
        $remainingAttempts = max(0, $quiz->max_attempts - $attempts->count());

        return response()->json([
            'attempts'          => $attempts,
            'remaining_attempts' => $remainingAttempts,
            'best_score'        => $attempts->max('score'),
        ]);
    }

    private function authorizeOwner(int $classId): void
    {
        $class = OnlineClass::findOrFail($classId);
        if ($class->owner_id !== Auth::id()) {
            abort(403, 'Hanya penyelenggara kelas yang dapat melakukan tindakan ini.');
        }
    }
}