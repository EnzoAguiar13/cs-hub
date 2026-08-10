import { Inject, Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { timingSafeEqual } from "node:crypto";
import { USER_REPOSITORY, type UserRepository } from "../domain/user.repository";
import { IssueSessionUseCase } from "./issue-session.use-case";
import type { LoginResult } from "./auth-result.types";

/**
 * Simplified entry point requested in place of per-user email/password login: everyone who
 * knows SITE_PIN gets in as the single account configured in SITE_PIN_USER_EMAIL (the seeded
 * admin by default). Deliberately does not touch LoginUserUseCase/VerifyTwoFactorUseCase/
 * LoginWithGoogleUseCase — those stay intact and working underneath so RBAC, per-user audit
 * trails ("responsible" fields throughout every module) and the session/JWT machinery are
 * unaffected; this just adds a second, simpler front door onto the same IssueSessionUseCase.
 */
@Injectable()
export class LoginWithPinUseCase {
  constructor(
    @Inject(USER_REPOSITORY) private readonly users: UserRepository,
    private readonly issueSession: IssueSessionUseCase,
    private readonly config: ConfigService,
  ) {}

  async execute(pin: string): Promise<LoginResult> {
    if (!this.isCorrectPin(pin)) {
      throw new UnauthorizedException("PIN inválido");
    }

    const email = this.config.getOrThrow<string>("SITE_PIN_USER_EMAIL");
    const user = await this.users.findByEmail(email);
    if (!user || user.status !== "ACTIVE") {
      throw new UnauthorizedException("Conta de acesso por PIN não está configurada corretamente");
    }

    const session = await this.issueSession.execute(user);
    return { requires2fa: false, ...session, user };
  }

  private isCorrectPin(pin: string): boolean {
    const expected = Buffer.from(this.config.getOrThrow<string>("SITE_PIN"));
    const provided = Buffer.from(pin);
    // Constant-time compare — a PIN this short is guessable by brute force regardless, but
    // there's no reason to leak timing information on top of that.
    return expected.length === provided.length && timingSafeEqual(expected, provided);
  }
}
