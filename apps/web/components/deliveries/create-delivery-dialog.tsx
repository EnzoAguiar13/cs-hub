"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { deliveryInputSchema, type DeliveryInput } from "@cs-hub/shared-types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { DELIVERY_TYPE_LABEL } from "@/components/deliveries/delivery-status-badge";
import { useCreateDeliveryMutation } from "@/hooks/use-deliveries";
import { ApiError } from "@/lib/api-client";

const DEFAULT_VALUES: DeliveryInput = {
  creatorId: "",
  campaignId: null,
  type: "STORY",
  status: "PENDING",
  scheduledAt: new Date().toISOString(),
  responsibleId: null,
  comments: null,
};

export function CreateDeliveryDialog() {
  const [open, setOpen] = React.useState(false);
  const createDelivery = useCreateDeliveryMutation();
  const form = useForm<DeliveryInput>({ resolver: zodResolver(deliveryInputSchema), defaultValues: DEFAULT_VALUES });

  async function onSubmit(values: DeliveryInput) {
    try {
      await createDelivery.mutateAsync(values);
      toast.success("Entrega agendada.");
      setOpen(false);
      form.reset(DEFAULT_VALUES);
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : "Não foi possível agendar a entrega.");
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus />
          Nova entrega
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Agendar entrega</DialogTitle>
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
                      {Object.entries(DELIVERY_TYPE_LABEL).map(([value, label]) => (
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
              name="scheduledAt"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Data e hora combinada</FormLabel>
                  <FormControl>
                    <Input
                      type="datetime-local"
                      value={field.value.slice(0, 16)}
                      onChange={(event) => field.onChange(new Date(event.target.value).toISOString())}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="comments"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Comentários</FormLabel>
                  <FormControl>
                    <Textarea rows={2} {...field} value={field.value ?? ""} />
                  </FormControl>
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                Agendar
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
