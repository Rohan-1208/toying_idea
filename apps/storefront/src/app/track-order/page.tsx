import { AppShell } from "@/components/AppShell";
import { TrackOrderClient } from "@/app/track-order/trackOrderClient";
import { Suspense } from "react";

export default function TrackOrderPage() {
  return (
    <AppShell>
      <div className="mx-auto w-full max-w-6xl px-5 py-10 grid gap-6">
        <div className="grid gap-2">
          <h1 className="font-[var(--font-ti-display)] text-4xl tracking-tight">Track Order</h1>
          <p className="text-sm text-muted">
            Enter your order number to view a production + shipping timeline.
          </p>
        </div>
        <Suspense fallback={<div className="text-sm text-muted">Loading…</div>}>
          <TrackOrderClient />
        </Suspense>
      </div>
    </AppShell>
  );
}
