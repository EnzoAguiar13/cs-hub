"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import type { AuthenticatedUser } from "@cs-hub/shared-types";
import { apiFetch, refreshAccessToken, API_URL } from "@/lib/api-client";
import { tokenStore } from "@/lib/auth-token-store";

type AuthStatus = "loading" | "authenticated" | "unauthenticated";

interface AuthContextValue {
  user: AuthenticatedUser | null;
  status: AuthStatus;
  login: (accessToken: string, user: AuthenticatedUser) => void;
  logout: () => Promise<void>;
}

const AuthContext = React.createContext<AuthContextValue | null>(null);

export function useAuth() {
  const context = React.useContext(AuthContext);
  if (!context) throw new Error("useAuth deve ser usado dentro de <AuthProvider>");
  return context;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = React.useState<AuthenticatedUser | null>(null);
  const [status, setStatus] = React.useState<AuthStatus>("loading");

  React.useEffect(() => {
    let cancelled = false;

    async function restoreSession() {
      const token = await refreshAccessToken();
      if (!token) {
        if (!cancelled) setStatus("unauthenticated");
        return;
      }
      try {
        const me = await apiFetch<AuthenticatedUser>("/auth/me");
        if (!cancelled) {
          setUser(me);
          setStatus("authenticated");
        }
      } catch {
        if (!cancelled) {
          tokenStore.set(null);
          setStatus("unauthenticated");
        }
      }
    }

    void restoreSession();
    return () => {
      cancelled = true;
    };
  }, []);

  React.useEffect(() => {
    if (status === "unauthenticated") router.replace("/login");
  }, [status, router]);

  const login = React.useCallback((accessToken: string, nextUser: AuthenticatedUser) => {
    tokenStore.set(accessToken);
    setUser(nextUser);
    setStatus("authenticated");
  }, []);

  const logout = React.useCallback(async () => {
    await fetch(`${API_URL}/auth/logout`, { method: "POST", credentials: "include" }).catch(() => {});
    tokenStore.set(null);
    setUser(null);
    setStatus("unauthenticated");
    router.replace("/login");
  }, [router]);

  return <AuthContext.Provider value={{ user, status, login, logout }}>{children}</AuthContext.Provider>;
}
