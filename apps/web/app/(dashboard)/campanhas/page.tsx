import Link from "next/link";
import { Plus } from "lucide-react";
import type { CampaignWithCreator } from "@cs-hub/shared-types";
import { Button } from "@/components/ui/button";
import { CampaignTable } from "@/components/campaigns/campaign-table";
import { ExportCsvButton } from "@/components/reports/export-csv-button";
import { apiFetch } from "@/lib/api-client";
import { formatCentsToBRL } from "@/lib/format";

export default function CampaignsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Campanhas</h1>
          <p className="text-sm text-muted-foreground">Investimento, resultados e ROI por campanha.</p>
        </div>
        <div className="flex gap-2">
          <ExportCsvButton
            filename="campanhas.csv"
            fetchRows={async () => {
              const res = await apiFetch<{ items: CampaignWithCreator[] }>("/campaigns?page=1&pageSize=1000");
              return res.items;
            }}
            columns={[
              { header: "Campanha", value: (c) => c.name },
              { header: "Creator", value: (c) => c.creatorName ?? "" },
              { header: "Status", value: (c) => c.status },
              { header: "Investimento", value: (c) => formatCentsToBRL(c.investmentCents) },
              { header: "Receita", value: (c) => formatCentsToBRL(c.revenueCents) },
              { header: "ROI", value: (c) => (c.roi !== null ? `${(c.roi * 100).toFixed(0)}%` : "") },
              { header: "Cliques", value: (c) => c.clicks },
              { header: "FTDs", value: (c) => c.ftds },
            ]}
          />
          <Button asChild>
            <Link href="/campanhas/new">
              <Plus />
              Nova Campanha
            </Link>
          </Button>
        </div>
      </div>
      <CampaignTable />
    </div>
  );
}
