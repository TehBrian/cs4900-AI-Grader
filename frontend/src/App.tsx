import React, { useMemo, useState } from "react";

type Role = "student" | "teacher";
type Page = "login" | "about" | "contact";

export default function App() {
  const [page, setPage] = useState<Page>("login");

  const [role, setRole] = useState<Role>("student");
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [error, setError] = useState<string | null>(null);

  const [session, setSession] = useState<{ role: Role; email: string } | null>(
    null
  );

  const canSubmit = useMemo(() => {
    return email.trim().length > 0 && pw.trim().length > 0;
  }, [email, pw]);

  function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (pw !== "password") {
      setError("Incorrect password. Use password=password");
      return;
    }

    setSession({ role, email: email.trim() });
    setPw("");
  }

  function logout() {
    setSession(null);
    setEmail("");
    setPw("");
    setError(null);
    setRole("student");
    setPage("login");
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

  // ---------- logged ----------
  if (session && page === "login") {
    const isTeacher = session.role === "teacher";
    return (
      <PageShell title={isTeacher ? "Teacher Home" : "Student Home"}>
        <div className="rounded-2xl bg-white border shadow-sm p-6">
          <p className="text-gray-700">
            Signed in as <span className="font-semibold">{session.email}</span>{" "}
            ({isTeacher ? "Teacher" : "Student"}).
          </p>

          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {(isTeacher
              ? [
                  { title: "Create Quiz", desc: "null" },
                  { title: "View Submissions", desc: "null" },
                  { title: "Export", desc: "null" },
                ]
              : [
                  { title: "My Quizzes", desc: "null" },
                  { title: "My Grades", desc: "null" },
                  { title: "Feedback", desc: "null" },
                ]
            ).map((c) => (
              <div
                key={c.title}
                className="rounded-2xl bg-white border shadow-sm hover:shadow-md transition overflow-hidden"
              >
                <div className="h-2 bg-[#FFC72C]" />
                <div className="p-5">
                  <div className="text-base font-bold">{c.title}</div>
                  <div className="text-sm text-gray-600 mt-1">{c.desc}</div>
                </div>
              </div>
            ))}
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
              <p className="text-sm text-gray-500 mt-1">
                password=password
              </p>
            </div>
            <div className="h-10 w-10 rounded-2xl bg-[#FFC72C] flex items-center justify-center font-black text-[#4E3629]">
              ✓
            </div>
          </div>

          {/* Role toggle */}
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
              onClick={() => setRole("teacher")}
              className={[
                "flex-1 rounded-2xl border px-4 py-2 font-bold transition",
                role === "teacher"
                  ? "bg-[#4E3629] text-white border-[#4E3629]"
                  : "bg-white hover:bg-gray-50",
              ].join(" ")}
            >
              Teacher
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
