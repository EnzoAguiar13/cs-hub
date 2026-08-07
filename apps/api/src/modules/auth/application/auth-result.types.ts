import type { AuthUser } from "../domain/auth.types";

export type LoginResult =
  | { requires2fa: true; challengeToken: string }
  | { requires2fa: false; accessToken: string; refreshToken: string; user: AuthUser };

export interface SessionTokens {
  accessToken: string;
  refreshToken: string;
}
