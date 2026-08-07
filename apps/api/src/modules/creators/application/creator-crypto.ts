import { Inject, Injectable } from "@nestjs/common";
import { ENCRYPTION_SERVICE, type EncryptionService } from "../../auth/domain/ports";
import { SENSITIVE_CREATOR_FIELDS } from "../domain/creator.entity";
import type { CreateCreatorData, CreatorRecord, UpdateCreatorData } from "../domain/creator.repository";

/** Encrypts/decrypts the sensitive Creator fields (cpf, cnpj, pixKey, bankAccount) at the application boundary. */
@Injectable()
export class CreatorCrypto {
  constructor(@Inject(ENCRYPTION_SERVICE) private readonly encryption: EncryptionService) {}

  encryptForWrite<T extends UpdateCreatorData | CreateCreatorData>(data: T): T {
    const result = { ...data };
    for (const field of SENSITIVE_CREATOR_FIELDS) {
      const value = result[field];
      if (typeof value === "string" && value.length > 0) {
        (result as Record<string, unknown>)[field] = this.encryption.encrypt(value);
      }
    }
    return result;
  }

  decryptForRead(record: CreatorRecord): CreatorRecord {
    const result = { ...record };
    for (const field of SENSITIVE_CREATOR_FIELDS) {
      const value = result[field];
      if (typeof value === "string" && value.length > 0) {
        result[field] = this.encryption.decrypt(value);
      }
    }
    return result;
  }
}
