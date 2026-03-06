import React, { createContext, useContext, useState, useCallback } from "react";

interface User {
  id: string;
  email: string;
  name: string;
  organization: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string, organization: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem("inspectai_user");
    return stored ? JSON.parse(stored) : null;
  });

  const login = useCallback(async (email: string, _password: string) => {
    // Mock login
    const mockUser: User = {
      id: crypto.randomUUID(),
      email,
      name: email.split("@")[0],
      organization: "Demo Organization",
    };
    localStorage.setItem("inspectai_user", JSON.stringify(mockUser));
    setUser(mockUser);
  }, []);

  const signup = useCallback(async (name: string, email: string, _password: string, organization: string) => {
    const mockUser: User = {
      id: crypto.randomUUID(),
      email,
      name,
      organization,
    };
    localStorage.setItem("inspectai_user", JSON.stringify(mockUser));
    setUser(mockUser);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("inspectai_user");
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
