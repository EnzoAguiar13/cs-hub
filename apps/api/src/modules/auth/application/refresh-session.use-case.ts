import { Inject, Injectable, UnauthorizedException } from "@nestjs/common";
import { USER_REPOSITORY, type UserRepository } from "../domain/user.repository";
import { TOKEN_SERVICE, type TokenService } from "../domain/token.service";
import { IssueSessionUseCase } from "./issue-session.use-case";
import type { SessionTokens } from "./auth-result.types";

@Injectable()
export class RefreshSessionUseCase {
  constructor(
    @Inject(USER_REPOSITORY) private readonly users: UserRepository,
    @Inject(TOKEN_SERVICE) private readonly tokens: TokenService,
    private readonly issueSession: IssueSessionUseCase,
  ) {}

  async execute(refreshTokenRaw: string): Promise<SessionTokens> {
    let sub: string;
    try {
      ({ sub } = await this.tokens.verifyRefreshToken(refreshTokenRaw));
    } catch {
      throw new UnauthorizedException("Sessão expirada, faça login novamente");
    }

    const tokenHash = this.tokens.hashRefreshToken(refreshTokenRaw);
    const stored = await this.users.findRefreshToken(tokenHash);
    if (!stored || stored.revokedAt || stored.expiresAt < new Date() || stored.userId !== sub) {
      throw new UnauthorizedException("Sessão expirada, faça login novamente");
    }

    const user = await this.users.findById(sub);
    if (!user || user.status !== "ACTIVE") {
      throw new UnauthorizedException("Sessão expirada, faça login novamente");
    }

    // rotation: invalidate the used refresh token before issuing a new one
    await this.users.revokeRefreshToken(tokenHash);
    return this.issueSession.execute(user);
  }
}
