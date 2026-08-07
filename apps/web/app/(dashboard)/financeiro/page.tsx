import { CreateTransactionDialog } from "@/components/finance/create-transaction-dialog";
import { FinanceSummaryCards } from "@/components/finance/finance-summary-cards";
import { TransactionTable } from "@/components/finance/transaction-table";

export default function FinanceiroPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Financeiro</h1>
          <p className="text-sm text-muted-foreground">Entradas, saídas e fluxo de caixa do mês.</p>
        </div>
        <CreateTransactionDialog />
      </div>
      <FinanceSummaryCards />
      <TransactionTable />
    </div>
  );
}
