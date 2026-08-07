import { BadRequestException, NotFoundException } from "@nestjs/common";
import type {
  CreateTransactionData,
  FinanceRepository,
  FinanceSummaryTotals,
  ListTransactionsFilters,
  TransactionRecord,
  TransactionWithCreatorNameRecord,
  UpdateTransactionData,
} from "../domain/finance.repository";
import { FinanceService } from "./finance.service";

class InMemoryFinanceRepository implements FinanceRepository {
  private readonly transactions = new Map<string, TransactionRecord>();
  private sequence = 0;

  async create(data: CreateTransactionData): Promise<TransactionRecord> {
    const now = new Date();
    const record: TransactionRecord = {
      id: `tx_${++this.sequence}`,
      status: "PENDING",
      paidAt: null,
      proofFileKey: null,
      createdAt: now,
      updatedAt: now,
      ...data,
    };
    this.transactions.set(record.id, record);
    return record;
  }

  async update(id: string, data: UpdateTransactionData): Promise<TransactionRecord> {
    const existing = this.transactions.get(id);
    if (!existing) throw new Error("not found");
    // Mirrors Prisma's own semantics: an explicit `undefined` means "leave this field alone",
    // not "set it to undefined" — only `null` clears a nullable field.
    const definedChanges = Object.fromEntries(Object.entries(data).filter(([, value]) => value !== undefined));
    const updated = { ...existing, ...definedChanges, updatedAt: new Date() };
    this.transactions.set(id, updated);
    return updated;
  }

  async findById(id: string): Promise<TransactionWithCreatorNameRecord | null> {
    const record = this.transactions.get(id);
    return record ? { ...record, creatorName: null } : null;
  }

  async list(_filters: ListTransactionsFilters) {
    const items = [...this.transactions.values()].map((record) => ({ ...record, creatorName: null }));
    return { items, total: items.length };
  }

  async sumTotals(_from: Date, _to: Date): Promise<FinanceSummaryTotals> {
    return { totalIncomePaidCents: 0, totalExpensePaidCents: 0, totalPendingIncomeCents: 0, totalPendingExpenseCents: 0 };
  }
}

function buildInput(overrides: Partial<CreateTransactionData> = {}): CreateTransactionData {
  return {
    type: "INCOME",
    description: "Comissão CPA",
    amountCents: 10000,
    costCenter: null,
    dueDate: new Date(),
    method: null,
    creatorId: null,
    dealId: null,
    createdById: "actor_1",
    ...overrides,
  };
}

describe("FinanceService", () => {
  it("throws NotFoundException when updating a transaction that does not exist", async () => {
    const service = new FinanceService(new InMemoryFinanceRepository());
    await expect(service.update("missing", { status: "PAID" })).rejects.toThrow(NotFoundException);
  });

  it("rejects an invalid status transition (PAID -> PENDING)", async () => {
    const repository = new InMemoryFinanceRepository();
    const service = new FinanceService(repository);
    const created = await repository.create(buildInput());
    await repository.update(created.id, { status: "PAID", paidAt: new Date() });

    await expect(service.update(created.id, { status: "PENDING" })).rejects.toThrow(BadRequestException);
  });

  it("automatically sets paidAt when a transaction transitions to PAID", async () => {
    const repository = new InMemoryFinanceRepository();
    const service = new FinanceService(repository);
    const created = await repository.create(buildInput());
    expect(created.paidAt).toBeNull();

    const updated = await service.update(created.id, { status: "PAID" });

    expect(updated.status).toBe("PAID");
    expect(updated.paidAt).toBeInstanceOf(Date);
  });

  it("does not overwrite paidAt when updating an already-PAID transaction without changing its status", async () => {
    const repository = new InMemoryFinanceRepository();
    const service = new FinanceService(repository);
    const created = await repository.create(buildInput());
    const paidOnce = await service.update(created.id, { status: "PAID" });

    const updatedAgain = await service.update(created.id, { description: "Comissão CPA (ajustada)" });

    expect(updatedAgain.paidAt).toEqual(paidOnce.paidAt);
  });
});
