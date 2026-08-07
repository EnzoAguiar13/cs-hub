import type { JwtAccessPayload, TwoFactorChallengePayload } from "./auth.types";

export const TOKEN_SERVICE = Symbol("TOKEN_SERVICE");

export interface TokenService {
  signAccessToken(payload: JwtAccessPayload): Promise<string>;
  signRefreshToken(userId: string): Promise<{ token: string; tokenHash: string; expiresAt: Date }>;
  signTwoFactorChallenge(userId: string): Promise<string>;
  verifyTwoFactorChallenge(token: string): Promise<TwoFactorChallengePayload>;
  hashRefreshToken(token: string): string;
  verifyRefreshToken(token: string): Promise<{ sub: string }>;
}
