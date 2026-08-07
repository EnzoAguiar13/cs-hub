import { tokenStore } from "@/lib/auth-token-store";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly issues?: Array<{ path: string; message: string }>,
  ) {
    super(message);
    this.name = "ApiError";
  }

  static async fromResponse(response: Response): Promise<ApiError> {
    const body = await response.json().catch(() => null);
    return new ApiError(response.status, body?.message ?? response.statusText, body?.issues);
  }
}

export class UnauthorizedError extends Error {
  constructor() {
    super("Sessão expirada");
    this.name = "UnauthorizedError";
  }
}

// A single in-flight refresh is shared by every caller that hits a 401 concurrently.
// Without this, several queries firing on first load would each call /auth/refresh at
// once; since the backend rotates the refresh token on every use, all but the first of
// those concurrent calls would fail because their refresh token was already invalidated.
let refreshPromise: Promise<string | null> | null = null;

export async function refreshAccessToken(): Promise<string | null> {
  if (!refreshPromise) {
    refreshPromise = fetch(`${API_URL}/auth/refresh`, { method: "POST", credentials: "include" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data: { accessToken?: string } | null) => {
        const token = data?.accessToken ?? null;
        tokenStore.set(token);
        return token;
      })
      .catch(() => {
        tokenStore.set(null);
        return null;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
}

export async function apiFetch<T = unknown>(path: string, init: RequestInit = {}): Promise<T> {
  const doFetch = (token: string | null) =>
    fetch(`${API_URL}${path}`, {
      ...init,
      credentials: "include",
      headers: {
        ...(init.body && !(init.headers as Record<string, string> | undefined)?.["Content-Type"]
          ? { "Content-Type": "application/json" }
          : {}),
        ...init.headers,
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });

  let response = await doFetch(tokenStore.get());

  if (response.status === 401) {
    const refreshed = await refreshAccessToken();
    if (!refreshed) throw new UnauthorizedError();
    response = await doFetch(refreshed);
  }

  if (!response.ok) throw await ApiError.fromResponse(response);
  if (response.status === 204) return null as T;
  return response.json() as Promise<T>;
}

export { API_URL };
