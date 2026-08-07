import type { CreatorStatus } from "@cs-hub/shared-types";

export const CREATOR_CREATED_EVENT = "creator.created";
export const CREATOR_STATUS_CHANGED_EVENT = "creator.status_changed";
export const CREATOR_FILE_UPLOADED_EVENT = "creator.file_uploaded";

export class CreatorCreatedEvent {
  constructor(
    public readonly creatorId: string,
    public readonly actorId: string,
  ) {}
}

export class CreatorStatusChangedEvent {
  constructor(
    public readonly creatorId: string,
    public readonly actorId: string,
    public readonly from: CreatorStatus,
    public readonly to: CreatorStatus,
  ) {}
}

export class CreatorFileUploadedEvent {
  constructor(
    public readonly creatorId: string,
    public readonly actorId: string,
    public readonly fileName: string,
  ) {}
}
