"use client";

import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { DealStatusBadge } from "@/components/deals/deal-status-badge";
import { TransactionStatusBadge } from "@/components/finance/transaction-status-badge";
import { useDealsQuery } from "@/hooks/use-deals";
import { useTransactionsQuery } from "@/hooks/use-finance";
import { formatCentsToBRL, formatDate } from "@/lib/format";
import { EmptyState } from "@/components/creators/empty-state";

export function CreatorFinanceTab({ creatorId }: { creatorId: string }) {
  const { data: deals, isLoading: loadingDeals } = useDealsQuery({ creatorId, page: 1, pageSize: 10 });
  const { data: transactions, isLoading: loadingTransactions } = useTransactionsQuery({ creatorId, page: 1, pageSize: 10 });

  return (
    <div className="max-w-2xl space-y-8">
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-muted-foreground">Deals</h3>
        {loadingDeals ? (
          <Skeleton className="h-24 w-full" />
        ) : !deals?.items.length ? (
          <EmptyState title="Nenhum deal cadastrado" description="Crie um deal para este creator no módulo Deals." />
        ) : (
          <ul className="divide-y rounded-lg border">
            {deals.items.map((deal) => (
              <li key={deal.id} className="flex items-center justify-between p-3">
                <Link href={`/deals/${deal.id}`} className="text-sm hover:underline">
                  {deal.type}
                </Link>
                <DealStatusBadge status={deal.status} />
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-muted-foreground">Lançamentos financeiros</h3>
        {loadingTransactions ? (
          <Skeleton className="h-24 w-full" />
        ) : !transactions?.items.length ? (
          <EmptyState title="Nenhum lançamento" description="Comissões e pagamentos deste creator aparecem aqui." />
        ) : (
          <ul className="divide-y rounded-lg border">
            {transactions.items.map((transaction) => (
              <li key={transaction.id} className="flex items-center justify-between p-3">
                <div className="flex flex-col">
                  <span className="text-sm">{transaction.description}</span>
                  <span className="text-xs text-muted-foreground">Vence em {formatDate(transaction.dueDate)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{formatCentsToBRL(transaction.amountCents)}</Badge>
                  <TransactionStatusBadge status={transaction.status} />
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
