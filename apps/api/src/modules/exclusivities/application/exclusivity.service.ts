import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import type { ExclusivityInput, ListExclusivitiesQuery, UpdateExclusivityInput } from "@cs-hub/shared-types";
import {
  EXCLUSIVITY_REPOSITORY,
  type ExclusivityRecord,
  type ExclusivityRepository,
  type ExclusivityWithCreatorNameRecord,
} from "../domain/exclusivity.repository";

@Injectable()
export class ExclusivityService {
  constructor(@Inject(EXCLUSIVITY_REPOSITORY) private readonly exclusivities: ExclusivityRepository) {}

  create(input: ExclusivityInput): Promise<ExclusivityRecord> {
    return this.exclusivities.create({
      creatorId: input.creatorId,
      company: input.company,
      brand: input.brand,
      contractId: input.contractId ?? null,
      valueCents: input.valueCents,
      penaltyCents: input.penaltyCents ?? null,
      startDate: new Date(input.startDate),
      endDate: new Date(input.endDate),
      autoRenew: input.autoRenew,
      status: input.status,
      notes: input.notes ?? null,
    });
  }

  async update(id: string, input: UpdateExclusivityInput): Promise<ExclusivityRecord> {
    const existing = await this.exclusivities.findById(id);
    if (!existing) throw new NotFoundException("Exclusividade não encontrada");

    return this.exclusivities.update(id, {
      ...input,
      startDate: input.startDate ? new Date(input.startDate) : undefined,
      endDate: input.endDate ? new Date(input.endDate) : undefined,
    });
  }

  async findById(id: string): Promise<ExclusivityWithCreatorNameRecord> {
    const exclusivity = await this.exclusivities.findById(id);
    if (!exclusivity) throw new NotFoundException("Exclusividade não encontrada");
    return exclusivity;
  }

  list(query: ListExclusivitiesQuery) {
    return this.exclusivities.list(query);
  }
}
