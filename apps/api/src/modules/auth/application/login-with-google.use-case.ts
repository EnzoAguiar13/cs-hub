import { ForbiddenException, Inject, Injectable } from "@nestjs/common";
import { USER_REPOSITORY, type UserRepository } from "../domain/user.repository";
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

    // Google's own sign-in already proves identity, so the TOTP challenge (designed for the
    // password flow) is not layered on top here — avoids a second redirect mid-OAuth-callback.
    const session = await this.issueSession.execute(user);
    return { requires2fa: false, ...session, user };
  }
}
