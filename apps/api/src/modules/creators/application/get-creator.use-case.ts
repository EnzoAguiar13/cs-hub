import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { CREATOR_REPOSITORY, type CreatorRepository, type CreatorRecord } from "../domain/creator.repository";
import { CreatorCrypto } from "./creator-crypto";

@Injectable()
export class GetCreatorUseCase {
  constructor(
    @Inject(CREATOR_REPOSITORY) private readonly creators: CreatorRepository,
    private readonly crypto: CreatorCrypto,
  ) {}

  async execute(id: string): Promise<CreatorRecord> {
    const creator = await this.creators.findById(id);
    if (!creator) throw new NotFoundException("Creator não encontrado");
    return this.crypto.decryptForRead(creator);
  }
}
