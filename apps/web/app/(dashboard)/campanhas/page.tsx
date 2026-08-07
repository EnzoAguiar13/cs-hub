import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CampaignTable } from "@/components/campaigns/campaign-table";

export default function CampaignsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Campanhas</h1>
          <p className="text-sm text-muted-foreground">Investimento, resultados e ROI por campanha.</p>
        </div>
        <Button asChild>
          <Link href="/campanhas/new">
            <Plus />
            Nova Campanha
          </Link>
        </Button>
      </div>
      <CampaignTable />
    </div>
  );
}
