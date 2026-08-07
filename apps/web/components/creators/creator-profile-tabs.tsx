"use client";

import { toast } from "sonner";
import type { Creator } from "@cs-hub/shared-types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CreatorForm } from "@/components/creators/creator-form";
import { CreatorTimeline } from "@/components/creators/creator-timeline";
import { CreatorFiles } from "@/components/creators/creator-files";
import { CreatorFinanceTab } from "@/components/creators/creator-finance-tab";
import { CreatorWithdrawalsTab } from "@/components/creators/creator-withdrawals-tab";
import { CreatorCampaignsTab } from "@/components/creators/creator-campaigns-tab";
import { CreatorDeliveriesTab } from "@/components/creators/creator-deliveries-tab";
import { CreatorContractsTab } from "@/components/creators/creator-contracts-tab";
import { CreatorExclusivityTab } from "@/components/creators/creator-exclusivity-tab";
import { useUpdateCreatorMutation } from "@/hooks/use-creators";
import { ApiError } from "@/lib/api-client";

export function CreatorProfileTabs({ creator }: { creator: Creator }) {
  const updateCreator = useUpdateCreatorMutation(creator.id);

  return (
    <Tabs defaultValue="info">
      <TabsList className="flex-wrap">
        <TabsTrigger value="info">Info</TabsTrigger>
        <TabsTrigger value="timeline">Timeline</TabsTrigger>
        <TabsTrigger value="files">Arquivos</TabsTrigger>
        <TabsTrigger value="financeiro">Financeiro</TabsTrigger>
        <TabsTrigger value="saques">Saques</TabsTrigger>
        <TabsTrigger value="campanhas">Campanhas</TabsTrigger>
        <TabsTrigger value="entregas">Entregas</TabsTrigger>
        <TabsTrigger value="contratos">Contratos</TabsTrigger>
        <TabsTrigger value="exclusividade">Exclusividade</TabsTrigger>
      </TabsList>

      <TabsContent value="info" className="max-w-3xl">
        <CreatorForm
          submitLabel="Salvar alterações"
          defaultValues={creator}
          onSubmit={async (values) => {
            try {
              await updateCreator.mutateAsync(values);
              toast.success("Creator atualizado.");
            } catch (error) {
              toast.error(error instanceof ApiError ? error.message : "Não foi possível salvar as alterações.");
            }
          }}
        />
      </TabsContent>

      <TabsContent value="timeline" className="max-w-2xl">
        <CreatorTimeline creatorId={creator.id} />
      </TabsContent>

      <TabsContent value="files" className="max-w-2xl">
        <CreatorFiles creatorId={creator.id} />
      </TabsContent>

      <TabsContent value="financeiro">
        <CreatorFinanceTab creatorId={creator.id} />
      </TabsContent>
      <TabsContent value="saques">
        <CreatorWithdrawalsTab creatorId={creator.id} />
      </TabsContent>
      <TabsContent value="campanhas">
        <CreatorCampaignsTab creatorId={creator.id} />
      </TabsContent>
      <TabsContent value="entregas">
        <CreatorDeliveriesTab creatorId={creator.id} />
      </TabsContent>
      <TabsContent value="contratos">
        <CreatorContractsTab creatorId={creator.id} />
      </TabsContent>
      <TabsContent value="exclusividade">
        <CreatorExclusivityTab creatorId={creator.id} />
      </TabsContent>
    </Tabs>
  );
}
