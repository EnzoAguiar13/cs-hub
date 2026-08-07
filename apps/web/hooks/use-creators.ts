import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  AddTimelineNoteInput,
  ConfirmFileUploadInput,
  Creator,
  CreatorFile,
  CreatorSummary,
  CreatorTimelineEvent,
  CreatorInput,
  ListCreatorsQuery,
  RequestFileUploadInput,
  RequestFileUploadResponse,
  UpdateCreatorInput,
} from "@cs-hub/shared-types";
import { apiFetch } from "@/lib/api-client";
import { queryKeys } from "@/lib/query-keys";

interface CreatorListResponse {
  items: CreatorSummary[];
  total: number;
  page: number;
  pageSize: number;
}

function toQueryString(filters: Partial<ListCreatorsQuery>): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(filters)) {
    if (value !== undefined && value !== null && value !== "") params.set(key, String(value));
  }
  return params.toString();
}

export function useCreatorsQuery(filters: Partial<ListCreatorsQuery>) {
  return useQuery({
    queryKey: queryKeys.creators.list(filters),
    queryFn: () => apiFetch<CreatorListResponse>(`/creators?${toQueryString(filters)}`),
  });
}

export function useCreatorQuery(id: string) {
  return useQuery({
    queryKey: queryKeys.creators.detail(id),
    queryFn: () => apiFetch<Creator>(`/creators/${id}`),
    enabled: Boolean(id),
  });
}

export function useCreateCreatorMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreatorInput) => apiFetch<Creator>("/creators", { method: "POST", body: JSON.stringify(input) }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["creators", "list"] });
    },
  });
}

export function useUpdateCreatorMutation(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdateCreatorInput) =>
      apiFetch<Creator>(`/creators/${id}`, { method: "PATCH", body: JSON.stringify(input) }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.creators.detail(id) });
      void queryClient.invalidateQueries({ queryKey: queryKeys.creators.timeline(id) });
      void queryClient.invalidateQueries({ queryKey: ["creators", "list"] });
    },
  });
}

export function useCreatorTimelineQuery(id: string) {
  return useQuery({
    queryKey: queryKeys.creators.timeline(id),
    queryFn: () => apiFetch<CreatorTimelineEvent[]>(`/creators/${id}/timeline`),
    enabled: Boolean(id),
  });
}

export function useAddTimelineNoteMutation(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: AddTimelineNoteInput) =>
      apiFetch<CreatorTimelineEvent>(`/creators/${id}/timeline`, { method: "POST", body: JSON.stringify(input) }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.creators.timeline(id) });
    },
  });
}

export function useCreatorFilesQuery(id: string) {
  return useQuery({
    queryKey: queryKeys.creators.files(id),
    queryFn: () => apiFetch<CreatorFile[]>(`/creators/${id}/files`),
    enabled: Boolean(id),
  });
}

export function useRequestFileUploadMutation(id: string) {
  return useMutation({
    mutationFn: (input: RequestFileUploadInput) =>
      apiFetch<RequestFileUploadResponse>(`/creators/${id}/files/upload-request`, {
        method: "POST",
        body: JSON.stringify(input),
      }),
  });
}

export function useConfirmFileUploadMutation(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: ConfirmFileUploadInput) =>
      apiFetch<CreatorFile>(`/creators/${id}/files/confirm`, { method: "POST", body: JSON.stringify(input) }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.creators.files(id) });
      void queryClient.invalidateQueries({ queryKey: queryKeys.creators.timeline(id) });
    },
  });
}
