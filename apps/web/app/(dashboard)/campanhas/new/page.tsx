"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { CampaignForm } from "@/components/campaigns/campaign-form";
import { useCreateCampaignMutation } from "@/hooks/use-campaigns";
import { ApiError } from "@/lib/api-client";

export default function NewCampaignPage() {
  const router = useRouter();
  const createCampaign = useCreateCampaignMutation();

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Nova Campanha</h1>
        <p className="text-sm text-muted-foreground">Cadastre uma nova campanha de marketing.</p>
      </div>
      <CampaignForm
        submitLabel="Criar Campanha"
        onSubmit={async (values) => {
          try {
            const campaign = await createCampaign.mutateAsync(values);
            toast.success("Campanha criada com sucesso.");
            router.push(`/campanhas/${campaign.id}`);
          } catch (error) {
            toast.error(error instanceof ApiError ? error.message : "Não foi possível criar a campanha.");
          }
        }}
      />
    </div>
  );
}
