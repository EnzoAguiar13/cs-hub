import { Inject, Injectable } from "@nestjs/common";
import { CREATOR_REPOSITORY, type CreatorRepository, type CreatorFileRecord } from "../domain/creator.repository";
import { FILE_STORAGE, type FileStorage } from "../domain/file-storage";

export interface CreatorFileWithUrl extends CreatorFileRecord {
  downloadUrl: string;
}

@Injectable()
export class ListFilesUseCase {
  constructor(
    @Inject(CREATOR_REPOSITORY) private readonly creators: CreatorRepository,
    @Inject(FILE_STORAGE) private readonly storage: FileStorage,
  ) {}

  async execute(creatorId: string): Promise<CreatorFileWithUrl[]> {
    const files = await this.creators.listFiles(creatorId);
    return Promise.all(
      files.map(async (file) => ({
        ...file,
        downloadUrl: await this.storage.getDownloadUrl(file.storageKey),
      })),
    );
  }
}
