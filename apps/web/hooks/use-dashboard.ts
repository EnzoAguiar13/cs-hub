import { useQuery } from "@tanstack/react-query";
import type { DashboardSummary } from "@cs-hub/shared-types";
import { apiFetch } from "@/lib/api-client";

export function useDashboardSummaryQuery() {
  return useQuery({
    queryKey: ["dashboard", "summary"],
    queryFn: () => apiFetch<DashboardSummary>("/dashboard/summary"),
  });
}
