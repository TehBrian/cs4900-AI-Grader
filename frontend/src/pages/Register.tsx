import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Register() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const form = e.target as HTMLFormElement;
    const formObj = Object.fromEntries(new FormData(form).entries());

    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || ""}/api/users/auth/register/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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
        navigate("/login", { replace: true, state: { registered: true } });
      } else {
        const err_response = await response.json();
        setError(Object.values(err_response).join("\n"));
      }
    } catch {
      setError("Failed to connect.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="max-w-5xl mx-auto px-4 py-10">
      <div className="w-full">
        <div className="rounded-3xl bg-white border shadow-sm p-6 md:p-8 w-full">
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight mb-6">Registration</h1>
          <form method="post" onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-sm font-semibold text-gray-700">First name</label>
                <input
                  name="first_name"
                  required
                  placeholder="First"
                  className="mt-1 w-full rounded-2xl border bg-gray-50 px-4 py-3 outline-none focus:ring-2 focus:ring-[#FFC72C]/60 focus:border-[#FFC72C]"
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700">Last name</label>
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
                <label className="text-sm font-semibold text-gray-700">Email</label>
                <input
                  name="email"
                  type="email"
                  required
                  placeholder="name@wmich.edu"
                  className="mt-1 w-full rounded-2xl border bg-gray-50 px-4 py-3 outline-none focus:ring-2 focus:ring-[#FFC72C]/60 focus:border-[#FFC72C]"
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700">Username</label>
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
                <label className="text-sm font-semibold text-gray-700">Password</label>
                <input
                  name="password"
                  type="password"
                  required
                  placeholder="password"
                  className="mt-1 w-full rounded-2xl border bg-gray-50 px-4 py-3 outline-none focus:ring-2 focus:ring-[#FFC72C]/60 focus:border-[#FFC72C]"
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700">Role</label>
                <div className="mt-2 flex gap-6">
                  <label className="flex items-center gap-2 rounded-2xl border px-4 py-3 bg-white hover:bg-gray-50 cursor-pointer w-full">
                    <input type="radio" name="role" value="student" defaultChecked className="accent-[#4E3629]" />
                    <span className="font-semibold">Student</span>
                  </label>
                  <label className="flex items-center gap-2 rounded-2xl border px-4 py-3 bg-white hover:bg-gray-50 cursor-pointer w-full">
                    <input type="radio" name="role" value="instructor" className="accent-[#4E3629]" />
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

            <div className="flex justify-end pt-4">
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
    </main>
  );
}
