import { ForbiddenException } from "@nestjs/common";
import type { AuthUser } from "../domain/auth.types";
import type { UserRepository } from "../domain/user.repository";
import type { TokenService } from "../domain/token.service";
import type { IssueSessionUseCase } from "./issue-session.use-case";
import { LoginWithGoogleUseCase } from "./login-with-google.use-case";

function buildUser(overrides: Partial<AuthUser> = {}): AuthUser {
  return {
    id: "user_1",
    email: "a@b.com",
    name: "Fulano",
    avatarUrl: null,
    passwordHash: null,
    googleId: "google_1",
    roleId: "role_1",
    roleName: "CS",
    twoFactorSecret: null,
    twoFactorEnabled: false,
    status: "ACTIVE",
    ...overrides,
  };
}

describe("LoginWithGoogleUseCase", () => {
  it("returns a 2FA challenge instead of a session for a 2FA-enabled account", async () => {
    const user = buildUser({ twoFactorEnabled: true });
    const users = { findByGoogleId: jest.fn().mockResolvedValue(user) } as unknown as UserRepository;
    const tokens = { signTwoFactorChallenge: jest.fn().mockResolvedValue("challenge-token") } as unknown as TokenService;
    const issueSession = { execute: jest.fn() } as unknown as IssueSessionUseCase;

    const useCase = new LoginWithGoogleUseCase(users, tokens, issueSession);
    const result = await useCase.execute({ googleId: "google_1", email: "a@b.com" });

    expect(result).toEqual({ requires2fa: true, challengeToken: "challenge-token" });
    expect(issueSession.execute).not.toHaveBeenCalled();
  });

  it("issues a session directly when the account has no 2FA enabled", async () => {
    const user = buildUser({ twoFactorEnabled: false });
    const users = { findByGoogleId: jest.fn().mockResolvedValue(user) } as unknown as UserRepository;
    const tokens = { signTwoFactorChallenge: jest.fn() } as unknown as TokenService;
    const issueSession = {
      execute: jest.fn().mockResolvedValue({ accessToken: "at", refreshToken: "rt" }),
    } as unknown as IssueSessionUseCase;

    const useCase = new LoginWithGoogleUseCase(users, tokens, issueSession);
    const result = await useCase.execute({ googleId: "google_1", email: "a@b.com" });

    expect(result).toMatchObject({ requires2fa: false, accessToken: "at" });
    expect(tokens.signTwoFactorChallenge).not.toHaveBeenCalled();
  });

  it("rejects a suspended account even before reaching the 2FA check", async () => {
    const user = buildUser({ status: "SUSPENDED", twoFactorEnabled: true });
    const users = { findByGoogleId: jest.fn().mockResolvedValue(user) } as unknown as UserRepository;
    const tokens = { signTwoFactorChallenge: jest.fn() } as unknown as TokenService;
    const issueSession = { execute: jest.fn() } as unknown as IssueSessionUseCase;

    const useCase = new LoginWithGoogleUseCase(users, tokens, issueSession);

    await expect(useCase.execute({ googleId: "google_1", email: "a@b.com" })).rejects.toThrow(ForbiddenException);
  });
});
