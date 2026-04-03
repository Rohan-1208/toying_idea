"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { Product } from "@/types/catalog";
import type { Cart } from "@/types/commerce";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ButtonLink } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { getCart } from "@/services/commerce";
import { formatMoney } from "@/lib/money";

type EnrichedItem = {
  id: string;
  quantity: number;
  product: Product;
  variant: Product["variants"][number];
};

export function CheckoutClient() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [cart, setCart] = useState<Cart | null>(null);
  const [catalog, setCatalog] = useState<Product[] | null>(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address1, setAddress1] = useState("");
  const [address2, setAddress2] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [country, setCountry] = useState("IN");

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

  const canSubmit = useMemo(() => {
    if (!cart || items.length === 0) return false;
    if (!name.trim() || !email.trim() || !address1.trim() || !city.trim() || !state.trim() || !postalCode.trim())
      return false;
    return true;
  }, [address1, cart, city, email, items.length, name, postalCode, state]);

  if (!cart || !catalog) {
    return (
      <Card className="p-10 text-center">
        <div className="text-sm text-muted">Loading checkout…</div>
      </Card>
    );
  }

  if (items.length === 0) {
    return (
      <Card className="p-12 text-center">
        <div className="font-[var(--font-ti-display)] text-2xl tracking-tight">Cart is empty.</div>
        <div className="mt-2 text-sm text-muted">Add items to cart before checkout.</div>
        <div className="mt-6 flex justify-center">
          <ButtonLink href="/shop" variant="primary">
            Shop
          </ButtonLink>
        </div>
      </Card>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_360px] items-start">
      <Card className="p-6 grid gap-4">
        <div className="font-[var(--font-ti-display)] text-xl tracking-tight">Delivery details</div>
        <div className="grid gap-4 md:grid-cols-2">
          <Input label="Name" value={name} onChange={(e) => setName(e.target.value)} required />
          <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <Input label="Phone (optional)" value={phone} onChange={(e) => setPhone(e.target.value)} />
        <Input label="Address line 1" value={address1} onChange={(e) => setAddress1(e.target.value)} required />
        <Input label="Address line 2 (optional)" value={address2} onChange={(e) => setAddress2(e.target.value)} />
        <div className="grid gap-4 md:grid-cols-3">
          <Input label="City" value={city} onChange={(e) => setCity(e.target.value)} required />
          <Input label="State" value={state} onChange={(e) => setState(e.target.value)} required />
          <Input
            label="Postal code"
            value={postalCode}
            onChange={(e) => setPostalCode(e.target.value)}
            required
          />
        </div>
        <Input label="Country" value={country} onChange={(e) => setCountry(e.target.value)} />
      </Card>

      <Card className="p-6 grid gap-4">
        <div className="font-[var(--font-ti-display)] text-xl tracking-tight">Summary</div>
        <div className="grid gap-2">
          {items.map((it) => (
            <div key={it.id} className="flex items-start justify-between gap-4 text-sm">
              <div className="grid">
                <div className="font-medium text-ti-cocoa">{it.product.name}</div>
                <div className="text-xs text-muted">{it.variant.label}</div>
                <div className="text-xs text-muted">Qty {it.quantity}</div>
              </div>
              <div className="font-medium">
                {formatMoney({ ...it.variant.price, amount: it.variant.price.amount * it.quantity })}
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between text-sm border-t border-border pt-4">
          <span className="text-muted">Subtotal</span>
          <span className="font-medium">{subtotal ? formatMoney(subtotal) : "—"}</span>
        </div>

        <Button
          variant="primary"
          disabled={!canSubmit || pending}
          onClick={() => {
            startTransition(async () => {
              const res = await fetch("/api/checkout", {
                method: "POST",
                headers: { "content-type": "application/json" },
                body: JSON.stringify({
                  customer: {
                    name,
                    email,
                    phone: phone || null,
                    address1,
                    address2: address2 || null,
                    city,
                    state,
                    postalCode,
                    country,
                  },
                }),
              });
              if (!res.ok) {
                const text = await res.text().catch(() => "");
                alert(text || "Checkout failed");
                return;
              }
              const json = (await res.json()) as { orderNumber?: string };
              const orderNumber = json.orderNumber ?? "";
              if (orderNumber) {
                try {
                  const key = "ti_orders";
                  const raw = window.localStorage.getItem(key);
                  const list = raw ? (JSON.parse(raw) as string[]) : [];
                  const next = [orderNumber, ...list.filter((x) => x !== orderNumber)].slice(0, 25);
                  window.localStorage.setItem(key, JSON.stringify(next));
                } catch {}
              }
              router.replace(`/orders?status=all`);
              router.refresh();
            });
          }}
        >
          {pending ? "Placing order…" : "Place order"}
        </Button>
      </Card>
    </div>
  );
}
