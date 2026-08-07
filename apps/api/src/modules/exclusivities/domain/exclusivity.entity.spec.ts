import { daysRemaining } from "./exclusivity.entity";

describe("daysRemaining", () => {
  const now = new Date("2026-08-07T12:00:00.000Z");

  it("returns a positive count for a future end date", () => {
    expect(daysRemaining(new Date("2026-08-17T12:00:00.000Z"), now)).toBe(10);
  });

  it("returns zero for an end date that is today", () => {
    expect(daysRemaining(new Date("2026-08-07T18:00:00.000Z"), now)).toBe(1);
  });

  it("returns a negative count for an end date already in the past", () => {
    expect(daysRemaining(new Date("2026-08-01T12:00:00.000Z"), now)).toBe(-6);
  });
});
