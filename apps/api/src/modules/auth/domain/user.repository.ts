import type { AuthUser } from "./auth.types";

export const USER_REPOSITORY = Symbol("USER_REPOSITORY");

export interface UserRepository {
  findByEmail(email: string): Promise<AuthUser | null>;
  findById(id: string): Promise<AuthUser | null>;
  findByGoogleId(googleId: string): Promise<AuthUser | null>;
  linkGoogleAccount(userId: string, googleId: string): Promise<void>;
  setTwoFactorSecret(userId: string, secret: string): Promise<void>;
  confirmTwoFactorEnabled(userId: string): Promise<void>;
  storeRefreshToken(userId: string, tokenHash: string, expiresAt: Date): Promise<void>;
  findRefreshToken(tokenHash: string): Promise<{ userId: string; expiresAt: Date; revokedAt: Date | null } | null>;
  revokeRefreshToken(tokenHash: string): Promise<void>;
}
