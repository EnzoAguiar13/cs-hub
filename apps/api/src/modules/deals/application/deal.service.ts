import { BadRequestException, Inject, Injectable, NotFoundException } from "@nestjs/common";
import type { DealInput, ListDealsQuery, UpdateDealInput } from "@cs-hub/shared-types";
import {
  DEAL_REPOSITORY,
  type DealRepository,
  type DealRecord,
  type DealWithCreatorNameRecord,
} from "../domain/deal.repository";
import { canTransitionDealStatus } from "../domain/deal.entity";

@Injectable()
export class DealService {
  constructor(@Inject(DEAL_REPOSITORY) private readonly deals: DealRepository) {}

  create(input: DealInput): Promise<DealRecord> {
    return this.deals.create({
      creatorId: input.creatorId,
      type: input.type,
      status: input.status,
      cpaValueCents: input.cpaValueCents ?? null,
      revSharePercent: input.revSharePercent ?? null,
      fixedValueCents: input.fixedValueCents ?? null,
      targetValueCents: input.targetValueCents ?? null,
      startDate: new Date(input.startDate),
      endDate: input.endDate ? new Date(input.endDate) : null,
      autoRenew: input.autoRenew,
      notes: input.notes ?? null,
    });
  }

  async update(id: string, input: UpdateDealInput): Promise<DealRecord> {
    const existing = await this.deals.findById(id);
    if (!existing) throw new NotFoundException("Deal não encontrado");

    if (input.status && !canTransitionDealStatus(existing.status, input.status)) {
      throw new BadRequestException(`Transição de status inválida: ${existing.status} -> ${input.status}`);
    }

    return this.deals.update(id, {
      ...input,
      startDate: input.startDate ? new Date(input.startDate) : undefined,
      endDate: input.endDate !== undefined ? (input.endDate ? new Date(input.endDate) : null) : undefined,
    });
  }

  async findById(id: string): Promise<DealWithCreatorNameRecord> {
    const deal = await this.deals.findById(id);
    if (!deal) throw new NotFoundException("Deal não encontrado");
    return deal;
  }

  list(query: ListDealsQuery) {
    return this.deals.list(query);
  }
}
