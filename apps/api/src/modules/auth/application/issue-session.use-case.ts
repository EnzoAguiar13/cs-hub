import { Inject, Injectable } from "@nestjs/common";
import { USER_REPOSITORY, type UserRepository } from "../domain/user.repository";
import { TOKEN_SERVICE, type TokenService } from "../domain/token.service";
import type { AuthUser } from "../domain/auth.types";
import type { SessionTokens } from "./auth-result.types";

/** Shared by LoginUser/Verify2fa/LoginWithGoogle once a user is fully authenticated. */
@Injectable()
export class IssueSessionUseCase {
  constructor(
    @Inject(USER_REPOSITORY) private readonly users: UserRepository,
    @Inject(TOKEN_SERVICE) private readonly tokens: TokenService,
  ) {}

  async execute(user: AuthUser): Promise<SessionTokens> {
    const accessToken = await this.tokens.signAccessToken({
      sub: user.id,
      email: user.email,
      roleId: user.roleId,
      roleName: user.roleName,
    });
    const { token: refreshToken, tokenHash, expiresAt } = await this.tokens.signRefreshToken(user.id);
    await this.users.storeRefreshToken(user.id, tokenHash, expiresAt);
    return { accessToken, refreshToken };
  }
}
