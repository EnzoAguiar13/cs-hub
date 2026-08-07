import { Inject, Injectable } from "@nestjs/common";
import type { ListCreatorsQuery } from "@cs-hub/shared-types";
import { CREATOR_REPOSITORY, type CreatorRepository, type CreatorRecord } from "../domain/creator.repository";

@Injectable()
export class ListCreatorsUseCase {
  constructor(@Inject(CREATOR_REPOSITORY) private readonly creators: CreatorRepository) {}

  // Summary listing never touches encrypted fields, so no decryption pass is needed here.
  execute(query: ListCreatorsQuery): Promise<{ items: CreatorRecord[]; total: number }> {
    return this.creators.list(query);
  }
}
