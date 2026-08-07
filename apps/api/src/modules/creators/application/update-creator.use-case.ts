import { BadRequestException, Inject, Injectable, NotFoundException } from "@nestjs/common";
import { EventEmitter2 } from "@nestjs/event-emitter";
import type { UpdateCreatorInput } from "@cs-hub/shared-types";
import { CREATOR_REPOSITORY, type CreatorRepository, type CreatorRecord } from "../domain/creator.repository";
import { CreatorStatusChangedEvent, CREATOR_STATUS_CHANGED_EVENT } from "../domain/creator.events";
import { canTransitionStatus } from "../domain/creator.entity";
import { CreatorCrypto } from "./creator-crypto";
import { toUpdateData } from "./creator-input.mapper";

@Injectable()
export class UpdateCreatorUseCase {
  constructor(
    @Inject(CREATOR_REPOSITORY) private readonly creators: CreatorRepository,
    private readonly crypto: CreatorCrypto,
    private readonly events: EventEmitter2,
  ) {}

  async execute(id: string, input: UpdateCreatorInput, actorId: string): Promise<CreatorRecord> {
    const existing = await this.creators.findById(id);
    if (!existing) throw new NotFoundException("Creator não encontrado");

    if (input.status && !canTransitionStatus(existing.status, input.status)) {
      throw new BadRequestException(`Transição de status inválida: ${existing.status} -> ${input.status}`);
    }

    const data = this.crypto.encryptForWrite(toUpdateData(input));
    const updated = await this.creators.update(id, data);

    if (input.status && input.status !== existing.status) {
      this.events.emit(
        CREATOR_STATUS_CHANGED_EVENT,
        new CreatorStatusChangedEvent(id, actorId, existing.status, input.status),
      );
    }

    return this.crypto.decryptForRead(updated);
  }
}
