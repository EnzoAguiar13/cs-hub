import type { ListCreatorsQuery } from "@cs-hub/shared-types";

export const queryKeys = {
  currentUser: ["auth", "me"] as const,
  creators: {
    list: (filters: Partial<ListCreatorsQuery>) => ["creators", "list", filters] as const,
    detail: (id: string) => ["creators", "detail", id] as const,
    timeline: (id: string) => ["creators", "timeline", id] as const,
    files: (id: string) => ["creators", "files", id] as const,
  },
};
