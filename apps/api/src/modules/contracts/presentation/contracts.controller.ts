import { Body, Controller, Get, Param, Patch, Post, Query } from "@nestjs/common";
import {
  contractInputSchema,
  listContractsQuerySchema,
  requestContractUploadSchema,
  updateContractSchema,
  type ContractInput,
  type ListContractsQuery,
  type RequestContractUploadInput,
  type UpdateContractInput,
} from "@cs-hub/shared-types";
import { CurrentUser, type RequestUser } from "../../../common/decorators/current-user.decorator";
import { RequirePermission } from "../../../common/decorators/require-permission.decorator";
import { ZodValidationPipe } from "../../../common/pipes/zod-validation.pipe";
import { ContractService } from "../application/contract.service";
import { toContractResponse } from "./contract.mapper";

@Controller("contracts")
export class ContractsController {
  constructor(private readonly contracts: ContractService) {}

  @Get()
  @RequirePermission("contracts", "read")
  async list(@Query(new ZodValidationPipe(listContractsQuerySchema)) query: ListContractsQuery) {
    const { items, total } = await this.contracts.list(query);
    return { items: items.map(toContractResponse), total, page: query.page, pageSize: query.pageSize };
  }

  @Post("upload-request")
  @RequirePermission("contracts", "create")
  requestUpload(@Body(new ZodValidationPipe(requestContractUploadSchema)) body: RequestContractUploadInput) {
    return this.contracts.requestUpload(body);
  }

  @Post()
  @RequirePermission("contracts", "create")
  async create(@Body(new ZodValidationPipe(contractInputSchema)) body: ContractInput, @CurrentUser() user: RequestUser) {
    const contract = await this.contracts.create(body, user.id);
    return toContractResponse(await this.contracts.findById(contract.id));
  }

  @Get(":id")
  @RequirePermission("contracts", "read")
  async getById(@Param("id") id: string) {
    return toContractResponse(await this.contracts.findById(id));
  }

  @Patch(":id")
  @RequirePermission("contracts", "update")
  async update(@Param("id") id: string, @Body(new ZodValidationPipe(updateContractSchema)) body: UpdateContractInput) {
    await this.contracts.update(id, body);
    return toContractResponse(await this.contracts.findById(id));
  }
}
