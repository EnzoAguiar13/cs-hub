"use client";

import * as React from "react";
import { toast } from "sonner";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { downloadCsv, toCsv, type CsvColumn } from "@/lib/csv-export";
import { ApiError } from "@/lib/api-client";

interface ExportCsvButtonProps<T> {
  filename: string;
  columns: CsvColumn<T>[];
  fetchRows: () => Promise<T[]>;
  label?: string;
}

export function ExportCsvButton<T>({ filename, columns, fetchRows, label = "Exportar CSV" }: ExportCsvButtonProps<T>) {
  const [exporting, setExporting] = React.useState(false);

  async function handleExport() {
    setExporting(true);
    try {
      const rows = await fetchRows();
      downloadCsv(filename, toCsv(rows, columns));
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : "Não foi possível exportar os dados.");
    } finally {
      setExporting(false);
    }
  }

  return (
    <Button variant="outline" onClick={handleExport} disabled={exporting}>
      <Download />
      {exporting ? "Exportando..." : label}
    </Button>
  );
}
