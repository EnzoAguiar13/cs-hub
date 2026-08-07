"use client";

import * as React from "react";
import { toast } from "sonner";
import { FileText, Upload } from "lucide-react";
import type { ContractStatus } from "@cs-hub/shared-types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { EmptyState } from "@/components/creators/empty-state";
import {
  useContractsQuery,
  useCreateContractMutation,
  useRequestContractUploadMutation,
  useUpdateContractMutation,
} from "@/hooks/use-contracts";
import { ApiError } from "@/lib/api-client";

const STATUS_LABEL: Record<ContractStatus, string> = {
  DRAFT: "Rascunho",
  SENT: "Enviado",
  SIGNED: "Assinado",
  EXPIRED: "Vencido",
  CANCELLED: "Cancelado",
};

function UploadContractDialog({ creatorId }: { creatorId: string }) {
  const [open, setOpen] = React.useState(false);
  const [title, setTitle] = React.useState("");
  const [file, setFile] = React.useState<File | null>(null);
  const [uploading, setUploading] = React.useState(false);
  const requestUpload = useRequestContractUploadMutation();
  const createContract = useCreateContractMutation();

  async function handleUpload() {
    if (!file || !title.trim()) return;
    setUploading(true);
    try {
      const { uploadUrl, storageKey } = await requestUpload.mutateAsync({
        creatorId,
        fileName: file.name,
        mimeType: file.type || "application/pdf",
      });
      const putRes = await fetch(uploadUrl, { method: "PUT", body: file, headers: { "Content-Type": file.type || "application/pdf" } });
      if (!putRes.ok) throw new Error("Falha ao enviar o arquivo.");

      await createContract.mutateAsync({
        creatorId,
        title: title.trim(),
        storageKey,
        fileName: file.name,
        mimeType: file.type || "application/pdf",
        sizeBytes: file.size,
        status: "DRAFT",
      });

      toast.success("Contrato enviado.");
      setOpen(false);
      setTitle("");
      setFile(null);
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : "Não foi possível enviar o contrato.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Upload />
          Enviar contrato
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Enviar contrato (PDF)</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="contract-title">Título</Label>
            <Input id="contract-title" value={title} onChange={(event) => setTitle(event.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="contract-file">Arquivo</Label>
            <Input id="contract-file" type="file" accept=".pdf" onChange={(event) => setFile(event.target.files?.[0] ?? null)} />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleUpload} disabled={!file || !title.trim() || uploading}>
            {uploading ? "Enviando..." : "Enviar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ContractStatusSelect({ contractId, status }: { contractId: string; status: ContractStatus }) {
  const updateContract = useUpdateContractMutation(contractId);

  return (
    <Select
      value={status}
      onValueChange={async (value) => {
        try {
          await updateContract.mutateAsync({ status: value as ContractStatus });
          toast.success("Status do contrato atualizado.");
        } catch (error) {
          toast.error(error instanceof ApiError ? error.message : "Não foi possível atualizar o status.");
        }
      }}
    >
      <SelectTrigger className="h-7 w-32">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {Object.entries(STATUS_LABEL).map(([value, label]) => (
          <SelectItem key={value} value={value}>
            {label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export function CreatorContractsTab({ creatorId }: { creatorId: string }) {
  const { data, isLoading } = useContractsQuery({ creatorId, page: 1, pageSize: 20 });

  return (
    <div className="max-w-2xl space-y-4">
      <div className="flex justify-end">
        <UploadContractDialog creatorId={creatorId} />
      </div>

      {isLoading ? (
        <Skeleton className="h-32 w-full" />
      ) : !data?.items.length ? (
        <EmptyState title="Nenhum contrato enviado" description="Envie o PDF do contrato deste creator." />
      ) : (
        <ul className="divide-y rounded-lg border">
          {data.items.map((contract) => (
            <li key={contract.id} className="flex items-center gap-3 p-3">
              <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
              <div className="flex flex-1 flex-col">
                <a href={contract.downloadUrl} target="_blank" rel="noreferrer" className="text-sm hover:underline">
                  {contract.title}
                </a>
                <span className="text-xs text-muted-foreground">v{contract.version}</span>
              </div>
              <ContractStatusSelect contractId={contract.id} status={contract.status} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
