"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { WithdrawalStatusBadge } from "@/components/withdrawals/withdrawal-status-badge";
import { EmptyState } from "@/components/creators/empty-state";
import { useWithdrawalsQuery } from "@/hooks/use-withdrawals";
import { formatCentsToBRL } from "@/lib/format";

export function CreatorWithdrawalsTab({ creatorId }: { creatorId: string }) {
  const { data, isLoading } = useWithdrawalsQuery({ creatorId, page: 1, pageSize: 24 });

  if (isLoading) return <Skeleton className="h-48 w-full max-w-3xl" />;
  if (!data?.items.length) {
    return <EmptyState title="Nenhum saque registrado" description="Os saques deste creator aparecem aqui por competência." />;
  }

  return (
    <div className="max-w-3xl rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Competência</TableHead>
            <TableHead>Valor solicitado</TableHead>
            <TableHead>Solicitado em</TableHead>
            <TableHead>Pago em</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.items.map((withdrawal) => (
            <TableRow key={withdrawal.id}>
              <TableCell>
                {new Date(withdrawal.competence).toLocaleDateString("pt-BR", { month: "long", year: "numeric" })}
              </TableCell>
              <TableCell>{withdrawal.requestedAmountCents ? formatCentsToBRL(withdrawal.requestedAmountCents) : "—"}</TableCell>
              <TableCell>{withdrawal.requestedAt ? new Date(withdrawal.requestedAt).toLocaleDateString("pt-BR") : "—"}</TableCell>
              <TableCell>{withdrawal.paidAt ? new Date(withdrawal.paidAt).toLocaleDateString("pt-BR") : "—"}</TableCell>
              <TableCell>
                <WithdrawalStatusBadge status={withdrawal.status} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
