import { EventEmitter2 } from "@nestjs/event-emitter";
import type { CreatorInput } from "@cs-hub/shared-types";
import type { EncryptionService } from "../../auth/domain/ports";
import { CREATOR_CREATED_EVENT } from "../domain/creator.events";
import { CreatorCrypto } from "./creator-crypto";
import { CreateCreatorUseCase } from "./create-creator.use-case";
import { InMemoryCreatorRepository } from "./__fixtures__/in-memory-creator.repository";

class PassthroughEncryption implements EncryptionService {
  encrypt(plain: string): string {
    return `enc:${plain}`;
  }
  decrypt(ciphertext: string): string {
    return ciphertext.replace(/^enc:/, "");
  }
}

function buildInput(overrides: Partial<CreatorInput> = {}): CreatorInput {
  return {
    photoUrl: null,
    name: "Fulano da Silva",
    nickname: null,
    status: "ACTIVE",
    category: null,
    isVip: false,
    tags: [],
    phone: null,
    whatsapp: null,
    email: null,
    country: null,
    language: null,
    telegram: null,
    discord: null,
    instagram: null,
    tiktok: null,
    youtube: null,
    kick: null,
    facebook: null,
    twitterX: null,
    csResponsibleId: null,
    managerId: null,
    pixKey: null,
    bankName: null,
    bankAccount: null,
    cpf: null,
    cnpj: null,
    notes: null,
    ...overrides,
  };
}

describe("CreateCreatorUseCase", () => {
  it("persists the creator with sensitive fields encrypted and returns them decrypted", async () => {
    const repository = new InMemoryCreatorRepository();
    const crypto = new CreatorCrypto(new PassthroughEncryption());
    const events = new EventEmitter2();

    const useCase = new CreateCreatorUseCase(repository, crypto, events);
    const result = await useCase.execute(buildInput({ pixKey: "chave-pix" }), "actor_1");

    expect(result.pixKey).toBe("chave-pix");
    const stored = await repository.findById(result.id);
    expect(stored?.pixKey).toBe("enc:chave-pix");
  });

  it("emits CREATOR_CREATED_EVENT with the new creator id and actor", async () => {
    const repository = new InMemoryCreatorRepository();
    const crypto = new CreatorCrypto(new PassthroughEncryption());
    const events = new EventEmitter2();
    const listener = jest.fn();
    events.on(CREATOR_CREATED_EVENT, listener);

    const useCase = new CreateCreatorUseCase(repository, crypto, events);
    const result = await useCase.execute(buildInput(), "actor_42");

    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener.mock.calls[0][0]).toMatchObject({ creatorId: result.id, actorId: "actor_42" });
  });
});
