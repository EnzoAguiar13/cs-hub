import { useMutation, useQuery } from "@tanstack/react-query";
import type { AiInsight, AskAiResponse } from "@cs-hub/shared-types";
import { apiFetch } from "@/lib/api-client";

export function useAiInsightsQuery() {
  return useQuery({
    queryKey: ["ai", "insights"],
    queryFn: () => apiFetch<AiInsight[]>("/ai/insights"),
  });
}

export function useAskAiMutation() {
  return useMutation({
    mutationFn: (question: string) => apiFetch<AskAiResponse>("/ai/ask", { method: "POST", body: JSON.stringify({ question }) }),
  });
}
