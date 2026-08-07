import type { CreatorStatus } from "@cs-hub/shared-types";
import { canTransitionStatus } from "./creator.entity";

describe("canTransitionStatus", () => {
  it("always allows staying in the same status", () => {
    const statuses: CreatorStatus[] = ["ACTIVE", "INACTIVE", "BLOCKED"];
    for (const status of statuses) {
      expect(canTransitionStatus(status, status)).toBe(true);
    }
  });

  it.each([
    ["ACTIVE", "INACTIVE"],
    ["ACTIVE", "BLOCKED"],
    ["INACTIVE", "ACTIVE"],
    ["INACTIVE", "BLOCKED"],
    ["BLOCKED", "ACTIVE"],
    ["BLOCKED", "INACTIVE"],
  ] satisfies Array<[CreatorStatus, CreatorStatus]>)("allows %s -> %s", (from, to) => {
    expect(canTransitionStatus(from, to)).toBe(true);
  });
});
