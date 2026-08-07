"use client";

import * as React from "react";
import { X } from "lucide-react";
import type { CreatorStatus } from "@cs-hub/shared-types";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const STATUS_OPTIONS: { value: CreatorStatus; label: string }[] = [
  { value: "ACTIVE", label: "Ativo" },
  { value: "INACTIVE", label: "Inativo" },
  { value: "BLOCKED", label: "Bloqueado" },
];

export interface CreatorTableFilters {
  search: string;
  status: CreatorStatus | "";
  category: string;
}

export function CreatorTableToolbar({
  filters,
  onChange,
}: {
  filters: CreatorTableFilters;
  onChange: (filters: CreatorTableFilters) => void;
}) {
  const hasActiveFilters = filters.search || filters.status || filters.category;

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Input
        placeholder="Buscar por nome, nickname ou tag..."
        className="h-8 w-64"
        value={filters.search}
        onChange={(event) => onChange({ ...filters, search: event.target.value })}
      />
      <Select
        value={filters.status || "ALL"}
        onValueChange={(value) => onChange({ ...filters, status: value === "ALL" ? "" : (value as CreatorStatus) })}
      >
        <SelectTrigger className="h-8 w-40">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ALL">Todos os status</SelectItem>
          {STATUS_OPTIONS.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Input
        placeholder="Categoria"
        className="h-8 w-40"
        value={filters.category}
        onChange={(event) => onChange({ ...filters, category: event.target.value })}
      />
      {hasActiveFilters && (
        <Button
          variant="ghost"
          size="sm"
          className="h-8 px-2"
          onClick={() => onChange({ search: "", status: "", category: "" })}
        >
          <X className="mr-1 h-3.5 w-3.5" />
          Limpar
        </Button>
      )}
    </div>
  );
}
