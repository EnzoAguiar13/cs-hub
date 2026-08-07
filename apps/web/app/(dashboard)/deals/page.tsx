import Link from "next/link";
import { Plus } from "lucide-react";
import type { DealWithCreator } from "@cs-hub/shared-types";
import { Button } from "@/components/ui/button";
import { DealTable } from "@/components/deals/deal-table";
import { ExportCsvButton } from "@/components/reports/export-csv-button";
import { apiFetch } from "@/lib/api-client";
import { formatCentsToBRL } from "@/lib/format";

export default function DealsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Deals</h1>
          <p className="text-sm text-muted-foreground">Acordos comerciais com afiliados e creators.</p>
        </div>
        <div className="flex gap-2">
          <ExportCsvButton
            filename="deals.csv"
            fetchRows={async () => {
              const res = await apiFetch<{ items: DealWithCreator[] }>("/deals?page=1&pageSize=1000");
              return res.items;
            }}
            columns={[
              { header: "Creator", value: (d) => d.creatorName },
              { header: "Tipo", value: (d) => d.type },
              { header: "Status", value: (d) => d.status },
              { header: "CPA", value: (d) => (d.cpaValueCents ? formatCentsToBRL(d.cpaValueCents) : "") },
              { header: "RevShare %", value: (d) => d.revSharePercent ?? "" },
              { header: "Início", value: (d) => new Date(d.startDate).toLocaleDateString("pt-BR") },
              { header: "Fim", value: (d) => (d.endDate ? new Date(d.endDate).toLocaleDateString("pt-BR") : "") },
            ]}
          />
          <Button asChild>
            <Link href="/deals/new">
              <Plus />
              Novo Deal
            </Link>
          </Button>
        </div>
      </div>
      <DealTable />
    </div>
  );
}
