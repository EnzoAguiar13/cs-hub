import {
  Body,
  Controller,
  Get,
  HttpCode,
  Inject,
  NotFoundException,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
  UsePipes,
} from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { ConfigService } from "@nestjs/config";
import type { Request, Response } from "express";
import { confirm2faSchema, loginSchema, verify2faSchema } from "@cs-hub/shared-types";
import { Public } from "../../../common/decorators/public.decorator";
import { CurrentUser, type RequestUser } from "../../../common/decorators/current-user.decorator";
import { ZodValidationPipe } from "../../../common/pipes/zod-validation.pipe";
import { USER_REPOSITORY, type UserRepository } from "../domain/user.repository";
import { LoginUserUseCase } from "../application/login-user.use-case";
import { VerifyTwoFactorUseCase } from "../application/verify-two-factor.use-case";
import { RefreshSessionUseCase } from "../application/refresh-session.use-case";
import { LogoutUseCase } from "../application/logout.use-case";
import { EnableTwoFactorUseCase } from "../application/enable-two-factor.use-case";
import { ConfirmTwoFactorUseCase } from "../application/confirm-two-factor.use-case";
import { LoginWithGoogleUseCase, type GoogleProfile } from "../application/login-with-google.use-case";
import { toPublicUser } from "./auth.mapper";

const REFRESH_COOKIE = "cshub_refresh_token";
const REFRESH_COOKIE_PATH = "/auth";

@Controller("auth")
export class AuthController {
  constructor(
    private readonly loginUser: LoginUserUseCase,
    private readonly verifyTwoFactor: VerifyTwoFactorUseCase,
    private readonly refreshSession: RefreshSessionUseCase,
    private readonly logout: LogoutUseCase,
    private readonly enableTwoFactor: EnableTwoFactorUseCase,
    private readonly confirmTwoFactor: ConfirmTwoFactorUseCase,
    private readonly loginWithGoogle: LoginWithGoogleUseCase,
    private readonly config: ConfigService,
    @Inject(USER_REPOSITORY) private readonly users: UserRepository,
  ) {}

  @Get("me")
  async me(@CurrentUser() user: RequestUser) {
    const found = await this.users.findById(user.id);
    if (!found) throw new NotFoundException("Usuário não encontrado");
    return toPublicUser(found);
  }

  @Public()
  @Post("login")
  @HttpCode(200)
  @UsePipes(new ZodValidationPipe(loginSchema))
  async login(@Body() body: { email: string; password: string }, @Res({ passthrough: true }) res: Response) {
    const result = await this.loginUser.execute(body.email, body.password);
    if (result.requires2fa) return result;

    this.setRefreshCookie(res, result.refreshToken);
    return { requires2fa: false, accessToken: result.accessToken, user: toPublicUser(result.user) };
  }

  @Public()
  @Post("2fa/verify")
  @HttpCode(200)
  @UsePipes(new ZodValidationPipe(verify2faSchema))
  async verify2fa(
    @Body() body: { challengeToken: string; code: string },
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.verifyTwoFactor.execute(body.challengeToken, body.code);
    if (result.requires2fa) return result;

    this.setRefreshCookie(res, result.refreshToken);
    return { requires2fa: false, accessToken: result.accessToken, user: toPublicUser(result.user) };
  }

  @Public()
  @Post("refresh")
  @HttpCode(200)
  async refresh(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const refreshToken = req.cookies?.[REFRESH_COOKIE];
    if (!refreshToken) throw new UnauthorizedException("Sessão não encontrada");

    const session = await this.refreshSession.execute(refreshToken);
    this.setRefreshCookie(res, session.refreshToken);
    return { accessToken: session.accessToken };
  }

  @Public()
  @Post("logout")
  @HttpCode(204)
  async doLogout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const refreshToken = req.cookies?.[REFRESH_COOKIE];
    if (refreshToken) await this.logout.execute(refreshToken);
    res.clearCookie(REFRESH_COOKIE, { path: REFRESH_COOKIE_PATH });
  }

  @Post("2fa/enable")
  @HttpCode(200)
  enable2fa(@CurrentUser() user: RequestUser) {
    return this.enableTwoFactor.execute(user.id);
  }

  @Post("2fa/confirm")
  @HttpCode(204)
  @UsePipes(new ZodValidationPipe(confirm2faSchema))
  async confirm2fa(@CurrentUser() user: RequestUser, @Body() body: { code: string }) {
    await this.confirmTwoFactor.execute(user.id, body.code);
  }

  @Public()
  @UseGuards(AuthGuard("google"))
  @Get("google")
  googleLogin() {
    // handled by GoogleStrategy redirect; body never reached
  }

  @Public()
  @UseGuards(AuthGuard("google"))
  @Get("google/callback")
  async googleCallback(@Req() req: Request, @Res() res: Response) {
    const profile = req.user as GoogleProfile;
    const webOrigin = this.config.get<string>("CORS_ORIGIN", "http://localhost:3000");

    try {
      const result = await this.loginWithGoogle.execute(profile);
      if (result.requires2fa) {
        // LoginWithGoogleUseCase never returns this branch today, but keep the contract honest.
        res.redirect(`${webOrigin}/login?error=2fa_required`);
        return;
      }
      this.setRefreshCookie(res, result.refreshToken);
      res.redirect(`${webOrigin}/auth/google/callback#accessToken=${encodeURIComponent(result.accessToken)}`);
    } catch {
      res.redirect(`${webOrigin}/login?error=google_not_provisioned`);
    }
  }

  private setRefreshCookie(res: Response, refreshToken: string) {
    res.cookie(REFRESH_COOKIE, refreshToken, {
      httpOnly: true,
      secure: this.config.get("NODE_ENV") === "production",
      sameSite: "lax",
      path: REFRESH_COOKIE_PATH,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
  }
}
