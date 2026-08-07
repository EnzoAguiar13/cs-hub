"use client";

import * as React from "react";
import { toast } from "sonner";
import { Upload } from "lucide-react";
import type { FileType } from "@cs-hub/shared-types";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useConfirmFileUploadMutation, useRequestFileUploadMutation } from "@/hooks/use-creators";
import { ApiError } from "@/lib/api-client";

const FILE_TYPE_LABEL: Record<FileType, string> = {
  PHOTO: "Foto",
  CONTRACT: "Contrato",
  DOCUMENT: "Documento",
  OTHER: "Outro",
};

export function CreatorFileUploadDialog({ creatorId }: { creatorId: string }) {
  const [open, setOpen] = React.useState(false);
  const [file, setFile] = React.useState<File | null>(null);
  const [type, setType] = React.useState<FileType>("DOCUMENT");
  const [uploading, setUploading] = React.useState(false);

  const requestUpload = useRequestFileUploadMutation(creatorId);
  const confirmUpload = useConfirmFileUploadMutation(creatorId);

  async function handleUpload() {
    if (!file) return;
    setUploading(true);
    try {
      // 1. Ask the API for a presigned URL.
      const { uploadUrl, storageKey } = await requestUpload.mutateAsync({
        fileName: file.name,
        mimeType: file.type || "application/octet-stream",
        type,
      });

      // 2. Upload the bytes directly to storage — not our API, so no Authorization header.
      const putRes = await fetch(uploadUrl, {
        method: "PUT",
        body: file,
        headers: { "Content-Type": file.type || "application/octet-stream" },
      });
      if (!putRes.ok) throw new Error("Falha ao enviar o arquivo para o armazenamento.");

      // 3. Confirm the upload so the API records the file's metadata.
      await confirmUpload.mutateAsync({
        storageKey,
        fileName: file.name,
        mimeType: file.type || "application/octet-stream",
        sizeBytes: file.size,
        type,
      });

      toast.success("Arquivo enviado com sucesso.");
      setOpen(false);
      setFile(null);
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : "Não foi possível enviar o arquivo.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Upload />
          Enviar arquivo
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Enviar arquivo</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="file-type">Tipo</Label>
            <Select value={type} onValueChange={(value) => setType(value as FileType)}>
              <SelectTrigger id="file-type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(FILE_TYPE_LABEL).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="file-input">Arquivo</Label>
            <Input id="file-input" type="file" onChange={(event) => setFile(event.target.files?.[0] ?? null)} />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleUpload} disabled={!file || uploading}>
            {uploading ? "Enviando..." : "Enviar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
