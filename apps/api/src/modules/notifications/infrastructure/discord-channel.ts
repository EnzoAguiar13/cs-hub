import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import type { NotificationChannel } from "../domain/notification-channel";

@Injectable()
export class DiscordChannel implements NotificationChannel {
  readonly type = "DISCORD" as const;

  constructor(private readonly config: ConfigService) {}

  isConfigured(): boolean {
    return Boolean(this.config.get<string>("DISCORD_WEBHOOK_URL", ""));
  }

  async send(title: string, message: string): Promise<void> {
    const webhookUrl = this.config.getOrThrow<string>("DISCORD_WEBHOOK_URL");
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: `**${title}**\n${message}` }),
    });
    if (!response.ok) throw new Error(`Discord webhook respondeu ${response.status}`);
  }
}
