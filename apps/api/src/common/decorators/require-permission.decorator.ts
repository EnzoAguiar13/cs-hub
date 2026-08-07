import { SetMetadata } from "@nestjs/common";
import type { PermissionAction } from "@cs-hub/shared-types";

export const PERMISSION_KEY = "requiredPermission";

export interface RequiredPermission {
  resource: string;
  action: PermissionAction;
}

/** Declares the resource:action a route needs. Enforced by PermissionsGuard. */
export const RequirePermission = (resource: string, action: PermissionAction) =>
  SetMetadata(PERMISSION_KEY, { resource, action } satisfies RequiredPermission);
