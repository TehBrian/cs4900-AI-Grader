import { useState } from "react";
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

export default function CreateQuiz() {
  const { courseId } = useParams<{ courseId: string }>();
  const { loginresult } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState<QuizFormState>(EMPTY_QUIZ_FORM);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || ""}/api/quizzes/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${loginresult!.tokens.access}`,
        },
        body: JSON.stringify(buildQuizPayload(form, Number(courseId), loginresult!.user.id)),
      });

      if (response.ok) {
        navigate(`/instructor/course/${courseId}`, { replace: true });
      } else {
        const err_response = await response.json();
        setError(Object.values(err_response).join("\n") || "Failed to create quiz.");
      }
    } catch {
      setError("Failed to connect.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <PageShell title="Create quiz">
      <div className="w-full">
        <div className="rounded-3xl bg-white border shadow-sm p-6 md:p-8 w-full">
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
                Submit
              </button>
            </div>
          </form>
        </div>
      </div>
    </PageShell>
  );
}
