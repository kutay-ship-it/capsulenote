import { ScheduleDeliveryForm } from "@/components/schedule-delivery-form"

interface PageProps {
  params: Promise<{
    id: string
  }>
}

export default async function ScheduleDeliveryPage({ params }: PageProps) {
  const { id } = await params

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Schedule Delivery</h1>
        <p className="text-muted-foreground">Choose when and how to deliver your letter</p>
      </div>

      <ScheduleDeliveryForm letterId={id} />
    </div>
  )
}
