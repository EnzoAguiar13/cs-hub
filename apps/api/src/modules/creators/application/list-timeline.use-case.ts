import { Inject, Injectable } from "@nestjs/common";
import { CREATOR_REPOSITORY, type CreatorRepository, type TimelineEventRecord } from "../domain/creator.repository";

@Injectable()
export class ListTimelineUseCase {
  constructor(@Inject(CREATOR_REPOSITORY) private readonly creators: CreatorRepository) {}

  execute(creatorId: string): Promise<TimelineEventRecord[]> {
    return this.creators.listTimelineEvents(creatorId);
  }
}
