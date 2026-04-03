"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { Cart } from "@/types/commerce";

export function CartPill() {
  const [cart, setCart] = useState<Cart | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/cart", { cache: "no-store" })
      .then((r) => r.json())
      .then((d: { cart: Cart }) => {
        if (!cancelled) setCart(d.cart);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  const count = useMemo(
    () => cart?.items.reduce((sum, i) => sum + i.quantity, 0) ?? 0,
    [cart],
  );

  return (
    <Link
      href="/cart"
      className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-4 py-2 text-sm ti-ring hover:bg-surface-2 transition"
    >
      <span className="font-medium">Cart</span>
      <span className="grid h-6 min-w-6 place-items-center rounded-full bg-ti-cocoa text-ti-cream text-xs px-2">
        {count}
      </span>
    </Link>
  );
}

