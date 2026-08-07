import { Module } from "@nestjs/common";
import { ScheduleModule } from "@nestjs/schedule";
import { NOTIFICATION_CHANNELS } from "./domain/notification-channel";
import { NOTIFICATION_REPOSITORY } from "./domain/notification.repository";
import { PrismaNotificationRepository } from "./infrastructure/prisma-notification.repository";
import { EmailChannel } from "./infrastructure/email-channel";
import { TelegramChannel } from "./infrastructure/telegram-channel";
import { SlackChannel } from "./infrastructure/slack-channel";
import { DiscordChannel } from "./infrastructure/discord-channel";
import { NotificationService } from "./application/notification.service";
import { NotificationSchedulerService } from "./application/notification-scheduler.service";
import { NotificationsController } from "./presentation/notifications.controller";

@Module({
  imports: [ScheduleModule.forRoot()],
  controllers: [NotificationsController],
  providers: [
    { provide: NOTIFICATION_REPOSITORY, useClass: PrismaNotificationRepository },
    EmailChannel,
    TelegramChannel,
    SlackChannel,
    DiscordChannel,
    {
      provide: NOTIFICATION_CHANNELS,
      useFactory: (email: EmailChannel, telegram: TelegramChannel, slack: SlackChannel, discord: DiscordChannel) => [
        email,
        telegram,
        slack,
        discord,
      ],
      inject: [EmailChannel, TelegramChannel, SlackChannel, DiscordChannel],
    },
    NotificationService,
    NotificationSchedulerService,
  ],
  exports: [NotificationService],
})
export class NotificationsModule {}
