import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import type { AddTimelineNoteInput } from "@cs-hub/shared-types";
import { CREATOR_REPOSITORY, type CreatorRepository, type TimelineEventRecord } from "../domain/creator.repository";

@Injectable()
export class AddTimelineNoteUseCase {
  constructor(@Inject(CREATOR_REPOSITORY) private readonly creators: CreatorRepository) {}

  async execute(creatorId: string, input: AddTimelineNoteInput, actorId: string): Promise<TimelineEventRecord> {
    const creator = await this.creators.findById(creatorId);
    if (!creator) throw new NotFoundException("Creator não encontrado");

    return this.creators.addTimelineEvent({
      creatorId,
      type: "NOTE",
      description: input.description,
      actorId,
      metadata: null,
    });
  }
}
