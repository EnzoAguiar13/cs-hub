import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CreatorTable } from "@/components/creators/creator-table";

export default function CreatorsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Creators</h1>
          <p className="text-sm text-muted-foreground">Afiliados e influenciadores cadastrados no CS Hub.</p>
        </div>
        <Button asChild>
          <Link href="/creators/new">
            <Plus />
            Novo Creator
          </Link>
        </Button>
      </div>
      <CreatorTable />
    </div>
  );
}
