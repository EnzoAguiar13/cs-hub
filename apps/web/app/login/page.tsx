"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import { pinLoginSchema, type LoginResponse } from "@cs-hub/shared-types";
import { API_URL, ApiError } from "@/lib/api-client";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";

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
  const [error, setError] = React.useState<string | null>(null);

  const form = useForm<z.infer<typeof pinLoginSchema>>({
    resolver: zodResolver(pinLoginSchema),
    defaultValues: { pin: "" },
  });

  async function onSubmit(values: z.infer<typeof pinLoginSchema>) {
    setError(null);
    try {
      const result = await postJson<LoginResponse>("/auth/pin", values);
      if (result.requires2fa) {
        // The PIN flow never issues a 2FA challenge today, but keep the contract honest.
        setError("Esta conta exige verificação adicional. Contate um administrador.");
        return;
      }
      login(result.accessToken, result.user);
      router.replace("/");
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Não foi possível conectar ao servidor. Verifique a configuração da API e tente novamente.");
      }
    }
  }

  return (
    <div className="flex min-h-svh items-center justify-center bg-background px-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-xl">CS Hub</CardTitle>
          <CardDescription>Digite o PIN de acesso</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="pin">PIN</Label>
              <Input
                id="pin"
                inputMode="numeric"
                autoFocus
                autoComplete="off"
                {...form.register("pin")}
              />
              {form.formState.errors.pin && (
                <p className="text-xs text-destructive">{form.formState.errors.pin.message}</p>
              )}
            </div>
            <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
              Entrar
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
