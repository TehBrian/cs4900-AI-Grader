import React, { createContext, useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { Course, LoginResult, Role } from "../types";

type Session = { role: Role; email: string };

type AuthContextValue = {
  loginresult: LoginResult | null;
  session: Session | null;
  studentCourses: Course[];
  instructorCourses: Course[];
  login: (username: string, password: string, role: Role) => Promise<string | null>;
  logout: () => void;
  fetchCourses: (accessToken: string, role: Role) => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const [loginresult, setLoginResult] = useState<LoginResult | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [studentCourses, setStudentCourses] = useState<Course[]>([]);
  const [instructorCourses, setInstructorCourses] = useState<Course[]>([]);

  async function fetchCourses(accessToken: string, role: Role) {
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || ""}/api/courses/`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const data = await response.json();

    if (!response.ok) throw new Error("Failed to fetch courses");

    if (role === "student") {
      setStudentCourses(data);
    } else {
      setInstructorCourses(data);
    }
  }

  async function login(username: string, password: string, role: Role): Promise<string | null> {
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || ""}/api/users/auth/login/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
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

  function logout() {
    setLoginResult(null);
    setSession(null);
    setStudentCourses([]);
    setInstructorCourses([]);
    navigate("/login", { replace: true });
  }

  return (
    <AuthContext.Provider
      value={{ loginresult, session, studentCourses, instructorCourses, login, logout, fetchCourses }}
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
