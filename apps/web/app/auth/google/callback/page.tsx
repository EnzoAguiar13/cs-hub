"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import type { AuthenticatedUser } from "@cs-hub/shared-types";
import { apiFetch } from "@/lib/api-client";
import { tokenStore } from "@/lib/auth-token-store";
import { useAuth } from "@/lib/auth-context";

export default function GoogleCallbackPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const hash = new URLSearchParams(window.location.hash.replace(/^#/, ""));
    const accessToken = hash.get("accessToken");

    if (!accessToken) {
      setError("Login com Google falhou.");
      return;
    }

    tokenStore.set(accessToken);
    history.replaceState(null, "", window.location.pathname);

    apiFetch<AuthenticatedUser>("/auth/me")
      .then((user) => {
        login(accessToken, user);
        router.replace("/");
      })
      .catch(() => setError("Não foi possível concluir o login com Google."));
  }, [login, router]);

  return (
    <div className="flex min-h-svh items-center justify-center bg-background px-4 text-sm text-muted-foreground">
      {error ?? "Concluindo login..."}
    </div>
  );
}
