"use client";

import { useMemo, useState, useTransition } from "react";
import { useSearchParams } from "next/navigation";
import type { TrackOrderResponse } from "@/types/commerce";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

function fmt(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString(undefined, { year: "numeric", month: "short", day: "2-digit", hour: "2-digit", minute: "2-digit" });
}

export function TrackOrderClient() {
  const params = useSearchParams();
  const [order, setOrder] = useState(() => params.get("order") || "");
  const [pending, startTransition] = useTransition();
  const [data, setData] = useState<TrackOrderResponse | null>(null);

  const has = useMemo(() => (data?.events?.length ?? 0) > 0, [data]);

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_360px] items-start">
      <Card className="p-6 grid gap-4">
        <div className="flex flex-col sm:flex-row gap-3 items-end">
          <div className="flex-1">
            <Input
              label="Order number"
              placeholder="e.g. TI-1042"
              value={order}
              onChange={(e) => setOrder(e.target.value)}
            />
          </div>
          <Button
            disabled={pending || !order.trim()}
            onClick={() => {
              startTransition(async () => {
                const res = await fetch(`/api/track-order?order=${encodeURIComponent(order.trim())}`, { cache: "no-store" });
                setData((await res.json()) as TrackOrderResponse);
              });
            }}
          >
            {pending ? "Checking…" : "Track"}
          </Button>
        </div>

        {!data ? (
          <div className="text-sm text-muted">Enter an order number to see status updates.</div>
        ) : has ? (
          <div className="grid gap-4">
            <div className="rounded-[var(--radius-lg)] border border-border bg-surface p-4">
              <div className="text-xs text-muted">Order</div>
              <div className="mt-1 font-[var(--font-ti-display)] text-xl tracking-tight">
                {data.order?.number}
              </div>
              <div className="mt-1 text-sm text-muted">Status: {data.order?.status}</div>
            </div>

            <div className="grid gap-3">
              {data.events
                .slice()
                .sort((a, b) => (a.at < b.at ? 1 : -1))
                .map((e) => (
                  <div key={e.id} className="rounded-[var(--radius-lg)] border border-border bg-ti-cream p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="font-medium">{e.title}</div>
                      <div className="text-xs text-muted">{fmt(e.at)}</div>
                    </div>
                    {e.description ? <div className="mt-1 text-sm text-muted">{e.description}</div> : null}
                  </div>
                ))}
            </div>
          </div>
        ) : (
          <div className="rounded-[var(--radius-lg)] border border-border bg-surface p-8 text-center">
            <div className="font-[var(--font-ti-display)] text-xl tracking-tight">Not found.</div>
            <div className="mt-2 text-sm text-muted">Check the order number and try again.</div>
          </div>
        )}
      </Card>

      <Card className="p-6 grid gap-4">
        <div className="font-[var(--font-ti-display)] text-xl tracking-tight">What you’ll see</div>
        <div className="rounded-[var(--radius-lg)] border border-border bg-surface p-4">
          <div className="text-xs text-muted">Timeline stages</div>
          <ul className="mt-2 grid gap-2 text-sm">
            <li>Placed</li>
            <li>In production</li>
            <li>Quality check</li>
            <li>Shipped</li>
            <li>Delivered</li>
          </ul>
        </div>
        <div className="text-sm text-muted">
          You’ll see status updates as your order moves through production and delivery.
        </div>
      </Card>
    </div>
  );
}
