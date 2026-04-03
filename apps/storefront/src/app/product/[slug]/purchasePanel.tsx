"use client";

import { useMemo, useState, useTransition } from "react";
import type { Product } from "@/types/catalog";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { addToCart } from "@/services/commerce";
import { formatMoney } from "@/lib/money";

export function AddToCartPanel({ product }: { product: Product }) {
  const [variantId, setVariantId] = useState(product.variants[0]?.id ?? "");
  const [qty, setQty] = useState(1);
  const [pending, startTransition] = useTransition();
  const [status, setStatus] = useState<string | null>(null);

  const variant = useMemo(
    () => product.variants.find((v) => v.id === variantId) ?? product.variants[0]!,
    [product.variants, variantId],
  );

  const unitPrice = formatMoney(variant.price);
  const totalPrice = formatMoney({ ...variant.price, amount: variant.price.amount * qty });

  return (
    <div className="grid gap-4">
      <div className="grid gap-4 md:grid-cols-2">
        <Select
          label="Variant"
          value={variantId}
          onChange={(e) => setVariantId(e.target.value)}
          options={product.variants.map((v) => ({
            value: v.id,
            label: `${v.label}${v.inStock ? "" : " (out of stock)"}`,
          }))}
        />
        <Select
          label="Quantity"
          value={String(qty)}
          onChange={(e) => setQty(Number(e.target.value))}
          options={[1, 2, 3, 4, 5].map((n) => ({ value: String(n), label: String(n) }))}
        />
      </div>

      <div className="flex items-center justify-between">
        <div className="text-sm text-muted">{qty > 1 ? "Total" : "Price"}</div>
        <div className="font-medium">{totalPrice}</div>
      </div>
      {qty > 1 ? <div className="text-xs text-muted">{unitPrice} each</div> : null}

      <div className="flex flex-col sm:flex-row gap-3">
        <Button
          variant="primary"
          disabled={pending || !variant.inStock}
          onClick={() => {
            setStatus(null);
            startTransition(async () => {
              try {
                await addToCart({ productSlug: product.slug, variantId: variant.id, quantity: qty });
                setStatus("Added to cart.");
              } catch {
                setStatus("Couldn’t add to cart. Try again.");
              }
            });
          }}
        >
          {variant.inStock ? (pending ? "Adding…" : "Add to cart") : "Out of stock"}
        </Button>
        <Button
          variant="ghost"
          onClick={() => {
            navigator.clipboard?.writeText(window.location.href).catch(() => {});
            setStatus("Link copied.");
          }}
        >
          Copy link
        </Button>
      </div>

      {status ? <div className="text-sm text-muted">{status}</div> : null}
    </div>
  );
}
