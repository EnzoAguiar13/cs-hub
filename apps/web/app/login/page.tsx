"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import { loginSchema, verify2faSchema, type AuthenticatedUser } from "@cs-hub/shared-types";
import { API_URL, ApiError } from "@/lib/api-client";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";

type LoginResult =
  | { requires2fa: true; challengeToken: string }
  | { requires2fa: false; accessToken: string; user: AuthenticatedUser };

async function postJson<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw await ApiError.fromResponse(res);
  return res.json() as Promise<T>;
}

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [challengeToken, setChallengeToken] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  const credentialsForm = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const twoFactorForm = useForm<z.infer<typeof verify2faSchema>>({
    resolver: zodResolver(verify2faSchema),
    defaultValues: { challengeToken: "", code: "" },
  });

  async function onSubmitCredentials(values: z.infer<typeof loginSchema>) {
    setError(null);
    try {
      const result = await postJson<LoginResult>("/auth/login", values);
      if (result.requires2fa) {
        setChallengeToken(result.challengeToken);
        twoFactorForm.setValue("challengeToken", result.challengeToken);
        return;
      }
      login(result.accessToken, result.user);
      router.replace("/");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Não foi possível entrar. Tente novamente.");
    }
  }

  async function onSubmitTwoFactor(values: z.infer<typeof verify2faSchema>) {
    setError(null);
    try {
      const result = await postJson<LoginResult>("/auth/2fa/verify", values);
      if (result.requires2fa) {
        setError("Código inválido, tente novamente.");
        return;
      }
      login(result.accessToken, result.user);
      router.replace("/");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Código inválido, tente novamente.");
    }
  }

  return (
    <div className="flex min-h-svh items-center justify-center bg-background px-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-xl">CS Hub</CardTitle>
          <CardDescription>
            {challengeToken ? "Digite o código do seu autenticador" : "Entre com suas credenciais"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {!challengeToken ? (
            <form onSubmit={credentialsForm.handleSubmit(onSubmitCredentials)} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" autoComplete="email" {...credentialsForm.register("email")} />
                {credentialsForm.formState.errors.email && (
                  <p className="text-xs text-destructive">{credentialsForm.formState.errors.email.message}</p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="password">Senha</Label>
                <Input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  {...credentialsForm.register("password")}
                />
                {credentialsForm.formState.errors.password && (
                  <p className="text-xs text-destructive">{credentialsForm.formState.errors.password.message}</p>
                )}
              </div>
              <Button type="submit" className="w-full" disabled={credentialsForm.formState.isSubmitting}>
                Entrar
              </Button>
              <Button variant="outline" className="w-full" type="button" asChild>
                <a href={`${API_URL}/auth/google`}>Continuar com Google</a>
              </Button>
            </form>
          ) : (
            <form onSubmit={twoFactorForm.handleSubmit(onSubmitTwoFactor)} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="code">Código de 6 dígitos</Label>
                <Input id="code" inputMode="numeric" maxLength={6} autoFocus {...twoFactorForm.register("code")} />
                {twoFactorForm.formState.errors.code && (
                  <p className="text-xs text-destructive">{twoFactorForm.formState.errors.code.message}</p>
                )}
              </div>
              <Button type="submit" className="w-full" disabled={twoFactorForm.formState.isSubmitting}>
                Verificar
              </Button>
              <Button variant="ghost" className="w-full" type="button" onClick={() => setChallengeToken(null)}>
                Voltar
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
