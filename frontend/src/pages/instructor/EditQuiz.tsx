import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import PageShell from "../../components/PageShell";
import QuizFormFields from "../../components/QuizFormFields";
import { useAuth } from "../../context/AuthContext";
import { EMPTY_QUIZ_FORM } from "../../types";
import type { QuizFormState } from "../../types";

function buildQuizPayload(form: QuizFormState, courseId: number, userId: number) {
  return {
    title: form.title,
    course: courseId,
    created_by: userId,
    quiz_type: form.quiz_type,
    time_limit: form.time_limit ? Number(form.time_limit) : null,
    available_from: form.available_from || null,
    available_until: form.available_until || null,
    max_attempts: form.max_attempts ? Number(form.max_attempts) : 1,
    allow_review: form.allow_review,
    total_points: form.total_points ? Number(form.total_points) : 0,
    problems: form.problems.map((p) => ({
      title: p.title,
      question_text: p.question_text,
      question_latex: "",
      correct_answer: p.correct_answer,
      problem_order: p.problem_order,
      points: p.points,
      figure: p.figure || "",
      parts: p.parts.map((part, i) => ({
        part_number: i + 1,
        part_text: part.text,
        expected_answer: part.correct_answer,
        points: 1,
        allow_partial_credit: true,
        answer_format: "mathematical_expression",
      })),
    })),
  };
}

const toDatetimeLocal = (iso: string | null) => (iso ? iso.slice(0, 16) : "");

export default function EditQuiz() {
  const { courseId, quizId } = useParams<{ courseId: string; quizId: string }>();
  const { loginresult } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState<QuizFormState>(EMPTY_QUIZ_FORM);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (!loginresult || !quizId) return;

    Promise.all([
      fetch(`${import.meta.env.VITE_API_BASE_URL || ""}/api/quizzes/${quizId}/`, {
        headers: { Authorization: `Bearer ${loginresult.tokens.access}` },
      }),
      fetch(`${import.meta.env.VITE_API_BASE_URL || ""}/api/quizzes/${quizId}/problems/`, {
        headers: { Authorization: `Bearer ${loginresult.tokens.access}` },
      }),
    ])
      .then(async ([metaRes, problemsRes]) => {
        if (!metaRes.ok || !problemsRes.ok) {
          setError("Failed to load quiz data.");
          return;
        }
        const meta = await metaRes.json();
        const problems = await problemsRes.json();

        setForm({
          title: meta.title ?? "",
          quiz_type: meta.quiz_type ?? "practice",
          time_limit: meta.time_limit != null ? String(meta.time_limit) : "",
          available_from: toDatetimeLocal(meta.available_from),
          available_until: toDatetimeLocal(meta.available_until),
          max_attempts: meta.max_attempts != null ? String(meta.max_attempts) : "1",
          allow_review: meta.allow_review ?? true,
          total_points: meta.total_points != null ? String(meta.total_points) : "",
          problems: (problems as any[]).map((qp: any) => ({
            title: qp.problem_title ?? "",
            question_text: qp.problem_text ?? "",
            correct_answer: qp.parts?.[0]?.expected_answer ?? "",
            problem_order: qp.problem_order ?? 1,
            points: qp.points ?? 1,
            figure: qp.figure ?? "",
            figurePreview: qp.figure ?? "",
            parts: (qp.parts ?? []).map((part: any, i: number) => ({
              label: String.fromCharCode(65 + i),
              text: part.part_text ?? "",
              requires_response: true,
              correct_answer: part.expected_answer ?? "",
            })),
          })),
        });
      })
      .catch(() => setError("Failed to connect."))
      .finally(() => setFetching(false));
  }, [quizId, loginresult]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL || ""}/api/quizzes/${quizId}/`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${loginresult!.tokens.access}`,
          },
          body: JSON.stringify(buildQuizPayload(form, Number(courseId), loginresult!.user.id)),
        }
      );

      if (response.ok) {
        navigate(`/instructor/course/${courseId}`, { replace: true });
      } else {
        const err_response = await response.json();
        setError(Object.values(err_response).join("\n") || "Failed to update quiz.");
      }
    } catch {
      setError("Failed to connect.");
    } finally {
      setLoading(false);
    }
  }

  if (fetching) {
    return <PageShell><p className="text-gray-500">Loading...</p></PageShell>;
  }

  return (
    <PageShell>
      <div className="w-full">
        <div className="rounded-3xl bg-white border shadow-sm p-6 md:p-8 w-full">
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight mb-6">Edit Quiz</h1>
          <form method="post" onSubmit={handleSubmit} className="space-y-6">
            <QuizFormFields form={form} onChange={setForm} error={error} />

            <div className="flex justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={() => navigate(`/instructor/course/${courseId}`)}
                className="px-8 py-3 rounded-2xl font-bold transition shadow-sm bg-white border hover:shadow"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-8 py-3 rounded-2xl font-bold transition shadow-sm bg-[#4E3629] text-white hover:opacity-95 disabled:opacity-60"
              >
                Save Changes
              </button>
            </div>
          </form>
        </div>
      </div>
    </PageShell>
  );
}
