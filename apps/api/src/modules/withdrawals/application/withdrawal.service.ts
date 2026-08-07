import { BadRequestException, Inject, Injectable, NotFoundException } from "@nestjs/common";
import type { UpdateWithdrawalInput, WithdrawalInput } from "@cs-hub/shared-types";
import { FinanceService } from "../../finance/application/finance.service";
import {
  WITHDRAWAL_REPOSITORY,
  type WithdrawalRecord,
  type WithdrawalRepository,
  type WithdrawalWithCreatorNameRecord,
} from "../domain/withdrawal.repository";
import { canTransitionWithdrawalStatus } from "../domain/withdrawal.entity";

@Injectable()
export class WithdrawalService {
  constructor(
    @Inject(WITHDRAWAL_REPOSITORY) private readonly withdrawals: WithdrawalRepository,
    private readonly finance: FinanceService,
  ) {}

  async create(input: WithdrawalInput): Promise<WithdrawalRecord> {
    const competence = new Date(input.competence);
    const existing = await this.withdrawals.findByCreatorAndCompetence(input.creatorId, competence);
    if (existing) {
      throw new BadRequestException("Já existe um registro de saque para este creator nesta competência");
    }

    const created = await this.withdrawals.create({
      creatorId: input.creatorId,
      competence,
      availableAmountCents: input.availableAmountCents,
      status: input.status,
      notes: input.notes ?? null,
    });

    await this.withdrawals.addStatusHistory({ withdrawalId: created.id, fromStatus: null, toStatus: created.status, actorId: null });
    return created;
  }

  async update(id: string, input: UpdateWithdrawalInput, actorId: string): Promise<WithdrawalRecord> {
    const existing = await this.withdrawals.findById(id);
    if (!existing) throw new NotFoundException("Saque não encontrado");

    if (input.status && !canTransitionWithdrawalStatus(existing.status, input.status)) {
      throw new BadRequestException(`Transição de status inválida: ${existing.status} -> ${input.status}`);
    }

    const requestedAmountCents = input.requestedAmountCents ?? existing.requestedAmountCents;
    if (input.status === "SUBMITTED" && !requestedAmountCents) {
      throw new BadRequestException("Informe o valor solicitado antes de enviar a solicitação");
    }

    const isFirstRequest = input.requestedAmountCents !== undefined && !existing.requestedAt;
    const becamePaid = input.status === "PAID" && existing.status !== "PAID";

    const updated = await this.withdrawals.update(id, {
      ...input,
      requestedAt: isFirstRequest ? new Date() : undefined,
      requestedById: isFirstRequest ? actorId : undefined,
      paidAt: becamePaid ? new Date() : undefined,
    });

    if (input.status && input.status !== existing.status) {
      await this.withdrawals.addStatusHistory({
        withdrawalId: id,
        fromStatus: existing.status,
        toStatus: input.status,
        actorId,
      });
    }

    // "Quando o status mudar para Pago, atualizar automaticamente o módulo Financeiro e o
    // fluxo de caixa" — cria a despesa já paga; o saldo/fluxo é derivado dela automaticamente
    // (ver FinanceService.summary), sem precisar de nenhuma outra sincronização manual.
    if (becamePaid) {
      const competenceLabel = updated.competence.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
      await this.finance.recordPaidExpense(
        {
          description: `Saque — ${competenceLabel}`,
          amountCents: updated.requestedAmountCents ?? updated.availableAmountCents,
          creatorId: updated.creatorId,
          method: updated.paymentMethod,
        },
        actorId,
      );
    }

    return updated;
  }

  async findById(id: string): Promise<WithdrawalWithCreatorNameRecord> {
    const withdrawal = await this.withdrawals.findById(id);
    if (!withdrawal) throw new NotFoundException("Saque não encontrado");
    return withdrawal;
  }

  listStatusHistory(withdrawalId: string) {
    return this.withdrawals.listStatusHistory(withdrawalId);
  }

  list(query: {
    creatorId?: string;
    status?: WithdrawalRecord["status"];
    competence?: string;
    page: number;
    pageSize: number;
    sortBy: "competence" | "createdAt" | "status";
    sortDir: "asc" | "desc";
  }) {
    return this.withdrawals.list({ ...query, competence: query.competence ? new Date(query.competence) : undefined });
  }

  summary(competence: Date) {
    return this.withdrawals.summary(competence);
  }
}
