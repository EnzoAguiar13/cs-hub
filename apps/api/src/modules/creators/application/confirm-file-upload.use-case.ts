import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { EventEmitter2 } from "@nestjs/event-emitter";
import type { ConfirmFileUploadInput } from "@cs-hub/shared-types";
import { CREATOR_REPOSITORY, type CreatorRepository, type CreatorFileRecord } from "../domain/creator.repository";
import { CreatorFileUploadedEvent, CREATOR_FILE_UPLOADED_EVENT } from "../domain/creator.events";

@Injectable()
export class ConfirmFileUploadUseCase {
  constructor(
    @Inject(CREATOR_REPOSITORY) private readonly creators: CreatorRepository,
    private readonly events: EventEmitter2,
  ) {}

  async execute(creatorId: string, input: ConfirmFileUploadInput, actorId: string): Promise<CreatorFileRecord> {
    const creator = await this.creators.findById(creatorId);
    if (!creator) throw new NotFoundException("Creator não encontrado");

    const file = await this.creators.createFile({
      creatorId,
      type: input.type,
      fileName: input.fileName,
      storageKey: input.storageKey,
      mimeType: input.mimeType,
      sizeBytes: input.sizeBytes,
      uploadedById: actorId,
    });

    this.events.emit(
      CREATOR_FILE_UPLOADED_EVENT,
      new CreatorFileUploadedEvent(creatorId, actorId, input.fileName),
    );

    return file;
  }
}
