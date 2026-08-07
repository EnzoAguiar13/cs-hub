import { CreatorDetailClient } from "@/components/creators/creator-detail-client";

export default async function CreatorDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <CreatorDetailClient id={id} />;
}
