"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { CreatorForm } from "@/components/creators/creator-form";
import { useCreateCreatorMutation } from "@/hooks/use-creators";
import { ApiError } from "@/lib/api-client";

export default function NewCreatorPage() {
  const router = useRouter();
  const createCreator = useCreateCreatorMutation();

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Novo Creator</h1>
        <p className="text-sm text-muted-foreground">Cadastre um novo afiliado ou influenciador.</p>
      </div>
      <CreatorForm
        submitLabel="Criar Creator"
        onSubmit={async (values) => {
          try {
            const creator = await createCreator.mutateAsync(values);
            toast.success("Creator criado com sucesso.");
            router.push(`/creators/${creator.id}`);
          } catch (error) {
            toast.error(error instanceof ApiError ? error.message : "Não foi possível criar o creator.");
          }
        }}
      />
    </div>
  );
}
