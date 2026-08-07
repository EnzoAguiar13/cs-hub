import type { TransactionWithCreator } from "@cs-hub/shared-types";
import { CreateTransactionDialog } from "@/components/finance/create-transaction-dialog";
import { FinanceSummaryCards } from "@/components/finance/finance-summary-cards";
import { TransactionTable } from "@/components/finance/transaction-table";
import { ExportCsvButton } from "@/components/reports/export-csv-button";
import { apiFetch } from "@/lib/api-client";
import { formatCentsToBRL } from "@/lib/format";

export default function FinanceiroPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Financeiro</h1>
          <p className="text-sm text-muted-foreground">Entradas, saídas e fluxo de caixa do mês.</p>
        </div>
        <div className="flex gap-2">
          <ExportCsvButton
            filename="financeiro.csv"
            fetchRows={async () => {
              const res = await apiFetch<{ items: TransactionWithCreator[] }>("/finance/transactions?page=1&pageSize=1000");
              return res.items;
            }}
            columns={[
              { header: "Descrição", value: (t) => t.description },
              { header: "Creator", value: (t) => t.creatorName ?? "" },
              { header: "Tipo", value: (t) => t.type },
              { header: "Valor", value: (t) => formatCentsToBRL(t.amountCents) },
              { header: "Vencimento", value: (t) => new Date(t.dueDate).toLocaleDateString("pt-BR") },
              { header: "Pago em", value: (t) => (t.paidAt ? new Date(t.paidAt).toLocaleDateString("pt-BR") : "") },
              { header: "Status", value: (t) => t.status },
            ]}
          />
          <CreateTransactionDialog />
        </div>
      </div>
      <FinanceSummaryCards />
      <TransactionTable />
    </div>
  );
}
