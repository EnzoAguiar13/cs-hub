import { canTransitionWithdrawalStatus } from "./withdrawal.entity";

describe("canTransitionWithdrawalStatus", () => {
  it("follows the full happy path from NOT_AVAILABLE to PAID", () => {
    expect(canTransitionWithdrawalStatus("NOT_AVAILABLE", "AVAILABLE")).toBe(true);
    expect(canTransitionWithdrawalStatus("AVAILABLE", "PENDING")).toBe(true);
    expect(canTransitionWithdrawalStatus("PENDING", "SUBMITTED")).toBe(true);
    expect(canTransitionWithdrawalStatus("SUBMITTED", "IN_REVIEW")).toBe(true);
    expect(canTransitionWithdrawalStatus("IN_REVIEW", "APPROVED")).toBe(true);
    expect(canTransitionWithdrawalStatus("APPROVED", "PAID")).toBe(true);
  });

  it("allows cancelling from any non-terminal status", () => {
    expect(canTransitionWithdrawalStatus("AVAILABLE", "CANCELLED")).toBe(true);
    expect(canTransitionWithdrawalStatus("PENDING", "CANCELLED")).toBe(true);
    expect(canTransitionWithdrawalStatus("IN_REVIEW", "CANCELLED")).toBe(true);
  });

  it("allows rejecting only from IN_REVIEW", () => {
    expect(canTransitionWithdrawalStatus("IN_REVIEW", "REJECTED")).toBe(true);
    expect(canTransitionWithdrawalStatus("SUBMITTED", "REJECTED")).toBe(false);
  });

  it("treats PAID, REJECTED and CANCELLED as terminal", () => {
    expect(canTransitionWithdrawalStatus("PAID", "AVAILABLE")).toBe(false);
    expect(canTransitionWithdrawalStatus("REJECTED", "IN_REVIEW")).toBe(false);
    expect(canTransitionWithdrawalStatus("CANCELLED", "AVAILABLE")).toBe(false);
  });

  it("rejects skipping the flow (e.g. AVAILABLE straight to PAID)", () => {
    expect(canTransitionWithdrawalStatus("AVAILABLE", "PAID")).toBe(false);
    expect(canTransitionWithdrawalStatus("NOT_AVAILABLE", "PAID")).toBe(false);
  });
});
