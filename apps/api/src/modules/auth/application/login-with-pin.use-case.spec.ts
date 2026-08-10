import { UnauthorizedException } from "@nestjs/common";
import type { ConfigService } from "@nestjs/config";
import type { AuthUser } from "../domain/auth.types";
import type { UserRepository } from "../domain/user.repository";
import type { IssueSessionUseCase } from "./issue-session.use-case";
import { LoginWithPinUseCase } from "./login-with-pin.use-case";

function buildUser(overrides: Partial<AuthUser> = {}): AuthUser {
  return {
    id: "user_1",
    email: "admin@cshub.local",
    name: "Admin",
    avatarUrl: null,
    passwordHash: "hash",
    googleId: null,
    roleId: "role_1",
    roleName: "ADMIN",
    twoFactorSecret: null,
    twoFactorEnabled: false,
    status: "ACTIVE",
    ...overrides,
  };
}

function buildConfig(values: Record<string, string>): ConfigService {
  return { getOrThrow: (key: string) => values[key] } as unknown as ConfigService;
}

describe("LoginWithPinUseCase", () => {
  it("issues a session for the configured user when the PIN matches", async () => {
    const user = buildUser();
    const users = { findByEmail: jest.fn().mockResolvedValue(user) } as unknown as UserRepository;
    const issueSession = {
      execute: jest.fn().mockResolvedValue({ accessToken: "at", refreshToken: "rt" }),
    } as unknown as IssueSessionUseCase;
    const config = buildConfig({ SITE_PIN: "9090", SITE_PIN_USER_EMAIL: "admin@cshub.local" });

    const useCase = new LoginWithPinUseCase(users, issueSession, config);
    const result = await useCase.execute("9090");

    expect(result).toMatchObject({ requires2fa: false, accessToken: "at" });
    expect(users.findByEmail).toHaveBeenCalledWith("admin@cshub.local");
  });

  it("rejects an incorrect PIN without looking up any user", async () => {
    const users = { findByEmail: jest.fn() } as unknown as UserRepository;
    const issueSession = { execute: jest.fn() } as unknown as IssueSessionUseCase;
    const config = buildConfig({ SITE_PIN: "9090", SITE_PIN_USER_EMAIL: "admin@cshub.local" });

    const useCase = new LoginWithPinUseCase(users, issueSession, config);

    await expect(useCase.execute("1234")).rejects.toThrow(UnauthorizedException);
    expect(users.findByEmail).not.toHaveBeenCalled();
  });

  it("rejects a PIN of a different length than the configured one", async () => {
    const users = { findByEmail: jest.fn() } as unknown as UserRepository;
    const issueSession = { execute: jest.fn() } as unknown as IssueSessionUseCase;
    const config = buildConfig({ SITE_PIN: "9090", SITE_PIN_USER_EMAIL: "admin@cshub.local" });

    const useCase = new LoginWithPinUseCase(users, issueSession, config);

    await expect(useCase.execute("90909090")).rejects.toThrow(UnauthorizedException);
  });

  it("rejects when the configured account is missing or inactive", async () => {
    const users = { findByEmail: jest.fn().mockResolvedValue(null) } as unknown as UserRepository;
    const issueSession = { execute: jest.fn() } as unknown as IssueSessionUseCase;
    const config = buildConfig({ SITE_PIN: "9090", SITE_PIN_USER_EMAIL: "admin@cshub.local" });

    const useCase = new LoginWithPinUseCase(users, issueSession, config);

    await expect(useCase.execute("9090")).rejects.toThrow(UnauthorizedException);
  });
});
