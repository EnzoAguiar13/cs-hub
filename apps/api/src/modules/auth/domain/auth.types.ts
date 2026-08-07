export interface AuthUser {
  id: string;
  email: string;
  name: string;
  avatarUrl: string | null;
  passwordHash: string | null;
  googleId: string | null;
  roleId: string;
  roleName: string;
  twoFactorSecret: string | null;
  twoFactorEnabled: boolean;
  status: "ACTIVE" | "SUSPENDED";
}

export interface JwtAccessPayload {
  sub: string;
  email: string;
  roleId: string;
  roleName: string;
}

export interface TwoFactorChallengePayload {
  sub: string;
  purpose: "2fa-challenge";
}
