import { DealDetailClient } from "@/components/deals/deal-detail-client";

export default async function DealDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <DealDetailClient id={id} />;
}
