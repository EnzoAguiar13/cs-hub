"use client";

import * as React from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { flexRender, getCoreRowModel, useReactTable } from "@tanstack/react-table";
import type { CreatorStatus } from "@cs-hub/shared-types";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useCreatorsQuery } from "@/hooks/use-creators";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { creatorTableColumns } from "@/components/creators/creator-table-columns";
import { CreatorTableToolbar, type CreatorTableFilters } from "@/components/creators/creator-table-toolbar";

const PAGE_SIZE = 20;

export function CreatorTable() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [filters, setFilters] = React.useState<CreatorTableFilters>({
    search: searchParams.get("search") ?? "",
    status: (searchParams.get("status") as CreatorStatus | null) ?? "",
    category: searchParams.get("category") ?? "",
  });
  const [page, setPage] = React.useState(Number(searchParams.get("page") ?? "1"));

  const debouncedSearch = useDebouncedValue(filters.search, 300);

  React.useEffect(() => {
    setPage(1);
  }, [debouncedSearch, filters.status, filters.category]);

  React.useEffect(() => {
    const params = new URLSearchParams();
    if (debouncedSearch) params.set("search", debouncedSearch);
    if (filters.status) params.set("status", filters.status);
    if (filters.category) params.set("category", filters.category);
    if (page > 1) params.set("page", String(page));
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }, [debouncedSearch, filters.status, filters.category, page, pathname, router]);

  const { data, isLoading, isFetching } = useCreatorsQuery({
    search: debouncedSearch || undefined,
    status: filters.status || undefined,
    category: filters.category || undefined,
    page,
    pageSize: PAGE_SIZE,
  });

  const table = useReactTable({
    data: data?.items ?? [],
    columns: creatorTableColumns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    manualFiltering: true,
    manualSorting: true,
    pageCount: data ? Math.max(1, Math.ceil(data.total / PAGE_SIZE)) : 1,
  });

  const totalPages = data ? Math.max(1, Math.ceil(data.total / PAGE_SIZE)) : 1;

  return (
    <div className="space-y-4">
      <CreatorTableToolbar filters={filters} onChange={setFilters} />

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 6 }).map((_, index) => (
                <TableRow key={index}>
                  {creatorTableColumns.map((_, columnIndex) => (
                    <TableCell key={columnIndex}>
                      <Skeleton className="h-5 w-full max-w-40" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={creatorTableColumns.length} className="h-24 text-center text-muted-foreground">
                  Nenhum creator encontrado.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {data ? `${data.total} creator${data.total === 1 ? "" : "s"}` : isFetching ? "Carregando..." : null}
        </p>
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
