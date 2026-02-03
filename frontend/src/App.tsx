import React, { useMemo, useState } from "react";

const ROLES = {
  student: "student",
  instructor: "instructor"
} as const;

type Role = "student" | "instructor";
type Page = "login" | "about" | "contact" | "registration" | "home";

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
        setError(err_response.error);
        return;
      }

    } catch (err) {
      alert("Failed to register.");
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

        <form method="post" onSubmit={registerUser}>
        <div className="rounded-2xl bg-white border shadow-sm p-6 text-gray-700 mt-6 flex flex-col gap-y-4">
          <div>
          <label>
            First name: <input className="border" name="first_name" />
          </label>
          </div>
          <div>
          <label>
            Last name: <input className="border" name="last_name" />
          </label>
          </div>
          <div>
          <label>
            Email: <input className="border" name="email" />
          </label>
          </div>
          <div>
          <label>
            Username: <input className="border" name="username" />
          </label>
          </div>
          <div>
          <label>
            Password: <input className="border" type="password" name="password" />
          </label>
          </div>
          <div className="flex flex-row gap-x-3">
            <label className="flex flex-row gap-x-1">
              Student
              <input type="radio" name="role" value="student" defaultChecked={true} />
            </label>
            <label className="flex flex-row gap-x-1">
              Instructor
              <input type="radio" name="role" value="instructor" />
            </label>
          </div>
          <div>
            <button className="border rounded shadow-sm flex text-sm p-1" type="submit">Submit</button>
          </div>
          </div>
          </form>

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
            Signed in as <span className="font-semibold">{loginresult.user.username}</span>{" "}
            ({isInstructor ? "Instructor" : "Student"}).
          </p>

          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {(isInstructor
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
