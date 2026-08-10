import { ForbiddenException, type ExecutionContext } from "@nestjs/common";
import type { Reflector } from "@nestjs/core";
import { PermissionsGuard } from "./permissions.guard";
import type { PrismaService } from "../../prisma/prisma.service";
import type { RequestUser } from "../decorators/current-user.decorator";

function buildContext(user?: RequestUser): ExecutionContext {
  const request = { user };
  return {
    switchToHttp: () => ({ getRequest: () => request }),
    getHandler: () => ({}),
    getClass: () => ({}),
  } as unknown as ExecutionContext;
}

function buildReflector(overrides: { isPublic?: boolean; required?: { resource: string; action: string } }): Reflector {
  return {
    getAllAndOverride: (key: string) => {
      if (key === "isPublic") return overrides.isPublic;
      return overrides.required;
    },
  } as unknown as Reflector;
}

describe("PermissionsGuard", () => {
  it("denies a request whose principal has no roleId, instead of matching any role's grant", async () => {
    // Regression test: Prisma treats `roleId: undefined` in a `where` clause as "no filter",
    // not "match nothing" — a malformed principal (e.g. one derived from a token that was
    // never supposed to carry a role at all) must never reach that query.
    const prisma = { rolePermission: { findFirst: jest.fn() }, userPermission: { findFirst: jest.fn() } };
    const guard = new PermissionsGuard(
      buildReflector({ isPublic: false, required: { resource: "creators", action: "read" } }),
      prisma as unknown as PrismaService,
    );

    const context = buildContext({ id: "user_1", email: "a@b.com", roleId: "", roleName: "" });

    await expect(guard.canActivate(context)).rejects.toThrow(ForbiddenException);
    expect(prisma.rolePermission.findFirst).not.toHaveBeenCalled();
  });

  it("allows the request when the role has the required grant", async () => {
    const prisma = {
      rolePermission: { findFirst: jest.fn().mockResolvedValue({ roleId: "role_1" }) },
      userPermission: { findFirst: jest.fn().mockResolvedValue(null) },
    };
    const guard = new PermissionsGuard(
      buildReflector({ isPublic: false, required: { resource: "creators", action: "read" } }),
      prisma as unknown as PrismaService,
    );

    const context = buildContext({ id: "user_1", email: "a@b.com", roleId: "role_1", roleName: "CS" });

    await expect(guard.canActivate(context)).resolves.toBe(true);
  });
});
