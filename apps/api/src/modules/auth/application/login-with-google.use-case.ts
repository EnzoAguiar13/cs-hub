import { ForbiddenException, Inject, Injectable } from "@nestjs/common";
import { USER_REPOSITORY, type UserRepository } from "../domain/user.repository";
import { TOKEN_SERVICE, type TokenService } from "../domain/token.service";
import { IssueSessionUseCase } from "./issue-session.use-case";
import type { LoginResult } from "./auth-result.types";

export interface GoogleProfile {
  googleId: string;
  email: string;
}

/**
 * Google accounts must already have a CS Hub user provisioned by an admin — there is no
 * self-service signup in an internal CRM. First successful login just links the googleId.
 */
@Injectable()
export class LoginWithGoogleUseCase {
  constructor(
    @Inject(USER_REPOSITORY) private readonly users: UserRepository,
    @Inject(TOKEN_SERVICE) private readonly tokens: TokenService,
    private readonly issueSession: IssueSessionUseCase,
  ) {}

  async execute(profile: GoogleProfile): Promise<LoginResult> {
    let user = await this.users.findByGoogleId(profile.googleId);

    if (!user) {
      const byEmail = await this.users.findByEmail(profile.email);
      if (!byEmail) {
        throw new ForbiddenException(
          "Conta não provisionada no CS Hub. Peça a um administrador para criar seu acesso.",
        );
      }
      await this.users.linkGoogleAccount(byEmail.id, profile.googleId);
      user = { ...byEmail, googleId: profile.googleId };
    }

    if (user.status !== "ACTIVE") {
      throw new ForbiddenException("Conta suspensa. Contate um administrador.");
    }

    // Google's own sign-in proves identity but not possession of the second factor — a
    // 2FA-enabled account must still clear the TOTP challenge, the same as the password flow.
    if (user.twoFactorEnabled) {
      const challengeToken = await this.tokens.signTwoFactorChallenge(user.id);
      return { requires2fa: true, challengeToken };
    }

    const session = await this.issueSession.execute(user);
    return { requires2fa: false, ...session, user };
  }
}
