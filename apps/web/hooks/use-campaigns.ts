import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Campaign, CampaignInput, CampaignWithCreator, ListCampaignsQuery, UpdateCampaignInput } from "@cs-hub/shared-types";
import { apiFetch } from "@/lib/api-client";
import { queryKeys } from "@/lib/query-keys";

interface CampaignListResponse {
  items: CampaignWithCreator[];
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

export function useCampaignsQuery(filters: Partial<ListCampaignsQuery>) {
  return useQuery({
    queryKey: queryKeys.campaigns.list(filters),
    queryFn: () => apiFetch<CampaignListResponse>(`/campaigns?${toQueryString(filters)}`),
  });
}

export function useCampaignQuery(id: string) {
  return useQuery({
    queryKey: queryKeys.campaigns.detail(id),
    queryFn: () => apiFetch<CampaignWithCreator>(`/campaigns/${id}`),
    enabled: Boolean(id),
  });
}

export function useCreateCampaignMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CampaignInput) => apiFetch<Campaign>("/campaigns", { method: "POST", body: JSON.stringify(input) }),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ["campaigns", "list"] }),
  });
}

export function useUpdateCampaignMutation(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdateCampaignInput) =>
      apiFetch<Campaign>(`/campaigns/${id}`, { method: "PATCH", body: JSON.stringify(input) }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.campaigns.detail(id) });
      void queryClient.invalidateQueries({ queryKey: ["campaigns", "list"] });
    },
  });
}
