import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});
export type LoginInput = z.infer<typeof loginSchema>;

export const loginResponseSchema = z.object({
  requires2fa: z.literal(true),
  challengeToken: z.string(),
}).or(
  z.object({
    requires2fa: z.literal(false),
    accessToken: z.string(),
  }),
);
export type LoginResponse = z.infer<typeof loginResponseSchema>;

export const verify2faSchema = z.object({
  challengeToken: z.string(),
  code: z.string().length(6),
});
export type Verify2faInput = z.infer<typeof verify2faSchema>;

export const enable2faResponseSchema = z.object({
  secret: z.string(),
  otpAuthUrl: z.string(),
});
export type Enable2faResponse = z.infer<typeof enable2faResponseSchema>;

export const confirm2faSchema = z.object({
  code: z.string().length(6),
});
export type Confirm2faInput = z.infer<typeof confirm2faSchema>;

export const refreshResponseSchema = z.object({
  accessToken: z.string(),
});
export type RefreshResponse = z.infer<typeof refreshResponseSchema>;

export const authenticatedUserSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  name: z.string(),
  avatarUrl: z.string().nullable(),
  role: z.string(),
  twoFactorEnabled: z.boolean(),
});
export type AuthenticatedUser = z.infer<typeof authenticatedUserSchema>;
