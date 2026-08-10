import { Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import type { JwtAccessPayload } from "../domain/auth.types";
import type { RequestUser } from "../../../common/decorators/current-user.decorator";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, "jwt") {
  constructor(config: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.getOrThrow<string>("JWT_ACCESS_SECRET"),
    });
  }

  validate(payload: JwtAccessPayload | { sub: string; purpose: string }): RequestUser {
    // The 2FA challenge token is signed with this same secret (5-minute TTL, issued before
    // the TOTP code is verified) so it passes signature verification here too. Without this
    // check it would be accepted as a full access token — and RequestUser.roleId would come
    // out `undefined`, which PermissionsGuard's Prisma query treats as "no role filter",
    // granting every permission any role holds. Reject it explicitly instead of relying on
    // downstream checks to notice a malformed principal.
    if ("purpose" in payload) {
      throw new UnauthorizedException("Token inválido para esta operação");
    }
    return { id: payload.sub, email: payload.email, roleId: payload.roleId, roleName: payload.roleName };
  }
}
