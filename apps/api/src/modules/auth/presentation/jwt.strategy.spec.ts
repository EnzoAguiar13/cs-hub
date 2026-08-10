import { UnauthorizedException } from "@nestjs/common";
import type { ConfigService } from "@nestjs/config";
import { JwtStrategy } from "./jwt.strategy";

function buildStrategy() {
  const config = { getOrThrow: () => "test-secret" } as unknown as ConfigService;
  return new JwtStrategy(config);
}

describe("JwtStrategy", () => {
  it("accepts a real access-token payload and maps it to a RequestUser", () => {
    const strategy = buildStrategy();
    const result = strategy.validate({ sub: "user_1", email: "a@b.com", roleId: "role_1", roleName: "ADMIN" });
    expect(result).toEqual({ id: "user_1", email: "a@b.com", roleId: "role_1", roleName: "ADMIN" });
  });

  it("rejects a 2FA challenge token even though it is signed with the same secret", () => {
    const strategy = buildStrategy();
    expect(() => strategy.validate({ sub: "user_1", purpose: "2fa-challenge" })).toThrow(UnauthorizedException);
  });
});
