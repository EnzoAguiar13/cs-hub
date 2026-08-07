"use client";

import * as React from "react";
import { toast } from "sonner";
import { UserPlus, Pencil, FileUp, MessageSquare, RefreshCcw } from "lucide-react";
import type { CreatorTimelineEvent } from "@cs-hub/shared-types";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { useAddTimelineNoteMutation, useCreatorTimelineQuery } from "@/hooks/use-creators";
import { ApiError } from "@/lib/api-client";

const EVENT_ICON: Record<string, React.ComponentType<{ className?: string }>> = {
  CREATED: UserPlus,
  STATUS_CHANGE: RefreshCcw,
  FILE_UPLOAD: FileUp,
  NOTE: MessageSquare,
};

export function CreatorTimeline({ creatorId }: { creatorId: string }) {
  const { data: events, isLoading } = useCreatorTimelineQuery(creatorId);
  const addNote = useAddTimelineNoteMutation(creatorId);
  const [note, setNote] = React.useState("");

  async function handleAddNote() {
    if (!note.trim()) return;
    try {
      await addNote.mutateAsync({ description: note.trim() });
      setNote("");
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : "Não foi possível adicionar a nota.");
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex gap-2">
        <Textarea
          placeholder="Adicionar uma nota..."
          value={note}
          onChange={(event) => setNote(event.target.value)}
          rows={2}
          className="flex-1"
        />
        <Button onClick={handleAddNote} disabled={addNote.isPending || !note.trim()}>
          Adicionar
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <Skeleton key={index} className="h-14 w-full" />
          ))}
        </div>
      ) : !events?.length ? (
        <p className="text-sm text-muted-foreground">Nenhum evento registrado ainda.</p>
      ) : (
        <ol className="space-y-4 border-l pl-4">
          {events.map((event: CreatorTimelineEvent) => {
            const Icon = EVENT_ICON[event.type] ?? Pencil;
            return (
              <li key={event.id} className="relative">
                <span className="absolute -left-[21px] flex h-6 w-6 items-center justify-center rounded-full border bg-background">
                  <Icon className="h-3.5 w-3.5" />
                </span>
                <p className="text-sm">{event.description}</p>
                <p className="text-xs text-muted-foreground">{new Date(event.createdAt).toLocaleString("pt-BR")}</p>
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}
