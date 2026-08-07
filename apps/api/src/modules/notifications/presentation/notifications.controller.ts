import { Controller, Get, Query } from "@nestjs/common";
import { listNotificationsQuerySchema, type ListNotificationsQuery } from "@cs-hub/shared-types";
import { RequirePermission } from "../../../common/decorators/require-permission.decorator";
import { ZodValidationPipe } from "../../../common/pipes/zod-validation.pipe";
import { NotificationService } from "../application/notification.service";
import { toNotificationResponse } from "./notification.mapper";

@Controller("notifications")
export class NotificationsController {
  constructor(private readonly notifications: NotificationService) {}

  @Get()
  @RequirePermission("notifications", "read")
  async list(@Query(new ZodValidationPipe(listNotificationsQuerySchema)) query: ListNotificationsQuery) {
    const { items, total } = await this.notifications.list(query.page, query.pageSize);
    return { items: items.map(toNotificationResponse), total, page: query.page, pageSize: query.pageSize };
  }

  @Get("channels")
  @RequirePermission("notifications", "read")
  channels() {
    return this.notifications.channelStatus();
  }
}
