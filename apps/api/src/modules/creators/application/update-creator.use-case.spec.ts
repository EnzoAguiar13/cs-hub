import { NotFoundException } from "@nestjs/common";
import { EventEmitter2 } from "@nestjs/event-emitter";
import type { EncryptionService } from "../../auth/domain/ports";
import { CREATOR_STATUS_CHANGED_EVENT } from "../domain/creator.events";
import { CreatorCrypto } from "./creator-crypto";
import { UpdateCreatorUseCase } from "./update-creator.use-case";
import { InMemoryCreatorRepository, buildCreateCreatorData } from "./__fixtures__/in-memory-creator.repository";

class PassthroughEncryption implements EncryptionService {
  encrypt(plain: string): string {
    return `enc:${plain}`;
  }
  decrypt(ciphertext: string): string {
    return ciphertext.replace(/^enc:/, "");
  }
}

async function setup() {
  const repository = new InMemoryCreatorRepository();
  const crypto = new CreatorCrypto(new PassthroughEncryption());
  const events = new EventEmitter2();
  const useCase = new UpdateCreatorUseCase(repository, crypto, events);
  const creator = await repository.create(buildCreateCreatorData());
  return { repository, useCase, events, creator };
}

describe("UpdateCreatorUseCase", () => {
  it("throws NotFoundException when the creator does not exist", async () => {
    const { useCase } = await setup();
    await expect(useCase.execute("missing", {}, "actor_1")).rejects.toThrow(NotFoundException);
  });

  it("emits CREATOR_STATUS_CHANGED_EVENT with from/to when the status actually changes", async () => {
    const { useCase, events, creator } = await setup();
    const listener = jest.fn();
    events.on(CREATOR_STATUS_CHANGED_EVENT, listener);

    await useCase.execute(creator.id, { status: "BLOCKED" }, "actor_1");

    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener.mock.calls[0][0]).toMatchObject({ creatorId: creator.id, from: "ACTIVE", to: "BLOCKED" });
  });

  it("does not emit a status event when the status is unchanged", async () => {
    const { useCase, events, creator } = await setup();
    const listener = jest.fn();
    events.on(CREATOR_STATUS_CHANGED_EVENT, listener);

    await useCase.execute(creator.id, { status: "ACTIVE" }, "actor_1");

    expect(listener).not.toHaveBeenCalled();
  });

  it("does not emit a status event when status is not part of the update", async () => {
    const { useCase, events, creator } = await setup();
    const listener = jest.fn();
    events.on(CREATOR_STATUS_CHANGED_EVENT, listener);

    await useCase.execute(creator.id, { name: "Novo Nome" }, "actor_1");

    expect(listener).not.toHaveBeenCalled();
  });

  it("encrypts sensitive fields before persisting and decrypts them on the returned record", async () => {
    const { useCase, repository, creator } = await setup();

    const result = await useCase.execute(creator.id, { cpf: "12345678900" }, "actor_1");

    expect(result.cpf).toBe("12345678900");
    const stored = await repository.findById(creator.id);
    expect(stored?.cpf).toBe("enc:12345678900");
  });
});
