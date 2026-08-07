"use client";

import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import { CampaignStatusBadge } from "@/components/campaigns/campaign-status-badge";
import { EmptyState } from "@/components/creators/empty-state";
import { useCampaignsQuery } from "@/hooks/use-campaigns";
import { formatCentsToBRL } from "@/lib/format";

export function CreatorCampaignsTab({ creatorId }: { creatorId: string }) {
  const { data, isLoading } = useCampaignsQuery({ creatorId, page: 1, pageSize: 20 });

  if (isLoading) return <Skeleton className="h-32 w-full max-w-2xl" />;
  if (!data?.items.length) {
    return <EmptyState title="Nenhuma campanha" description="Campanhas vinculadas a este creator aparecem aqui." />;
  }

  return (
    <ul className="max-w-2xl divide-y rounded-lg border">
      {data.items.map((campaign) => (
        <li key={campaign.id} className="flex items-center justify-between p-3">
          <div className="flex flex-col">
            <Link href={`/campanhas/${campaign.id}`} className="text-sm font-medium hover:underline">
              {campaign.name}
            </Link>
            <span className="text-xs text-muted-foreground">Investimento: {formatCentsToBRL(campaign.investmentCents)}</span>
          </div>
          <CampaignStatusBadge status={campaign.status} />
        </li>
      ))}
    </ul>
  );
}
