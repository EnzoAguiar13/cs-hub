import { Inject, Injectable } from "@nestjs/common";
import { EventEmitter2 } from "@nestjs/event-emitter";
import type { CreatorInput } from "@cs-hub/shared-types";
import { CREATOR_REPOSITORY, type CreatorRepository, type CreatorRecord } from "../domain/creator.repository";
import { CreatorCreatedEvent, CREATOR_CREATED_EVENT } from "../domain/creator.events";
import { CreatorCrypto } from "./creator-crypto";
import { toCreateData } from "./creator-input.mapper";

@Injectable()
export class CreateCreatorUseCase {
  constructor(
    @Inject(CREATOR_REPOSITORY) private readonly creators: CreatorRepository,
    private readonly crypto: CreatorCrypto,
    private readonly events: EventEmitter2,
  ) {}

  async execute(input: CreatorInput, actorId: string): Promise<CreatorRecord> {
    const data = this.crypto.encryptForWrite(toCreateData(input));
    const creator = await this.creators.create(data);
    this.events.emit(CREATOR_CREATED_EVENT, new CreatorCreatedEvent(creator.id, actorId));
    return this.crypto.decryptForRead(creator);
  }
}
