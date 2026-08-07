import type { TransactionStatus } from "@cs-hub/shared-types";
import { canTransitionTransactionStatus } from "./finance.entity";

describe("canTransitionTransactionStatus", () => {
  it("allows staying in the same status", () => {
    const statuses: TransactionStatus[] = ["PENDING", "PAID", "CANCELLED"];
    for (const status of statuses) {
      expect(canTransitionTransactionStatus(status, status)).toBe(true);
    }
  });

  it("allows PENDING -> PAID and PENDING -> CANCELLED", () => {
    expect(canTransitionTransactionStatus("PENDING", "PAID")).toBe(true);
    expect(canTransitionTransactionStatus("PENDING", "CANCELLED")).toBe(true);
  });

  it("treats PAID and CANCELLED as terminal", () => {
    expect(canTransitionTransactionStatus("PAID", "PENDING")).toBe(false);
    expect(canTransitionTransactionStatus("PAID", "CANCELLED")).toBe(false);
    expect(canTransitionTransactionStatus("CANCELLED", "PENDING")).toBe(false);
    expect(canTransitionTransactionStatus("CANCELLED", "PAID")).toBe(false);
  });
});
