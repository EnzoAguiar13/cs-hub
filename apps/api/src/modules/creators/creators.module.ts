import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { CREATOR_REPOSITORY } from "./domain/creator.repository";
import { FILE_STORAGE } from "./domain/file-storage";
import { PrismaCreatorRepository } from "./infrastructure/prisma-creator.repository";
import { MinioFileStorage } from "./infrastructure/minio-file-storage";
import { CreatorsController } from "./presentation/creators.controller";
import { AddTimelineNoteUseCase } from "./application/add-timeline-note.use-case";
import { ConfirmFileUploadUseCase } from "./application/confirm-file-upload.use-case";
import { CreateCreatorUseCase } from "./application/create-creator.use-case";
import { CreatorCrypto } from "./application/creator-crypto";
import { CreatorTimelineListener } from "./application/creator-timeline.listener";
import { GetCreatorUseCase } from "./application/get-creator.use-case";
import { ListCreatorsUseCase } from "./application/list-creators.use-case";
import { ListFilesUseCase } from "./application/list-files.use-case";
import { ListTimelineUseCase } from "./application/list-timeline.use-case";
import { RequestFileUploadUseCase } from "./application/request-file-upload.use-case";
import { UpdateCreatorUseCase } from "./application/update-creator.use-case";

@Module({
  imports: [AuthModule],
  controllers: [CreatorsController],
  providers: [
    { provide: CREATOR_REPOSITORY, useClass: PrismaCreatorRepository },
    { provide: FILE_STORAGE, useClass: MinioFileStorage },
    CreatorCrypto,
    CreatorTimelineListener,
    CreateCreatorUseCase,
    UpdateCreatorUseCase,
    GetCreatorUseCase,
    ListCreatorsUseCase,
    AddTimelineNoteUseCase,
    ListTimelineUseCase,
    RequestFileUploadUseCase,
    ConfirmFileUploadUseCase,
    ListFilesUseCase,
  ],
})
export class CreatorsModule {}
