"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

type OrderSummary = {
  number?: string;
  status?: string;
  createdAt?: string;
  customer?: { name?: string; email?: string };
  items?: Array<{ name?: string; productSlug?: string; quantity?: number }>;
};

type TrackResponse = { order: OrderSummary | null; events?: Array<{ id: string; at: string; title: string }> };

const statuses = ["all", "Placed", "In production", "Quality check", "Shipped", "Delivered", "Cancelled"] as const;

export function OrdersClient() {
  const params = useSearchParams();
  const [pending, startTransition] = useTransition();
  const [orderNumbers, setOrderNumbers] = useState<string[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const raw = window.localStorage.getItem("ti_orders");
      const list = raw ? (JSON.parse(raw) as string[]) : [];
      return list.filter(Boolean);
    } catch {
      return [];
    }
  });
  const [data, setData] = useState<Record<string, OrderSummary | null>>({});
  const [add, setAdd] = useState("");

  const [statusFilter, setStatusFilter] = useState(() => params.get("status") || "all");

  useEffect(() => {
    if (orderNumbers.length === 0) return;
    let cancelled = false;
    startTransition(async () => {
      const entries = await Promise.all(
        orderNumbers.map(async (n) => {
          try {
            const res = await fetch(`/api/track-order?order=${encodeURIComponent(n)}`, { cache: "no-store" });
            const json = (await res.json()) as TrackResponse;
            return [n, json.order] as const;
          } catch {
            return [n, null] as const;
          }
        }),
      );
      if (cancelled) return;
      const next: Record<string, OrderSummary | null> = {};
      for (const [n, o] of entries) next[n] = o;
      setData(next);
    });
    return () => {
      cancelled = true;
    };
  }, [orderNumbers, startTransition]);

  const visible = useMemo(() => {
    const rows = orderNumbers
      .map((n) => ({ number: n, order: data[n] }))
      .filter((x) => x.order);
    if (statusFilter === "all") return rows;
    return rows.filter((x) => x.order?.status === statusFilter);
  }, [data, orderNumbers, statusFilter]);

  return (
    <div className="grid gap-6">
      <Card className="p-6 grid gap-4">
        <div className="font-[var(--font-ti-display)] text-xl tracking-tight">Your orders</div>

        <div className="grid gap-4 md:grid-cols-[1fr_auto] items-end">
          <Input
            label="Add order number"
            placeholder="e.g. TI-7390"
            value={add}
            onChange={(e) => setAdd(e.target.value)}
          />
          <Button
            variant="primary"
            disabled={!add.trim()}
            onClick={() => {
              const n = add.trim();
              setAdd("");
              try {
                const next = [n, ...orderNumbers.filter((x) => x !== n)].slice(0, 25);
                window.localStorage.setItem("ti_orders", JSON.stringify(next));
                setOrderNumbers(next);
              } catch {}
            }}
          >
            Add
          </Button>
        </div>

        <div className="grid gap-2">
          <label className="grid gap-2 text-sm max-w-xs">
            <span className="font-medium text-ti-cocoa">Filter</span>
            <select
              className="h-12 rounded-[var(--radius-md)] border border-border bg-ti-cream px-4 text-sm"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              {statuses.map((s) => (
                <option key={s} value={s}>
                  {s === "all" ? "All" : s}
                </option>
              ))}
            </select>
          </label>
        </div>
      </Card>

      <Card className="p-6 grid gap-4">
        {orderNumbers.length === 0 ? (
          <div className="text-sm text-muted">No orders saved on this device yet.</div>
        ) : pending ? (
          <div className="text-sm text-muted">Loading…</div>
        ) : visible.length === 0 ? (
          <div className="text-sm text-muted">No orders match this filter.</div>
        ) : (
          <div className="grid gap-3">
            {visible.map(({ number, order }) => (
              <div key={number} className="rounded-[var(--radius-lg)] border border-border bg-surface p-4 grid gap-2">
                <div className="flex items-center justify-between gap-4">
                  <div className="grid">
                    <div className="font-medium">{order?.number ?? number}</div>
                    <div className="text-xs text-muted">{order?.status ?? "—"}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/track-order?order=${encodeURIComponent(order?.number ?? number)}`}
                      className="text-sm font-medium hover:underline"
                    >
                      Track
                    </Link>
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => {
                        const next = orderNumbers.filter((x) => x !== number);
                        window.localStorage.setItem("ti_orders", JSON.stringify(next));
                        setOrderNumbers(next);
                      }}
                    >
                      Remove
                    </Button>
                  </div>
                </div>
                {order?.items?.length ? (
                  <div className="grid gap-1">
                    {order.items.slice(0, 5).map((it, idx) => (
                      <div key={`${number}_${idx}`} className="text-sm text-muted">
                        {it.name ?? it.productSlug ?? "—"} · Qty {it.quantity ?? 0}
                      </div>
                    ))}
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
