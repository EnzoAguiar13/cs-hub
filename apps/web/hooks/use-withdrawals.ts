import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  ListWithdrawalsQuery,
  UpdateWithdrawalInput,
  Withdrawal,
  WithdrawalInput,
  WithdrawalStatusHistoryEntry,
  WithdrawalSummary,
  WithdrawalSummaryQuery,
  WithdrawalWithCreator,
} from "@cs-hub/shared-types";
import { apiFetch } from "@/lib/api-client";
import { queryKeys } from "@/lib/query-keys";

interface WithdrawalListResponse {
  items: WithdrawalWithCreator[];
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

export function useWithdrawalsQuery(filters: Partial<ListWithdrawalsQuery>) {
  return useQuery({
    queryKey: queryKeys.withdrawals.list(filters),
    queryFn: () => apiFetch<WithdrawalListResponse>(`/withdrawals?${toQueryString(filters)}`),
  });
}

export function useWithdrawalSummaryQuery(filters: Partial<WithdrawalSummaryQuery> = {}) {
  return useQuery({
    queryKey: queryKeys.withdrawals.summary(filters),
    queryFn: () => apiFetch<WithdrawalSummary>(`/withdrawals/summary?${toQueryString(filters)}`),
  });
}

export function useWithdrawalHistoryQuery(id: string) {
  return useQuery({
    queryKey: queryKeys.withdrawals.history(id),
    queryFn: () => apiFetch<WithdrawalStatusHistoryEntry[]>(`/withdrawals/${id}/history`),
    enabled: Boolean(id),
  });
}

export function useCreateWithdrawalMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: WithdrawalInput) => apiFetch<Withdrawal>("/withdrawals", { method: "POST", body: JSON.stringify(input) }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["withdrawals", "list"] });
      void queryClient.invalidateQueries({ queryKey: ["withdrawals", "summary"] });
    },
  });
}

export function useUpdateWithdrawalMutation(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdateWithdrawalInput) =>
      apiFetch<Withdrawal>(`/withdrawals/${id}`, { method: "PATCH", body: JSON.stringify(input) }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.withdrawals.detail(id) });
      void queryClient.invalidateQueries({ queryKey: queryKeys.withdrawals.history(id) });
      void queryClient.invalidateQueries({ queryKey: ["withdrawals", "list"] });
      void queryClient.invalidateQueries({ queryKey: ["withdrawals", "summary"] });
      void queryClient.invalidateQueries({ queryKey: ["finance"] });
    },
  });
}
