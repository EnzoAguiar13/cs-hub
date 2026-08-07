import { z } from "zod";

export const roleNameSchema = z.enum([
  "ADMIN",
  "MANAGER",
  "CS",
  "FINANCE",
  "MARKETING",
  "AFFILIATE",
  "VIEWER",
]);
export type RoleName = z.infer<typeof roleNameSchema>;

export const permissionEffectSchema = z.enum(["GRANT", "DENY"]);
export type PermissionEffect = z.infer<typeof permissionEffectSchema>;

export const permissionActionSchema = z.enum([
  "create",
  "read",
  "update",
  "delete",
  "export",
]);
export type PermissionAction = z.infer<typeof permissionActionSchema>;
