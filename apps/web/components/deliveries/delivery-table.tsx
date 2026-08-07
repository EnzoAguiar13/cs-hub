"use client";

import * as React from "react";
import { toast } from "sonner";
import type { DeliveryStatus, DeliveryType } from "@cs-hub/shared-types";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DELIVERY_STATUS_LABEL, DELIVERY_TYPE_LABEL } from "@/components/deliveries/delivery-status-badge";
import { useDeliveriesQuery, useUpdateDeliveryMutation } from "@/hooks/use-deliveries";
import { ApiError } from "@/lib/api-client";

const PAGE_SIZE = 20;

function StatusSelect({ id, status }: { id: string; status: DeliveryStatus }) {
  const updateDelivery = useUpdateDeliveryMutation(id);

  return (
    <Select
      value={status}
      onValueChange={async (value) => {
        try {
          await updateDelivery.mutateAsync({ status: value as DeliveryStatus });
          toast.success("Status atualizado.");
        } catch (error) {
          toast.error(error instanceof ApiError ? error.message : "Não foi possível atualizar o status.");
        }
      }}
    >
      <SelectTrigger className="h-8 w-40">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {Object.entries(DELIVERY_STATUS_LABEL).map(([value, label]) => (
          <SelectItem key={value} value={value}>
            {label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export function DeliveryTable() {
  const [status, setStatus] = React.useState<DeliveryStatus | "">("");
  const [page, setPage] = React.useState(1);

  const { data, isLoading } = useDeliveriesQuery({ status: status || undefined, page, pageSize: PAGE_SIZE });
  const totalPages = data ? Math.max(1, Math.ceil(data.total / PAGE_SIZE)) : 1;

  return (
    <div className="space-y-4">
      <Select value={status || "ALL"} onValueChange={(value) => { setStatus(value === "ALL" ? "" : (value as DeliveryStatus)); setPage(1); }}>
        <SelectTrigger className="h-8 w-48">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ALL">Todos os status</SelectItem>
          {Object.entries(DELIVERY_STATUS_LABEL).map(([value, label]) => (
            <SelectItem key={value} value={value}>
              {label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Creator</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Agendado para</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, index) => (
                <TableRow key={index}>
                  {Array.from({ length: 4 }).map((__, cellIndex) => (
                    <TableCell key={cellIndex}>
                      <Skeleton className="h-5 w-full max-w-28" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : data?.items.length ? (
              data.items.map((delivery) => (
                <TableRow key={delivery.id}>
                  <TableCell className="font-medium">{delivery.creatorName}</TableCell>
                  <TableCell>{DELIVERY_TYPE_LABEL[delivery.type as DeliveryType]}</TableCell>
                  <TableCell>{new Date(delivery.scheduledAt).toLocaleString("pt-BR")}</TableCell>
                  <TableCell>
                    <StatusSelect id={delivery.id} status={delivery.status} />
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                  Nenhuma entrega encontrada.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{data ? `${data.total} entrega${data.total === 1 ? "" : "s"}` : null}</p>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
            Anterior
          </Button>
          <span className="text-sm text-muted-foreground">
            Página {page} de {totalPages}
          </span>
          <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
            Próxima
          </Button>
        </div>
      </div>
    </div>
  );
}
