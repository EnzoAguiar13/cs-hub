import {
  CreatorCreatedEvent,
  CreatorFileUploadedEvent,
  CreatorStatusChangedEvent,
} from "../domain/creator.events";
import { CreatorTimelineListener } from "./creator-timeline.listener";
import { InMemoryCreatorRepository, buildCreateCreatorData } from "./__fixtures__/in-memory-creator.repository";

describe("CreatorTimelineListener", () => {
  it("records a CREATED entry on creator creation", async () => {
    const repository = new InMemoryCreatorRepository();
    const creator = await repository.create(buildCreateCreatorData());
    const listener = new CreatorTimelineListener(repository);

    await listener.onCreated(new CreatorCreatedEvent(creator.id, "actor_1"));

    const events = await repository.listTimelineEvents(creator.id);
    expect(events).toHaveLength(1);
    expect(events[0]).toMatchObject({ type: "CREATED", actorId: "actor_1" });
  });

  it("records a STATUS_CHANGE entry with from/to in the metadata", async () => {
    const repository = new InMemoryCreatorRepository();
    const creator = await repository.create(buildCreateCreatorData());
    const listener = new CreatorTimelineListener(repository);

    await listener.onStatusChanged(new CreatorStatusChangedEvent(creator.id, "actor_1", "ACTIVE", "BLOCKED"));

    const events = await repository.listTimelineEvents(creator.id);
    expect(events[0]).toMatchObject({ type: "STATUS_CHANGE", metadata: { from: "ACTIVE", to: "BLOCKED" } });
  });

  it("records a FILE_UPLOAD entry with the file name in the metadata", async () => {
    const repository = new InMemoryCreatorRepository();
    const creator = await repository.create(buildCreateCreatorData());
    const listener = new CreatorTimelineListener(repository);

    await listener.onFileUploaded(new CreatorFileUploadedEvent(creator.id, "actor_1", "contrato.pdf"));

    const events = await repository.listTimelineEvents(creator.id);
    expect(events[0]).toMatchObject({ type: "FILE_UPLOAD", metadata: { fileName: "contrato.pdf" } });
  });
});
