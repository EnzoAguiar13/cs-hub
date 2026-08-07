import type { AuthenticatedUser } from "@cs-hub/shared-types";
import type { AuthUser } from "../domain/auth.types";

export function toPublicUser(user: AuthUser): AuthenticatedUser {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    avatarUrl: user.avatarUrl,
    role: user.roleName,
    twoFactorEnabled: user.twoFactorEnabled,
  };
}
