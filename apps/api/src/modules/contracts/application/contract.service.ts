import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import type { ContractInput, RequestContractUploadInput, UpdateContractInput } from "@cs-hub/shared-types";
import { FILE_STORAGE, type FileStorage } from "../../creators/domain/file-storage";
import {
  CONTRACT_REPOSITORY,
  type ContractRecord,
  type ContractRepository,
} from "../domain/contract.repository";

export interface ContractWithDownloadUrl extends ContractRecord {
  downloadUrl: string;
}

@Injectable()
export class ContractService {
  constructor(
    @Inject(CONTRACT_REPOSITORY) private readonly contracts: ContractRepository,
    @Inject(FILE_STORAGE) private readonly storage: FileStorage,
  ) {}

  async requestUpload(input: RequestContractUploadInput) {
    const storageKey = this.storage.buildStorageKey(`contracts/${input.creatorId}`, input.fileName);
    const uploadUrl = await this.storage.getUploadUrl(storageKey, input.mimeType);
    return { uploadUrl, storageKey };
  }

  async create(input: ContractInput, actorId: string): Promise<ContractRecord> {
    let version = 1;
    if (input.previousVersionId) {
      const previous = await this.contracts.findById(input.previousVersionId);
      if (!previous) throw new NotFoundException("Versão anterior do contrato não encontrada");
      version = previous.version + 1;
    }

    return this.contracts.create({
      creatorId: input.creatorId,
      title: input.title,
      previousVersionId: input.previousVersionId ?? null,
      fileKey: input.storageKey,
      fileName: input.fileName,
      mimeType: input.mimeType,
      sizeBytes: input.sizeBytes,
      status: input.status,
      expiresAt: input.expiresAt ? new Date(input.expiresAt) : null,
      notes: input.notes ?? null,
      uploadedById: actorId,
      version,
    });
  }

  async update(id: string, input: UpdateContractInput): Promise<ContractRecord> {
    const existing = await this.contracts.findById(id);
    if (!existing) throw new NotFoundException("Contrato não encontrado");

    const becomesSigned = input.status === "SIGNED" && existing.status !== "SIGNED";

    return this.contracts.update(id, {
      ...input,
      expiresAt: input.expiresAt !== undefined ? (input.expiresAt ? new Date(input.expiresAt) : null) : undefined,
      signedAt: becomesSigned ? new Date() : undefined,
    });
  }

  async findById(id: string): Promise<ContractWithDownloadUrl> {
    const contract = await this.contracts.findById(id);
    if (!contract) throw new NotFoundException("Contrato não encontrado");
    const downloadUrl = await this.storage.getDownloadUrl(contract.fileKey);
    return { ...contract, downloadUrl };
  }

  async list(query: { creatorId?: string; status?: ContractRecord["status"]; page: number; pageSize: number }) {
    const { items, total } = await this.contracts.list(query);
    const withUrls = await Promise.all(
      items.map(async (item) => ({ ...item, downloadUrl: await this.storage.getDownloadUrl(item.fileKey) })),
    );
    return { items: withUrls, total };
  }
}
