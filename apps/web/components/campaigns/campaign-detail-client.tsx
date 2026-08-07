"use client";

import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CampaignForm } from "@/components/campaigns/campaign-form";
import { useCampaignQuery, useUpdateCampaignMutation } from "@/hooks/use-campaigns";
import { ApiError } from "@/lib/api-client";

export function CampaignDetailClient({ id }: { id: string }) {
  const { data: campaign, isLoading, error } = useCampaignQuery(id);
  const updateCampaign = useUpdateCampaignMutation(id);

  if (isLoading) return <Skeleton className="h-96 w-full max-w-2xl" />;

  if (error || !campaign) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{error instanceof ApiError ? error.message : "Não foi possível carregar esta campanha."}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-xl font-semibold">{campaign.name}</h1>
        <p className="text-sm text-muted-foreground">
          ROI: {campaign.roi !== null ? `${(campaign.roi * 100).toFixed(0)}%` : "—"}
        </p>
      </div>
      <CampaignForm
        submitLabel="Salvar alterações"
        defaultValues={campaign}
        onSubmit={async (values) => {
          try {
            await updateCampaign.mutateAsync(values);
            toast.success("Campanha atualizada.");
          } catch (error) {
            toast.error(error instanceof ApiError ? error.message : "Não foi possível salvar as alterações.");
          }
        }}
      />
    </div>
  );
}
