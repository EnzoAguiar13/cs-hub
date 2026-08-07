import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  FinanceSummary,
  FinanceSummaryQuery,
  ListTransactionsQuery,
  Transaction,
  TransactionInput,
  TransactionWithCreator,
  UpdateTransactionInput,
} from "@cs-hub/shared-types";
import { apiFetch } from "@/lib/api-client";
import { queryKeys } from "@/lib/query-keys";

interface TransactionListResponse {
  items: TransactionWithCreator[];
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

export function useTransactionsQuery(filters: Partial<ListTransactionsQuery>) {
  return useQuery({
    queryKey: queryKeys.finance.list(filters),
    queryFn: () => apiFetch<TransactionListResponse>(`/finance/transactions?${toQueryString(filters)}`),
  });
}

export function useFinanceSummaryQuery(filters: Partial<FinanceSummaryQuery> = {}) {
  return useQuery({
    queryKey: queryKeys.finance.summary(filters),
    queryFn: () => apiFetch<FinanceSummary>(`/finance/summary?${toQueryString(filters)}`),
  });
}

export function useCreateTransactionMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: TransactionInput) =>
      apiFetch<Transaction>("/finance/transactions", { method: "POST", body: JSON.stringify(input) }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["finance", "list"] });
      void queryClient.invalidateQueries({ queryKey: ["finance", "summary"] });
    },
  });
}

export function useUpdateTransactionMutation(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdateTransactionInput) =>
      apiFetch<Transaction>(`/finance/transactions/${id}`, { method: "PATCH", body: JSON.stringify(input) }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.finance.detail(id) });
      void queryClient.invalidateQueries({ queryKey: ["finance", "list"] });
      void queryClient.invalidateQueries({ queryKey: ["finance", "summary"] });
    },
  });
}
