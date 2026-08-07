import { Injectable } from "@nestjs/common";
import type { Prisma } from "@prisma/client";
import { PrismaService } from "../../../prisma/prisma.service";
import type {
  CreateWithdrawalData,
  ListWithdrawalsFilters,
  UpdateWithdrawalData,
  WithdrawalRecord,
  WithdrawalRepository,
  WithdrawalStatusHistoryRecord,
  WithdrawalSummaryCounts,
  WithdrawalWithCreatorNameRecord,
} from "../domain/withdrawal.repository";

function toRecord(withdrawal: { creator: { name: string } } & Record<string, unknown>): WithdrawalWithCreatorNameRecord {
  const { creator, ...rest } = withdrawal;
  return { ...(rest as unknown as WithdrawalRecord), creatorName: creator.name };
}

@Injectable()
export class PrismaWithdrawalRepository implements WithdrawalRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateWithdrawalData): Promise<WithdrawalRecord> {
    return this.prisma.withdrawalRequest.create({ data });
  }

  async update(id: string, data: UpdateWithdrawalData): Promise<WithdrawalRecord> {
    return this.prisma.withdrawalRequest.update({ where: { id }, data });
  }

  async findById(id: string): Promise<WithdrawalWithCreatorNameRecord | null> {
    const withdrawal = await this.prisma.withdrawalRequest.findUnique({
      where: { id },
      include: { creator: { select: { name: true } } },
    });
    return withdrawal ? toRecord(withdrawal) : null;
  }

  async findByCreatorAndCompetence(creatorId: string, competence: Date): Promise<WithdrawalRecord | null> {
    return this.prisma.withdrawalRequest.findUnique({ where: { creatorId_competence: { creatorId, competence } } });
  }

  async list(filters: ListWithdrawalsFilters): Promise<{ items: WithdrawalWithCreatorNameRecord[]; total: number }> {
    const where: Prisma.WithdrawalRequestWhereInput = {
      creatorId: filters.creatorId,
      status: filters.status,
      competence: filters.competence,
    };

    const [items, total] = await Promise.all([
      this.prisma.withdrawalRequest.findMany({
        where,
        include: { creator: { select: { name: true } } },
        orderBy: { [filters.sortBy]: filters.sortDir },
        skip: (filters.page - 1) * filters.pageSize,
        take: filters.pageSize,
      }),
      this.prisma.withdrawalRequest.count({ where }),
    ]);

    return { items: items.map(toRecord), total };
  }

  async addStatusHistory(
    entry: Omit<WithdrawalStatusHistoryRecord, "id" | "createdAt">,
  ): Promise<WithdrawalStatusHistoryRecord> {
    return this.prisma.withdrawalStatusHistory.create({ data: entry });
  }

  async listStatusHistory(withdrawalId: string): Promise<WithdrawalStatusHistoryRecord[]> {
    return this.prisma.withdrawalStatusHistory.findMany({ where: { withdrawalId }, orderBy: { createdAt: "asc" } });
  }

  async summary(competence: Date): Promise<WithdrawalSummaryCounts> {
    const [
      notRequested,
      requested,
      inReviewCount,
      approvedCount,
      paidCount,
      pendingAgg,
      paidAgg,
      awaitingAgg,
    ] = await Promise.all([
      this.prisma.withdrawalRequest.count({ where: { competence, requestedAt: null } }),
      this.prisma.withdrawalRequest.count({
        where: { competence, requestedAt: { not: null }, status: { notIn: ["PAID", "REJECTED", "CANCELLED"] } },
      }),
      this.prisma.withdrawalRequest.count({ where: { competence, status: "IN_REVIEW" } }),
      this.prisma.withdrawalRequest.count({ where: { competence, status: "APPROVED" } }),
      this.prisma.withdrawalRequest.count({ where: { competence, status: "PAID" } }),
      this.prisma.withdrawalRequest.aggregate({
        _sum: { requestedAmountCents: true },
        where: { competence, status: { in: ["PENDING", "SUBMITTED", "IN_REVIEW", "APPROVED"] } },
      }),
      this.prisma.withdrawalRequest.aggregate({
        _sum: { requestedAmountCents: true },
        where: { competence, status: "PAID" },
      }),
      this.prisma.withdrawalRequest.aggregate({
        _sum: { availableAmountCents: true },
        where: { competence, status: { in: ["NOT_AVAILABLE", "AVAILABLE"] } },
      }),
    ]);

    return {
      notRequestedCount: notRequested,
      requestedCount: requested,
      inReviewCount,
      approvedCount,
      paidCount,
      totalPendingCents: pendingAgg._sum.requestedAmountCents ?? 0,
      totalPaidCents: paidAgg._sum.requestedAmountCents ?? 0,
      totalAwaitingRequestCents: awaitingAgg._sum.availableAmountCents ?? 0,
    };
  }
}
