import { Inject, Injectable } from "@nestjs/common";
import { OnEvent } from "@nestjs/event-emitter";
import { CREATOR_REPOSITORY, type CreatorRepository } from "../domain/creator.repository";
import {
  CREATOR_CREATED_EVENT,
  CREATOR_FILE_UPLOADED_EVENT,
  CREATOR_STATUS_CHANGED_EVENT,
  type CreatorCreatedEvent,
  type CreatorFileUploadedEvent,
  type CreatorStatusChangedEvent,
} from "../domain/creator.events";

/** Turns domain events into human-readable CreatorTimelineEvent rows automatically. */
@Injectable()
export class CreatorTimelineListener {
  constructor(@Inject(CREATOR_REPOSITORY) private readonly creators: CreatorRepository) {}

  @OnEvent(CREATOR_CREATED_EVENT)
  async onCreated(event: CreatorCreatedEvent) {
    await this.creators.addTimelineEvent({
      creatorId: event.creatorId,
      type: "CREATED",
      description: "Creator cadastrado",
      actorId: event.actorId,
      metadata: null,
    });
  }

  @OnEvent(CREATOR_STATUS_CHANGED_EVENT)
  async onStatusChanged(event: CreatorStatusChangedEvent) {
    await this.creators.addTimelineEvent({
      creatorId: event.creatorId,
      type: "STATUS_CHANGE",
      description: `Status alterado de ${event.from} para ${event.to}`,
      actorId: event.actorId,
      metadata: { from: event.from, to: event.to },
    });
  }

  @OnEvent(CREATOR_FILE_UPLOADED_EVENT)
  async onFileUploaded(event: CreatorFileUploadedEvent) {
    await this.creators.addTimelineEvent({
      creatorId: event.creatorId,
      type: "FILE_UPLOAD",
      description: `Arquivo enviado: ${event.fileName}`,
      actorId: event.actorId,
      metadata: { fileName: event.fileName },
    });
  }
}
