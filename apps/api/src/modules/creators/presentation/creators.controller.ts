import { Body, Controller, Get, Inject, Param, Patch, Post, Query } from "@nestjs/common";
import {
  addTimelineNoteSchema,
  confirmFileUploadSchema,
  creatorInputSchema,
  listCreatorsQuerySchema,
  requestFileUploadSchema,
  updateCreatorSchema,
  type AddTimelineNoteInput,
  type ConfirmFileUploadInput,
  type CreatorInput,
  type ListCreatorsQuery,
  type RequestFileUploadInput,
  type UpdateCreatorInput,
} from "@cs-hub/shared-types";
import { CurrentUser, type RequestUser } from "../../../common/decorators/current-user.decorator";
import { RequirePermission } from "../../../common/decorators/require-permission.decorator";
import { ZodValidationPipe } from "../../../common/pipes/zod-validation.pipe";
import { FILE_STORAGE, type FileStorage } from "../domain/file-storage";
import { AddTimelineNoteUseCase } from "../application/add-timeline-note.use-case";
import { ConfirmFileUploadUseCase } from "../application/confirm-file-upload.use-case";
import { CreateCreatorUseCase } from "../application/create-creator.use-case";
import { GetCreatorUseCase } from "../application/get-creator.use-case";
import { ListCreatorsUseCase } from "../application/list-creators.use-case";
import { ListFilesUseCase } from "../application/list-files.use-case";
import { ListTimelineUseCase } from "../application/list-timeline.use-case";
import { RequestFileUploadUseCase } from "../application/request-file-upload.use-case";
import { UpdateCreatorUseCase } from "../application/update-creator.use-case";
import {
  toCreatorResponse,
  toCreatorSummaryResponse,
  toFileResponse,
  toTimelineResponse,
} from "./creator.mapper";

@Controller("creators")
export class CreatorsController {
  constructor(
    private readonly createCreator: CreateCreatorUseCase,
    private readonly updateCreator: UpdateCreatorUseCase,
    private readonly getCreator: GetCreatorUseCase,
    private readonly listCreators: ListCreatorsUseCase,
    private readonly addTimelineNote: AddTimelineNoteUseCase,
    private readonly listTimeline: ListTimelineUseCase,
    private readonly requestFileUpload: RequestFileUploadUseCase,
    private readonly confirmFileUpload: ConfirmFileUploadUseCase,
    private readonly listFiles: ListFilesUseCase,
    @Inject(FILE_STORAGE) private readonly storage: FileStorage,
  ) {}

  @Get()
  @RequirePermission("creators", "read")
  async list(@Query(new ZodValidationPipe(listCreatorsQuerySchema)) query: ListCreatorsQuery) {
    const { items, total } = await this.listCreators.execute(query);
    return {
      items: items.map(toCreatorSummaryResponse),
      total,
      page: query.page,
      pageSize: query.pageSize,
    };
  }

  @Post()
  @RequirePermission("creators", "create")
  async create(
    @Body(new ZodValidationPipe(creatorInputSchema)) body: CreatorInput,
    @CurrentUser() user: RequestUser,
  ) {
    const creator = await this.createCreator.execute(body, user.id);
    return toCreatorResponse(creator);
  }

  @Get(":id")
  @RequirePermission("creators", "read")
  async getById(@Param("id") id: string) {
    const creator = await this.getCreator.execute(id);
    return toCreatorResponse(creator);
  }

  @Patch(":id")
  @RequirePermission("creators", "update")
  async update(
    @Param("id") id: string,
    @Body(new ZodValidationPipe(updateCreatorSchema)) body: UpdateCreatorInput,
    @CurrentUser() user: RequestUser,
  ) {
    const creator = await this.updateCreator.execute(id, body, user.id);
    return toCreatorResponse(creator);
  }

  @Get(":id/timeline")
  @RequirePermission("creators", "read")
  async getTimeline(@Param("id") id: string) {
    const events = await this.listTimeline.execute(id);
    return events.map(toTimelineResponse);
  }

  @Post(":id/timeline")
  @RequirePermission("creators", "update")
  async addNote(
    @Param("id") id: string,
    @Body(new ZodValidationPipe(addTimelineNoteSchema)) body: AddTimelineNoteInput,
    @CurrentUser() user: RequestUser,
  ) {
    const event = await this.addTimelineNote.execute(id, body, user.id);
    return toTimelineResponse(event);
  }

  @Get(":id/files")
  @RequirePermission("creators", "read")
  async getFiles(@Param("id") id: string) {
    const files = await this.listFiles.execute(id);
    return files.map(toFileResponse);
  }

  @Post(":id/files/upload-request")
  @RequirePermission("creators", "update")
  requestUpload(
    @Param("id") id: string,
    @Body(new ZodValidationPipe(requestFileUploadSchema)) body: RequestFileUploadInput,
  ) {
    return this.requestFileUpload.execute(id, body);
  }

  @Post(":id/files/confirm")
  @RequirePermission("creators", "update")
  async confirmUpload(
    @Param("id") id: string,
    @Body(new ZodValidationPipe(confirmFileUploadSchema)) body: ConfirmFileUploadInput,
    @CurrentUser() user: RequestUser,
  ) {
    const file = await this.confirmFileUpload.execute(id, body, user.id);
    const downloadUrl = await this.storage.getDownloadUrl(file.storageKey);
    return toFileResponse({ ...file, downloadUrl });
  }
}
