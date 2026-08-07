"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Plus, Users2 } from "lucide-react";
import type { CreatorSummary } from "@cs-hub/shared-types";
import { apiFetch } from "@/lib/api-client";
import { queryKeys } from "@/lib/query-keys";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const router = useRouter();
  const [search, setSearch] = React.useState("");
  const debouncedSearch = useDebouncedValue(search, 250);

  React.useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "k" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        onOpenChange(!open);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onOpenChange]);

  React.useEffect(() => {
    if (!open) setSearch("");
  }, [open]);

  const { data, isFetching } = useQuery({
    queryKey: queryKeys.creators.list({ search: debouncedSearch, page: 1, pageSize: 8 }),
    queryFn: () =>
      apiFetch<{ items: CreatorSummary[] }>(
        `/creators?${new URLSearchParams({ search: debouncedSearch, page: "1", pageSize: "8" })}`,
      ),
    enabled: open && debouncedSearch.length > 0,
  });

  function go(path: string) {
    onOpenChange(false);
    router.push(path);
  }

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput placeholder="Buscar creators ou comandos..." value={search} onValueChange={setSearch} />
      <CommandList>
        <CommandEmpty>{isFetching ? "Buscando..." : "Nenhum resultado."}</CommandEmpty>

        <CommandGroup heading="Navegação">
          <CommandItem onSelect={() => go("/creators")}>
            <Users2 />
            Ir para Creators
          </CommandItem>
          <CommandItem onSelect={() => go("/creators/new")}>
            <Plus />
            Novo Creator
          </CommandItem>
        </CommandGroup>

        {data && data.items.length > 0 && (
          <CommandGroup heading="Creators">
            {data.items.map((creator) => (
              <CommandItem key={creator.id} onSelect={() => go(`/creators/${creator.id}`)}>
                <Users2 />
                <span>{creator.name}</span>
                {creator.nickname && <span className="text-muted-foreground">@{creator.nickname}</span>}
              </CommandItem>
            ))}
          </CommandGroup>
        )}
      </CommandList>
    </CommandDialog>
  );
}
