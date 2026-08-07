import type { ListCreatorsQuery, ListDealsQuery, ListTransactionsQuery, FinanceSummaryQuery } from "@cs-hub/shared-types";

export const queryKeys = {
  currentUser: ["auth", "me"] as const,
  creators: {
    list: (filters: Partial<ListCreatorsQuery>) => ["creators", "list", filters] as const,
    detail: (id: string) => ["creators", "detail", id] as const,
    timeline: (id: string) => ["creators", "timeline", id] as const,
    files: (id: string) => ["creators", "files", id] as const,
  },
  deals: {
    list: (filters: Partial<ListDealsQuery>) => ["deals", "list", filters] as const,
    detail: (id: string) => ["deals", "detail", id] as const,
  },
  finance: {
    list: (filters: Partial<ListTransactionsQuery>) => ["finance", "list", filters] as const,
    detail: (id: string) => ["finance", "detail", id] as const,
    summary: (filters: Partial<FinanceSummaryQuery>) => ["finance", "summary", filters] as const,
  },
};
