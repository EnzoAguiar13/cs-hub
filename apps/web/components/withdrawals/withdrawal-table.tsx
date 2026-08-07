"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import type { WithdrawalStatus } from "@cs-hub/shared-types";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { WithdrawalStatusBadge, WITHDRAWAL_STATUS_LABEL } from "@/components/withdrawals/withdrawal-status-badge";
import { WithdrawalActions } from "@/components/withdrawals/withdrawal-actions";
import { useWithdrawalsQuery } from "@/hooks/use-withdrawals";
import { formatCentsToBRL } from "@/lib/format";

const PAGE_SIZE = 20;
const NOT_REQUESTED_STATUSES: WithdrawalStatus[] = ["NOT_AVAILABLE", "AVAILABLE"];

export function WithdrawalTable() {
  const [status, setStatus] = React.useState<WithdrawalStatus | "">("");
  const [page, setPage] = React.useState(1);

  const { data, isLoading } = useWithdrawalsQuery({ status: status || undefined, page, pageSize: PAGE_SIZE });
  const totalPages = data ? Math.max(1, Math.ceil(data.total / PAGE_SIZE)) : 1;

  return (
    <div className="space-y-4">
      <Select value={status || "ALL"} onValueChange={(value) => { setStatus(value === "ALL" ? "" : (value as WithdrawalStatus)); setPage(1); }}>
        <SelectTrigger className="h-8 w-56">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ALL">Todos os status</SelectItem>
          {Object.entries(WITHDRAWAL_STATUS_LABEL).map(([value, label]) => (
            <SelectItem key={value} value={value}>
              {label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Creator</TableHead>
              <TableHead>Competência</TableHead>
              <TableHead>Disponível</TableHead>
              <TableHead>Solicitado</TableHead>
              <TableHead>Status</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, index) => (
                <TableRow key={index}>
                  {Array.from({ length: 6 }).map((__, cellIndex) => (
                    <TableCell key={cellIndex}>
                      <Skeleton className="h-5 w-full max-w-28" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : data?.items.length ? (
              data.items.map((withdrawal) => (
                <TableRow
                  key={withdrawal.id}
                  className={cn(NOT_REQUESTED_STATUSES.includes(withdrawal.status) && "bg-destructive/10 hover:bg-destructive/15")}
                >
                  <TableCell className="font-medium">{withdrawal.creatorName}</TableCell>
                  <TableCell>
                    {new Date(withdrawal.competence).toLocaleDateString("pt-BR", { month: "long", year: "numeric" })}
                  </TableCell>
                  <TableCell>{formatCentsToBRL(withdrawal.availableAmountCents)}</TableCell>
                  <TableCell>{withdrawal.requestedAmountCents ? formatCentsToBRL(withdrawal.requestedAmountCents) : "—"}</TableCell>
                  <TableCell>
                    <WithdrawalStatusBadge status={withdrawal.status} />
                  </TableCell>
                  <TableCell>
                    <WithdrawalActions id={withdrawal.id} status={withdrawal.status} />
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                  Nenhum registro encontrado.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{data ? `${data.total} registro${data.total === 1 ? "" : "s"}` : null}</p>
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
