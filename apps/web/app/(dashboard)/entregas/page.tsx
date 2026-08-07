import type { DeliveryWithCreator } from "@cs-hub/shared-types";
import { CreateDeliveryDialog } from "@/components/deliveries/create-delivery-dialog";
import { DeliveryTable } from "@/components/deliveries/delivery-table";
import { ExportCsvButton } from "@/components/reports/export-csv-button";
import { apiFetch } from "@/lib/api-client";
import { DELIVERY_STATUS_LABEL, DELIVERY_TYPE_LABEL } from "@/components/deliveries/delivery-status-badge";

export default function DeliveriesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Entregas</h1>
          <p className="text-sm text-muted-foreground">Calendário de conteúdo combinado com os creators.</p>
        </div>
        <div className="flex gap-2">
          <ExportCsvButton
            filename="entregas.csv"
            fetchRows={async () => {
              const res = await apiFetch<{ items: DeliveryWithCreator[] }>("/deliveries?page=1&pageSize=1000");
              return res.items;
            }}
            columns={[
              { header: "Creator", value: (d) => d.creatorName },
              { header: "Tipo", value: (d) => DELIVERY_TYPE_LABEL[d.type] },
              { header: "Status", value: (d) => DELIVERY_STATUS_LABEL[d.status] },
              { header: "Agendado para", value: (d) => new Date(d.scheduledAt).toLocaleString("pt-BR") },
              { header: "Publicado em", value: (d) => (d.publishedAt ? new Date(d.publishedAt).toLocaleString("pt-BR") : "") },
            ]}
          />
          <CreateDeliveryDialog />
        </div>
      </div>
      <DeliveryTable />
    </div>
  );
}
