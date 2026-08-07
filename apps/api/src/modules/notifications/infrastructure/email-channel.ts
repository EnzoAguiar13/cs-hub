import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import nodemailer, { type Transporter } from "nodemailer";
import type { NotificationChannel } from "../domain/notification-channel";

@Injectable()
export class EmailChannel implements NotificationChannel {
  readonly type = "EMAIL" as const;
  private transporter: Transporter | null = null;

  constructor(private readonly config: ConfigService) {
    const host = config.get<string>("SMTP_HOST", "");
    if (host) {
      this.transporter = nodemailer.createTransport({
        host,
        port: config.get<number>("SMTP_PORT", 587),
        auth: { user: config.get<string>("SMTP_USER", ""), pass: config.get<string>("SMTP_PASSWORD", "") },
      });
    }
  }

  isConfigured(): boolean {
    return Boolean(this.transporter && this.config.get<string>("NOTIFICATIONS_EMAIL_TO", ""));
  }

  async send(title: string, message: string): Promise<void> {
    if (!this.transporter) throw new Error("SMTP não configurado");
    await this.transporter.sendMail({
      from: this.config.get<string>("SMTP_FROM", "cshub@localhost"),
      to: this.config.get<string>("NOTIFICATIONS_EMAIL_TO", ""),
      subject: title,
      text: message,
    });
  }
}
