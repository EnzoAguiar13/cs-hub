"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { dealInputSchema, type DealInput } from "@cs-hub/shared-types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { CurrencyInput } from "@/components/ui/currency-input";

const DEAL_TYPE_LABEL: Record<DealInput["type"], string> = {
  CPA: "CPA",
  REVSHARE: "RevShare",
  HYBRID: "Híbrido",
  FEE: "Fee",
  MONTHLY: "Mensal",
  WEEKLY: "Semanal",
  BONUS: "Bônus",
};

const DEFAULT_VALUES: DealInput = {
  creatorId: "",
  type: "CPA",
  status: "ACTIVE",
  cpaValueCents: null,
  revSharePercent: null,
  fixedValueCents: null,
  targetValueCents: null,
  startDate: new Date().toISOString(),
  endDate: null,
  autoRenew: false,
  notes: null,
};

interface DealFormProps {
  defaultValues?: Partial<DealInput>;
  onSubmit: (values: DealInput) => Promise<unknown>;
  submitLabel: string;
}

export function DealForm({ defaultValues, onSubmit, submitLabel }: DealFormProps) {
  const form = useForm<DealInput>({
    resolver: zodResolver(dealInputSchema),
    defaultValues: { ...DEFAULT_VALUES, ...defaultValues },
  });

  const type = form.watch("type");

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit((values) => onSubmit(values))} className="space-y-4">
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

        <div className="grid grid-cols-2 gap-4">
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
                    {Object.entries(DEAL_TYPE_LABEL).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormItem>
            )}
          />
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
                    <SelectItem value="ACTIVE">Ativo</SelectItem>
                    <SelectItem value="PAUSED">Pausado</SelectItem>
                    <SelectItem value="ENDED">Encerrado</SelectItem>
                  </SelectContent>
                </Select>
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          {(type === "CPA" || type === "HYBRID") && (
            <FormField
              control={form.control}
              name="cpaValueCents"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Valor CPA (R$)</FormLabel>
                  <FormControl>
                    <CurrencyInput id={field.name} cents={field.value} onChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />
          )}
          {(type === "REVSHARE" || type === "HYBRID") && (
            <FormField
              control={form.control}
              name="revSharePercent"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>RevShare (%)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.1"
                      min={0}
                      max={100}
                      value={field.value ?? ""}
                      onChange={(event) => field.onChange(event.target.value === "" ? null : Number(event.target.value))}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          )}
          {(type === "FEE" || type === "MONTHLY" || type === "WEEKLY" || type === "BONUS") && (
            <FormField
              control={form.control}
              name="fixedValueCents"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Valor fixo (R$)</FormLabel>
                  <FormControl>
                    <CurrencyInput id={field.name} cents={field.value} onChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />
          )}
          <FormField
            control={form.control}
            name="targetValueCents"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Meta (R$)</FormLabel>
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
                <FormMessage />
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

        <FormField
          control={form.control}
          name="autoRenew"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
              <FormLabel className="mb-0">Renovação automática</FormLabel>
              <FormControl>
                <Switch checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
            </FormItem>
          )}
        />

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
