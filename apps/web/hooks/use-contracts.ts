import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Contract, ContractInput, ListContractsQuery, RequestContractUploadInput, UpdateContractInput } from "@cs-hub/shared-types";
import { apiFetch } from "@/lib/api-client";

interface ContractListResponse {
  items: Contract[];
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

export function useContractsQuery(filters: Partial<ListContractsQuery>) {
  return useQuery({
    queryKey: ["contracts", "list", filters],
    queryFn: () => apiFetch<ContractListResponse>(`/contracts?${toQueryString(filters)}`),
    enabled: Boolean(filters.creatorId),
  });
}

export function useRequestContractUploadMutation() {
  return useMutation({
    mutationFn: (input: RequestContractUploadInput) =>
      apiFetch<{ uploadUrl: string; storageKey: string }>("/contracts/upload-request", {
        method: "POST",
        body: JSON.stringify(input),
      }),
  });
}

export function useCreateContractMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: ContractInput) => apiFetch<Contract>("/contracts", { method: "POST", body: JSON.stringify(input) }),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ["contracts", "list"] }),
  });
}

export function useUpdateContractMutation(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdateContractInput) =>
      apiFetch<Contract>(`/contracts/${id}`, { method: "PATCH", body: JSON.stringify(input) }),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ["contracts", "list"] }),
  });
}
