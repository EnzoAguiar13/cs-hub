import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  Exclusivity,
  ExclusivityInput,
  ExclusivityWithCreator,
  ListExclusivitiesQuery,
  UpdateExclusivityInput,
} from "@cs-hub/shared-types";
import { apiFetch } from "@/lib/api-client";

interface ExclusivityListResponse {
  items: ExclusivityWithCreator[];
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

export function useExclusivitiesQuery(filters: Partial<ListExclusivitiesQuery>) {
  return useQuery({
    queryKey: ["exclusivities", "list", filters],
    queryFn: () => apiFetch<ExclusivityListResponse>(`/exclusivities?${toQueryString(filters)}`),
    enabled: Boolean(filters.creatorId),
  });
}

export function useCreateExclusivityMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: ExclusivityInput) =>
      apiFetch<Exclusivity>("/exclusivities", { method: "POST", body: JSON.stringify(input) }),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ["exclusivities", "list"] }),
  });
}

export function useUpdateExclusivityMutation(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdateExclusivityInput) =>
      apiFetch<Exclusivity>(`/exclusivities/${id}`, { method: "PATCH", body: JSON.stringify(input) }),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ["exclusivities", "list"] }),
  });
}
