import React, { useMemo, useState, useEffect, useRef } from "react";
import ForgotPassword from './ForgotPassword';
import QuizTemplate from './QuizTemplate';
import katex from "katex";
import { BlockMath } from "react-katex";
import ViewSubmissions, { Submission } from './ViewSubmissions';

const ROLES= {
  student: "student",
  instructor: "instructor"
} as const;

type Role= "student" | "instructor";
type Page=
  | "login"
  | "forgotPassword"
  | "about"
  | "contact"
  | "registration"
  | "home"
  | "course"
  | "quiz"
  | "grades"
  | "instructorCourse"
  | "instructorGrades"
  | "createCourse"
  | "createQuiz"
  | "viewSubmissions"
  | "submissionDetails";

type HistoryState = {
  page: Page;
  courseId?: number;
  instructorCourseId?: number;
};

type Course= {
  id: number;
  code: string;
  title: string;
  semester: string;
  instructor_name: string;
};

type Quiz = {
  id: number;
  title: string;
  description: string;
  course_id: number;
  quiz_type: string;
  problems: Record<string, string>[];
  time_limit: number;
  available_from: string | null;
  available_until: string | null;
  max_attempts: number;
  show_correct_answers: boolean;
  show_solution_after: boolean;
}

type ProblemOption = {
  id: number;
  title: string;
  question_text: string;
  question_latex?: string;
};

type CourseItemType= "Assignment" | "Quiz";

type CourseItem= {
  id: string;
  type: CourseItemType;
  title: string;
  dueText: string;
  windowText?: string; // optional 
  submissionsText?: string; // optional 
  scoreText?: string; // optional 
  gradeText?: string; // optional 
  evalText?: string; // optional 
};

const DEMO_COURSE_ITEMS: Record<number, CourseItem[]> = {
  4: [
    {
      id: "q6",
      type: "Quiz",
      title: "Week 1 Quiz",
      dueText: "Available now",
      submissionsText: "Not started",
      scoreText: "- / 10",
      evalText: "",
    },
    {
      id: "q7",
      type: "Quiz",
      title: "Midterm Quiz",
      dueText: "Available now",
      submissionsText: "Not started",
      scoreText: "- / 10",
      evalText: "",
    },
  ],
  2: [
    {
      id: "q15",
      type: "Quiz",
      title: "Problem 8.3 - Antenna Definitions",
      dueText: "Available now",
      submissionsText: "Not started",
      scoreText: "- / 10",
      evalText: "Up to 7 attempts",
    },
    {
      id: "q16",
      type: "Quiz",
      title: "Problem 8.4 - Beam Pattern Derivation",
      dueText: "Available now",
      submissionsText: "Not started",
      scoreText: "- / 25",
      evalText: "Up to 4 attempts",
    },
  ],
};

interface User {
  id: number,
  username: string,
  email: string,
  date_joined: string,
  first_name: string,
  last_name: string
}

interface Tokens {
  refresh: string;
  access: string;
}

interface LoginResult {
  user: User;
  tokens: Tokens;
}

function PageShell({
  title,
  topBar,
  children,
}: {
  title: string;
  topBar: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      {topBar}
      <main className="max-w-5xl mx-auto px-4 py-10">
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
          {title}
        </h1>
        <div className="mt-4">{children}</div>
      </main>
      <footer className="max-w-5xl mx-auto px-4 pb-10 text-center text-xs text-gray-500">
        © {new Date().getFullYear()} • WMU
      </footer>
    </div>
  );
}

export default function App() {
  const [page, setPage]= useState<Page>("login");
  const [selectedQuizId, setSelectedQuizId] = useState<number | null>(null);
  const [regSuccess, setRegSuccess]= useState<boolean>(false);
  const [role, setRole]= useState<Role>("student");
  const [email, setEmail]= useState("");
  const [pw, setPw]= useState("");
  const [error, setError]= useState<string | null>(null);

  const [loginresult, setLoginResult]= useState<LoginResult | null>(null);
  const [selectedCourse, setSelectedCourse]= useState<Course | null>(null);
  const [studentCourses, setStudentCourses]= useState<Course[]>([]);
  const [selectedInstructorCourse, setSelectedInstructorCourse]= useState<Course | null>(null);
  const [instructorCourses, setInstructorCourses]= useState<Course[]>([]);
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [quizForm, setQuizForm]= useState({
  title: "",
  quiz_type: "practice",
  time_limit: "",
  available_from: "",
  available_until: "",
  max_attempts: "1",
  allow_review: true,
  total_points: "",
  problems: [] as {
    title: string;
    question_text: string;
    correct_answer: string;
    problem_order: number;
    points: number;
    figure: string;
    figurePreview: string;
    parts: {
      label: string;
      text: string;
      requires_response: boolean;
      correct_answer: string;
    }[];
    }[],
  });
  const [courseQuizzes, setCourseQuizzes] = useState<Quiz[]>([]);
  const [completedQuizIds, setCompletedQuizIds] = useState<number[]>([]);
  const [availableProblems, setAvailableProblems] = useState<ProblemOption[]>([]);
  const [session, setSession]= useState<{ role: Role; email: string } | null>(
    null
  );

    const textRefs = useRef<Record<number, HTMLDivElement | null>>({});
  
    const caretRanges = useRef<Record<number, Range>>({});
    const [activeMathId, setActiveMathId] = useState<number | null>(null);
    const [mathInput, setMathInput] = useState<string>("");

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
    };

  const openMathPopup = () => {
    console.log("open math popup");
    setActiveMathId(1);
    setMathInput("");
  };

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
      });
  
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
  
      setActiveMathId(null);
      setMathInput("");
    };

  const canSubmit= useMemo(() => {
    return email.trim().length > 0 && pw.trim().length > 0;
  }, [email, pw]);

  function mapQuizzesToCourseItems(quizzes: unknown): CourseItem[] {
  if (!Array.isArray(quizzes)) {
    console.log("mapQuizzesToCourseItems got non-array:", quizzes);
    return [];
  }

  return quizzes.map((quiz: any) => ({
    id: String(quiz.id),
    type: "Quiz",
    title: quiz.title ?? "Untitled Quiz",
    dueText: quiz.available_until
      ? `Due: ${new Date(quiz.available_until).toLocaleString()}`
      : "No due date",
    submissionsText: completedQuizIds.includes(quiz.id)
      ? "Completed"
      : "Not started",
    scoreText: "-",
    evalText: "",
  }));
}

function navigateTo(
  nextPage: Page,
  options?: {
    course?: Course | null;
    instructorCourse?: Course | null;
    replace?: boolean;
  }
) {
  const nextCourse= options?.course ?? null;
  const nextInstructorCourse= options?.instructorCourse ?? null;

  setSelectedCourse(nextCourse);
  setSelectedInstructorCourse(nextInstructorCourse);
  setPage(nextPage);

  const historyState: HistoryState= {
    page: nextPage,
    courseId: nextCourse?.id,
    instructorCourseId: nextInstructorCourse?.id,
  };

  if (options?.replace) {
    window.history.replaceState(historyState, "", window.location.pathname);
  } else {
    window.history.pushState(historyState, "", window.location.pathname);
  }
}

useEffect(() => {
  const handlePopState= (event: PopStateEvent) => {
    const state= event.state as HistoryState | null;

    if (!state) {
      setPage("login");
      setSelectedCourse(null);
      setSelectedInstructorCourse(null);
      return;
    }

    setPage(state.page);

    if (state.courseId) {
      const foundStudentCourse= studentCourses.find((c) => c.id === state.courseId) ?? null;
      setSelectedCourse(foundStudentCourse);
    } else {
      setSelectedCourse(null);
    }

    if (state.instructorCourseId) {
      const foundInstructorCourse =
        instructorCourses.find((c) => c.id === state.instructorCourseId) ?? null;
      setSelectedInstructorCourse(foundInstructorCourse);
    } else {
      setSelectedInstructorCourse(null);
    }
  };

  window.addEventListener("popstate", handlePopState);
  return () => window.removeEventListener("popstate", handlePopState);
}, [studentCourses, instructorCourses]);

