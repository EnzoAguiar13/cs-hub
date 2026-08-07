import { CreateDeliveryDialog } from "@/components/deliveries/create-delivery-dialog";
import { DeliveryTable } from "@/components/deliveries/delivery-table";

export default function DeliveriesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Entregas</h1>
          <p className="text-sm text-muted-foreground">Calendário de conteúdo combinado com os creators.</p>
        </div>
        <CreateDeliveryDialog />
      </div>
      <DeliveryTable />
    </div>
  );
}
