"use client";

import * as React from "react";
import { toast } from "sonner";
import { MoreHorizontal } from "lucide-react";
import type { WithdrawalStatus } from "@cs-hub/shared-types";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CurrencyInput } from "@/components/ui/currency-input";
import { useUpdateWithdrawalMutation } from "@/hooks/use-withdrawals";
import { ApiError } from "@/lib/api-client";

// Mesma máquina de estados do backend (WithdrawalService) — mantida aqui só para decidir quais
// ações mostrar; a validação de verdade é sempre refeita no servidor.
const NEXT_STATUS: Partial<Record<WithdrawalStatus, { status: WithdrawalStatus; label: string; needsAmount?: boolean }>> = {
  NOT_AVAILABLE: { status: "AVAILABLE", label: "Marcar como disponível" },
  AVAILABLE: { status: "PENDING", label: "Marcar como pendente" },
  PENDING: { status: "SUBMITTED", label: "Enviar solicitação", needsAmount: true },
  SUBMITTED: { status: "IN_REVIEW", label: "Colocar em análise" },
  IN_REVIEW: { status: "APPROVED", label: "Aprovar" },
  APPROVED: { status: "PAID", label: "Marcar como pago" },
};

const CANCELLABLE: WithdrawalStatus[] = ["AVAILABLE", "PENDING", "SUBMITTED", "IN_REVIEW", "APPROVED"];

export function WithdrawalActions({ id, status }: { id: string; status: WithdrawalStatus }) {
  const [amountDialogOpen, setAmountDialogOpen] = React.useState(false);
  const updateWithdrawal = useUpdateWithdrawalMutation(id);
  const [amountCents, setAmountCents] = React.useState<number | null>(null);

  const next = NEXT_STATUS[status];

  async function transition(toStatus: WithdrawalStatus, extra?: Record<string, unknown>) {
    try {
      await updateWithdrawal.mutateAsync({ status: toStatus, ...extra });
      toast.success("Status atualizado.");
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : "Não foi possível atualizar o status.");
    }
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {next && (
            <DropdownMenuItem
              onClick={() => (next.needsAmount ? setAmountDialogOpen(true) : void transition(next.status))}
            >
              {next.label}
            </DropdownMenuItem>
          )}
          {status === "IN_REVIEW" && <DropdownMenuItem onClick={() => void transition("REJECTED")}>Recusar</DropdownMenuItem>}
          {CANCELLABLE.includes(status) && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => void transition("CANCELLED")}>Cancelar</DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={amountDialogOpen} onOpenChange={setAmountDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Enviar solicitação de saque</DialogTitle>
          </DialogHeader>
          <div className="space-y-1.5">
            <Label htmlFor="requested-amount">Valor solicitado (R$)</Label>
            <CurrencyInput id="requested-amount" cents={amountCents} onChange={setAmountCents} />
          </div>
          <DialogFooter>
            <Button
              disabled={!amountCents || updateWithdrawal.isPending}
              onClick={async () => {
                await transition("SUBMITTED", { requestedAmountCents: amountCents });
                setAmountDialogOpen(false);
                setAmountCents(null);
              }}
            >
              Enviar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
