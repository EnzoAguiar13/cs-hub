import { Inject, Injectable, UnauthorizedException } from "@nestjs/common";
import { USER_REPOSITORY, type UserRepository } from "../domain/user.repository";
import { PASSWORD_HASHER, type PasswordHasher } from "../domain/ports";
import { TOKEN_SERVICE, type TokenService } from "../domain/token.service";
import { IssueSessionUseCase } from "./issue-session.use-case";
import type { LoginResult } from "./auth-result.types";

@Injectable()
export class LoginUserUseCase {
  constructor(
    @Inject(USER_REPOSITORY) private readonly users: UserRepository,
    @Inject(PASSWORD_HASHER) private readonly passwordHasher: PasswordHasher,
    @Inject(TOKEN_SERVICE) private readonly tokens: TokenService,
    private readonly issueSession: IssueSessionUseCase,
  ) {}

  async execute(email: string, password: string): Promise<LoginResult> {
    const user = await this.users.findByEmail(email);
    if (!user || !user.passwordHash || user.status !== "ACTIVE") {
      throw new UnauthorizedException("Credenciais inválidas");
    }

    const passwordValid = await this.passwordHasher.verify(user.passwordHash, password);
    if (!passwordValid) {
      throw new UnauthorizedException("Credenciais inválidas");
    }

    if (user.twoFactorEnabled) {
      const challengeToken = await this.tokens.signTwoFactorChallenge(user.id);
      return { requires2fa: true, challengeToken };
    }

    const session = await this.issueSession.execute(user);
    return { requires2fa: false, ...session, user };
  }
}
