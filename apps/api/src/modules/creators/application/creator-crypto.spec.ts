import type { EncryptionService } from "../../auth/domain/ports";
import { CreatorCrypto } from "./creator-crypto";
import { buildCreateCreatorData } from "./__fixtures__/in-memory-creator.repository";

class ReversibleFakeEncryption implements EncryptionService {
  encrypt(plain: string): string {
    return `enc:${plain}`;
  }
  decrypt(ciphertext: string): string {
    return ciphertext.replace(/^enc:/, "");
  }
}

describe("CreatorCrypto", () => {
  const crypto = new CreatorCrypto(new ReversibleFakeEncryption());

  it("encrypts the four sensitive fields on write", () => {
    const data = buildCreateCreatorData({ pixKey: "chave-pix", bankAccount: "123-4", cpf: "12345678900", cnpj: null });

    const encrypted = crypto.encryptForWrite(data);

    expect(encrypted.pixKey).toBe("enc:chave-pix");
    expect(encrypted.bankAccount).toBe("enc:123-4");
    expect(encrypted.cpf).toBe("enc:12345678900");
    expect(encrypted.cnpj).toBeNull();
  });

  it("leaves non-sensitive fields untouched", () => {
    const data = buildCreateCreatorData({ name: "Fulano", pixKey: "chave-pix" });

    const encrypted = crypto.encryptForWrite(data);

    expect(encrypted.name).toBe("Fulano");
  });

  it("does not encrypt null or empty sensitive fields", () => {
    const data = buildCreateCreatorData({ pixKey: null, bankAccount: null, cpf: null, cnpj: null });

    const encrypted = crypto.encryptForWrite(data);

    expect(encrypted.pixKey).toBeNull();
    expect(encrypted.bankAccount).toBeNull();
    expect(encrypted.cpf).toBeNull();
    expect(encrypted.cnpj).toBeNull();
  });

  it("round-trips encrypt -> decrypt back to the original plaintext", () => {
    const created = { id: "creator_1", createdAt: new Date(), updatedAt: new Date(), ...buildCreateCreatorData({
      pixKey: "chave-pix",
      bankAccount: "123-4",
      cpf: "12345678900",
      cnpj: "12345678000199",
    }) };

    const encrypted = crypto.encryptForWrite(created);
    const decrypted = crypto.decryptForRead({ ...created, ...encrypted });

    expect(decrypted.pixKey).toBe("chave-pix");
    expect(decrypted.bankAccount).toBe("123-4");
    expect(decrypted.cpf).toBe("12345678900");
    expect(decrypted.cnpj).toBe("12345678000199");
  });
});
