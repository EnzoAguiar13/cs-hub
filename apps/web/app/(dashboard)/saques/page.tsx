import { CreateWithdrawalDialog } from "@/components/withdrawals/create-withdrawal-dialog";
import { WithdrawalSummaryCards } from "@/components/withdrawals/withdrawal-summary-cards";
import { WithdrawalTable } from "@/components/withdrawals/withdrawal-table";

export default function SaquesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Controle de Saques</h1>
          <p className="text-sm text-muted-foreground">Solicitações de saque de afiliados e creators por competência.</p>
        </div>
        <CreateWithdrawalDialog />
      </div>
      <WithdrawalSummaryCards />
      <WithdrawalTable />
    </div>
  );
}
