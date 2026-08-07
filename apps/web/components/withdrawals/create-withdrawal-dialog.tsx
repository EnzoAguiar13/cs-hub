"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { withdrawalInputSchema, type WithdrawalInput } from "@cs-hub/shared-types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { CurrencyInput } from "@/components/ui/currency-input";
import { useCreateWithdrawalMutation } from "@/hooks/use-withdrawals";
import { ApiError } from "@/lib/api-client";

function firstDayOfCurrentMonth() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
}

const DEFAULT_VALUES: WithdrawalInput = {
  creatorId: "",
  competence: firstDayOfCurrentMonth(),
  availableAmountCents: 0,
  status: "AVAILABLE",
  notes: null,
};

export function CreateWithdrawalDialog() {
  const [open, setOpen] = React.useState(false);
  const createWithdrawal = useCreateWithdrawalMutation();
  const form = useForm<WithdrawalInput>({ resolver: zodResolver(withdrawalInputSchema), defaultValues: DEFAULT_VALUES });

  async function onSubmit(values: WithdrawalInput) {
    try {
      await createWithdrawal.mutateAsync(values);
      toast.success("Competência de saque criada.");
      setOpen(false);
      form.reset({ ...DEFAULT_VALUES, competence: firstDayOfCurrentMonth() });
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : "Não foi possível criar o registro.");
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus />
          Nova competência
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Abrir competência de saque</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="creatorId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ID do Creator</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="cljk2x0..." />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="competence"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Competência</FormLabel>
                  <FormControl>
                    <Input
                      type="month"
                      value={field.value.slice(0, 7)}
                      onChange={(event) => field.onChange(new Date(`${event.target.value}-01`).toISOString())}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="availableAmountCents"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Valor disponível para saque (R$)</FormLabel>
                  <FormControl>
                    <CurrencyInput id={field.name} cents={field.value} onChange={(cents) => field.onChange(cents ?? 0)} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status inicial</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="NOT_AVAILABLE">Não disponível</SelectItem>
                      <SelectItem value="AVAILABLE">Disponível para solicitar</SelectItem>
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                Criar
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
