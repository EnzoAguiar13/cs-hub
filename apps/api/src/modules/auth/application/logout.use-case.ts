import { Inject, Injectable } from "@nestjs/common";
import { TOKEN_SERVICE, type TokenService } from "../domain/token.service";
import { USER_REPOSITORY, type UserRepository } from "../domain/user.repository";

@Injectable()
export class LogoutUseCase {
  constructor(
    @Inject(TOKEN_SERVICE) private readonly tokens: TokenService,
    @Inject(USER_REPOSITORY) private readonly users: UserRepository,
  ) {}

  async execute(refreshTokenRaw: string): Promise<void> {
    const tokenHash = this.tokens.hashRefreshToken(refreshTokenRaw);
    await this.users.revokeRefreshToken(tokenHash);
  }
}
