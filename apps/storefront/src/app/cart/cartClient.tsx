"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, useTransition } from "react";
import type { Product } from "@/types/catalog";
import type { Cart } from "@/types/commerce";
import { Card } from "@/components/ui/Card";
import { ButtonLink } from "@/components/ui/Button";
import { clearCart, getCart, updateCartItem } from "@/services/commerce";
import { formatMoney } from "@/lib/money";

type EnrichedItem = {
  id: string;
  quantity: number;
  product: Product;
  variant: Product["variants"][number];
};

export function CartClient() {
  const [cart, setCart] = useState<Cart | null>(null);
  const [catalog, setCatalog] = useState<Product[] | null>(null);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      fetch("/api/products", { cache: "no-store" }).then((r) => r.json() as Promise<{ items: Product[] }>),
      getCart(),
    ])
      .then(([p, c]) => {
        if (cancelled) return;
        setCatalog(p.items);
        setCart(c);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  const items = useMemo<EnrichedItem[]>(() => {
    if (!cart || !catalog) return [];
    const bySlug = new Map(catalog.map((p) => [p.slug, p]));
    return cart.items
      .map((i) => {
        const product = bySlug.get(i.productSlug);
        const variant = product?.variants.find((v) => v.id === i.variantId);
        if (!product || !variant) return null;
        return { id: i.id, quantity: i.quantity, product, variant };
      })
      .filter((x): x is EnrichedItem => Boolean(x));
  }, [cart, catalog]);

  const subtotal = useMemo(() => {
    if (!cart) return null;
    if (!catalog) return null;
    let sum = 0;
    for (const it of items) sum += it.variant.price.amount * it.quantity;
    const currency = items[0]?.variant.price.currency ?? cart.currency;
    return { currency, amount: sum };
  }, [cart, catalog, items]);

  if (!cart || !catalog) {
    return (
      <Card className="p-10 text-center">
        <div className="text-sm text-muted">Loading cart…</div>
      </Card>
    );
  }

  if (items.length === 0) {
    return (
      <Card className="p-12 text-center">
        <div className="font-[var(--font-ti-display)] text-2xl tracking-tight">Cart is empty.</div>
        <div className="mt-2 text-sm text-muted">Start with a drop or build something custom.</div>
        <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
          <ButtonLink href="/shop" variant="primary">
            Shop the Collection
          </ButtonLink>
          <ButtonLink href="/pyot" variant="ghost">
            Start Your Toy
          </ButtonLink>
        </div>
      </Card>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_360px] items-start">
      <div className="grid gap-4">
        {items.map((it) => (
          <Card key={it.id} className="p-6">
            <div className="flex items-start justify-between gap-4">
              <div className="grid gap-1">
                <Link
                  href={`/product/${encodeURIComponent(it.product.slug)}`}
                  className="font-[var(--font-ti-display)] tracking-tight hover:underline"
                >
                  {it.product.name}
                </Link>
                <div className="text-sm text-muted">{it.variant.label}</div>
                <div className="text-sm font-medium">{formatMoney(it.variant.price)}</div>
              </div>

              <div className="grid gap-2 justify-items-end">
                <label className="text-sm text-muted">Qty</label>
                <select
                  className="h-11 rounded-full border border-border bg-ti-cream px-4 text-sm"
                  value={String(it.quantity)}
                  disabled={pending}
                  onChange={(e) => {
                    const next = Number(e.target.value);
                    startTransition(async () => {
                      const nextCart = await updateCartItem({ itemId: it.id, quantity: next });
                      setCart(nextCart);
                    });
                  }}
                >
                  {[1, 2, 3, 4, 5, 10, 20].map((n) => (
                    <option key={n} value={String(n)}>
                      {n}
                    </option>
                  ))}
                  <option value="0">Remove</option>
                </select>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Card className="p-6 grid gap-4">
        <div className="font-[var(--font-ti-display)] text-xl tracking-tight">Summary</div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted">Subtotal</span>
          <span className="font-medium">{subtotal ? formatMoney(subtotal) : "—"}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted">Shipping estimate</span>
          <span className="font-medium">Calculated at checkout</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted">Tax</span>
          <span className="font-medium">—</span>
        </div>
        <div className="pt-2">
          <ButtonLink href="/checkout" variant="primary" size="lg" className="w-full">
            Checkout
          </ButtonLink>
        </div>
        <button
          className="text-sm text-muted hover:text-ti-cocoa underline"
          disabled={pending}
          onClick={() => {
            startTransition(async () => {
              await clearCart();
              const next = await getCart();
              setCart(next);
            });
          }}
        >
          Clear cart
        </button>
      </Card>
    </div>
  );
}
