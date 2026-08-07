import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import type { RequestFileUploadInput } from "@cs-hub/shared-types";
import { CREATOR_REPOSITORY, type CreatorRepository } from "../domain/creator.repository";
import { FILE_STORAGE, type FileStorage } from "../domain/file-storage";

@Injectable()
export class RequestFileUploadUseCase {
  constructor(
    @Inject(CREATOR_REPOSITORY) private readonly creators: CreatorRepository,
    @Inject(FILE_STORAGE) private readonly storage: FileStorage,
  ) {}

  async execute(creatorId: string, input: RequestFileUploadInput): Promise<{ uploadUrl: string; storageKey: string }> {
    const creator = await this.creators.findById(creatorId);
    if (!creator) throw new NotFoundException("Creator não encontrado");

    const storageKey = this.storage.buildStorageKey(creatorId, input.fileName);
    const uploadUrl = await this.storage.getUploadUrl(storageKey, input.mimeType);
    return { uploadUrl, storageKey };
  }
}
