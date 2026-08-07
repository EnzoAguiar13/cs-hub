import type { DealStatus } from "@cs-hub/shared-types";
import { canTransitionDealStatus } from "./deal.entity";

describe("canTransitionDealStatus", () => {
  it("allows staying in the same status", () => {
    const statuses: DealStatus[] = ["ACTIVE", "PAUSED", "ENDED"];
    for (const status of statuses) {
      expect(canTransitionDealStatus(status, status)).toBe(true);
    }
  });

  it("allows ACTIVE <-> PAUSED and either into ENDED", () => {
    expect(canTransitionDealStatus("ACTIVE", "PAUSED")).toBe(true);
    expect(canTransitionDealStatus("PAUSED", "ACTIVE")).toBe(true);
    expect(canTransitionDealStatus("ACTIVE", "ENDED")).toBe(true);
    expect(canTransitionDealStatus("PAUSED", "ENDED")).toBe(true);
  });

  it("treats ENDED as terminal — no transition back out of it", () => {
    expect(canTransitionDealStatus("ENDED", "ACTIVE")).toBe(false);
    expect(canTransitionDealStatus("ENDED", "PAUSED")).toBe(false);
  });
});
