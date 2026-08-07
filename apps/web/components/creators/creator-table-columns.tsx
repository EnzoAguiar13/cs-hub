import Link from "next/link";
import type { ColumnDef } from "@tanstack/react-table";
import type { CreatorSummary } from "@cs-hub/shared-types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/creators/status-badge";

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export const creatorTableColumns: ColumnDef<CreatorSummary>[] = [
  {
    accessorKey: "name",
    header: "Creator",
    cell: ({ row }) => {
      const creator = row.original;
      return (
        <Link href={`/creators/${creator.id}`} className="flex items-center gap-3 hover:underline">
          <Avatar className="h-8 w-8">
            {creator.photoUrl && <AvatarImage src={creator.photoUrl} alt={creator.name} />}
            <AvatarFallback className="text-xs">{initials(creator.name)}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="text-sm font-medium">{creator.name}</span>
            {creator.nickname && <span className="text-xs text-muted-foreground">@{creator.nickname}</span>}
          </div>
        </Link>
      );
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => <StatusBadge status={row.original.status} />,
  },
  {
    accessorKey: "category",
    header: "Categoria",
    cell: ({ row }) => row.original.category ?? "—",
  },
  {
    id: "tags",
    header: "Tags",
    cell: ({ row }) => (
      <div className="flex flex-wrap gap-1">
        {row.original.tags.map((tag) => (
          <Badge key={tag} variant="outline">
            {tag}
          </Badge>
        ))}
        {row.original.isVip && <Badge>VIP</Badge>}
      </div>
    ),
  },
  {
    accessorKey: "country",
    header: "País",
    cell: ({ row }) => row.original.country ?? "—",
  },
  {
    accessorKey: "createdAt",
    header: "Cadastrado em",
    cell: ({ row }) => new Date(row.original.createdAt).toLocaleDateString("pt-BR"),
  },
];
