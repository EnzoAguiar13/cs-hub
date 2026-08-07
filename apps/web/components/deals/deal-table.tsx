"use client";

import * as React from "react";
import Link from "next/link";
import type { DealStatus } from "@cs-hub/shared-types";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DealStatusBadge } from "@/components/deals/deal-status-badge";
import { useDealsQuery } from "@/hooks/use-deals";
import { formatCentsToBRL, formatDate } from "@/lib/format";

const PAGE_SIZE = 20;

const DEAL_TYPE_LABEL: Record<string, string> = {
  CPA: "CPA",
  REVSHARE: "RevShare",
  HYBRID: "Híbrido",
  FEE: "Fee",
  MONTHLY: "Mensal",
  WEEKLY: "Semanal",
  BONUS: "Bônus",
};

function dealValue(deal: {
  cpaValueCents?: number | null;
  revSharePercent?: number | null;
  fixedValueCents?: number | null;
}) {
  if (deal.cpaValueCents) return `${formatCentsToBRL(deal.cpaValueCents)} / FTD`;
  if (deal.revSharePercent) return `${deal.revSharePercent}% RevShare`;
  if (deal.fixedValueCents) return formatCentsToBRL(deal.fixedValueCents);
  return "—";
}

export function DealTable() {
  const [status, setStatus] = React.useState<DealStatus | "">("");
  const [page, setPage] = React.useState(1);

  const { data, isLoading } = useDealsQuery({ status: status || undefined, page, pageSize: PAGE_SIZE });
  const totalPages = data ? Math.max(1, Math.ceil(data.total / PAGE_SIZE)) : 1;

  return (
    <div className="space-y-4">
      <Select
        value={status || "ALL"}
        onValueChange={(value) => {
          setStatus(value === "ALL" ? "" : (value as DealStatus));
          setPage(1);
        }}
      >
        <SelectTrigger className="h-8 w-40">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ALL">Todos os status</SelectItem>
          <SelectItem value="ACTIVE">Ativo</SelectItem>
          <SelectItem value="PAUSED">Pausado</SelectItem>
          <SelectItem value="ENDED">Encerrado</SelectItem>
        </SelectContent>
      </Select>

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Creator</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Valor</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Início</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, index) => (
                <TableRow key={index}>
                  {Array.from({ length: 5 }).map((__, cellIndex) => (
                    <TableCell key={cellIndex}>
                      <Skeleton className="h-5 w-full max-w-32" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : data?.items.length ? (
              data.items.map((deal) => (
                <TableRow key={deal.id}>
                  <TableCell>
                    <Link href={`/deals/${deal.id}`} className="font-medium hover:underline">
                      {deal.creatorName}
                    </Link>
                  </TableCell>
                  <TableCell>{DEAL_TYPE_LABEL[deal.type]}</TableCell>
                  <TableCell>{dealValue(deal)}</TableCell>
                  <TableCell>
                    <DealStatusBadge status={deal.status} />
                  </TableCell>
                  <TableCell>{formatDate(deal.startDate)}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                  Nenhum deal encontrado.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{data ? `${data.total} deal${data.total === 1 ? "" : "s"}` : null}</p>
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
