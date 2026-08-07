import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import type { NotificationChannel } from "../domain/notification-channel";

@Injectable()
export class TelegramChannel implements NotificationChannel {
  readonly type = "TELEGRAM" as const;

  constructor(private readonly config: ConfigService) {}

  isConfigured(): boolean {
    return Boolean(this.config.get<string>("TELEGRAM_BOT_TOKEN", "") && this.config.get<string>("TELEGRAM_CHAT_ID", ""));
  }

  async send(title: string, message: string): Promise<void> {
    const token = this.config.getOrThrow<string>("TELEGRAM_BOT_TOKEN");
    const chatId = this.config.getOrThrow<string>("TELEGRAM_CHAT_ID");

    const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text: `*${title}*\n${message}`, parse_mode: "Markdown" }),
    });
    if (!response.ok) throw new Error(`Telegram API respondeu ${response.status}`);
  }
}
