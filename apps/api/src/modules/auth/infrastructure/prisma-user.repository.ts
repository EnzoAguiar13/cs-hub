import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../../prisma/prisma.service";
import type { UserRepository } from "../domain/user.repository";
import type { AuthUser } from "../domain/auth.types";

@Injectable()
export class PrismaUserRepository implements UserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByEmail(email: string): Promise<AuthUser | null> {
    const user = await this.prisma.user.findUnique({ where: { email }, include: { role: true } });
    return user ? this.toAuthUser(user) : null;
  }

  async findById(id: string): Promise<AuthUser | null> {
    const user = await this.prisma.user.findUnique({ where: { id }, include: { role: true } });
    return user ? this.toAuthUser(user) : null;
  }

  async findByGoogleId(googleId: string): Promise<AuthUser | null> {
    const user = await this.prisma.user.findUnique({ where: { googleId }, include: { role: true } });
    return user ? this.toAuthUser(user) : null;
  }

  async linkGoogleAccount(userId: string, googleId: string): Promise<void> {
    await this.prisma.user.update({ where: { id: userId }, data: { googleId } });
  }

  async setTwoFactorSecret(userId: string, secret: string): Promise<void> {
    await this.prisma.user.update({ where: { id: userId }, data: { twoFactorSecret: secret } });
  }

  async confirmTwoFactorEnabled(userId: string): Promise<void> {
    await this.prisma.user.update({ where: { id: userId }, data: { twoFactorEnabled: true } });
  }

  async storeRefreshToken(userId: string, tokenHash: string, expiresAt: Date): Promise<void> {
    await this.prisma.refreshToken.create({ data: { userId, tokenHash, expiresAt } });
  }

  async findRefreshToken(tokenHash: string) {
    const token = await this.prisma.refreshToken.findUnique({ where: { tokenHash } });
    if (!token) return null;
    return { userId: token.userId, expiresAt: token.expiresAt, revokedAt: token.revokedAt };
  }

  async revokeRefreshToken(tokenHash: string): Promise<void> {
    await this.prisma.refreshToken.updateMany({
      where: { tokenHash, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }

  private toAuthUser(user: {
    id: string;
    email: string;
    name: string;
    avatarUrl: string | null;
    passwordHash: string | null;
    googleId: string | null;
    roleId: string;
    role: { name: string };
    twoFactorSecret: string | null;
    twoFactorEnabled: boolean;
    status: "ACTIVE" | "SUSPENDED";
  }): AuthUser {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      avatarUrl: user.avatarUrl,
      passwordHash: user.passwordHash,
      googleId: user.googleId,
      roleId: user.roleId,
      roleName: user.role.name,
      twoFactorSecret: user.twoFactorSecret,
      twoFactorEnabled: user.twoFactorEnabled,
      status: user.status,
    };
  }
}
