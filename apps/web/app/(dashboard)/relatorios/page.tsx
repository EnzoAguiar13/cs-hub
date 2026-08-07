import type {
  CreatorSummary,
  DealWithCreator,
  TransactionWithCreator,
  WithdrawalWithCreator,
  CampaignWithCreator,
  DeliveryWithCreator,
} from "@cs-hub/shared-types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ExportCsvButton } from "@/components/reports/export-csv-button";
import { apiFetch } from "@/lib/api-client";
import { formatCentsToBRL } from "@/lib/format";
import { WITHDRAWAL_STATUS_LABEL } from "@/components/withdrawals/withdrawal-status-badge";
import { DELIVERY_STATUS_LABEL, DELIVERY_TYPE_LABEL } from "@/components/deliveries/delivery-status-badge";

const REPORTS = [
  {
    title: "Creators",
    description: "Todos os afiliados e influenciadores cadastrados.",
    filename: "creators.csv",
    path: "/creators?page=1&pageSize=1000",
    columns: [
      { header: "Nome", value: (c: CreatorSummary) => c.name },
      { header: "Status", value: (c: CreatorSummary) => c.status },
      { header: "Categoria", value: (c: CreatorSummary) => c.category ?? "" },
      { header: "País", value: (c: CreatorSummary) => c.country ?? "" },
      { header: "Cadastrado em", value: (c: CreatorSummary) => new Date(c.createdAt).toLocaleDateString("pt-BR") },
    ],
  },
  {
    title: "Deals",
    description: "Todos os acordos comerciais.",
    filename: "deals.csv",
    path: "/deals?page=1&pageSize=1000",
    columns: [
      { header: "Creator", value: (d: DealWithCreator) => d.creatorName },
      { header: "Tipo", value: (d: DealWithCreator) => d.type },
      { header: "Status", value: (d: DealWithCreator) => d.status },
      { header: "Início", value: (d: DealWithCreator) => new Date(d.startDate).toLocaleDateString("pt-BR") },
    ],
  },
  {
    title: "Financeiro",
    description: "Todos os lançamentos financeiros.",
    filename: "financeiro.csv",
    path: "/finance/transactions?page=1&pageSize=1000",
    columns: [
      { header: "Descrição", value: (t: TransactionWithCreator) => t.description },
      { header: "Creator", value: (t: TransactionWithCreator) => t.creatorName ?? "" },
      { header: "Valor", value: (t: TransactionWithCreator) => formatCentsToBRL(t.amountCents) },
      { header: "Status", value: (t: TransactionWithCreator) => t.status },
    ],
  },
  {
    title: "Saques",
    description: "Histórico completo de solicitações de saque.",
    filename: "saques.csv",
    path: "/withdrawals?page=1&pageSize=1000",
    columns: [
      { header: "Creator", value: (w: WithdrawalWithCreator) => w.creatorName },
      { header: "Status", value: (w: WithdrawalWithCreator) => WITHDRAWAL_STATUS_LABEL[w.status] },
      {
        header: "Solicitado",
        value: (w: WithdrawalWithCreator) => (w.requestedAmountCents ? formatCentsToBRL(w.requestedAmountCents) : ""),
      },
    ],
  },
  {
    title: "Campanhas",
    description: "Investimento e resultados por campanha.",
    filename: "campanhas.csv",
    path: "/campaigns?page=1&pageSize=1000",
    columns: [
      { header: "Campanha", value: (c: CampaignWithCreator) => c.name },
      { header: "Investimento", value: (c: CampaignWithCreator) => formatCentsToBRL(c.investmentCents) },
      { header: "ROI", value: (c: CampaignWithCreator) => (c.roi !== null ? `${(c.roi * 100).toFixed(0)}%` : "") },
    ],
  },
  {
    title: "Entregas",
    description: "Calendário completo de entregas de conteúdo.",
    filename: "entregas.csv",
    path: "/deliveries?page=1&pageSize=1000",
    columns: [
      { header: "Creator", value: (d: DeliveryWithCreator) => d.creatorName },
      { header: "Tipo", value: (d: DeliveryWithCreator) => DELIVERY_TYPE_LABEL[d.type] },
      { header: "Status", value: (d: DeliveryWithCreator) => DELIVERY_STATUS_LABEL[d.status] },
    ],
  },
];

export default function RelatoriosPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Relatórios</h1>
        <p className="text-sm text-muted-foreground">
          Exportação em CSV (abre nativamente no Excel/Google Sheets) de cada módulo do CS Hub.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {REPORTS.map((report) => (
          <Card key={report.title}>
            <CardHeader>
              <CardTitle className="text-base">{report.title}</CardTitle>
              <CardDescription>{report.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <ExportCsvButton
                filename={report.filename}
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                columns={report.columns as any}
                fetchRows={async () => {
                  const res = await apiFetch<{ items: unknown[] }>(report.path);
                  return res.items;
                }}
              />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
