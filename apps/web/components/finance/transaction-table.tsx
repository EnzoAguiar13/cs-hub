"use client";

import * as React from "react";
import { toast } from "sonner";
import type { TransactionStatus, TransactionType } from "@cs-hub/shared-types";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TransactionStatusBadge } from "@/components/finance/transaction-status-badge";
import { useTransactionsQuery, useUpdateTransactionMutation } from "@/hooks/use-finance";
import { ApiError } from "@/lib/api-client";
import { formatCentsToBRL, formatDate } from "@/lib/format";

const PAGE_SIZE = 20;
const TYPE_LABEL: Record<TransactionType, string> = { INCOME: "Receita", EXPENSE: "Despesa" };

function MarkAsPaidButton({ id, status }: { id: string; status: TransactionStatus }) {
  const updateTransaction = useUpdateTransactionMutation(id);
  if (status !== "PENDING") return null;

  return (
    <Button
      size="sm"
      variant="outline"
      disabled={updateTransaction.isPending}
      onClick={async () => {
        try {
          await updateTransaction.mutateAsync({ status: "PAID" });
          toast.success("Lançamento marcado como pago.");
        } catch (error) {
          toast.error(error instanceof ApiError ? error.message : "Não foi possível marcar como pago.");
        }
      }}
    >
      Marcar como pago
    </Button>
  );
}

export function TransactionTable() {
  const [status, setStatus] = React.useState<TransactionStatus | "">("");
  const [type, setType] = React.useState<TransactionType | "">("");
  const [page, setPage] = React.useState(1);

  const { data, isLoading } = useTransactionsQuery({
    status: status || undefined,
    type: type || undefined,
    page,
    pageSize: PAGE_SIZE,
  });
  const totalPages = data ? Math.max(1, Math.ceil(data.total / PAGE_SIZE)) : 1;

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Select value={type || "ALL"} onValueChange={(value) => { setType(value === "ALL" ? "" : (value as TransactionType)); setPage(1); }}>
          <SelectTrigger className="h-8 w-40">
            <SelectValue placeholder="Tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Todos os tipos</SelectItem>
            <SelectItem value="INCOME">Receita</SelectItem>
            <SelectItem value="EXPENSE">Despesa</SelectItem>
          </SelectContent>
        </Select>
        <Select value={status || "ALL"} onValueChange={(value) => { setStatus(value === "ALL" ? "" : (value as TransactionStatus)); setPage(1); }}>
          <SelectTrigger className="h-8 w-40">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Todos os status</SelectItem>
            <SelectItem value="PENDING">Pendente</SelectItem>
            <SelectItem value="PAID">Pago</SelectItem>
            <SelectItem value="CANCELLED">Cancelado</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Descrição</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Valor</TableHead>
              <TableHead>Vencimento</TableHead>
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
                      <Skeleton className="h-5 w-full max-w-32" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : data?.items.length ? (
              data.items.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium">{transaction.description}</span>
                      {transaction.creatorName && (
                        <span className="text-xs text-muted-foreground">{transaction.creatorName}</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{TYPE_LABEL[transaction.type]}</TableCell>
                  <TableCell className={transaction.type === "EXPENSE" ? "text-red-500" : "text-emerald-500"}>
                    {transaction.type === "EXPENSE" ? "-" : "+"}
                    {formatCentsToBRL(transaction.amountCents)}
                  </TableCell>
                  <TableCell>{formatDate(transaction.dueDate)}</TableCell>
                  <TableCell>
                    <TransactionStatusBadge status={transaction.status} />
                  </TableCell>
                  <TableCell>
                    <MarkAsPaidButton id={transaction.id} status={transaction.status} />
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                  Nenhum lançamento encontrado.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{data ? `${data.total} lançamento${data.total === 1 ? "" : "s"}` : null}</p>
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
