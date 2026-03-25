// some things to add that is back end stuff sort of:
// autosaving answers, a timer, an extra detail page just for instructions

import React, { useState, useRef, useMemo, useEffect } from "react";
import "katex/dist/katex.min.css";
import katex from "katex";
import { BlockMath } from "react-katex";

// katex and block math are used for the latex math inserting portions
// katex renders the latex into html, blockmath displays it

type QuizPage = "quiz" | "details" | "submit";

interface Props {
  setPage: React.Dispatch<React.SetStateAction<any>>;
}

// need to make a details page

interface Question {
  id: number;
  text: string;
  latex?: string;
  type: "multiple" | "text";
  options?: string[];
}

// current question / problem parts, can be changed

export default function Quiztemplate({ setPage }: Props) {

  const [page, setLocalPage] = useState<QuizPage>("quiz");
  const [multipleAnswers, setMultipleAnswers] = useState<Record<number, string>>({});
  const [textAnswers, setTextAnswers] = useState<Record<number, string>>({});
  const [activeMathId, setActiveMathId] = useState<number | null>(null);
  const [mathInput, setMathInput] = useState<string>("");

  // tracks which question is currently visible on screen
  const [activeQuestion, setActiveQuestion] = useState<number | null>(null);

  const textRefs = useRef<Record<number, HTMLDivElement | null>>({});
  const caretRanges = useRef<Record<number, Range>>({});

  // sample questions for right now

  const questions: Question[] = useMemo(
    () => [
      { id: 1, text: "What is 2 + 2?", type: "multiple", options: ["3", "4", "5"] },
      { id: 2, text: "What color is the sky?", type: "text" },
      {
        id: 3,
        text: "Answer this question:",
        latex: "A e^{-a x} \\cos(\\omega x)",
        type: "text",
      },
    ],
    []
  );

  // progress counter
  const answeredCount = questions.filter((q) => {
    return multipleAnswers[q.id] || textAnswers[q.id];
  }).length;

  // fetch questions and such from the backend....

  // detects which question is visible while scrolling from the top of the screen ( kind of hard when there isnt a lot of questions )
  useEffect(() => {
    const handleScroll = () => {

      let current: number | null = null;

      questions.forEach((q) => {
        const el = document.getElementById(`question-${q.id}`);
        if (!el) return;

        const rect = el.getBoundingClientRect();

        if (rect.top <= 150 && rect.bottom >= 150) {
          current = q.id;
        }
      });

      setActiveQuestion(current);
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);

  }, [questions]);

  const scrollToQuestion = (id: number) => {
    const el = document.getElementById(`question-${id}`);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const selectAnswer = (qid: number, option: string) => {
    setMultipleAnswers((prev) => ({ ...prev, [qid]: option }));
  };

  const handleInput = (qid: number) => {

    const el = textRefs.current[qid];
    if (el) {
      setTextAnswers((prev) => ({
        ...prev,
        [qid]: el.innerHTML,
      }));
    }

  }; // reads html content of the box - the latex information

  const saveCaret = (qid: number) => {

    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return;

    caretRanges.current[qid] = sel.getRangeAt(0).cloneRange();

  }; // helps with the positioning of the math element

  const openMathPopup = (qid: number) => {

    setActiveMathId(qid);
    setMathInput("");

  }; // opens the math pop up

  const insertMathAtCaret = () => {

    if (activeMathId === null || !mathInput) return;

    const container = textRefs.current[activeMathId];
    if (!container) return;

    const mathWrapper = document.createElement("span");
    mathWrapper.contentEditable = "false";
    mathWrapper.style.display = "inline-block";
    mathWrapper.className = "math-block";

    mathWrapper.innerHTML = katex.renderToString(mathInput, {
      throwOnError: false,
    }); // renders the latex

    const spaceNode = document.createTextNode(" ");

    const range = caretRanges.current[activeMathId];

    if (range) {

      range.deleteContents();
      range.insertNode(spaceNode);
      range.insertNode(mathWrapper);

      const newRange = document.createRange();
      newRange.setStartAfter(spaceNode);
      newRange.collapse(true);

      const sel = window.getSelection();
      if (sel) {
        sel.removeAllRanges();
        sel.addRange(newRange);
      }

    } else {

      container.appendChild(mathWrapper);
      container.appendChild(spaceNode);

    }

    handleInput(activeMathId);

    setActiveMathId(null);
    setMathInput("");

  };

  const handleKeyDown = (e: React.KeyboardEvent, qid: number) => {

    if (e.key !== "Backspace") return;

    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return;

    const range = sel.getRangeAt(0);

    if (!range.collapsed) return;

    const node = range.startContainer;

    if (node.nodeType === Node.TEXT_NODE && range.startOffset === 0) {

      const previousSibling = node.previousSibling as HTMLElement | null;

      if (previousSibling && previousSibling.classList?.contains("math-block")) {

        e.preventDefault();
        previousSibling.remove();

      }
    }

  }; // makes it so that when you go backspace on a math element, it doesnt break
     // so it just deletes the whole math element when outside of the html container

  // checks if a question has been answered and will get highlighted if it was
  const isAnswered = (qid: number) => {
    return multipleAnswers[qid] || textAnswers[qid];
  };

  return (

    <div className="min-h-screen bg-gray-100 flex justify-center px-4 py-12">

      <div className="hidden md:flex flex-col gap-3 fixed top-32 left-8 w-20">

        {questions.map((q, index) => (

          <button
            key={q.id}
            onClick={() => scrollToQuestion(q.id)}
            className={[
              "w-full py-2 rounded-xl border text-sm font-semibold transition flex items-center justify-center gap-1",
              activeQuestion === q.id
                ? "bg-[#4E3629] text-white border-[#4E3629]"
                : isAnswered(q.id)
                ? "bg-green-100 border-green-400"
                : "hover:bg-gray-50",
            ].join(" ")}
          >
            Q{index + 1}
            {isAnswered(q.id) && <span className="text-green-600">✓</span>}
          </button>

        ))}

      </div>

      <div className="w-full max-w-3xl bg-white rounded-3xl border shadow-lg p-8 md:p-12">

        {/* header */}

        <div className="flex items-center justify-between mb-8">

          <button
            onClick={() => setPage("course")}
            className="text-sm font-semibold text-gray-600 hover:text-black"
          >
            ← Exit Quiz
          </button>

          <h1 className="text-2xl font-extrabold text-[#4E3629]">
            Locked Quiz
          </h1>

          <div className="text-sm font-semibold text-gray-500">
            {answeredCount}/{questions.length}
          </div>

        </div>

        {page === "quiz" && (
          <>
            <h1 className="text-3xl font-extrabold mb-6 text-center">Locked Quiz</h1>

            <div className="space-y-10">
              {questions.map((q) => ( /** how each question is renders, based on the type and info given */
                <div key={q.id} id={`question-${q.id}`}>
                  <p className="font-semibold mb-2 text-lg">{q.text}</p>
                  {q.latex && <BlockMath math={q.latex} />}

                  {q.type === "multiple" && /** Multiple choice questions */
                    q.options?.map((opt) => (
                      <button
                        key={opt}
                        onClick={() => selectAnswer(q.id, opt)}
                        className={[
                          "w-full text-left px-4 py-3 rounded-xl border mb-2 transition",
                          multipleAnswers[q.id] === opt
                            ? "bg-[#4E3629] text-white border-[#4E3629]"
                            : "bg-white hover:bg-gray-50",
                        ].join(" ")}
                      >
                        {opt}
                      </button>
                    ))}

                  {q.type === "text" && ( /** questions with a text box */
                    <div className="relative">
                      <div
                        ref={(el) => {
                          textRefs.current[q.id] = el;
                        }} /** insertable math handling  */
                        contentEditable
                        suppressContentEditableWarning
                        onInput={() => handleInput(q.id)}
                        onKeyUp={() => saveCaret(q.id)}
                        onClick={() => saveCaret(q.id)}
                        onKeyDown={(e) => handleKeyDown(e, q.id)}
                        className="w-full border rounded-xl p-3 pr-10 min-h-[100px] focus:outline-none focus:ring-2 focus:ring-[#4E3629] whitespace-pre-wrap"
                      />

                      <button
                        type="button" /** opens the math pop up */
                        onClick={() => openMathPopup(q.id)}
                        className="absolute bottom-2 right-2 text-gray-500 hover:text-black text-lg"
                      >
                        ∑
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <button
              onClick={() => setLocalPage("details")}
              className="mt-10 w-full rounded-2xl bg-[#4E3629] text-white py-3 font-bold"
            >
              Review Answers
            </button>
          </>
        )}

        {page === "details" && (
          <>
            <h1 className="text-3xl font-extrabold mb-6 text-center">Review Answers</h1>

            <div className="space-y-6">
              {questions.map((q) => (
                <div key={q.id} className="border-b pb-4">
                  <p className="font-semibold mb-2">{q.text}</p>
                  {multipleAnswers[q.id] && <p>{multipleAnswers[q.id]}</p>}
                  {textAnswers[q.id] && (
                    <div dangerouslySetInnerHTML={{ __html: textAnswers[q.id] }} />
                  )}
                </div>
              ))}
            </div>

            <div className="mt-8 flex gap-4">
              <button
                onClick={() => setLocalPage("quiz")}
                className="flex-1 rounded-2xl border py-3 font-semibold"
              >
                Edit Answers
              </button>

              <button
                onClick={() => setLocalPage("submit")}
                className="flex-1 rounded-2xl bg-[#4E3629] text-white py-3 font-bold"
              >
                Submit Quiz
              </button>
            </div>
          </>
        )}

        {page === "submit" && (
          <div className="text-center">
            <h1 className="text-3xl font-extrabold mb-4">Submitted 🎉</h1>
            <p className="text-gray-600 mb-6">
              Your quiz has been submitted successfully.
            </p>
            <button
              onClick={() => setPage("course")}
              className="rounded-2xl bg-[#4E3629] text-white px-6 py-3 font-semibold"
            >
              Return to Course
            </button>
          </div> 
        )}
      </div>

      {activeMathId !== null && ( /** structure of math pop up */
        <div className="fixed inset-0 flex items-center justify-center bg-black/25 z-50">
          <div className="bg-white p-6 rounded-xl shadow-lg flex flex-col gap-4 w-[420px]">
            <p className="font-semibold">Type LaTeX:</p>

            <textarea /** where the text is put into */
              value={mathInput}
              onChange={(e) => setMathInput(e.target.value)}
              className="w-full border rounded-xl p-2"
              placeholder="e.g. x^2 + y^2 = z^2"
            /> 

            <div className="min-h-[60px] border rounded-xl p-2 bg-gray-50"> 
              {mathInput && <BlockMath math={mathInput} />} 
            </div> 

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setActiveMathId(null)}
                className="px-4 py-2 border rounded-xl"
              >
                Cancel
              </button>

              <button
                onClick={insertMathAtCaret}
                className="px-4 py-2 bg-[#4E3629] text-white rounded-xl"
              >
                Insert
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}