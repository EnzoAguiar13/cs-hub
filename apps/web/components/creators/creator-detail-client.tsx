"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { StatusBadge } from "@/components/creators/status-badge";
import { CreatorProfileTabs } from "@/components/creators/creator-profile-tabs";
import { useCreatorQuery } from "@/hooks/use-creators";
import { ApiError } from "@/lib/api-client";

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export function CreatorDetailClient({ id }: { id: string }) {
  const { data: creator, isLoading, error } = useCreatorQuery(id);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-16 w-full max-w-md" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (error || !creator) {
    return (
      <Alert variant="destructive">
        <AlertDescription>
          {error instanceof ApiError ? error.message : "Não foi possível carregar este creator."}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Avatar className="h-14 w-14">
          {creator.photoUrl && <AvatarImage src={creator.photoUrl} alt={creator.name} />}
          <AvatarFallback>{initials(creator.name)}</AvatarFallback>
        </Avatar>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-semibold">{creator.name}</h1>
            <StatusBadge status={creator.status} />
          </div>
          {creator.nickname && <p className="text-sm text-muted-foreground">@{creator.nickname}</p>}
        </div>
      </div>

      <CreatorProfileTabs creator={creator} />
    </div>
  );
}
