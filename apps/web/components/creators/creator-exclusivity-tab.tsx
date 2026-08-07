"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { exclusivityInputSchema, type ExclusivityInput } from "@cs-hub/shared-types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { CurrencyInput } from "@/components/ui/currency-input";
import { EmptyState } from "@/components/creators/empty-state";
import { useCreateExclusivityMutation, useExclusivitiesQuery } from "@/hooks/use-exclusivities";
import { ApiError } from "@/lib/api-client";
import { formatCentsToBRL } from "@/lib/format";

function buildDefaultValues(creatorId: string): ExclusivityInput {
  const now = new Date();
  return {
    creatorId,
    company: "",
    brand: "",
    contractId: null,
    valueCents: 0,
    penaltyCents: null,
    startDate: now.toISOString(),
    endDate: new Date(now.getFullYear(), now.getMonth() + 12, now.getDate()).toISOString(),
    autoRenew: false,
    status: "ACTIVE",
    notes: null,
  };
}

function CreateExclusivityDialog({ creatorId }: { creatorId: string }) {
  const [open, setOpen] = React.useState(false);
  const createExclusivity = useCreateExclusivityMutation();
  const form = useForm<ExclusivityInput>({
    resolver: zodResolver(exclusivityInputSchema),
    defaultValues: buildDefaultValues(creatorId),
  });

  async function onSubmit(values: ExclusivityInput) {
    try {
      await createExclusivity.mutateAsync(values);
      toast.success("Exclusividade cadastrada.");
      setOpen(false);
      form.reset(buildDefaultValues(creatorId));
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : "Não foi possível cadastrar a exclusividade.");
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus />
          Nova exclusividade
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Cadastrar exclusividade</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="company"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Empresa</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="brand"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Marca</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="valueCents"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Valor (R$)</FormLabel>
                    <FormControl>
                      <CurrencyInput id={field.name} cents={field.value} onChange={(cents) => field.onChange(cents ?? 0)} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="penaltyCents"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Multa (R$)</FormLabel>
                    <FormControl>
                      <CurrencyInput id={field.name} cents={field.value} onChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Início</FormLabel>
                    <FormControl>
                      <Input
                        type="date"
                        value={field.value.slice(0, 10)}
                        onChange={(event) => field.onChange(new Date(event.target.value).toISOString())}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="endDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fim</FormLabel>
                    <FormControl>
                      <Input
                        type="date"
                        value={field.value.slice(0, 10)}
                        onChange={(event) => field.onChange(new Date(event.target.value).toISOString())}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
            <DialogFooter>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                Cadastrar
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

export function CreatorExclusivityTab({ creatorId }: { creatorId: string }) {
  const { data, isLoading } = useExclusivitiesQuery({ creatorId, page: 1, pageSize: 20 });

  return (
    <div className="max-w-2xl space-y-4">
      <div className="flex justify-end">
        <CreateExclusivityDialog creatorId={creatorId} />
      </div>

      {isLoading ? (
        <Skeleton className="h-32 w-full" />
      ) : !data?.items.length ? (
        <EmptyState title="Nenhuma exclusividade" description="Cadastre acordos de exclusividade deste creator com marcas." />
      ) : (
        <ul className="divide-y rounded-lg border">
          {data.items.map((exclusivity) => (
            <li key={exclusivity.id} className="flex items-center justify-between p-3">
              <div className="flex flex-col">
                <span className="text-sm font-medium">
                  {exclusivity.company} — {exclusivity.brand}
                </span>
                <span className="text-xs text-muted-foreground">{formatCentsToBRL(exclusivity.valueCents)}</span>
              </div>
              <Badge variant={exclusivity.daysRemaining < 0 ? "destructive" : exclusivity.daysRemaining <= 30 ? "secondary" : "success"}>
                {exclusivity.daysRemaining >= 0 ? `${exclusivity.daysRemaining} dias restantes` : "Vencida"}
              </Badge>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
