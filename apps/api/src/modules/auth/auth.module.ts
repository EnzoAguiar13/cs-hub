import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import { AuthController } from "./presentation/auth.controller";
import { JwtStrategy } from "./presentation/jwt.strategy";
import { GoogleStrategy } from "./presentation/google.strategy";
import { USER_REPOSITORY } from "./domain/user.repository";
import { PASSWORD_HASHER, TWO_FACTOR_SERVICE, ENCRYPTION_SERVICE } from "./domain/ports";
import { TOKEN_SERVICE } from "./domain/token.service";
import { PrismaUserRepository } from "./infrastructure/prisma-user.repository";
import { ArgonPasswordHasher } from "./infrastructure/argon-password-hasher";
import { TotpService } from "./infrastructure/totp.service";
import { JwtTokenService } from "./infrastructure/jwt-token.service";
import { AesEncryptionService } from "./infrastructure/aes-encryption.service";
import { LoginUserUseCase } from "./application/login-user.use-case";
import { VerifyTwoFactorUseCase } from "./application/verify-two-factor.use-case";
import { RefreshSessionUseCase } from "./application/refresh-session.use-case";
import { LogoutUseCase } from "./application/logout.use-case";
import { EnableTwoFactorUseCase } from "./application/enable-two-factor.use-case";
import { ConfirmTwoFactorUseCase } from "./application/confirm-two-factor.use-case";
import { LoginWithGoogleUseCase } from "./application/login-with-google.use-case";
import { LoginWithPinUseCase } from "./application/login-with-pin.use-case";
import { IssueSessionUseCase } from "./application/issue-session.use-case";

@Module({
  imports: [PassportModule, JwtModule.register({})],
  controllers: [AuthController],
  providers: [
    { provide: USER_REPOSITORY, useClass: PrismaUserRepository },
    { provide: PASSWORD_HASHER, useClass: ArgonPasswordHasher },
    { provide: TWO_FACTOR_SERVICE, useClass: TotpService },
    { provide: TOKEN_SERVICE, useClass: JwtTokenService },
    { provide: ENCRYPTION_SERVICE, useClass: AesEncryptionService },
    JwtStrategy,
    GoogleStrategy,
    IssueSessionUseCase,
    LoginUserUseCase,
    VerifyTwoFactorUseCase,
    RefreshSessionUseCase,
    LogoutUseCase,
    EnableTwoFactorUseCase,
    ConfirmTwoFactorUseCase,
    LoginWithGoogleUseCase,
    LoginWithPinUseCase,
  ],
  exports: [ENCRYPTION_SERVICE],
})
export class AuthModule {}