useEffect(() => {
  window.history.replaceState(
    { page: "login" } satisfies HistoryState,
    "",
    window.location.pathname
  );
}, []);

useEffect(() => {
  if (
    page === "instructorCourse" &&
    selectedInstructorCourse &&
    loginresult?.tokens.access
  ) {
    console.log("INSTRUCTOR effect running");
    console.log("instructor page:", page);
    console.log("instructor selected course:", selectedInstructorCourse);
    console.log("instructor course id:", selectedInstructorCourse.id);
    fetchQuizzes(loginresult.tokens.access, selectedInstructorCourse.id);
  }
}, [page, selectedInstructorCourse, loginresult]);

useEffect(() => {
  if (
    page === "course" &&
    selectedCourse &&
    loginresult?.tokens.access
  ) {
    console.log("STUDENT effect running");
    console.log("student page:", page);
    console.log("student selected course:", selectedCourse);
    console.log("student course id:", selectedCourse.id);
    fetchQuizzes(loginresult.tokens.access, selectedCourse.id);
  }
}, [page, selectedCourse, loginresult]);

useEffect(() => {
  if (page === "createQuiz" && loginresult?.tokens.access) {
    fetchAvailableProblems(loginresult.tokens.access);
  }
}, [page, loginresult]);

async function createCourse(e: React.FormEvent) {
  e.preventDefault();
  setError(null);

  const form= e.target as HTMLFormElement;
  const formData= new FormData(form);
  const formObj= Object.fromEntries(formData.entries());

  try {
    const response= await fetch(`${import.meta.env.VITE_API_BASE_URL || ''}/api/courses/create_course/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        course_code: formObj.course_code,
        title: formObj.title,
        term: formObj.term,
        instructor_name: loginresult!.user.username ?? "username failed",
        instructor_id: loginresult!.user.id ?? -1,
      }),
    });

    if (response.ok) {
      form.reset();
      setRegSuccess(true);
      await fetchCourses(loginresult!.tokens.access ?? 0, role);
      navigateTo("home",{ replace: true });

      setTimeout(() => {
        setRegSuccess(false);
      }, 3000);
    } else {
      const err_response = await response.json();
      let err_msg = "";

      Object.entries(err_response).forEach((i) => {
        err_msg += i[1] + "\n";
      });

      setError(err_msg);
    }
  } catch (err) {
    alert("Failed to connect.");
  }
}

async function createQuiz(e: React.FormEvent) {
  e.preventDefault();
  setError(null);

  if (!selectedInstructorCourse || !loginresult) {
    setError("No course selected.");
    return;
  }

  try {
    const response= await fetch(`${import.meta.env.VITE_API_BASE_URL || ''}/api/quizzes/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${loginresult.tokens.access}`,
      },
      body: JSON.stringify({
        title: quizForm.title,
        course: selectedInstructorCourse.id,
        created_by: loginresult.user.id,
        quiz_type: quizForm.quiz_type,
        time_limit: quizForm.time_limit ? Number(quizForm.time_limit) : null,
        available_from: quizForm.available_from || null,
        available_until: quizForm.available_until || null,
        max_attempts: quizForm.max_attempts ? Number(quizForm.max_attempts) : 1,
        allow_review: quizForm.allow_review,
        total_points: quizForm.total_points ? Number(quizForm.total_points) : 0,
        problems: quizForm.problems.map((p) => ({
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
        }),
    });
    

    if (response.ok) {
      setQuizForm({
        title: "",
        quiz_type: "practice",
        time_limit: "",
        available_from: "",
        available_until: "",
        max_attempts: "1",
        allow_review: true,
        total_points: "",
        problems: [],
      });

      navigateTo("instructorCourse", {
        instructorCourse: selectedInstructorCourse,
        replace: true,
      });
    } else {
      const err_response = await response.json();
      let err_msg = "";

      Object.entries(err_response).forEach((i) => {
        err_msg += i[1] + "\n";
      });

      setError(err_msg || "Failed to create quiz.");
    }
  } catch (err) {
    alert("Failed to connect.");
  }
}

async function registerUser(e: React.FormEvent) {
  e.preventDefault();
  setError(null);

  const form= e.target as HTMLFormElement;
  const formData= new FormData(form);
  const formObj= Object.fromEntries(formData.entries());

  try {
    const response= await fetch(`${import.meta.env.VITE_API_BASE_URL || ''}/api/users/auth/register/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        first_name: formObj.first_name,
        last_name: formObj.last_name,
        email: formObj.email,
        username: formObj.username,
        password: formObj.password,
        role: formObj.role,
      }),
    });

    if (response.ok) {
      form.reset();
      setRegSuccess(true);
      navigateTo("login",{ replace: true });

      setTimeout(() => {
        setRegSuccess(false);
      }, 3000);
    } else {
      const err_response = await response.json();
      let err_msg = "";

      Object.entries(err_response).forEach((i) => {
        err_msg += i[1] + "\n";
      });

      setError(err_msg);
    }
  } catch (err) {
    alert("Failed to connect.");
  }
}
  
  async function fetchCourses(accessToken: string, userRole: Role) {
    try {
      const response= await fetch(`${import.meta.env.VITE_API_BASE_URL || ''}/api/courses/`, {
        method: "GET",
        headers: {
         "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const data = await response.json();
      console.log("courses response:", response.status, data);

      if (!response.ok) {
        throw new Error("Failed to fetch courses");
      }

      if (userRole === "student") {
       setStudentCourses(data);
      } else {
        setInstructorCourses(data);
     }
    } catch (err) {
     console.error(err);
     setError("Could not load courses.");
    }
  }

  async function fetchAvailableProblems(accessToken: string) {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || ''}/api/problems/`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const data = await response.json();
      console.log("available problems:", data);

      if (!response.ok) {
        throw new Error("Failed to fetch problems");
      }

      if (Array.isArray(data)) {
        setAvailableProblems(data);
      } else if (Array.isArray(data.results)) {
      setAvailableProblems(data.results);
      } else {
        setAvailableProblems([]);
      }
    } catch (err) {
      console.error(err);
      setError("Could not load problems.");
    }
  }

  // function addProblemToQuiz(problemId: number) {
  //   setQuizForm((prev) => {
  //     if (prev.problems.some((p) => p.problem_id === problemId)) {
  //       return prev;
  //     }

  //     return {
  //       ...prev,
  //       problems: [
  //         ...prev.problems,
  //         {
  //           problem_id: problemId,
  //           problem_order: prev.problems.length + 1,
  //           points: 1,
  //           custom_instructions: "",
  //           time_limit_override: null,
  //           parameter_overrides: {},
  //         },
  //       ],
  //     };
  //   });
  // }

 // function addProblemToQuiz() {
  //  return (
   //   <div className="relative">
    //                  <div
    //                    contentEditable
    //                    suppressContentEditableWarning
    //                    className="w-full border rounded-xl p-3 pr-10 min-h-[100px] focus:outline-none focus:ring-2 focus:ring-[#4E3629] whitespace-pre-wrap"
    //                  />
    //                  <input required name="problem text" placeholder="write problem text here..." className="mt-1 w-full rounded- 2x1 border bg-gray-50 px-4 py-3 outline-none focus:ring-2 focus:ring-[#FFC72C]/60 focus:border-[#FFC72C]"  />
     //                 <button
     //                   type="button"
    //                    onClick={() => openMathPopup()}
    //                    className="absolute bottom-2 right-2 text-gray-500 hover:text-black text-lg"
    //                    title="Insert Math (LaTeX)"
     //                 >
    //                    ∑
     //                 </button>
     //               </div>
   // );
 // }

 function addProblemToQuiz() {
  setQuizForm((prev) => ({
    ...prev,
    problems: [
      ...prev.problems,
      {
        title: "",
        question_text: "",
        correct_answer: "",
        problem_order: prev.problems.length + 1,
        points: 1,
        figure: "",
        figurePreview: "",
        parts: [],
      },
    ],
  }));
}

//function removeProblemFromQuiz(problemId: number) {
 // setQuizForm((prev) => ({
 //   ...prev,
 //   problems: prev.problems.filter((p) => p.problem_id !== problemId),
 // }));
//}

function removeProblemFromQuiz(index: number) {
  setQuizForm((prev) => ({
    ...prev,
    problems: prev.problems.filter((_, i) => i !== index),
  }));
}

function updateQuizProblem(
  index: number,
  field: "title" | "question_text" | "correct_answer" | "problem_order" | "points" | "figure" | "figurePreview",
  value: string | number | null
) {
  setQuizForm((prev) => ({
    ...prev,
    problems: prev.problems.map((problem, i) =>
      i === index ? { ...problem, [field]: value } : problem
    ),
  }));
}

function addPartToProblem(problemIndex: number) {
  setQuizForm((prev) => ({
    ...prev,
    problems: prev.problems.map((problem, i) =>
      i === problemIndex
        ? {
            ...problem,
            parts: [
              ...problem.parts,
              {
                label: String.fromCharCode(65 + problem.parts.length),
                text: "",
                requires_response: true,
                correct_answer: "",
              },
            ],
          }
        : problem
    ),
  }));
}

function updateProblemPart(
  problemIndex: number,
  partIndex: number,
  field: "label" | "text" | "requires_response" | "correct_answer",
  value: string | boolean
) {
  setQuizForm((prev) => {
    const updatedProblems = [...prev.problems];
    const updatedParts = [...updatedProblems[problemIndex].parts];

    updatedParts[partIndex] = {
      ...updatedParts[partIndex],
      [field]: value,
    };

    updatedProblems[problemIndex] = {
      ...updatedProblems[problemIndex],
      parts: updatedParts,
    };

    return {
      ...prev,
      problems: updatedProblems,
    };
  });
}

function removeProblemPart(problemIndex: number, partIndex: number) {
  setQuizForm((prev) => ({
    ...prev,
    problems: prev.problems.map((problem, i) =>
      i === problemIndex
        ? {
            ...problem,
            parts: problem.parts.filter((_, j) => j !== partIndex),
          }
        : problem
    ),
  }));
}

  async function fetchQuizzes(accessToken: string, courseID: number) {
    try {
      console.log("fetchQuizzes called with courseID:", courseID);
      console.log("access token exists:", !!accessToken);

      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || ''}/api/quizzes/?course=${courseID}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        }
      });

      console.log("quiz fetch raw status:", response.status);

      const data = await response.json();
      console.log("quiz fetch response data:", data);

      if (!response.ok) {
        throw new Error("Quiz fetch response not ok.");
      }

      if (Array.isArray(data)) {
        setCourseQuizzes(data);
      } else if (Array.isArray(data.results)) {
        setCourseQuizzes(data.results);
      } else if (Array.isArray(data.quizzes)) {
        setCourseQuizzes(data.quizzes);
      } else {
        console.log("Unexpected quiz response shape:", data);
        setCourseQuizzes([]);
      }

      setCourseQuizzes(data);
      console.log("setCourseQuizzes finished");
    } catch (err) {
      console.error("fetchQuizzes failed:", err);
      setError("Could not fetch quizzes.");
    }
  }

  async function handleQuizSubmission(e: React.FormEvent) {
    e.preventDefault();
    setError(null);


    const form= e.target as HTMLFormElement;
    const formData= new FormData(form);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || ''}/api/grading/submit/`, {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(
          {
            quiz_id: selectedQuizId,
            student_id: loginresult?.user.id,
            content: formData,
          }
        )
      });

      /*if (response.ok) {
        const data = await response.json();
      } */
      if (!response.ok) {
        const err_response = await response.json();
        setError(err_response.error);
        return;
      }

    } catch (err) {
      alert("Failed to submit quiz.");
    }
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || ''}/api/users/auth/login/`, {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({username: email, password: pw, role: role})
      });

      if (response.ok) {
        const data = await response.json();

        setLoginResult(data);
        setSession({ role, email: email.trim() });

        await fetchCourses(data.tokens.access, role);

        navigateTo("home", { replace: true });

      } else {
        const err_response = await response.json();
        setError(err_response.error);
        return;
      }
    } catch (err) {
      alert("Failed to connect to database.");
    }
  }

  function logout() {
    setSession(null);
    setEmail("");
    setPw("");
    setError(null);
    setRole("student");
    navigateTo("login", { replace: true });
    setLoginResult(null);
    setStudentCourses([]);
    setCourseQuizzes([]);
    setInstructorCourses([]);
    setSelectedCourse(null);
    setSelectedInstructorCourse(null);
  }

  // ---------- layout ----------
  const TopBar = (
    <header className="sticky top-0 z-10 bg-gray-50/90 backdrop-blur border-b">
      <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* left simple mark */}
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-full bg-[#4E3629] flex items-center justify-center text-[#FFC72C] font-black">
            W
          </div>
          <div className="leading-tight">
            <div className="font-extrabold tracking-tight">Portal</div>
            <div className="text-xs text-gray-500 -mt-0.5">
              Western Michigan University
            </div>
          </div>
        </div>

        {/* right nav buttons */}

        <nav className="flex items-center gap-2">
          {session ? (
            <button
            onClick={() => navigateTo("home")}
            className={[
              "px-4 py-2 rounded-full border shadow-sm text-sm font-semibold transition",
              page === "home"
                ? "bg-[#4E3629] text-white border-[#4E3629]"
                : "bg-white hover:shadow",
            ].join(" ")}
            type="button"
          >
            Home
          </button>
          ): null}
          <button
            onClick={() => navigateTo("about")}
            className={[
              "px-4 py-2 rounded-full border shadow-sm text-sm font-semibold transition",
              page === "about"
                ? "bg-[#4E3629] text-white border-[#4E3629]"
                : "bg-white hover:shadow",
            ].join(" ")}
            type="button"
          >
            About
          </button>

          <button
            onClick={() => navigateTo("contact")}
            className={[
              "px-4 py-2 rounded-full border shadow-sm text-sm font-semibold transition",
              page === "contact"
                ? "bg-[#4E3629] text-white border-[#4E3629]"
                : "bg-white hover:shadow",
            ].join(" ")}
            type="button"
          >
            Contact
          </button>

          {session ? (
            <button
              onClick={logout}
              className="ml-1 px-4 py-2 rounded-full bg-white border shadow-sm hover:shadow transition text-sm font-semibold"
              type="button"
            >
              Log out
            </button>
          ) : (
            <button
              onClick={() => navigateTo("login")}
              className={[
                "ml-1 px-4 py-2 rounded-full border shadow-sm text-sm font-semibold transition",
                page === "login"
                  ? "bg-[#4E3629] text-white border-[#4E3629]"
                  : "bg-white hover:shadow",
              ].join(" ")}
              type="button"
            >
              Login
            </button>
          )}

          <button
            onClick={() => navigateTo("registration")}
            className={[
              "px-4 py-2 rounded-full border shadow-sm text-sm font-semibold transition",
              page === "registration"
                ? "bg-[#4E3629] text-white border-[#4E3629]"
                : "bg-white hover:shadow",
            ].join(" ")}
            type="button"
          >
            Register
          </button>
        </nav>
      </div>
    </header>
  );

  // ---------- pgs ----------
  if (page === "about") {
    return (
      <PageShell title="About" topBar={TopBar}>
        <div className="rounded-2xl bg-white border shadow-sm p-6 text-gray-700">
          <p className="leading-relaxed">
            An application that can give and grade problem solutions that are symbolic in nature combining both quiz delivery with intelligent AI-powered grading.
          </p>
        </div>
      </PageShell>
    );
  }

  if (page === "contact") {
    return (
      <PageShell title="Contact" topBar={TopBar}>
        <div className="rounded-2xl bg-white border shadow-sm p-6 text-gray-700">
          <div className="leading-relaxed space-y-1">
            <p>CS 4910 Spring Group 6</p>
            <p>Dr. Dean Johnson: dean.johnson@wmich.edu </p>
            </div>
        </div>
      </PageShell>
    );
  }

  if (page === "createCourse") {
        return (
      <PageShell title="Create course" topBar={TopBar}>
      <div className="w-full">
        <div className="rounded-3xl bg-white border shadow-sm p-6 md:p-8 w-full">
          <form method="post" onSubmit={createCourse} className="space-y-6">

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-sm font-semibold text-gray-700">
                  Title
                </label>
                <input
                  name="title"
                  required
                  placeholder="Software Systems Development II"
                  className="mt-1 w-full rounded-2xl border bg-gray-50 px-4 py-3 outline-none focus:ring-2 focus:ring-[#FFC72C]/60 focus:border-[#FFC72C]"
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-700">
                  Course code
                </label>
                <input
                  name="course_code"
                  required
                  placeholder="CS 4910"
                  className="mt-1 w-full rounded-2xl border bg-gray-50 px-4 py-3 outline-none focus:ring-2 focus:ring-[#FFC72C]/60 focus:border-[#FFC72C]"
                />
              </div>
            </div>


            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-sm font-semibold text-gray-700">
                  term
                </label>
                <input
                  name="term"
                  required
                  placeholder="spring"
                  className="mt-1 w-full rounded-2xl border bg-gray-50 px-4 py-3 outline-none focus:ring-2 focus:ring-[#FFC72C]/60 focus:border-[#FFC72C]"
                />
              </div>
            </div>



            {error && (
              <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}


            {/* button */}
            <div className="flex justify-end pt-4">
              <button
                type="submit"
                className="px-8 py-3 rounded-2xl font-bold transition shadow-sm bg-[#4E3629] text-white hover:opacity-95"
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

if (page === "createQuiz" && selectedInstructorCourse) {
  return (
    <PageShell title="Create quiz" topBar={TopBar}>
      <div className="w-full">
        <div className="rounded-3xl bg-white border shadow-sm p-6 md:p-8 w-full">
          <form method="post" onSubmit={createQuiz} className="space-y-6">

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-sm font-semibold text-gray-700">
                  Title
                </label>
                <input
                  value={quizForm.title}
                  onChange={(e) =>
                    setQuizForm({ ...quizForm, title: e.target.value })
                  }
                  required
                  placeholder="Quiz 1"
                  className="mt-1 w-full rounded-2xl border bg-gray-50 px-4 py-3 outline-none focus:ring-2 focus:ring-[#FFC72C]/60 focus:border-[#FFC72C]"
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-700">
                  Quiz type
                </label>
                <select
                  value={quizForm.quiz_type}
                  onChange={(e) =>
                    setQuizForm({ ...quizForm, quiz_type: e.target.value })
                  }
                  className="mt-1 w-full rounded-2xl border bg-gray-50 px-4 py-3 outline-none focus:ring-2 focus:ring-[#FFC72C]/60 focus:border-[#FFC72C]"
                >
                  <option value="practice">Practice</option>
                  <option value="quiz">Graded</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-sm font-semibold text-gray-700">
                  Time limit
                </label>
                <input
                  type="number"
                  min="1"
                  value={quizForm.time_limit}
                  onChange={(e) =>
                    setQuizForm({ ...quizForm, time_limit: e.target.value })
                  }
                  placeholder="30"
                  className="mt-1 w-full rounded-2xl border bg-gray-50 px-4 py-3 outline-none focus:ring-2 focus:ring-[#FFC72C]/60 focus:border-[#FFC72C]"
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-700">
                  Max attempts
                </label>
                <input
                  type="number"
                  min="1"
                  value={quizForm.max_attempts}
                  onChange={(e) =>
                    setQuizForm({ ...quizForm, max_attempts: e.target.value })
                  }
                  placeholder="1"
                  className="mt-1 w-full rounded-2xl border bg-gray-50 px-4 py-3 outline-none focus:ring-2 focus:ring-[#FFC72C]/60 focus:border-[#FFC72C]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-sm font-semibold text-gray-700">
                  Available from
                </label>
                <input
                  type="datetime-local"
                  value={quizForm.available_from}
                  onChange={(e) =>
                    setQuizForm({ ...quizForm, available_from: e.target.value })
                  }
                  className="mt-1 w-full rounded-2xl border bg-gray-50 px-4 py-3 outline-none focus:ring-2 focus:ring-[#FFC72C]/60 focus:border-[#FFC72C]"
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-700">
                  Available until
                </label>
                <input
                  type="datetime-local"
                  value={quizForm.available_until}
                  onChange={(e) =>
                    setQuizForm({ ...quizForm, available_until: e.target.value })
                  }
                  className="mt-1 w-full rounded-2xl border bg-gray-50 px-4 py-3 outline-none focus:ring-2 focus:ring-[#FFC72C]/60 focus:border-[#FFC72C]"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-semibold text-gray-700">
                Total points
              </label>
              <input
                type="number"
                min="0"
                value={quizForm.total_points}
                onChange={(e) =>
                  setQuizForm({ ...quizForm, total_points: e.target.value })
                }
                placeholder="100"
                className="mt-1 w-full rounded-2xl border bg-gray-50 px-4 py-3 outline-none focus:ring-2 focus:ring-[#FFC72C]/60 focus:border-[#FFC72C]"
              />
            </div>

            <div>
              <label className="text-sm font-semibold text-gray-700 block mb-2">
                Review
              </label>

              <label className="flex items-center gap-2 rounded-2xl border px-4 py-3 bg-white hover:bg-gray-50 cursor-pointer w-full">
                <input
                  type="checkbox"
                  checked={quizForm.allow_review}
                  onChange={(e) =>
                    setQuizForm({ ...quizForm, allow_review: e.target.checked })
                  }
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
              <label className="text-sm font-semibold text-gray-700 block mb-3">
                Make Problems
              </label>

              <div className="space-y-5">
                {quizForm.problems.map((problem, index) => (
                  <div key={index} className="rounded-3xl border bg-white p-5">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xl font-bold">Problem {index + 1}</h3>
                      <button
                        type="button"
                        onClick={() => removeProblemFromQuiz(index)}
                        className="px-4 py-2 rounded-2xl border bg-red-50 hover:bg-red-100 text-sm font-medium"
                      >
                        Remove
                      </button>
                    </div>

                    <div className="space-y-4">
                      <input
                        type="text"
                        value={problem.title}
                        onChange={(e) =>
                          updateQuizProblem(index, "title", e.target.value)
                        }
                        placeholder="Title"
                        className="w-full rounded-2xl border bg-gray-50 px-4 py-3 outline-none focus:ring-2 focus:ring-[#FFC72C]/60 focus:border-[#FFC72C]"
                      />

                      <textarea
                        value={problem.question_text}
                        onChange={(e) =>
                          updateQuizProblem(index, "question_text", e.target.value)
                        }
                        placeholder="Question text"
                        rows={5}
                        className="w-full rounded-2xl border bg-gray-50 px-4 py-3 outline-none resize-none focus:ring-2 focus:ring-[#FFC72C]/60 focus:border-[#FFC72C]"
                      />

                      <div>
                        <label className="text-sm font-semibold text-gray-700">
                          Figure (PNG)
                        </label>

                        <input
                          type="file"
                          accept="image/png"
                          className="mt-1 w-full rounded-2xl border bg-gray-50 px-4 py-3 outline-none focus:ring-2 focus:ring-[#FFC72C]/60"
                          onChange={(e) => {
                            const file = e.target.files?.[0] || null;

                            if (!file) {
                              updateQuizProblem(index, "figure", "");
                              updateQuizProblem(index, "figurePreview", "");
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
                              updateQuizProblem(index, "figure", result);
                              updateQuizProblem(index, "figurePreview", result);
                            };

                            reader.readAsDataURL(file);
                          }}
                        />
                      </div>

                      {problem.figurePreview && (
                        <div className="rounded-2xl border bg-gray-50 p-4 mt-2">
                          <p className="text-sm font-semibold text-gray-700 mb-3">
                            Figure Preview
                          </p>
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
                        onChange={(e) =>
                          updateQuizProblem(index, "correct_answer", e.target.value)
                        }
                        placeholder="Correct answer"
                        className="w-full rounded-2xl border bg-gray-50 px-4 py-3 outline-none focus:ring-2 focus:ring-[#FFC72C]/60 focus:border-[#FFC72C]"
                      />

                      <div className="rounded-2xl border bg-gray-50 p-4 space-y-4">
                        <div className="flex items-center justify-between">
                          <h4 className="font-bold text-[#4E3629]">Problem Parts</h4>

                          <button
                            type="button"
                            onClick={() => addPartToProblem(index)}
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
                                onClick={() => removeProblemPart(index, partIndex)}
                                className="text-sm text-red-600"
                              >
                                Remove
                              </button>
                            </div>

                            <textarea
                              value={part.text}
                              onChange={(e) =>
                                updateProblemPart(index, partIndex, "text", e.target.value)
                              }
                              placeholder="Part question text"
                              rows={3}
                              className="w-full rounded-2xl border bg-gray-50 px-4 py-3"
                            />

                            <input
                              value={part.correct_answer}
                              onChange={(e) =>
                                updateProblemPart(index, partIndex, "correct_answer", e.target.value)
                              }
                              placeholder="Correct answer for this part"
                              className="w-full rounded-2xl border bg-gray-50 px-4 py-3"
                            />
                          </div>
                        ))}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-semibold text-gray-700">
                            Problem Order
                          </label>
                          <input
                            type="number"
                            min="1"
                            value={problem.problem_order}
                            onChange={(e) =>
                              updateQuizProblem(index, "problem_order", Number(e.target.value))
                            }
                            className="mt-1 w-full rounded-2xl border bg-gray-50 px-4 py-3 outline-none focus:ring-2 focus:ring-[#FFC72C]/60 focus:border-[#FFC72C]"
                          />
                        </div>

                        <div>
                          <label className="text-sm font-semibold text-gray-700">
                            Points
                          </label>
                        <input
                          type="number"
                          min="1"
                          value={problem.points}
                          onChange={(e) =>
                            updateQuizProblem(index, "points", Number(e.target.value))
                          }
                          className="mt-1 w-full rounded-2xl border bg-gray-50 px-4 py-3 outline-none focus:ring-2 focus:ring-[#FFC72C]/60 focus:border-[#FFC72C]"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              <button
                type="button"
                onClick={addProblemToQuiz}
                className="px-6 py-3 rounded-2xl bg-white border shadow-sm hover:shadow transition text-base font-medium"
              >
                Add Problem
              </button>
            </div>
          </div>

            <div className="flex justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={() =>
                  navigateTo("instructorCourse", {
                    instructorCourse: selectedInstructorCourse,
                  })
                }
                className="px-8 py-3 rounded-2xl font-bold transition shadow-sm bg-white border hover:shadow"
              >
                Cancel
              </button>

              <button
                type="submit"
                className="px-8 py-3 rounded-2xl font-bold transition shadow-sm bg-[#4E3629] text-white hover:opacity-95"
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

if (page === "registration") {
  return (
    <PageShell title="Registration" topBar={TopBar}>
      <div className="w-full">
        <div className="rounded-3xl bg-white border shadow-sm p-6 md:p-8 w-full">
          <form method="post" onSubmit={registerUser} className="space-y-6">

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-sm font-semibold text-gray-700">
                  First name
                </label>
                <input
                  name="first_name"
                  required
                  placeholder="First"
                  className="mt-1 w-full rounded-2xl border bg-gray-50 px-4 py-3 outline-none focus:ring-2 focus:ring-[#FFC72C]/60 focus:border-[#FFC72C]"
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-700">
                  Last name
                </label>
                <input
                  name="last_name"
                  required
                  placeholder="Last"
                  className="mt-1 w-full rounded-2xl border bg-gray-50 px-4 py-3 outline-none focus:ring-2 focus:ring-[#FFC72C]/60 focus:border-[#FFC72C]"
                />
              </div>
            </div>


            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-sm font-semibold text-gray-700">
                  Email
                </label>
                <input
                  name="email"
                  type="email"
                  required
                  placeholder="name@wmich.edu"
                  className="mt-1 w-full rounded-2xl border bg-gray-50 px-4 py-3 outline-none focus:ring-2 focus:ring-[#FFC72C]/60 focus:border-[#FFC72C]"
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-700">
                  Username
                </label>
                <input
                  name="username"
                  required
                  placeholder="username"
                  className="mt-1 w-full rounded-2xl border bg-gray-50 px-4 py-3 outline-none focus:ring-2 focus:ring-[#FFC72C]/60 focus:border-[#FFC72C]"
                />
              </div>
            </div>


            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-sm font-semibold text-gray-700">
                  Password
                </label>
                <input
                  name="password"
                  type="password"
                  required
                  placeholder="password"
                  className="mt-1 w-full rounded-2xl border bg-gray-50 px-4 py-3 outline-none focus:ring-2 focus:ring-[#FFC72C]/60 focus:border-[#FFC72C]"
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-700">
                  Role
                </label>

                <div className="mt-2 flex gap-6">
                  <label className="flex items-center gap-2 rounded-2xl border px-4 py-3 bg-white hover:bg-gray-50 cursor-pointer w-full">
                    <input
                      type="radio"
                      name="role"
                      value="student"
                      defaultChecked
                      className="accent-[#4E3629]"
                    />
                    <span className="font-semibold">Student</span>
                  </label>

                  <label className="flex items-center gap-2 rounded-2xl border px-4 py-3 bg-white hover:bg-gray-50 cursor-pointer w-full">
                    <input
                      type="radio"
                      name="role"
                      value="instructor"
                      className="accent-[#4E3629]"
                    />
                    <span className="font-semibold">Instructor</span>
                  </label>
                </div>
              </div>
            </div>


            {error && (
              <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}


            {/* button */}
            <div className="flex justify-end pt-4">
              <button
                type="submit"
                className="px-8 py-3 rounded-2xl font-bold transition shadow-sm bg-[#4E3629] text-white hover:opacity-95"
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

if (page === "course" && selectedCourse) {
  console.log("Selected course:", selectedCourse);
  console.log("Course ID:", selectedCourse.id);
  console.log("Rendering student course page");
  console.log("student courseQuizzes state:", courseQuizzes);
  const items = mapQuizzesToCourseItems(courseQuizzes);
  const pill = (t: CourseItemType) => (
    <span
      className={[
        "inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold",
        t === "Assignment" ? "bg-gray-50" : "bg-white",
      ].join(" ")}
    >
      {t}
    </span>
  );

  return (
    <PageShell title={selectedCourse.code} topBar={TopBar}>
      <div className="rounded-2xl bg-white border shadow-sm overflow-hidden">
        <div className="h-2 bg-[#FFC72C]" />

        <div className="p-6">
          {/* row */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="text-sm text-gray-600">
              Term: {selectedCourse.semester} {selectedCourse.instructor_name}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => navigateTo("grades", { course: selectedCourse })}
                className="px-4 py-2 rounded-full bg-white border shadow-sm hover:shadow transition text-sm font-semibold"
              >
                Grades
              </button>

              <button
                type="button"
                onClick={() => {
                  navigateTo("home");
                }}
                className="px-4 py-2 rounded-full bg-white border shadow-sm hover:shadow transition text-sm font-semibold"
              >
                Back to courses
              </button>
            </div>
          </div>

          {/* header */}
          <div className="mt-6 rounded-2xl border overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-12 bg-gray-50 text-xs font-bold text-gray-600">
              <div className="md:col-span-7 p-3 border-b md:border-b-0 md:border-r">
                Item
              </div>
              <div className="md:col-span-3 p-3 border-b md:border-b-0 md:border-r">
                Completion
              </div>
              <div className="md:col-span-2 p-3">
                Score
              </div>
            </div>

            {/* rpws */}
            <div className="divide-y">
              {items.length === 0 ? (
                <div className="p-4 text-sm text-gray-600">
                  No assignments or quizzes yet.
                </div>
              ) : (
                items.map((it) => (
                  <button
                    key={it.id}
                    type="button"
                    onClick={() => {
                      if (it.type === "Quiz") {
                        setSelectedQuizId(Number(it.id));
                        navigateTo("quiz", {course: selectedCourse});
                      } else {
                        alert(`Open: ${it.title}`);
                      }
                   }}
                    className="w-full text-left hover:bg-gray-50 transition"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-12">
                      
                      {/* Item */}
                      <div className="md:col-span-7 p-4 md:border-r">
                        <div className="flex items-start justify-between gap-3">
                          <div className="font-bold text-[#4E3629]">
                            {it.title}
                          </div>
                          <div className="shrink-0">{pill(it.type)}</div>
                        </div>

                        <div className="text-sm text-gray-600 mt-1">
                          {it.dueText}
                        </div>

                        {it.windowText ? (
                          <div className="text-xs text-gray-500 mt-1">
                            {it.windowText}
                          </div>
                        ) : null}
                      </div>

                      {/* completion */}
                      <div className="md:col-span-3 p-4 md:border-r text-sm text-gray-700">
                        {it.submissionsText ?? "-"}
                      </div>

                      {/* score */}
                      <div className="md:col-span-2 p-4 text-sm text-gray-700">
                        {it.scoreText ?? "-"}
                      </div>

                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </PageShell>
  );
}

if (page === "instructorCourse" && selectedInstructorCourse) {
  const items = mapQuizzesToCourseItems(courseQuizzes);
  console.log("Rendering instructor course page");
  console.log("instructor courseQuizzes state:", courseQuizzes);
  const pill = (t: CourseItemType) => (
    <span
      className={[
        "inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold",
        t === "Assignment" ? "bg-gray-50" : "bg-white",
      ].join(" ")}
    >
      {t}
    </span>
  );

  const statusFor = (it: CourseItem) => {
    const s = (it.submissionsText ?? "").toLowerCase();
    if (!s) return "—";
    if (s.includes("not started")) return "Not started";
    if (s.includes("submission")) return "Submissions received";
    return it.submissionsText ?? "—";
  };

  return (
    <PageShell title="Instructor" topBar={TopBar}>
      <div className="rounded-2xl bg-white border shadow-sm overflow-hidden">
        <div className="h-2 bg-[#FFC72C]" />

        <div className="p-6">
          {/* top row */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="text-sm text-gray-600">
              <div></div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => navigateTo("instructorGrades", { instructorCourse: selectedInstructorCourse })}
                className="px-4 py-2 rounded-full bg-white border shadow-sm hover:shadow transition text-sm font-semibold"
              >
                Gradebook
              </button>

              <button
                type="button"
                onClick={() => {
                  navigateTo("home");
                }}
                className="px-4 py-2 rounded-full bg-white border shadow-sm hover:shadow transition text-sm font-semibold"
              >
                Back to courses
              </button>
            </div>
          </div>

          {/* instructor actions */}
          <div className="mt-6 rounded-2xl border bg-gray-50 p-4">
            <div className="text-xs font-bold text-gray-600">Instructor Actions</div>

            <div className="mt-3 flex flex-wrap gap-2">

              <button
                type="button"
                onClick={() => 
                  navigateTo("createQuiz", {
                    instructorCourse: selectedInstructorCourse
                  })
                }
                className="px-4 py-2 rounded-full bg-white border shadow-sm hover:shadow transition text-sm font-semibold"
              >
                Create Quiz
              </button>

              <button
                type="button"
                onClick={() =>
                  navigateTo("viewSubmissions", {
                    instructorCourse: selectedInstructorCourse,
                  })
                }
                className="px-4 py-2 rounded-full bg-white border shadow-sm hover:shadow transition text-sm font-semibold"
              >
                View Submissions
              </button>
            </div>
          </div>

          {/* table */}
          <div className="mt-6 rounded-2xl border overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-12 bg-gray-50 text-xs font-bold text-gray-600">
              <div className="md:col-span-7 p-3 border-b md:border-b-0 md:border-r">
                Item
              </div>
              <div className="md:col-span-3 p-3 border-b md:border-b-0 md:border-r">
                Submissions
              </div>
              <div className="md:col-span-2 p-3">Actions</div>
            </div>

            <div className="divide-y">
              {items.length === 0 ? (
                <div className="p-4 text-sm text-gray-600">
                  No assignments or quizzes yet.
                </div>
              ) : (
                items.map((it) => (
                  <div key={it.id} className="grid grid-cols-1 md:grid-cols-12">
                    {/* item */}
                    <div className="md:col-span-7 p-4 md:border-r">
                      <div className="flex items-start justify-between gap-3">
                        <div className="font-bold text-[#4E3629]">{it.title}</div>
                        <div className="shrink-0">{pill(it.type)}</div>
                      </div>

                      <div className="text-sm text-gray-600 mt-1">{it.dueText}</div>

                      {it.windowText ? (
                        <div className="text-xs text-gray-500 mt-1">{it.windowText}</div>
                      ) : null}
                    </div>

                    {/* submissions */}
                    <div className="md:col-span-3 p-4 md:border-r">
                      <div className="text-sm text-gray-700">
                        {it.submissionsText ?? "—"}
                      </div>
                    </div>

                    {/* actions */}
                    <div className="md:col-span-2 p-4 flex md:block items-center gap-2">
                      <button
                          type="button"
                          onClick={() =>
                            navigateTo("viewSubmissions", {
                              instructorCourse: selectedInstructorCourse,
                            })
                          }
                          className="px-3 py-2 rounded-full bg-white border shadow-sm hover:shadow transition text-xs font-semibold"
                        >
                          Submissions
                        </button>

                      <button
                        type="button"
                        onClick={() =>
                          navigateTo("instructorGrades", {
                            instructorCourse: selectedInstructorCourse,
                          })
                        }
                        className="mt-0 md:mt-2 px-3 py-2 rounded-full bg-[#4E3629] text-white border border-[#4E3629] shadow-sm hover:opacity-95 transition text-xs font-semibold"
                      >
                        Gradebook
                    </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </PageShell>
  );
}

if (page === "instructorGrades" && selectedInstructorCourse) {
  const items = DEMO_COURSE_ITEMS[selectedInstructorCourse.id] ?? [];

  const pill = (t: CourseItemType) => (
    <span
      className={[
        "inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold",
        t === "Assignment" ? "bg-gray-50" : "bg-white",
      ].join(" ")}
    >
      {t}
    </span>
  );

  return (
    <PageShell title={`${selectedInstructorCourse?.title} Gradebook`} topBar={TopBar}>
      <div className="rounded-2xl bg-white border shadow-sm overflow-hidden">
        <div className="h-2 bg-[#FFC72C]" />

        <div className="p-6">
          {/* Top row */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="text-sm text-gray-600">
              {selectedInstructorCourse.semester} {selectedInstructorCourse.instructor_name}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => navigateTo("instructorCourse", { instructorCourse: selectedInstructorCourse })}
                className="px-4 py-2 rounded-full bg-white border shadow-sm hover:shadow transition text-sm font-semibold"
              >
                Quizzes
              </button>

              <button
                type="button"
                onClick={() => {
                  navigateTo("home");
                }}
                className="px-4 py-2 rounded-full bg-white border shadow-sm hover:shadow transition text-sm font-semibold"
              >
                Back to courses
              </button>
            </div>
          </div>

          {/* header */}
          <div className="mt-6 rounded-2xl border overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-12 bg-gray-50 text-xs font-bold text-gray-600">
              <div className="md:col-span-7 p-3 border-b md:border-b-0 md:border-r">
                Item
              </div>

              <div className="md:col-span-3 p-3 border-b md:border-b-0 md:border-r">
                Score
              </div>

              <div className="md:col-span-2 p-3">Eval</div>
            </div>

            <div className="divide-y">
              {items.length === 0 ? (
                <div className="p-4 text-sm text-gray-600">No grades yet.</div>
              ) : (
                items.map((it) => (
                  <div key={it.id} className="grid grid-cols-1 md:grid-cols-12">
                    {/* item */}
                    <div className="md:col-span-7 p-4 md:border-r">
                      <div className="flex items-start justify-between gap-3">
                        <div className="font-bold text-[#4E3629]">
                          {it.title}
                        </div>
                        <div className="shrink-0">{pill(it.type)}</div>
                      </div>

                      <div className="text-sm text-gray-600 mt-1">
                        {it.dueText}
                      </div>

                      {it.windowText ? (
                        <div className="text-xs text-gray-500 mt-1">
                          {it.windowText}
                        </div>
                      ) : null}
                    </div>

                    {/* score */}
                    <div className="md:col-span-3 p-4 md:border-r text-sm text-gray-700">
                      {it.scoreText ?? "-"}
                    </div>

                    {/* eval */}
                    <div className="md:col-span-2 p-4 text-sm text-gray-700">
                      {it.evalText ?? ""}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </PageShell>
  );
}

if (page === "grades" && selectedCourse) {
  const items = DEMO_COURSE_ITEMS[selectedCourse.id] ?? [];

  const pill = (t: CourseItemType) => (
    <span
      className={[
        "inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold",
        t === "Assignment" ? "bg-gray-50" : "bg-white",
      ].join(" ")}
    >
      {t}
    </span>
  );

  return (
    <PageShell 
      title={`${selectedCourse.title || selectedCourse.code || "Course"} Grades`} 
      topBar={TopBar}
      >
      <div className="rounded-2xl bg-white border shadow-sm overflow-hidden">
        <div className="h-2 bg-[#FFC72C]" />

        <div className="p-6">
          {/* Top row */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="text-sm text-gray-600">
              {selectedCourse.semester} {selectedCourse.instructor_name}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => navigateTo("course", { course: selectedCourse })}
                className="px-4 py-2 rounded-full bg-white border shadow-sm hover:shadow transition text-sm font-semibold"
              >
                Quizzes
              </button>

              <button
                type="button"
                onClick={() => {
                  navigateTo("home");
                }}
                className="px-4 py-2 rounded-full bg-white border shadow-sm hover:shadow transition text-sm font-semibold"
              >
                Back to courses
              </button>
            </div>
          </div>

          {/* header */}
          <div className="mt-6 rounded-2xl border overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-12 bg-gray-50 text-xs font-bold text-gray-600">
              <div className="md:col-span-7 p-3 border-b md:border-b-0 md:border-r">
                Item
              </div>

              <div className="md:col-span-3 p-3 border-b md:border-b-0 md:border-r">
                Score
              </div>

              <div className="md:col-span-2 p-3">
                Eval
              </div>
            </div>

            <div className="divide-y">
              {items.length === 0 ? (
                <div className="p-4 text-sm text-gray-600">
                  No grades yet.
                </div>
              ) : (
                items.map((it) => (
                  <div key={it.id} className="grid grid-cols-1 md:grid-cols-12">

                    {/* item */}
                    <div className="md:col-span-7 p-4 md:border-r">
                      <div className="flex items-start justify-between gap-3">
                        <div className="font-bold text-[#4E3629]">
                          {it.title}
                        </div>
                        <div className="shrink-0">{pill(it.type)}</div>
                      </div>

                      <div className="text-sm text-gray-600 mt-1">
                        {it.dueText}
                      </div>

                      {it.windowText ? (
                        <div className="text-xs text-gray-500 mt-1">
                          {it.windowText}
                        </div>
                      ) : null}
                    </div>

                    {/* score */}
                    <div className="md:col-span-3 p-4 md:border-r text-sm text-gray-700">
                      {it.scoreText ?? "-"}
                    </div>

                    {/* eval */}
                    <div className="md:col-span-2 p-4 text-sm text-gray-700">
                      {it.evalText ?? ""}
                    </div>

                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </PageShell>
  );
}
  // ---------- Quiz Template ----------
if (page === "quiz" && selectedQuizId) {
  return <QuizTemplate
    onExit={() => navigateTo("course", { course: selectedCourse })}
    onSubmitted={() => {
      setCompletedQuizIds((prev) =>
        selectedQuizId && !prev.includes(selectedQuizId)
          ? [...prev, selectedQuizId]
          : prev
      );
    }}
    quizId={selectedQuizId}
    userId={loginresult?.user.id}
    course={selectedCourse}
  />;
}

if (page === "viewSubmissions" && selectedInstructorCourse) {
  return (
    <ViewSubmissions
      courseId={selectedInstructorCourse.id}
      courseCode={selectedInstructorCourse.code}
      onBack={() =>
        navigateTo("instructorCourse", {
          instructorCourse: selectedInstructorCourse,
        })
      }
      onOpenSubmission={(submission) => {
        setSelectedSubmission(submission);
        navigateTo("submissionDetails", {
          instructorCourse: selectedInstructorCourse,
        });
      }}
    />
  );
}

if (page === "submissionDetails" && selectedSubmission && selectedInstructorCourse) {
  return (
    <PageShell title="Submission Details" topBar={TopBar}>
      <div className="rounded-2xl bg-white border shadow-sm overflow-hidden">
        <div className="h-2 bg-[#FFC72C]" />

        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-500">Quiz</div>
              <div className="text-xl font-bold text-[#4E3629]">
                {selectedSubmission.quiz_title}
              </div>
            </div>

            <button
              type="button"
              onClick={() =>
                navigateTo("viewSubmissions", {
                  instructorCourse: selectedInstructorCourse,
                })
              }
              className="px-4 py-2 rounded-full bg-white border shadow-sm hover:shadow transition text-sm font-semibold"
            >
              Back to Submissions
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="rounded-2xl border bg-gray-50 p-4">
              <div className="text-sm text-gray-500">Student</div>
              <div className="font-semibold text-gray-900">
                {selectedSubmission.student}
              </div>
            </div>

            <div className="rounded-2xl border bg-gray-50 p-4">
              <div className="text-sm text-gray-500">Attempt</div>
              <div className="font-semibold text-gray-900">
                #{selectedSubmission.attempt_number}
              </div>
            </div>

            <div className="rounded-2xl border bg-gray-50 p-4">
              <div className="text-sm text-gray-500">Status</div>
              <div className="font-semibold text-gray-900">
                {selectedSubmission.status.replace("_", " ")}
              </div>
            </div>

            <div className="rounded-2xl border bg-gray-50 p-4">
              <div className="text-sm text-gray-500">Score</div>
              <div className="font-semibold text-gray-900">
                {selectedSubmission.score ?? "—"}
              </div>
            </div>

            <div className="rounded-2xl border bg-gray-50 p-4">
              <div className="text-sm text-gray-500">Started At</div>
              <div className="font-semibold text-gray-900">
                {selectedSubmission.grading_started_at || "—"}
              </div>
            </div>

            <div className="rounded-2xl border bg-gray-50 p-4">
              <div className="text-sm text-gray-500">Submitted At</div>
              <div className="font-semibold text-gray-900">
                {selectedSubmission.submitted_at || "—"}
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageShell>
  );
}

  // ---------- logged ----------
if (loginresult && session && (page === "login" || page === "home")) {
  const isInstructor = session.role === ROLES.instructor;

  return (
    <PageShell title={isInstructor ? "Instructor Home" : "Student Home"} topBar={TopBar}>
      <div className="rounded-2xl bg-white border shadow-sm p-6">
        <p className="text-gray-700">
          Signed in as{" "}
          <span className="font-semibold">{loginresult.user.username}</span>{" "}
          ({isInstructor ? "Instructor" : "Student"}).
        </p>

        {isInstructor ? (
          <div className="mt-6">
            <div className="flex items-end justify-between gap-4">
              <div className="text-lg font-extrabold tracking-tight">
                My Courses
              </div>

              <div className="text-xs text-gray-500">
                {instructorCourses.length} teaching
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {instructorCourses.map((course) => (
                <button
                  key={course.id}
                  type="button"
                  onClick={() => {
                    navigateTo("instructorCourse", { instructorCourse: course });
                  }}
                  className="text-left rounded-2xl bg-white border shadow-sm hover:shadow-md transition overflow-hidden"
                >
                  <div className="h-2 bg-[#FFC72C]" />

                  <div className="p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="text-base font-bold">
                          {course.code}
                        </div>

                        <div className="text-md text-gray-700 mt-1 font-bold">
                          {course.title}
                        </div>
                      </div>
                    </div>

                    <div className="mt-3">
                      <span className="inline-flex items-center rounded-full border px-4 py-1.5 text-sm font-normal bg-gray-50 shadow-sm">
                        {course.semester}
                      </span>
                    </div>
                    
                    <div className="mt-6 inline-flex items-center gap-2 text-sm font-normal text-[#4E3629]">
                      Open course <span aria-hidden>→</span>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {instructorCourses.length === 0 && (
              <div className="mt-4 rounded-2xl border bg-gray-50 px-4 py-3 text-sm text-gray-700">
                You’re not teaching any courses yet.
              </div>
            )}
            <div className="flex justify-end gap-6">
              <div className="">
                <button
                  type="button"
                  onClick={() => {
                    navigateTo("createCourse", );
                  }}
                  className="px-4 py-2 rounded-full bg-white border shadow-sm hover:shadow transition text-sm font-semibold"
                >
                  Create course
                </button>
              </div>
            </div>

          </div>
        ) : (
          <div className="mt-6">
            <div className="flex items-end justify-between gap-4">
              <div className="text-lg font-extrabold tracking-tight">
                My Courses
              </div>

              <div className="text-xs text-gray-500">
                {studentCourses.length} enrolled
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {studentCourses.map((course) => (
                <button
                  key={course.id}
                  type="button"
                  onClick={() => {
                    navigateTo("course", { course });
                  }}
                  className="text-left rounded-2xl bg-white border shadow-sm hover:shadow-md transition overflow-hidden"
                >
                  <div className="h-2 bg-[#FFC72C]" />

                  <div className="p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="text-base font-bold">
                          {course.code}
                        </div>

                        <div className="text-md text-gray-700 mt-1 font-bold">
                          {course.title}
                        </div>
                      </div>
                    </div>

                    <div className="mt-3">
                      <span className="inline-flex items-center rounded-full border px-4 py-1.5 text-sm font-normal bg-gray-50 shadow-sm">
                        {course.semester}
                      </span>
                    </div>

                    <div className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-[#4E3629]">
                      Open course <span aria-hidden>→</span>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {studentCourses.length === 0 && (
              <div className="mt-4 rounded-2xl border bg-gray-50 px-4 py-3 text-sm text-gray-700">
                You’re not enrolled in any courses yet.
              </div>
            )}
          </div>
        )}
      </div>
    </PageShell>
  );
}

// ---------- authenticated fallback ----------
if (session && loginresult) {
  return (
    <PageShell title="Home" topBar={TopBar}>
      <div className="rounded-2xl bg-white border shadow-sm p-6">
        <div className="text-sm text-gray-700">
          You’re signed in, but that page isn’t available right now.
        </div>

        <div className="mt-4">
          <button
            type="button"
            onClick={() => navigateTo("home")}
            className="px-4 py-2 rounded-full bg-white border shadow-sm hover:shadow transition text-sm font-semibold"
          >
            Back to Home
          </button>
        </div>
      </div>
    </PageShell>
  );
}

  // ---------- Forgot Password ----------
  if (page === "forgotPassword") {
    return <ForgotPassword />;
  }

  // ---------- login ----------
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      {TopBar}

      <main className="max-w-5xl mx-auto px-4 py-10">
        <div className="max-w-md mx-auto rounded-3xl bg-white border shadow-sm p-6 md:p-7">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight">Login</h1>
            </div>
            <div className="h-10 w-10 rounded-2xl bg-[#FFC72C] flex items-center justify-center font-black text-[#4E3629]">
              ✓
            </div>
          </div>

          {/* roles */}
          <div className="mt-5 flex gap-2">
            <button
              type="button"
              onClick={() => setRole("student")}
              className={[
                "flex-1 rounded-2xl border px-4 py-2 font-bold transition",
                role === "student"
                  ? "bg-[#4E3629] text-white border-[#4E3629]"
                  : "bg-white hover:bg-gray-50",
              ].join(" ")}
            >
              Student
            </button>

            <button
              type="button"
              onClick={() => setRole("instructor")}
              className={[
                "flex-1 rounded-2xl border px-4 py-2 font-bold transition",
                role === ROLES.instructor
                  ? "bg-[#4E3629] text-white border-[#4E3629]"
                  : "bg-white hover:bg-gray-50",
              ].join(" ")}
            >
              Instructor
            </button>
          </div>

          <form onSubmit={handleLogin} className="mt-5 space-y-4">
            <div>
              <label className="text-sm font-semibold text-gray-700">
                Email / Username
              </label>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@wmich.edu"
                className="mt-1 w-full rounded-2xl border bg-gray-50 px-4 py-3 outline-none focus:ring-2 focus:ring-[#FFC72C]/60 focus:border-[#FFC72C]"
              />
            </div>

            <div>
              <label className="text-sm font-semibold text-gray-700">
                Password
              </label>
              <input
                value={pw}
                onChange={(e) => setPw(e.target.value)}
                type="password"
                placeholder="password"
                className="mt-1 w-full rounded-2xl border bg-gray-50 px-4 py-3 outline-none focus:ring-2 focus:ring-[#FFC72C]/60 focus:border-[#FFC72C]"
              />
            </div>

            {error && (
              <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            {regSuccess && (
              <div className="rounded-2xl border border-gray-50 px-4 py-3 text-sm">
                Registered
              </div>
            )}

            <button
              type="submit"
              disabled={!canSubmit}
              className={[
                "w-full rounded-2xl font-bold py-3 transition shadow-sm",
                canSubmit
                  ? "bg-[#4E3629] text-white hover:opacity-95"
                  : "bg-gray-200 text-gray-500 cursor-not-allowed",
              ].join(" ")}
            >
              Sign in
            </button>
            <div className="text-center mt-4">
              <button
                type="button"
                onClick={() => navigateTo("forgotPassword")}
                className="text-sm text-blue-600 hover:underline"
              >
                Forgot Password?
              </button>
            </div>
          </form>
        </div>
      </main>

      <footer className="max-w-5xl mx-auto px-4 pb-10 text-center text-xs text-gray-500">
        © {new Date().getFullYear()} • WMU
      </footer>
    </div>
  );
}
