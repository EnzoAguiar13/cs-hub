"use client";

import { FileText } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useCreatorFilesQuery } from "@/hooks/use-creators";
import { CreatorFileUploadDialog } from "@/components/creators/creator-file-upload-dialog";

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function CreatorFiles({ creatorId }: { creatorId: string }) {
  const { data: files, isLoading } = useCreatorFilesQuery(creatorId);

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <CreatorFileUploadDialog creatorId={creatorId} />
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, index) => (
            <Skeleton key={index} className="h-12 w-full" />
          ))}
        </div>
      ) : !files?.length ? (
        <p className="text-sm text-muted-foreground">Nenhum arquivo enviado ainda.</p>
      ) : (
        <ul className="divide-y rounded-lg border">
          {files.map((file) => (
            <li key={file.id} className="flex items-center gap-3 p-3">
              <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
              <a href={file.downloadUrl} target="_blank" rel="noreferrer" className="flex-1 text-sm hover:underline">
                {file.fileName}
              </a>
              <Badge variant="outline">{file.type}</Badge>
              <span className="text-xs text-muted-foreground">{formatBytes(file.sizeBytes)}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
