"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { transactionInputSchema, type TransactionInput } from "@cs-hub/shared-types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { CurrencyInput } from "@/components/ui/currency-input";
import { useCreateTransactionMutation } from "@/hooks/use-finance";
import { ApiError } from "@/lib/api-client";

const DEFAULT_VALUES: TransactionInput = {
  type: "INCOME",
  description: "",
  amountCents: 0,
  costCenter: null,
  dueDate: new Date().toISOString(),
  method: null,
  creatorId: null,
  dealId: null,
};

export function CreateTransactionDialog() {
  const [open, setOpen] = React.useState(false);
  const createTransaction = useCreateTransactionMutation();
  const form = useForm<TransactionInput>({ resolver: zodResolver(transactionInputSchema), defaultValues: DEFAULT_VALUES });

  async function onSubmit(values: TransactionInput) {
    try {
      await createTransaction.mutateAsync(values);
      toast.success("Lançamento criado.");
      setOpen(false);
      form.reset(DEFAULT_VALUES);
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : "Não foi possível criar o lançamento.");
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus />
          Novo lançamento
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Novo lançamento financeiro</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="INCOME">Receita</SelectItem>
                      <SelectItem value="EXPENSE">Despesa</SelectItem>
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="amountCents"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Valor (R$)</FormLabel>
                  <FormControl>
                    <CurrencyInput id={field.name} cents={field.value} onChange={(cents) => field.onChange(cents ?? 0)} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="dueDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Vencimento</FormLabel>
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
              name="method"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Forma de pagamento</FormLabel>
                  <Select value={field.value ?? "NONE"} onValueChange={(value) => field.onChange(value === "NONE" ? null : value)}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="NONE">Não definida</SelectItem>
                      <SelectItem value="PIX">PIX</SelectItem>
                      <SelectItem value="TED">TED</SelectItem>
                      <SelectItem value="BOLETO">Boleto</SelectItem>
                      <SelectItem value="OTHER">Outro</SelectItem>
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="costCenter"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Centro de custo</FormLabel>
                  <FormControl>
                    <Input {...field} value={field.value ?? ""} />
                  </FormControl>
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                Criar lançamento
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
