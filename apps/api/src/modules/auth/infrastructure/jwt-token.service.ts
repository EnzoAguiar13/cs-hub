import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { createHash } from "node:crypto";
import ms from "ms";
import type { TokenService } from "../domain/token.service";
import type { JwtAccessPayload, TwoFactorChallengePayload } from "../domain/auth.types";

@Injectable()
export class JwtTokenService implements TokenService {
  constructor(
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  signAccessToken(payload: JwtAccessPayload): Promise<string> {
    return this.jwt.signAsync(payload, {
      secret: this.config.getOrThrow("JWT_ACCESS_SECRET"),
      expiresIn: this.config.get("JWT_ACCESS_TTL", "15m"),
    });
  }

  async signRefreshToken(userId: string) {
    const ttl = this.config.get<string>("JWT_REFRESH_TTL", "7d");
    const token = await this.jwt.signAsync(
      { sub: userId },
      { secret: this.config.getOrThrow("JWT_REFRESH_SECRET"), expiresIn: ttl },
    );
    const expiresAt = new Date(Date.now() + ms(ttl));
    return { token, tokenHash: this.hashRefreshToken(token), expiresAt };
  }

  signTwoFactorChallenge(userId: string): Promise<string> {
    return this.jwt.signAsync(
      { sub: userId, purpose: "2fa-challenge" } satisfies TwoFactorChallengePayload,
      { secret: this.config.getOrThrow("JWT_ACCESS_SECRET"), expiresIn: "5m" },
    );
  }

  async verifyTwoFactorChallenge(token: string): Promise<TwoFactorChallengePayload> {
    return this.jwt.verifyAsync<TwoFactorChallengePayload>(token, {
      secret: this.config.getOrThrow("JWT_ACCESS_SECRET"),
    });
  }

  hashRefreshToken(token: string): string {
    return createHash("sha256").update(token).digest("hex");
  }

  async verifyRefreshToken(token: string): Promise<{ sub: string }> {
    return this.jwt.verifyAsync<{ sub: string }>(token, {
      secret: this.config.getOrThrow("JWT_REFRESH_SECRET"),
    });
  }
}
