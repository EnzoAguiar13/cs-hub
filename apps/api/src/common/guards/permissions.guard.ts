import { ForbiddenException, Injectable, type CanActivate, type ExecutionContext } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { IS_PUBLIC_KEY } from "../decorators/public.decorator";
import { PERMISSION_KEY, type RequiredPermission } from "../decorators/require-permission.decorator";
import { PrismaService } from "../../prisma/prisma.service";
import type { RequestUser } from "../decorators/current-user.decorator";
import type { Request } from "express";

/**
 * Resolves effective access as: role's granted permissions, then applies per-user
 * overrides on top. A DENY override always wins over a GRANT, whether the GRANT came
 * from the role or from another override.
 */
@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const required = this.reflector.getAllAndOverride<RequiredPermission | undefined>(PERMISSION_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!required) return true;

    const request = context.switchToHttp().getRequest<Request & { user?: RequestUser }>();
    const user = request.user;
    if (!user) throw new ForbiddenException("Not authenticated");

    const [roleGrant, override] = await Promise.all([
      this.prisma.rolePermission.findFirst({
        where: {
          roleId: user.roleId,
          permission: { resource: required.resource, action: required.action },
        },
      }),
      this.prisma.userPermission.findFirst({
        where: {
          userId: user.id,
          permission: { resource: required.resource, action: required.action },
        },
      }),
    ]);

    if (override?.effect === "DENY") {
      throw new ForbiddenException(`Missing permission ${required.resource}:${required.action}`);
    }
    if (override?.effect === "GRANT" || roleGrant) return true;

    throw new ForbiddenException(`Missing permission ${required.resource}:${required.action}`);
  }
}
