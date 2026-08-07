import { NotFoundException } from "@nestjs/common";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { CREATOR_FILE_UPLOADED_EVENT } from "../domain/creator.events";
import { ConfirmFileUploadUseCase } from "./confirm-file-upload.use-case";
import { InMemoryCreatorRepository, buildCreateCreatorData } from "./__fixtures__/in-memory-creator.repository";

describe("ConfirmFileUploadUseCase", () => {
  it("throws NotFoundException when the creator does not exist", async () => {
    const repository = new InMemoryCreatorRepository();
    const useCase = new ConfirmFileUploadUseCase(repository, new EventEmitter2());

    await expect(
      useCase.execute(
        "missing",
        { storageKey: "k", fileName: "f.png", mimeType: "image/png", sizeBytes: 10, type: "PHOTO" },
        "actor_1",
      ),
    ).rejects.toThrow(NotFoundException);
  });

  it("stores the file metadata and emits CREATOR_FILE_UPLOADED_EVENT", async () => {
    const repository = new InMemoryCreatorRepository();
    const events = new EventEmitter2();
    const listener = jest.fn();
    events.on(CREATOR_FILE_UPLOADED_EVENT, listener);
    const creator = await repository.create(buildCreateCreatorData());

    const useCase = new ConfirmFileUploadUseCase(repository, events);
    const file = await useCase.execute(
      creator.id,
      { storageKey: "creators/1/abc-doc.pdf", fileName: "doc.pdf", mimeType: "application/pdf", sizeBytes: 1024, type: "CONTRACT" },
      "actor_1",
    );

    expect(file).toMatchObject({ creatorId: creator.id, fileName: "doc.pdf", type: "CONTRACT", uploadedById: "actor_1" });
    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener.mock.calls[0][0]).toMatchObject({ creatorId: creator.id, actorId: "actor_1", fileName: "doc.pdf" });

    const files = await repository.listFiles(creator.id);
    expect(files).toHaveLength(1);
  });
});
