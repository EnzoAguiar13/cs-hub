import { BadRequestException, NotFoundException } from "@nestjs/common";
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
import type { FinanceService } from "../../finance/application/finance.service";
import { WithdrawalService } from "./withdrawal.service";

class InMemoryWithdrawalRepository implements WithdrawalRepository {
  private readonly withdrawals = new Map<string, WithdrawalRecord>();
  private readonly history: WithdrawalStatusHistoryRecord[] = [];
  private sequence = 0;

  async create(data: CreateWithdrawalData): Promise<WithdrawalRecord> {
    const now = new Date();
    const record: WithdrawalRecord = {
      id: `wd_${++this.sequence}`,
      requestedAmountCents: null,
      requestedAt: null,
      requestedById: null,
      paymentMethod: null,
      proofFileKey: null,
      paidAt: null,
      createdAt: now,
      updatedAt: now,
      ...data,
    };
    this.withdrawals.set(record.id, record);
    return record;
  }

  async update(id: string, data: UpdateWithdrawalData): Promise<WithdrawalRecord> {
    const existing = this.withdrawals.get(id);
    if (!existing) throw new Error("not found");
    const definedChanges = Object.fromEntries(Object.entries(data).filter(([, value]) => value !== undefined));
    const updated = { ...existing, ...definedChanges, updatedAt: new Date() };
    this.withdrawals.set(id, updated);
    return updated;
  }

  async findById(id: string): Promise<WithdrawalWithCreatorNameRecord | null> {
    const record = this.withdrawals.get(id);
    return record ? { ...record, creatorName: "Fulano" } : null;
  }

  async findByCreatorAndCompetence(creatorId: string, competence: Date): Promise<WithdrawalRecord | null> {
    return (
      [...this.withdrawals.values()].find((w) => w.creatorId === creatorId && w.competence.getTime() === competence.getTime()) ??
      null
    );
  }

  async list(_filters: ListWithdrawalsFilters) {
    const items = [...this.withdrawals.values()].map((record) => ({ ...record, creatorName: "Fulano" }));
    return { items, total: items.length };
  }

  async addStatusHistory(entry: Omit<WithdrawalStatusHistoryRecord, "id" | "createdAt">): Promise<WithdrawalStatusHistoryRecord> {
    const record = { id: `hist_${this.history.length + 1}`, createdAt: new Date(), ...entry };
    this.history.push(record);
    return record;
  }

  async listStatusHistory(withdrawalId: string): Promise<WithdrawalStatusHistoryRecord[]> {
    return this.history.filter((h) => h.withdrawalId === withdrawalId);
  }

  async summary(_competence: Date): Promise<WithdrawalSummaryCounts> {
    return {
      notRequestedCount: 0,
      requestedCount: 0,
      inReviewCount: 0,
      approvedCount: 0,
      paidCount: 0,
      totalPendingCents: 0,
      totalPaidCents: 0,
      totalAwaitingRequestCents: 0,
    };
  }
}

function buildFinanceStub() {
  return { recordPaidExpense: jest.fn().mockResolvedValue({}) } as unknown as FinanceService;
}

const COMPETENCE = new Date("2026-08-01T00:00:00.000Z").toISOString();

describe("WithdrawalService", () => {
  it("rejects creating a second withdrawal for the same creator and competence", async () => {
    const repository = new InMemoryWithdrawalRepository();
    const service = new WithdrawalService(repository, buildFinanceStub());
    const input = { creatorId: "creator_1", competence: COMPETENCE, availableAmountCents: 10000, status: "AVAILABLE" as const };

    await service.create(input);
    await expect(service.create(input)).rejects.toThrow(BadRequestException);
  });

  it("throws NotFoundException when updating a withdrawal that does not exist", async () => {
    const service = new WithdrawalService(new InMemoryWithdrawalRepository(), buildFinanceStub());
    await expect(service.update("missing", {}, "actor_1")).rejects.toThrow(NotFoundException);
  });

  it("rejects an invalid status transition", async () => {
    const repository = new InMemoryWithdrawalRepository();
    const service = new WithdrawalService(repository, buildFinanceStub());
    const created = await service.create({
      creatorId: "creator_1",
      competence: COMPETENCE,
      availableAmountCents: 10000,
      status: "AVAILABLE",
    });

    await expect(service.update(created.id, { status: "PAID" }, "actor_1")).rejects.toThrow(BadRequestException);
  });

  it("requires a requested amount before moving to SUBMITTED", async () => {
    const repository = new InMemoryWithdrawalRepository();
    const service = new WithdrawalService(repository, buildFinanceStub());
    const created = await service.create({
      creatorId: "creator_1",
      competence: COMPETENCE,
      availableAmountCents: 10000,
      status: "AVAILABLE",
    });
    await service.update(created.id, { status: "PENDING" }, "actor_1");

    await expect(service.update(created.id, { status: "SUBMITTED" }, "actor_1")).rejects.toThrow(BadRequestException);
  });

  it("records requestedAt/requestedById on the first requested amount, and status history on every status change", async () => {
    const repository = new InMemoryWithdrawalRepository();
    const service = new WithdrawalService(repository, buildFinanceStub());
    const created = await service.create({
      creatorId: "creator_1",
      competence: COMPETENCE,
      availableAmountCents: 10000,
      status: "AVAILABLE",
    });

    const requested = await service.update(created.id, { status: "PENDING", requestedAmountCents: 8000 }, "actor_1");
    expect(requested.requestedAt).toBeInstanceOf(Date);
    expect(requested.requestedById).toBe("actor_1");

    const history = await repository.listStatusHistory(created.id);
    expect(history.map((h) => h.toStatus)).toEqual(["AVAILABLE", "PENDING"]);
  });

  it("records a paid expense in Finance and stamps paidAt when the withdrawal becomes PAID", async () => {
    const repository = new InMemoryWithdrawalRepository();
    const finance = buildFinanceStub();
    const service = new WithdrawalService(repository, finance);
    const created = await service.create({
      creatorId: "creator_1",
      competence: COMPETENCE,
      availableAmountCents: 10000,
      status: "AVAILABLE",
    });

    await service.update(created.id, { status: "PENDING", requestedAmountCents: 8000 }, "actor_1");
    await service.update(created.id, { status: "SUBMITTED" }, "actor_1");
    await service.update(created.id, { status: "IN_REVIEW" }, "actor_1");
    await service.update(created.id, { status: "APPROVED" }, "actor_1");
    const paid = await service.update(created.id, { status: "PAID" }, "actor_1");

    expect(paid.paidAt).toBeInstanceOf(Date);
    expect(finance.recordPaidExpense).toHaveBeenCalledTimes(1);
    expect(finance.recordPaidExpense).toHaveBeenCalledWith(
      expect.objectContaining({ amountCents: 8000, creatorId: "creator_1" }),
      "actor_1",
    );
  });
});
