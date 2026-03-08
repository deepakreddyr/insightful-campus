import React, { createContext, useContext, useState, useCallback } from "react";

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem("inspectai_user");
    return stored ? JSON.parse(stored) : null;
  });

  const login = useCallback(async (email: string, password: string) => {
    try {
      const response = await fetch(`/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.detail || "Login failed");
      }

      const { user, access_token } = await response.json();
      localStorage.setItem("inspectai_user", JSON.stringify(user));
      localStorage.setItem("inspectai_token", access_token);
      setUser(user);
    } catch (err) {
      console.error("Login error:", err);
      throw err;
    }
  }, []);

  const signup = useCallback(async (name: string, email: string, password: string) => {
    try {
      const response = await fetch(`/api/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.detail || "Signup failed");
      }

      const { user, access_token } = await response.json();
      localStorage.setItem("inspectai_user", JSON.stringify(user));
      localStorage.setItem("inspectai_token", access_token);
      setUser(user);
    } catch (err) {
      console.error("Signup error:", err);
      throw err;
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("inspectai_user");
    localStorage.removeItem("inspectai_token");
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be inside AuthProvider");
  return ctx;
}
