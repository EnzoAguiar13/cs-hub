import type { NotificationChannel } from "../domain/notification-channel";
import type {
  CreateDeliveryData,
  CreateNotificationData,
  DeliveryRecord,
  NotificationRecord,
  NotificationRepository,
  NotificationWithDeliveriesRecord,
} from "../domain/notification.repository";
import { NotificationService } from "./notification.service";

class InMemoryNotificationRepository implements NotificationRepository {
  readonly deliveries: DeliveryRecord[] = [];
  private sequence = 0;

  async create(data: CreateNotificationData): Promise<NotificationRecord> {
    return { id: `notif_${++this.sequence}`, createdAt: new Date(), ...data };
  }

  async addDelivery(data: CreateDeliveryData): Promise<DeliveryRecord> {
    const record = { id: `delivery_${this.deliveries.length + 1}`, createdAt: new Date(), ...data };
    this.deliveries.push(record);
    return record;
  }

  async list(_page: number, _pageSize: number): Promise<{ items: NotificationWithDeliveriesRecord[]; total: number }> {
    return { items: [], total: 0 };
  }

  async existsRecentByMetadataKey(): Promise<boolean> {
    return false;
  }
}

function buildChannel(overrides: Partial<NotificationChannel> = {}): NotificationChannel {
  return {
    type: "SLACK",
    isConfigured: () => true,
    send: jest.fn().mockResolvedValue(undefined),
    ...overrides,
  };
}

describe("NotificationService", () => {
  it("marks a delivery SKIPPED when the channel is not configured, without calling send", async () => {
    const repository = new InMemoryNotificationRepository();
    const send = jest.fn();
    const channel = buildChannel({ isConfigured: () => false, send });
    const service = new NotificationService(repository, [channel]);

    await service.notify("PAYMENT_OVERDUE", "Título", "Mensagem");

    expect(send).not.toHaveBeenCalled();
    expect(repository.deliveries[0]).toMatchObject({ channel: "SLACK", status: "SKIPPED" });
  });

  it("marks a delivery SENT when the channel sends successfully", async () => {
    const repository = new InMemoryNotificationRepository();
    const channel = buildChannel();
    const service = new NotificationService(repository, [channel]);

    await service.notify("DELIVERY_LATE", "Título", "Mensagem");

    expect(channel.send).toHaveBeenCalledWith("Título", "Mensagem");
    expect(repository.deliveries[0]).toMatchObject({ status: "SENT", error: null });
  });

  it("marks a delivery FAILED and records the error when send throws", async () => {
    const repository = new InMemoryNotificationRepository();
    const channel = buildChannel({ send: jest.fn().mockRejectedValue(new Error("boom")) });
    const service = new NotificationService(repository, [channel]);

    await service.notify("CONTRACT_EXPIRING", "Título", "Mensagem");

    expect(repository.deliveries[0]).toMatchObject({ status: "FAILED", error: "boom" });
  });

  it("dispatches to every configured channel independently", async () => {
    const repository = new InMemoryNotificationRepository();
    const configured = buildChannel({ type: "SLACK" });
    const notConfigured = buildChannel({ type: "DISCORD", isConfigured: () => false });
    const service = new NotificationService(repository, [configured, notConfigured]);

    await service.notify("GOAL_REACHED", "Título", "Mensagem");

    expect(repository.deliveries).toHaveLength(2);
    expect(repository.deliveries.map((d) => d.channel).sort()).toEqual(["DISCORD", "SLACK"]);
  });
});
