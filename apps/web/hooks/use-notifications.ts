import { useQuery } from "@tanstack/react-query";
import type { ChannelStatus, Notification } from "@cs-hub/shared-types";
import { apiFetch } from "@/lib/api-client";

interface NotificationListResponse {
  items: Notification[];
  total: number;
  page: number;
  pageSize: number;
}

export function useNotificationsQuery(page: number, pageSize = 20) {
  return useQuery({
    queryKey: ["notifications", "list", page, pageSize],
    queryFn: () => apiFetch<NotificationListResponse>(`/notifications?page=${page}&pageSize=${pageSize}`),
  });
}

export function useNotificationChannelsQuery() {
  return useQuery({
    queryKey: ["notifications", "channels"],
    queryFn: () => apiFetch<ChannelStatus[]>("/notifications/channels"),
  });
}
