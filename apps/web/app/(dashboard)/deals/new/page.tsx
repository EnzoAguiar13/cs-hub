"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { DealForm } from "@/components/deals/deal-form";
import { useCreateDealMutation } from "@/hooks/use-deals";
import { ApiError } from "@/lib/api-client";

export default function NewDealPage() {
  const router = useRouter();
  const createDeal = useCreateDealMutation();

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Novo Deal</h1>
        <p className="text-sm text-muted-foreground">Cadastre um novo acordo comercial.</p>
      </div>
      <DealForm
        submitLabel="Criar Deal"
        onSubmit={async (values) => {
          try {
            const deal = await createDeal.mutateAsync(values);
            toast.success("Deal criado com sucesso.");
            router.push(`/deals/${deal.id}`);
          } catch (error) {
            toast.error(error instanceof ApiError ? error.message : "Não foi possível criar o deal.");
          }
        }}
      />
    </div>
  );
}
