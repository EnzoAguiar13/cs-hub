import { Injectable } from "@nestjs/common";
import type { Prisma } from "@prisma/client";
import { PrismaService } from "../../../prisma/prisma.service";
import type {
  CampaignRecord,
  CampaignRepository,
  CampaignWithCreatorNameRecord,
  CreateCampaignData,
  ListCampaignsFilters,
  UpdateCampaignData,
} from "../domain/campaign.repository";

function toRecord(campaign: { creator: { name: string } | null } & Record<string, unknown>): CampaignWithCreatorNameRecord {
  const { creator, ...rest } = campaign;
  return { ...(rest as unknown as CampaignRecord), creatorName: creator?.name ?? null };
}

@Injectable()
export class PrismaCampaignRepository implements CampaignRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateCampaignData): Promise<CampaignRecord> {
    return this.prisma.campaign.create({ data });
  }

  async update(id: string, data: UpdateCampaignData): Promise<CampaignRecord> {
    return this.prisma.campaign.update({ where: { id }, data });
  }

  async findById(id: string): Promise<CampaignWithCreatorNameRecord | null> {
    const campaign = await this.prisma.campaign.findUnique({ where: { id }, include: { creator: { select: { name: true } } } });
    return campaign ? toRecord(campaign) : null;
  }

  async list(filters: ListCampaignsFilters): Promise<{ items: CampaignWithCreatorNameRecord[]; total: number }> {
    const where: Prisma.CampaignWhereInput = { creatorId: filters.creatorId, status: filters.status };

    const [items, total] = await Promise.all([
      this.prisma.campaign.findMany({
        where,
        include: { creator: { select: { name: true } } },
        orderBy: { [filters.sortBy]: filters.sortDir },
        skip: (filters.page - 1) * filters.pageSize,
        take: filters.pageSize,
      }),
      this.prisma.campaign.count({ where }),
    ]);

    return { items: items.map(toRecord), total };
  }
}
