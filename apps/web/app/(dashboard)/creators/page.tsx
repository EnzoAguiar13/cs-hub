import Link from "next/link";
import { Plus } from "lucide-react";
import type { CreatorSummary } from "@cs-hub/shared-types";
import { Button } from "@/components/ui/button";
import { CreatorTable } from "@/components/creators/creator-table";
import { ExportCsvButton } from "@/components/reports/export-csv-button";
import { apiFetch } from "@/lib/api-client";

export default function CreatorsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Creators</h1>
          <p className="text-sm text-muted-foreground">Afiliados e influenciadores cadastrados no CS Hub.</p>
        </div>
        <div className="flex gap-2">
          <ExportCsvButton
            filename="creators.csv"
            fetchRows={async () => {
              const res = await apiFetch<{ items: CreatorSummary[] }>("/creators?page=1&pageSize=1000");
              return res.items;
            }}
            columns={[
              { header: "Nome", value: (c) => c.name },
              { header: "Nickname", value: (c) => c.nickname ?? "" },
              { header: "Status", value: (c) => c.status },
              { header: "Categoria", value: (c) => c.category ?? "" },
              { header: "País", value: (c) => c.country ?? "" },
              { header: "Tags", value: (c) => c.tags.join("; ") },
              { header: "Cadastrado em", value: (c) => new Date(c.createdAt).toLocaleDateString("pt-BR") },
            ]}
          />
          <Button asChild>
            <Link href="/creators/new">
              <Plus />
              Novo Creator
            </Link>
          </Button>
        </div>
      </div>
      <CreatorTable />
    </div>
  );
}
