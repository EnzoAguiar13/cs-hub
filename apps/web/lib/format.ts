export function formatCentsToBRL(cents: number): string {
  return (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function parseBRLToCents(value: string): number {
  const normalized = value.replace(/[^\d,.-]/g, "").replace(/\.(?=\d{3},)/g, "").replace(",", ".");
  const amount = Number.parseFloat(normalized);
  return Number.isFinite(amount) ? Math.round(amount * 100) : 0;
}

export function formatDate(value: string | Date): string {
  return new Date(value).toLocaleDateString("pt-BR");
}
