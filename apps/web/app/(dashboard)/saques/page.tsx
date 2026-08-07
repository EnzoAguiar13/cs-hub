import type { WithdrawalWithCreator } from "@cs-hub/shared-types";
import { CreateWithdrawalDialog } from "@/components/withdrawals/create-withdrawal-dialog";
import { WithdrawalSummaryCards } from "@/components/withdrawals/withdrawal-summary-cards";
import { WithdrawalTable } from "@/components/withdrawals/withdrawal-table";
import { ExportCsvButton } from "@/components/reports/export-csv-button";
import { apiFetch } from "@/lib/api-client";
import { formatCentsToBRL } from "@/lib/format";
import { WITHDRAWAL_STATUS_LABEL } from "@/components/withdrawals/withdrawal-status-badge";

export default function SaquesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Controle de Saques</h1>
          <p className="text-sm text-muted-foreground">Solicitações de saque de afiliados e creators por competência.</p>
        </div>
        <div className="flex gap-2">
          <ExportCsvButton
            filename="saques.csv"
            fetchRows={async () => {
              const res = await apiFetch<{ items: WithdrawalWithCreator[] }>("/withdrawals?page=1&pageSize=1000");
              return res.items;
            }}
            columns={[
              { header: "Creator", value: (w) => w.creatorName },
              {
                header: "Competência",
                value: (w) => new Date(w.competence).toLocaleDateString("pt-BR", { month: "long", year: "numeric" }),
              },
              { header: "Disponível", value: (w) => formatCentsToBRL(w.availableAmountCents) },
              { header: "Solicitado", value: (w) => (w.requestedAmountCents ? formatCentsToBRL(w.requestedAmountCents) : "") },
              { header: "Status", value: (w) => WITHDRAWAL_STATUS_LABEL[w.status] },
              { header: "Pago em", value: (w) => (w.paidAt ? new Date(w.paidAt).toLocaleDateString("pt-BR") : "") },
            ]}
          />
          <CreateWithdrawalDialog />
        </div>
      </div>
      <WithdrawalSummaryCards />
      <WithdrawalTable />
    </div>
  );
}
