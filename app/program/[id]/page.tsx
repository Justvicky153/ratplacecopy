import { ProgramDetailClient } from "@/components/program-detail-client"

export default function ProgramDetailPage({ params }: { params: { id: string } }) {
  return <ProgramDetailClient id={params.id} />
}
