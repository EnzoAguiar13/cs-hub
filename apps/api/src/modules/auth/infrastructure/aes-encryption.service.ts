import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";
import type { EncryptionService } from "../domain/ports";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 12;

/** Encrypts sensitive Creator fields (cpf, cnpj, pixKey, bankAccount) at rest. */
@Injectable()
export class AesEncryptionService implements EncryptionService {
  private readonly key: Buffer;

  constructor(config: ConfigService) {
    const rawKey = config.getOrThrow<string>("ENCRYPTION_KEY");
    this.key = Buffer.from(rawKey, "base64");
    if (this.key.length !== 32) {
      throw new Error("ENCRYPTION_KEY must decode to exactly 32 bytes (base64-encoded AES-256 key)");
    }
  }

  encrypt(plain: string): string {
    const iv = randomBytes(IV_LENGTH);
    const cipher = createCipheriv(ALGORITHM, this.key, iv);
    const ciphertext = Buffer.concat([cipher.update(plain, "utf8"), cipher.final()]);
    const authTag = cipher.getAuthTag();
    return [iv.toString("base64"), authTag.toString("base64"), ciphertext.toString("base64")].join(":");
  }

  decrypt(payload: string): string {
    const [ivB64, authTagB64, ciphertextB64] = payload.split(":");
    if (!ivB64 || !authTagB64 || !ciphertextB64) {
      throw new Error("Malformed encrypted payload");
    }
    const decipher = createDecipheriv(ALGORITHM, this.key, Buffer.from(ivB64, "base64"));
    decipher.setAuthTag(Buffer.from(authTagB64, "base64"));
    const plain = Buffer.concat([decipher.update(Buffer.from(ciphertextB64, "base64")), decipher.final()]);
    return plain.toString("utf8");
  }
}
