import { Inject, Injectable, UnauthorizedException } from "@nestjs/common";
import { USER_REPOSITORY, type UserRepository } from "../domain/user.repository";
import { TOKEN_SERVICE, type TokenService } from "../domain/token.service";
import { TWO_FACTOR_SERVICE, type TwoFactorService } from "../domain/ports";
import { IssueSessionUseCase } from "./issue-session.use-case";
import type { LoginResult } from "./auth-result.types";

@Injectable()
export class VerifyTwoFactorUseCase {
  constructor(
    @Inject(USER_REPOSITORY) private readonly users: UserRepository,
    @Inject(TOKEN_SERVICE) private readonly tokens: TokenService,
    @Inject(TWO_FACTOR_SERVICE) private readonly twoFactor: TwoFactorService,
    private readonly issueSession: IssueSessionUseCase,
  ) {}

  async execute(challengeToken: string, code: string): Promise<LoginResult> {
    let userId: string;
    try {
      const payload = await this.tokens.verifyTwoFactorChallenge(challengeToken);
      userId = payload.sub;
    } catch {
      throw new UnauthorizedException("Desafio de 2FA inválido ou expirado");
    }

    const user = await this.users.findById(userId);
    if (!user || !user.twoFactorEnabled || !user.twoFactorSecret) {
      throw new UnauthorizedException("2FA não configurado para este usuário");
    }

    const valid = this.twoFactor.verify(user.twoFactorSecret, code);
    if (!valid) {
      throw new UnauthorizedException("Código 2FA inválido");
    }

    const session = await this.issueSession.execute(user);
    return { requires2fa: false, ...session, user };
  }
}
