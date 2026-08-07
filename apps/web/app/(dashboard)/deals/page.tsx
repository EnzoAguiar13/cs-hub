import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DealTable } from "@/components/deals/deal-table";

export default function DealsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Deals</h1>
          <p className="text-sm text-muted-foreground">Acordos comerciais com afiliados e creators.</p>
        </div>
        <Button asChild>
          <Link href="/deals/new">
            <Plus />
            Novo Deal
          </Link>
        </Button>
      </div>
      <DealTable />
    </div>
  );
}
