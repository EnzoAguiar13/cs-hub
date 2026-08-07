"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { campaignInputSchema, type CampaignInput } from "@cs-hub/shared-types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { CurrencyInput } from "@/components/ui/currency-input";

const DEFAULT_VALUES: CampaignInput = {
  name: "",
  objective: null,
  status: "PLANNED",
  investmentCents: 0,
  startDate: new Date().toISOString(),
  endDate: null,
  creatorId: null,
  clicks: 0,
  leads: 0,
  registrations: 0,
  ftds: 0,
  revenueCents: 0,
  notes: null,
};

interface CampaignFormProps {
  defaultValues?: Partial<CampaignInput>;
  onSubmit: (values: CampaignInput) => Promise<unknown>;
  submitLabel: string;
}

function NumberField({ name, label, form }: { name: "clicks" | "leads" | "registrations" | "ftds"; label: string; form: ReturnType<typeof useForm<CampaignInput>> }) {
  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <Input type="number" min={0} value={field.value} onChange={(event) => field.onChange(Number(event.target.value) || 0)} />
          </FormControl>
        </FormItem>
      )}
    />
  );
}

export function CampaignForm({ defaultValues, onSubmit, submitLabel }: CampaignFormProps) {
  const form = useForm<CampaignInput>({
    resolver: zodResolver(campaignInputSchema),
    defaultValues: { ...DEFAULT_VALUES, ...defaultValues },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit((values) => onSubmit(values))} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome da campanha</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="objective"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Objetivo</FormLabel>
              <FormControl>
                <Input {...field} value={field.value ?? ""} />
              </FormControl>
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status</FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="PLANNED">Planejada</SelectItem>
                    <SelectItem value="ACTIVE">Ativa</SelectItem>
                    <SelectItem value="PAUSED">Pausada</SelectItem>
                    <SelectItem value="ENDED">Encerrada</SelectItem>
                  </SelectContent>
                </Select>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="investmentCents"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Investimento (R$)</FormLabel>
                <FormControl>
                  <CurrencyInput id={field.name} cents={field.value} onChange={(cents) => field.onChange(cents ?? 0)} />
                </FormControl>
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="creatorId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>ID do Creator (opcional)</FormLabel>
                <FormControl>
                  <Input {...field} value={field.value ?? ""} />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="revenueCents"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Receita gerada (R$)</FormLabel>
                <FormControl>
                  <CurrencyInput id={field.name} cents={field.value} onChange={(cents) => field.onChange(cents ?? 0)} />
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
                <FormLabel>Fim (opcional)</FormLabel>
                <FormControl>
                  <Input
                    type="date"
                    value={field.value ? field.value.slice(0, 10) : ""}
                    onChange={(event) => field.onChange(event.target.value ? new Date(event.target.value).toISOString() : null)}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4 rounded-lg border p-3 sm:grid-cols-4">
          <NumberField name="clicks" label="Cliques" form={form} />
          <NumberField name="leads" label="Leads" form={form} />
          <NumberField name="registrations" label="Cadastros" form={form} />
          <NumberField name="ftds" label="FTDs" form={form} />
        </div>

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Observações</FormLabel>
              <FormControl>
                <Textarea rows={3} {...field} value={field.value ?? ""} />
              </FormControl>
            </FormItem>
          )}
        />

        <div className="flex justify-end">
          <Button type="submit" disabled={form.formState.isSubmitting}>
            {submitLabel}
          </Button>
        </div>
      </form>
    </Form>
  );
}
