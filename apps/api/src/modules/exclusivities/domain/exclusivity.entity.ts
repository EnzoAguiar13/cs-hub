/** Positive = days until expiry, negative = days past expiry. Never stored, always derived. */
export function daysRemaining(endDate: Date, now: Date = new Date()): number {
  const msPerDay = 24 * 60 * 60 * 1000;
  return Math.ceil((endDate.getTime() - now.getTime()) / msPerDay);
}
