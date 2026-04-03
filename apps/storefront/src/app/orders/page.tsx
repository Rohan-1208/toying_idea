import { AppShell } from "@/components/AppShell";
import { OrdersClient } from "@/app/orders/OrdersClient";
import { Suspense } from "react";

export default function OrdersPage() {
  return (
    <AppShell>
      <div className="mx-auto w-full max-w-6xl px-5 py-10 grid gap-6">
        <div className="grid gap-2">
          <h1 className="font-[var(--font-ti-display)] text-4xl tracking-tight">Orders</h1>
          <p className="text-sm text-muted">Saved on this device. Use Track Order for full timeline.</p>
        </div>
        <Suspense fallback={<div className="text-sm text-muted">Loading…</div>}>
          <OrdersClient />
        </Suspense>
      </div>
    </AppShell>
  );
}
