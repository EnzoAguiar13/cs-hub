"use client";

import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { DealForm } from "@/components/deals/deal-form";
import { useDealQuery, useUpdateDealMutation } from "@/hooks/use-deals";
import { ApiError } from "@/lib/api-client";

export function DealDetailClient({ id }: { id: string }) {
  const { data: deal, isLoading, error } = useDealQuery(id);
  const updateDeal = useUpdateDealMutation(id);

  if (isLoading) {
    return <Skeleton className="h-96 w-full max-w-2xl" />;
  }

  if (error || !deal) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{error instanceof ApiError ? error.message : "Não foi possível carregar este deal."}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Deal — {deal.creatorName}</h1>
        <p className="text-sm text-muted-foreground">Criado em {new Date(deal.createdAt).toLocaleDateString("pt-BR")}</p>
      </div>
      <DealForm
        submitLabel="Salvar alterações"
        defaultValues={deal}
        onSubmit={async (values) => {
          try {
            await updateDeal.mutateAsync(values);
            toast.success("Deal atualizado.");
          } catch (error) {
            toast.error(error instanceof ApiError ? error.message : "Não foi possível salvar as alterações.");
          }
        }}
      />
    </div>
  );
}
