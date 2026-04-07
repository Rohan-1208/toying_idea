"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { formatMoney } from "@/lib/money";

export type AdminOrder = {
  id: string;
  number?: string;
  status?: string;
  createdAt?: string;
  customer?: {
    name?: string;
    email?: string;
    phone?: string | null;
    address1?: string;
    address2?: string | null;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
  };
  user_id?: string;
  items?: Array<{
    productSlug?: string;
    variantId?: string;
    name?: string;
    variantLabel?: string;
    quantity?: number;
    unitPrice?: { currency: "INR" | "EUR"; amount: number };
  }>;
};

const statusOptions = [
  "Placed",
  "In production",
  "Quality check",
  "Shipped",
  "Delivered",
  "Cancelled",
] as const;

export function AdminOrdersClient({ initial }: { initial: AdminOrder[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [orders, setOrders] = useState<AdminOrder[]>(initial);

  const sorted = useMemo(() => {
    return [...orders].sort((a, b) => String(b.createdAt || "").localeCompare(String(a.createdAt || "")));
  }, [orders]);

  return (
    <div className="grid gap-2">
      {sorted.map((o) => (
        <div key={o.id} className="rounded-[var(--radius-lg)] border border-border bg-surface p-4 grid gap-3">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
            <div className="grid">
              <div className="font-medium">{o.number ?? o.id}</div>
              <div className="text-xs text-muted">{o.status ?? "—"}</div>
            </div>
            <div className="text-xs text-muted">{o.createdAt ?? ""}</div>
          </div>

          <div className="grid gap-2 md:grid-cols-[1fr_auto] items-end">
            <label className="grid gap-2 text-sm">
              <span className="font-medium text-ti-cocoa">Update status</span>
              <select
                className="h-12 rounded-[var(--radius-md)] border border-border bg-ti-cream px-4 text-sm"
                value={o.status ?? ""}
                onChange={(e) => {
                  const next = e.target.value;
                  startTransition(async () => {
                    const res = await fetch(
                      `/api/admin/orders/${encodeURIComponent(o.id)}/status?status_value=${encodeURIComponent(next)}`,
                      { method: "PUT" },
                    );
                    if (res.status === 401 || res.status === 403) {
                      window.location.href = "/admin";
                      return;
                    }
                    if (!res.ok) {
                      const text = await res.text().catch(() => "");
                      alert(text || "Failed to update status");
                      return;
                    }
                    const updated = (await res.json()) as AdminOrder;
                    setOrders((prev) => prev.map((x) => (x.id === o.id ? updated : x)));
                    router.refresh();
                  });
                }}
                disabled={pending}
              >
                <option value="" disabled>
                  Select
                </option>
                {statusOptions.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </label>
            <Button type="button" variant="ghost" onClick={() => router.refresh()} disabled={pending}>
              Refresh
            </Button>
          </div>

          {o.customer ? (
            <div className="grid gap-1">
              <div className="text-xs text-muted">Customer</div>
              <div className="text-sm">{(o.customer.name || "—") + " · " + (o.customer.email || "—")}</div>
              {o.customer.phone ? <div className="text-sm text-muted">{o.customer.phone}</div> : null}
              <div className="text-sm text-muted">
                {[
                  o.customer.address1,
                  o.customer.address2,
                  o.customer.city,
                  o.customer.state,
                  o.customer.postalCode,
                  o.customer.country,
                ]
                  .filter(Boolean)
                  .join(", ")}
              </div>
            </div>
          ) : o.user_id ? (
            <div className="grid gap-1">
              <div className="text-xs text-muted">User</div>
              <div className="text-sm text-muted">{o.user_id}</div>
            </div>
          ) : null}

          {o.items?.length ? (
            <div className="grid gap-2">
              <div className="text-xs text-muted">Items</div>
              <div className="grid gap-2">
                {o.items.map((it, idx) => {
                  const unit = it.unitPrice;
                  const qty = it.quantity ?? 0;
                  const line = unit && qty ? formatMoney({ currency: unit.currency, amount: unit.amount * qty }) : null;
                  const unitLabel = unit ? formatMoney(unit) : "—";
                  return (
                    <div key={`${o.id}_${idx}`} className="flex items-start justify-between gap-4 text-sm">
                      <div className="grid">
                        <div className="font-medium text-ti-cocoa">{it.name ?? it.productSlug ?? "—"}</div>
                        <div className="text-xs text-muted">{it.variantLabel ?? it.variantId ?? ""}</div>
                        <div className="text-xs text-muted">
                          Qty {qty} · {unitLabel} each
                        </div>
                      </div>
                      <div className="font-medium">{line ?? "—"}</div>
                    </div>
                  );
                })}
              </div>

              {(() => {
                const currency = o.items?.[0]?.unitPrice?.currency;
                const total = (o.items || []).reduce((sum, it) => {
                  const unit = it.unitPrice?.amount ?? 0;
                  const qty = it.quantity ?? 0;
                  return sum + unit * qty;
                }, 0);
                return currency ? (
                  <div className="flex items-center justify-between text-sm border-t border-border pt-3">
                    <span className="text-muted">Total</span>
                    <span className="font-medium">{formatMoney({ currency, amount: total })}</span>
                  </div>
                ) : null;
              })()}
            </div>
          ) : null}
        </div>
      ))}
    </div>
  );
}

