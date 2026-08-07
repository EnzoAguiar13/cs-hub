import { Module } from "@nestjs/common";
import { FILE_STORAGE } from "../creators/domain/file-storage";
import { MinioFileStorage } from "../creators/infrastructure/minio-file-storage";
import { CONTRACT_REPOSITORY } from "./domain/contract.repository";
import { PrismaContractRepository } from "./infrastructure/prisma-contract.repository";
import { ContractService } from "./application/contract.service";
import { ContractsController } from "./presentation/contracts.controller";

@Module({
  controllers: [ContractsController],
  providers: [
    { provide: CONTRACT_REPOSITORY, useClass: PrismaContractRepository },
    { provide: FILE_STORAGE, useClass: MinioFileStorage },
    ContractService,
  ],
  exports: [ContractService],
})
export class ContractsModule {}
