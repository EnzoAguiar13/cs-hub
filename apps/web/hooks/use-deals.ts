import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Deal, DealInput, DealWithCreator, ListDealsQuery, UpdateDealInput } from "@cs-hub/shared-types";
import { apiFetch } from "@/lib/api-client";
import { queryKeys } from "@/lib/query-keys";

interface DealListResponse {
  items: DealWithCreator[];
  total: number;
  page: number;
  pageSize: number;
}

function toQueryString(filters: Record<string, unknown>): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(filters)) {
    if (value !== undefined && value !== null && value !== "") params.set(key, String(value));
  }
  return params.toString();
}

export function useDealsQuery(filters: Partial<ListDealsQuery>) {
  return useQuery({
    queryKey: queryKeys.deals.list(filters),
    queryFn: () => apiFetch<DealListResponse>(`/deals?${toQueryString(filters)}`),
  });
}

export function useDealQuery(id: string) {
  return useQuery({
    queryKey: queryKeys.deals.detail(id),
    queryFn: () => apiFetch<DealWithCreator>(`/deals/${id}`),
    enabled: Boolean(id),
  });
}

export function useCreateDealMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: DealInput) => apiFetch<Deal>("/deals", { method: "POST", body: JSON.stringify(input) }),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ["deals", "list"] }),
  });
}

export function useUpdateDealMutation(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdateDealInput) => apiFetch<Deal>(`/deals/${id}`, { method: "PATCH", body: JSON.stringify(input) }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.deals.detail(id) });
      void queryClient.invalidateQueries({ queryKey: ["deals", "list"] });
    },
  });
}
