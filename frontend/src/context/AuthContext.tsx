import React, { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { Course, LoginResult, Role } from "../types";

type Session = { role: Role; email: string };

type AuthContextValue = {
  loginresult: LoginResult | null;
  session: Session | null;
  isInitializing: boolean;
  studentCourses: Course[];
  instructorCourses: Course[];
  login: (username: string, password: string, role: Role) => Promise<string | null>;
  logout: () => Promise<void>;
  fetchCourses: (accessToken: string, role: Role) => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const [loginresult, setLoginResult] = useState<LoginResult | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [studentCourses, setStudentCourses] = useState<Course[]>([]);
  const [instructorCourses, setInstructorCourses] = useState<Course[]>([]);

  useEffect(() => {
    async function restoreSession() {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_BASE_URL || ""}/api/users/auth/refresh/`,
          { method: "POST", credentials: "include" }
        );
        if (res.ok) {
          const data = await res.json();
          setLoginResult({ user: data.user, tokens: { access: data.access } });
          const role = data.user.role as Role;
          setSession({ role, email: data.user.email });
          fetchCourses(data.access, role).catch(() => {});
          if (window.location.pathname === "/login") {
            navigate("/", { replace: true });
          }
        }
      } catch {
        // network error — leave state null, user will see login page
      } finally {
        setIsInitializing(false);
      }
    }
    restoreSession();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function fetchCourses(accessToken: string, role: Role) {
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || ""}/api/courses/`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const data = await response.json();

    if (!response.ok) throw new Error("Failed to fetch courses");

    const courses: Course[] = Array.isArray(data) ? data : (data.results ?? []);

    if (role === "student") {
      setStudentCourses(courses);
    } else {
      setInstructorCourses(courses);
    }
  }

  async function login(username: string, password: string, role: Role): Promise<string | null> {
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || ""}/api/users/auth/login/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ username, password, role }),
    });

    if (!response.ok) {
      const err = await response.json();
      return err.error ?? "Login failed.";
    }

    const data = await response.json();
    setLoginResult(data);
    setSession({ role, email: username.trim() });
    await fetchCourses(data.tokens.access, role);
    navigate("/", { replace: true });
    return null;
  }

  async function logout() {
    try {
      await fetch(`${import.meta.env.VITE_API_BASE_URL || ""}/api/users/auth/logout/`, {
        method: "POST",
        credentials: "include",
        headers: loginresult
          ? { Authorization: `Bearer ${loginresult.tokens.access}` }
          : {},
      });
    } catch {
      // proceed with local logout even if backend call fails
    }

    setLoginResult(null);
    setSession(null);
    setStudentCourses([]);
    setInstructorCourses([]);
    navigate("/login", { replace: true });
  }

  return (
    <AuthContext.Provider
      value={{ loginresult, session, isInitializing, studentCourses, instructorCourses, login, logout, fetchCourses }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
