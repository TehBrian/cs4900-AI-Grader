import React, { useMemo, useState } from "react";

const ROLES = {
  student: "student",
  instructor: "instructor"
} as const;

type Role = "student" | "instructor";
type Page =
  | "login"
  | "about"
  | "contact"
  | "registration"
  | "home"
  | "course"
  | "grades"
  | "instructorCourse"
  | "instructorGrades";

type Course = {
  id: string;
  code: string;
  title: string;
  term: string;
  instructor: string;
};

const DEMO_COURSES: Course[] = [
  { id: "ece1234", code: "ECE 1234", title: "ECE", term: "Spring 2026", instructor: "Dr. Johnson" },
];

const DEMO_INSTRUCTOR_COURSES: Course[] = [
  {
    id: "ece1234",
    code: "ECE 1234",
    title: "ECE",
    term: "Spring 2026",
    instructor: "Dr. Johnson",
  },
];

type CourseItemType = "Assignment" | "Quiz";

type CourseItem = {
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

const DEMO_COURSE_ITEMS: Record<string, CourseItem[]> = {
  ece1234: [
    {
      id: "a1",
      type: "Assignment",
      title: "meow",
      dueText: "Due on Jan 30, 2026 11:59 PM",
      windowText: "Jan 14 - Jan 30",
      submissionsText: "2 Submissions, 1 Files",
      scoreText: "- / 10",
      evalText: "",
    },
    {
      id: "q1",
      type: "Quiz",
      title: "miau",
      dueText: "Due on Feb 18, 2026 11:59 PM",
      submissionsText: "Not started",
      scoreText: "- / 10",
      evalText: "",
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
interface Token {
  refresh: string,
  access: string
}
interface LoginResult {
  user: User,
  token: Token
}

export default function App() {
  const [page, setPage] = useState<Page>("login");

  const [regSuccess, setRegSuccess] = useState<Boolean>(false);

  const [role, setRole] = useState<Role>("student");
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [error, setError] = useState<string | null>(null);

  const [loginresult, setLoginResult] = useState<LoginResult | null>(null);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [selectedInstructorCourse, setSelectedInstructorCourse] = useState<Course | null>(null);
  const [session, setSession] = useState<{ role: Role; email: string } | null>(
    null
  );

  const canSubmit = useMemo(() => {
    return email.trim().length > 0 && pw.trim().length > 0;
  }, [email, pw]);

  async function registerUser(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);

    const formObj = Object.fromEntries(formData.entries());
    form.reset();

    try {
      const response = await fetch("http://127.0.0.1:8000/api/users/auth/register/", {
        method: "POST",
        headers: {
          'content-Type': "application/json",
        },
        body: JSON.stringify({
          first_name: formObj.first_name,
          last_name: formObj.last_name,
          email: formObj.email,
          username: formObj.username,
          password: formObj.password,
          role: formObj.role
        })
      });

      if (response.ok) {
        setRegSuccess(true);
        setPage("login");
        const timer = setTimeout(() => {
          setRegSuccess(false);
        }, 3000);
        return () => clearTimeout(timer);
      } else {
        const err_response = await response.json();
        var err_msg = "";
        Object.entries(err_response).forEach((i) => {
          err_msg += i[1] + '\n';
        });
        setError(err_msg);
        return;
      }

    } catch (err) {
      alert("Failed to connect.");
    }

  }


  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    try {
      const response = await fetch("http://127.0.0.1:8000/api/users/auth/login/", {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({username: email, password: pw, role: role})
      });

      if (response.ok) {
        const data = await response.json();

        setLoginResult(data);
        setSession({role, email: email.trim()});
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
    setPage("login");
    setLoginResult(null);
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
            onClick={() => setPage("home")}
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
            onClick={() => setPage("about")}
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
            onClick={() => setPage("contact")}
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
              onClick={() => setPage("login")}
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
            onClick={() => setPage("registration")}
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
  function PageShell({
    title,
    children,
  }: {
    title: string;
    children: React.ReactNode;
  }) {
    return (
      <div className="min-h-screen bg-gray-50 text-gray-900">
        {TopBar}
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

  if (page === "about") {
    return (
      <PageShell title="About">
        <div className="rounded-2xl bg-white border shadow-sm p-6 text-gray-700">
          <p className="leading-relaxed">bla bla bla this is the explanation</p>
        </div>
      </PageShell>
    );
  }

  if (page === "contact") {
    return (
      <PageShell title="Contact">
        <div className="rounded-2xl bg-white border shadow-sm p-6 text-gray-700">
          <p className="leading-relaxed">contact details to us ig</p>
        </div>
      </PageShell>
    );
  }

if (page === "registration") {
  return (
    <PageShell title="Registration">
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
    <PageShell title={selectedCourse.code}>
      <div className="rounded-2xl bg-white border shadow-sm overflow-hidden">
        <div className="h-2 bg-[#FFC72C]" />

        <div className="p-6">
          {/* row */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="text-sm text-gray-600">
              {selectedCourse.term} • Instructor: {selectedCourse.instructor}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPage("grades")}
                className="px-4 py-2 rounded-full bg-white border shadow-sm hover:shadow transition text-sm font-semibold"
              >
                Grades
              </button>

              <button
                type="button"
                onClick={() => {
                  setSelectedCourse(null);
                  setPage("home");
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
                    onClick={() => alert(`Open: ${it.title}`)}
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

  const statusFor = (it: CourseItem) => {
    const s = (it.submissionsText ?? "").toLowerCase();
    if (!s) return "—";
    if (s.includes("not started")) return "Not started";
    if (s.includes("submission")) return "Submissions received";
    return it.submissionsText ?? "—";
  };

  return (
    <PageShell title={`${selectedInstructorCourse.code} (Instructor)`}>
      <div className="rounded-2xl bg-white border shadow-sm overflow-hidden">
        <div className="h-2 bg-[#FFC72C]" />

        <div className="p-6">
          {/* top row */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="text-sm text-gray-600">
              {selectedInstructorCourse.term} • Instructor:{" "}
              {selectedInstructorCourse.instructor}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPage("instructorGrades")}
                className="px-4 py-2 rounded-full bg-white border shadow-sm hover:shadow transition text-sm font-semibold"
              >
                Gradebook
              </button>

              <button
                type="button"
                onClick={() => {
                  setSelectedInstructorCourse(null);
                  setPage("home");
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
                onClick={() => alert("Create Assignment (demo)")}
                className="px-4 py-2 rounded-full bg-white border shadow-sm hover:shadow transition text-sm font-semibold"
              >
                Create Assignment
              </button>

              <button
                type="button"
                onClick={() => alert("Create Quiz (demo)")}
                className="px-4 py-2 rounded-full bg-white border shadow-sm hover:shadow transition text-sm font-semibold"
              >
                Create Quiz
              </button>

              <button
                type="button"
                onClick={() => alert("View Submissions (demo)")}
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
                      <div className="text-xs text-gray-500 mt-1">
                        Status: {statusFor(it)}
                      </div>
                    </div>

                    {/* actions */}
                    <div className="md:col-span-2 p-4 flex md:block items-center gap-2">
                      <button
                        type="button"
                        onClick={() => alert(`Open submissions for: ${it.title} (demo)`)}
                        className="px-3 py-2 rounded-full bg-white border shadow-sm hover:shadow transition text-xs font-semibold"
                      >
                        Submissions
                      </button>

                      <button
                        type="button"
                        onClick={() => alert(`Quick grade: ${it.title} (demo)`)}
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
    <PageShell title={`${selectedInstructorCourse.code} Gradebook`}>
      <div className="rounded-2xl bg-white border shadow-sm overflow-hidden">
        <div className="h-2 bg-[#FFC72C]" />

        <div className="p-6">
          {/* Top row */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="text-sm text-gray-600">
              {selectedInstructorCourse.term} • Instructor:{" "}
              {selectedInstructorCourse.instructor}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPage("instructorCourse")}
                className="px-4 py-2 rounded-full bg-white border shadow-sm hover:shadow transition text-sm font-semibold"
              >
                Assignments &amp; Quizzes
              </button>

              <button
                type="button"
                onClick={() => {
                  setSelectedInstructorCourse(null);
                  setPage("home");
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
    <PageShell title={`${selectedCourse.code} Grades`}>
      <div className="rounded-2xl bg-white border shadow-sm overflow-hidden">
        <div className="h-2 bg-[#FFC72C]" />

        <div className="p-6">
          {/* Top row */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="text-sm text-gray-600">
              {selectedCourse.term} • Instructor: {selectedCourse.instructor}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPage("course")}
                className="px-4 py-2 rounded-full bg-white border shadow-sm hover:shadow transition text-sm font-semibold"
              >
                Assignments &amp; Quizzes
              </button>

              <button
                type="button"
                onClick={() => {
                  setSelectedCourse(null);
                  setPage("home");
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


  // ---------- logged ----------
if (loginresult && session && (page === "login" || page === "home")) {
  const isInstructor = session.role === ROLES.instructor;

  return (
    <PageShell title={isInstructor ? "Instructor Home" : "Student Home"}>
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
                {DEMO_INSTRUCTOR_COURSES.length} teaching
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {DEMO_INSTRUCTOR_COURSES.map((course) => (
                <button
                  key={course.id}
                  type="button"
                  onClick={() => {
                    setSelectedInstructorCourse(course);
                    setPage("instructorCourse");
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

                        <div className="text-sm text-gray-700 mt-1">
                          {course.title}
                        </div>
                      </div>

                      <span className="inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold bg-gray-50">
                        {course.term}
                      </span>
                    </div>

                    <div className="text-xs text-gray-500 mt-3">
                      Instructor: {course.instructor}
                    </div>

                    <div className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-[#4E3629]">
                      Open course <span aria-hidden>→</span>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {DEMO_INSTRUCTOR_COURSES.length === 0 && (
              <div className="mt-4 rounded-2xl border bg-gray-50 px-4 py-3 text-sm text-gray-700">
                You’re not teaching any courses yet.
              </div>
            )}
          </div>
        ) : (
          <div className="mt-6">
            <div className="flex items-end justify-between gap-4">
              <div className="text-lg font-extrabold tracking-tight">
                My Courses
              </div>

              <div className="text-xs text-gray-500">
                {DEMO_COURSES.length} enrolled
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {DEMO_COURSES.map((course) => (
                <button
                  key={course.id}
                  type="button"
                  onClick={() => {
                    setSelectedCourse(course);
                    setPage("course");
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

                        <div className="text-sm text-gray-700 mt-1">
                          {course.title}
                        </div>
                      </div>

                      <span className="inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold bg-gray-50">
                        {course.term}
                      </span>
                    </div>

                    <div className="text-xs text-gray-500 mt-3">
                      Instructor: {course.instructor}
                    </div>

                    <div className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-[#4E3629]">
                      Open course <span aria-hidden>→</span>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {DEMO_COURSES.length === 0 && (
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
    <PageShell title="Home">
      <div className="rounded-2xl bg-white border shadow-sm p-6">
        <div className="text-sm text-gray-700">
          You’re signed in, but that page isn’t available right now.
        </div>

        <div className="mt-4">
          <button
            type="button"
            onClick={() => setPage("home")}
            className="px-4 py-2 rounded-full bg-white border shadow-sm hover:shadow transition text-sm font-semibold"
          >
            Back to Home
          </button>
        </div>
      </div>
    </PageShell>
  );
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
          </form>
        </div>
      </main>

      <footer className="max-w-5xl mx-auto px-4 pb-10 text-center text-xs text-gray-500">
        © {new Date().getFullYear()} • WMU
      </footer>
    </div>
  );
}


