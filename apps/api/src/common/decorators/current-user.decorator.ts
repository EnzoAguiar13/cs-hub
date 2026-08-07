import { createParamDecorator, type ExecutionContext } from "@nestjs/common";
import type { Request } from "express";

export interface RequestUser {
  id: string;
  email: string;
  roleId: string;
  roleName: string;
}

export const CurrentUser = createParamDecorator((_data: unknown, ctx: ExecutionContext): RequestUser => {
  const request = ctx.switchToHttp().getRequest<Request & { user: RequestUser }>();
  return request.user;
});
