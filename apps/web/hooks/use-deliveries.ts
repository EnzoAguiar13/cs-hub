import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Delivery, DeliveryInput, DeliveryWithCreator, ListDeliveriesQuery, UpdateDeliveryInput } from "@cs-hub/shared-types";
import { apiFetch } from "@/lib/api-client";
import { queryKeys } from "@/lib/query-keys";

interface DeliveryListResponse {
  items: DeliveryWithCreator[];
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

export function useDeliveriesQuery(filters: Partial<ListDeliveriesQuery>) {
  return useQuery({
    queryKey: queryKeys.deliveries.list(filters),
    queryFn: () => apiFetch<DeliveryListResponse>(`/deliveries?${toQueryString(filters)}`),
  });
}

export function useCreateDeliveryMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: DeliveryInput) => apiFetch<Delivery>("/deliveries", { method: "POST", body: JSON.stringify(input) }),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ["deliveries", "list"] }),
  });
}

export function useUpdateDeliveryMutation(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdateDeliveryInput) =>
      apiFetch<Delivery>(`/deliveries/${id}`, { method: "PATCH", body: JSON.stringify(input) }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.deliveries.detail(id) });
      void queryClient.invalidateQueries({ queryKey: ["deliveries", "list"] });
    },
  });
}
