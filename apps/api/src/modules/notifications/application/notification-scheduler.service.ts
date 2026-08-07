import { Injectable, Logger } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { PrismaService } from "../../../prisma/prisma.service";
import { NotificationService } from "./notification.service";

const EXPIRY_WINDOW_DAYS = 7;
const EXPIRY_DEDUPE_DAYS = 3;
const OVERDUE_DEDUPE_DAYS = 1;

function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

/**
 * Closes the loop the Contratos/Exclusividade and Saques specs asked for ("alerta
 * automático") — this is where those checks actually run and dispatch through
 * NotificationService, rather than just exposing the raw data for a human to notice.
 */
@Injectable()
export class NotificationSchedulerService {
  private readonly logger = new Logger(NotificationSchedulerService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly notifications: NotificationService,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_8AM)
  async runDailyChecks() {
    this.logger.log("Running daily notification checks");
    await Promise.all([
      this.checkExpiringContracts(),
      this.checkExpiringExclusivities(),
      this.checkOverduePayments(),
      this.checkLateDeliveries(),
      this.checkMissingWithdrawalRequests(),
    ]);
  }

  private async checkExpiringContracts() {
    const now = new Date();
    const windowEnd = new Date(now.getTime() + EXPIRY_WINDOW_DAYS * 24 * 60 * 60 * 1000);
    const contracts = await this.prisma.contract.findMany({
      where: { status: { in: ["SENT", "SIGNED"] }, expiresAt: { gte: now, lte: windowEnd } },
      include: { creator: { select: { name: true } } },
    });

    for (const contract of contracts) {
      const alreadyNotified = await this.notifications.wasRecentlyNotified(
        "CONTRACT_EXPIRING",
        "entityId",
        contract.id,
        EXPIRY_DEDUPE_DAYS,
      );
      if (alreadyNotified) continue;

      await this.notifications.notify(
        "CONTRACT_EXPIRING",
        "Contrato vencendo",
        `O contrato "${contract.title}" de ${contract.creator.name} vence em ${contract.expiresAt!.toLocaleDateString("pt-BR")}.`,
        { entityId: contract.id, creatorId: contract.creatorId },
      );
    }
  }

  private async checkExpiringExclusivities() {
    const now = new Date();
    const windowEnd = new Date(now.getTime() + EXPIRY_WINDOW_DAYS * 24 * 60 * 60 * 1000);
    const exclusivities = await this.prisma.exclusivity.findMany({
      where: { status: "ACTIVE", endDate: { gte: now, lte: windowEnd } },
      include: { creator: { select: { name: true } } },
    });

    for (const exclusivity of exclusivities) {
      const alreadyNotified = await this.notifications.wasRecentlyNotified(
        "EXCLUSIVITY_EXPIRING",
        "entityId",
        exclusivity.id,
        EXPIRY_DEDUPE_DAYS,
      );
      if (alreadyNotified) continue;

      await this.notifications.notify(
        "EXCLUSIVITY_EXPIRING",
        "Exclusividade vencendo",
        `A exclusividade de ${exclusivity.creator.name} com ${exclusivity.brand} vence em ${exclusivity.endDate.toLocaleDateString("pt-BR")}.`,
        { entityId: exclusivity.id, creatorId: exclusivity.creatorId },
      );
    }
  }

  private async checkOverduePayments() {
    const now = new Date();
    const overdue = await this.prisma.financeTransaction.findMany({
      where: { status: "PENDING", dueDate: { lt: now }, creatorId: { not: null } },
      include: { creator: { select: { name: true } } },
    });

    for (const transaction of overdue) {
      const alreadyNotified = await this.notifications.wasRecentlyNotified(
        "PAYMENT_OVERDUE",
        "entityId",
        transaction.id,
        OVERDUE_DEDUPE_DAYS,
      );
      if (alreadyNotified) continue;

      await this.notifications.notify(
        "PAYMENT_OVERDUE",
        "Pagamento atrasado",
        `O pagamento "${transaction.description}" de ${transaction.creator?.name ?? "—"} (R$ ${(transaction.amountCents / 100).toFixed(2)}) está vencido.`,
        { entityId: transaction.id, creatorId: transaction.creatorId },
      );
    }
  }

  private async checkLateDeliveries() {
    const late = await this.prisma.delivery.findMany({
      where: { status: "LATE" },
      include: { creator: { select: { name: true } } },
    });

    for (const delivery of late) {
      const alreadyNotified = await this.notifications.wasRecentlyNotified(
        "DELIVERY_LATE",
        "entityId",
        delivery.id,
        OVERDUE_DEDUPE_DAYS,
      );
      if (alreadyNotified) continue;

      await this.notifications.notify(
        "DELIVERY_LATE",
        "Entrega atrasada",
        `A entrega de ${delivery.creator.name} agendada para ${delivery.scheduledAt.toLocaleString("pt-BR")} está atrasada.`,
        { entityId: delivery.id, creatorId: delivery.creatorId },
      );
    }
  }

  private async checkMissingWithdrawalRequests() {
    const competence = startOfMonth(new Date());
    const missing = await this.prisma.withdrawalRequest.findMany({
      where: { competence, requestedAt: null, status: { in: ["AVAILABLE", "PENDING"] } },
      include: { creator: { select: { name: true } } },
    });

    for (const withdrawal of missing) {
      const alreadyNotified = await this.notifications.wasRecentlyNotified(
        "WITHDRAWAL_NOT_REQUESTED",
        "entityId",
        withdrawal.id,
        EXPIRY_DEDUPE_DAYS,
      );
      if (alreadyNotified) continue;

      await this.notifications.notify(
        "WITHDRAWAL_NOT_REQUESTED",
        "Saque não solicitado",
        `${withdrawal.creator.name} ainda não solicitou o saque de ${competence.toLocaleDateString("pt-BR", { month: "long", year: "numeric" })}.`,
        { entityId: withdrawal.id, creatorId: withdrawal.creatorId },
      );
    }
  }
}
