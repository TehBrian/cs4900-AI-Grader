import type { QuizFormState, QuizFormProblem } from "../types";

type Props = {
  form: QuizFormState;
  onChange: (form: QuizFormState) => void;
  error: string | null;
};

export default function QuizFormFields({ form, onChange, error }: Props) {
  function set(patch: Partial<QuizFormState>) {
    onChange({ ...form, ...patch });
  }

  function setProblem(
    index: number,
    field: keyof QuizFormProblem,
    value: string | number | boolean
  ) {
    onChange({
      ...form,
      problems: form.problems.map((p, i) =>
        i === index ? { ...p, [field]: value } : p
      ),
    });
  }

  function addProblem() {
    onChange({
      ...form,
      problems: [
        ...form.problems,
        {
          title: "",
          question_text: "",
          correct_answer: "",
          problem_order: form.problems.length + 1,
          points: 1,
          figure: "",
          figurePreview: "",
          grading_strategy: "auto",
          rubric: "",
          case_sensitive: false,
          approximation_tolerance: "",
          parts: [],
        },
      ],
    });
  }

  function removeProblem(index: number) {
    onChange({ ...form, problems: form.problems.filter((_, i) => i !== index) });
  }

  function addPart(problemIndex: number) {
    onChange({
      ...form,
      problems: form.problems.map((p, i) =>
        i === problemIndex
          ? {
              ...p,
              parts: [
                ...p.parts,
                {
                  label: String.fromCharCode(65 + p.parts.length),
                  text: "",
                  requires_response: true,
                  correct_answer: "",
                  grading_strategy: "auto",
                  rubric: "",
                  case_sensitive: false,
                  approximation_tolerance: "",
                },
              ],
            }
          : p
      ),
    });
  }

  function removePart(problemIndex: number, partIndex: number) {
    onChange({
      ...form,
      problems: form.problems.map((p, i) =>
        i === problemIndex
          ? { ...p, parts: p.parts.filter((_, j) => j !== partIndex) }
          : p
      ),
    });
  }

  function setPart(
    problemIndex: number,
    partIndex: number,
    field: keyof QuizFormPart,
    value: string | boolean
  ) {
    onChange({
      ...form,
      problems: form.problems.map((p, i) => {
        if (i !== problemIndex) return p;
        return {
          ...p,
          parts: p.parts.map((part, j) =>
            j === partIndex ? { ...part, [field]: value } : part
          ),
        };
      }),
    });
  }

  const inputCls =
    "mt-1 w-full rounded-2xl border bg-gray-50 px-4 py-3 outline-none focus:ring-2 focus:ring-[#FFC72C]/60 focus:border-[#FFC72C]";

  const strategyOptions = [
    ["auto", "Auto"],
    ["exact", "Exact"],
    ["numeric", "Numeric"],
    ["symbolic", "Symbolic"],
    ["hybrid", "Hybrid"],
    ["ai", "AI"],
    ["manual", "Manual"],
  ];

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="text-sm font-semibold text-gray-700">Title</label>
          <input
            value={form.title}
            onChange={(e) => set({ title: e.target.value })}
            required
            placeholder="Quiz 1"
            className={inputCls}
          />
        </div>
        <div>
          <label className="text-sm font-semibold text-gray-700">Quiz type</label>
          <select
            value={form.quiz_type}
            onChange={(e) => set({ quiz_type: e.target.value })}
            className={inputCls}
          >
            <option value="practice">Practice</option>
            <option value="quiz">Graded</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="text-sm font-semibold text-gray-700">Time limit</label>
          <input
            type="number"
            min="1"
            value={form.time_limit}
            onChange={(e) => set({ time_limit: e.target.value })}
            placeholder="30"
            className={inputCls}
          />
        </div>
        <div>
          <label className="text-sm font-semibold text-gray-700">Max attempts</label>
          <input
            type="number"
            min="1"
            value={form.max_attempts}
            onChange={(e) => set({ max_attempts: e.target.value })}
            placeholder="1"
            className={inputCls}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="text-sm font-semibold text-gray-700">Available from</label>
          <input
            type="datetime-local"
            value={form.available_from}
            onChange={(e) => set({ available_from: e.target.value })}
            className={inputCls}
          />
        </div>
        <div>
          <label className="text-sm font-semibold text-gray-700">Available until</label>
          <input
            type="datetime-local"
            value={form.available_until}
            onChange={(e) => set({ available_until: e.target.value })}
            className={inputCls}
          />
        </div>
      </div>

      <div>
        <label className="text-sm font-semibold text-gray-700">Total points</label>
        <input
          type="number"
          min="0"
          value={form.total_points}
          onChange={(e) => set({ total_points: e.target.value })}
          placeholder="100"
          className={inputCls}
        />
      </div>

      <div>
        <label className="text-sm font-semibold text-gray-700 block mb-2">Review</label>
        <label className="flex items-center gap-2 rounded-2xl border px-4 py-3 bg-white hover:bg-gray-50 cursor-pointer w-full">
          <input
            type="checkbox"
            checked={form.allow_review}
            onChange={(e) => set({ allow_review: e.target.checked })}
            className="accent-[#4E3629]"
          />
          <span className="font-semibold">Allow review after submission</span>
        </label>
      </div>

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div>
        <label className="text-sm font-semibold text-gray-700 block mb-3">Problems</label>
        <div className="space-y-5">
          {form.problems.map((problem, index) => (
            <div key={index} className="rounded-3xl border bg-white p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold">Problem {index + 1}</h3>
                <button
                  type="button"
                  onClick={() => removeProblem(index)}
                  className="px-4 py-2 rounded-2xl border bg-red-50 hover:bg-red-100 text-sm font-medium"
                >
                  Remove
                </button>
              </div>

              <div className="space-y-4">
                <input
                  type="text"
                  value={problem.title}
                  onChange={(e) => setProblem(index, "title", e.target.value)}
                  placeholder="Title"
                  className="w-full rounded-2xl border bg-gray-50 px-4 py-3 outline-none focus:ring-2 focus:ring-[#FFC72C]/60 focus:border-[#FFC72C]"
                />

                <textarea
                  value={problem.question_text}
                  onChange={(e) => setProblem(index, "question_text", e.target.value)}
                  placeholder="Question text"
                  rows={5}
                  className="w-full rounded-2xl border bg-gray-50 px-4 py-3 outline-none resize-none focus:ring-2 focus:ring-[#FFC72C]/60 focus:border-[#FFC72C]"
                />

                <div>
                  <label className="text-sm font-semibold text-gray-700">Figure (PNG)</label>
                  <input
                    type="file"
                    accept="image/png"
                    className="mt-1 w-full rounded-2xl border bg-gray-50 px-4 py-3 outline-none focus:ring-2 focus:ring-[#FFC72C]/60"
                    onChange={(e) => {
                      const file = e.target.files?.[0] || null;
                      if (!file) {
                        setProblem(index, "figure", "");
                        setProblem(index, "figurePreview", "");
                        return;
                      }
                      if (file.type !== "image/png") {
                        alert("Please upload a PNG image only.");
                        e.target.value = "";
                        return;
                      }
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        const result = typeof reader.result === "string" ? reader.result : "";
                        setProblem(index, "figure", result);
                        setProblem(index, "figurePreview", result);
                      };
                      reader.readAsDataURL(file);
                    }}
                  />
                </div>

                {problem.figurePreview && (
                  <div className="rounded-2xl border bg-gray-50 p-4 mt-2">
                    <p className="text-sm font-semibold text-gray-700 mb-3">Figure Preview</p>
                    <img
                      src={problem.figurePreview}
                      alt={`Problem ${index + 1} figure`}
                      className="max-h-64 rounded-xl border"
                    />
                  </div>
                )}

                <input
                  type="text"
                  value={problem.correct_answer}
                  onChange={(e) => setProblem(index, "correct_answer", e.target.value)}
                  placeholder="Correct answer"
                  className="w-full rounded-2xl border bg-gray-50 px-4 py-3 outline-none focus:ring-2 focus:ring-[#FFC72C]/60 focus:border-[#FFC72C]"
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 rounded-2xl border bg-gray-50 p-4">
                  <div>
                    <label className="text-sm font-semibold text-gray-700">Grading strategy</label>
                    <select
                      value={problem.grading_strategy}
                      onChange={(e) => setProblem(index, "grading_strategy", e.target.value)}
                      className={inputCls}
                    >
                      {strategyOptions.map(([value, label]) => (
                        <option key={value} value={value}>{label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-700">Numeric tolerance</label>
                    <input
                      value={problem.approximation_tolerance}
                      onChange={(e) => setProblem(index, "approximation_tolerance", e.target.value)}
                      placeholder="0.01"
                      className={inputCls}
                    />
                  </div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                    <input
                      type="checkbox"
                      checked={problem.case_sensitive}
                      onChange={(e) => setProblem(index, "case_sensitive", e.target.checked)}
                      className="accent-[#4E3629]"
                    />
                    Case-sensitive exact match
                  </label>
                  <textarea
                    value={problem.rubric}
                    onChange={(e) => setProblem(index, "rubric", e.target.value)}
                    placeholder="Rubric for AI, hybrid, or manual review"
                    rows={3}
                    className="md:col-span-2 w-full rounded-2xl border bg-white px-4 py-3 outline-none resize-none focus:ring-2 focus:ring-[#FFC72C]/60 focus:border-[#FFC72C]"
                  />
                </div>

                <div className="rounded-2xl border bg-gray-50 p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-[#4E3629]">Problem Parts</h4>
                    <button
                      type="button"
                      onClick={() => addPart(index)}
                      className="px-4 py-2 rounded-xl bg-white border text-sm font-semibold hover:shadow"
                    >
                      Add Part
                    </button>
                  </div>

                  {problem.parts.map((part, partIndex) => (
                    <div key={partIndex} className="rounded-2xl bg-white border p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <strong>Part {part.label}</strong>
                        <button
                          type="button"
                          onClick={() => removePart(index, partIndex)}
                          className="text-sm text-red-600"
                        >
                          Remove
                        </button>
                      </div>
                      <textarea
                        value={part.text}
                        onChange={(e) => setPart(index, partIndex, "text", e.target.value)}
                        placeholder="Part question text"
                        rows={3}
                        className="w-full rounded-2xl border bg-gray-50 px-4 py-3"
                      />
                      <input
                        value={part.correct_answer}
                        onChange={(e) => setPart(index, partIndex, "correct_answer", e.target.value)}
                        placeholder="Correct answer for this part"
                        className="w-full rounded-2xl border bg-gray-50 px-4 py-3"
                      />
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <select
                          value={part.grading_strategy}
                          onChange={(e) => setPart(index, partIndex, "grading_strategy", e.target.value)}
                          className="w-full rounded-2xl border bg-gray-50 px-4 py-3"
                        >
                          {strategyOptions.map(([value, label]) => (
                            <option key={value} value={value}>{label}</option>
                          ))}
                        </select>
                        <input
                          value={part.approximation_tolerance}
                          onChange={(e) => setPart(index, partIndex, "approximation_tolerance", e.target.value)}
                          placeholder="Numeric tolerance"
                          className="w-full rounded-2xl border bg-gray-50 px-4 py-3"
                        />
                      </div>
                      <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                        <input
                          type="checkbox"
                          checked={part.case_sensitive}
                          onChange={(e) => setPart(index, partIndex, "case_sensitive", e.target.checked)}
                          className="accent-[#4E3629]"
                        />
                        Case-sensitive exact match
                      </label>
                      <textarea
                        value={part.rubric}
                        onChange={(e) => setPart(index, partIndex, "rubric", e.target.value)}
                        placeholder="Rubric for AI, hybrid, or manual review"
                        rows={2}
                        className="w-full rounded-2xl border bg-gray-50 px-4 py-3"
                      />
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-semibold text-gray-700">Problem Order</label>
                    <input
                      type="number"
                      min="1"
                      value={problem.problem_order}
                      onChange={(e) => setProblem(index, "problem_order", Number(e.target.value))}
                      className="mt-1 w-full rounded-2xl border bg-gray-50 px-4 py-3 outline-none focus:ring-2 focus:ring-[#FFC72C]/60 focus:border-[#FFC72C]"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-700">Points</label>
                    <input
                      type="number"
                      min="1"
                      value={problem.points}
                      onChange={(e) => setProblem(index, "points", Number(e.target.value))}
                      className="mt-1 w-full rounded-2xl border bg-gray-50 px-4 py-3 outline-none focus:ring-2 focus:ring-[#FFC72C]/60 focus:border-[#FFC72C]"
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}

          <button
            type="button"
            onClick={addProblem}
            className="px-6 py-3 rounded-2xl bg-white border shadow-sm hover:shadow transition text-base font-medium"
          >
            Add Problem
          </button>
        </div>
      </div>
    </>
  );
}
