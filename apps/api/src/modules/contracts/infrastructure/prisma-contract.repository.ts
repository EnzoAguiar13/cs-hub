import { Injectable } from "@nestjs/common";
import type { Prisma } from "@prisma/client";
import { PrismaService } from "../../../prisma/prisma.service";
import type {
  ContractRecord,
  ContractRepository,
  CreateContractData,
  ListContractsFilters,
  UpdateContractData,
} from "../domain/contract.repository";

@Injectable()
export class PrismaContractRepository implements ContractRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateContractData): Promise<ContractRecord> {
    return this.prisma.contract.create({ data });
  }

  async update(id: string, data: UpdateContractData): Promise<ContractRecord> {
    return this.prisma.contract.update({ where: { id }, data });
  }

  async findById(id: string): Promise<ContractRecord | null> {
    return this.prisma.contract.findUnique({ where: { id } });
  }

  async list(filters: ListContractsFilters): Promise<{ items: ContractRecord[]; total: number }> {
    const where: Prisma.ContractWhereInput = { creatorId: filters.creatorId, status: filters.status };

    const [items, total] = await Promise.all([
      this.prisma.contract.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (filters.page - 1) * filters.pageSize,
        take: filters.pageSize,
      }),
      this.prisma.contract.count({ where }),
    ]);

    return { items, total };
  }
}
