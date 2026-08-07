"use client";

import * as React from "react";
import Link from "next/link";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { CampaignStatusBadge } from "@/components/campaigns/campaign-status-badge";
import { useCampaignsQuery } from "@/hooks/use-campaigns";
import { formatCentsToBRL } from "@/lib/format";

const PAGE_SIZE = 20;

export function CampaignTable() {
  const [page, setPage] = React.useState(1);
  const { data, isLoading } = useCampaignsQuery({ page, pageSize: PAGE_SIZE });
  const totalPages = data ? Math.max(1, Math.ceil(data.total / PAGE_SIZE)) : 1;

  return (
    <div className="space-y-4">
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Campanha</TableHead>
              <TableHead>Creator</TableHead>
              <TableHead>Investimento</TableHead>
              <TableHead>ROI</TableHead>
              <TableHead>CPA</TableHead>
              <TableHead>Conversão</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, index) => (
                <TableRow key={index}>
                  {Array.from({ length: 7 }).map((__, cellIndex) => (
                    <TableCell key={cellIndex}>
                      <Skeleton className="h-5 w-full max-w-24" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : data?.items.length ? (
              data.items.map((campaign) => (
                <TableRow key={campaign.id}>
                  <TableCell>
                    <Link href={`/campanhas/${campaign.id}`} className="font-medium hover:underline">
                      {campaign.name}
                    </Link>
                  </TableCell>
                  <TableCell>{campaign.creatorName ?? "—"}</TableCell>
                  <TableCell>{formatCentsToBRL(campaign.investmentCents)}</TableCell>
                  <TableCell className={campaign.roi !== null && campaign.roi < 0 ? "text-red-500" : "text-emerald-500"}>
                    {campaign.roi !== null ? `${(campaign.roi * 100).toFixed(0)}%` : "—"}
                  </TableCell>
                  <TableCell>{campaign.cpaCents !== null ? formatCentsToBRL(campaign.cpaCents) : "—"}</TableCell>
                  <TableCell>{campaign.conversionRate !== null ? `${(campaign.conversionRate * 100).toFixed(2)}%` : "—"}</TableCell>
                  <TableCell>
                    <CampaignStatusBadge status={campaign.status} />
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                  Nenhuma campanha encontrada.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{data ? `${data.total} campanha${data.total === 1 ? "" : "s"}` : null}</p>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
            Anterior
          </Button>
          <span className="text-sm text-muted-foreground">
            Página {page} de {totalPages}
          </span>
          <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
            Próxima
          </Button>
        </div>
      </div>
    </div>
  );
}
