import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/types/catalog";
import { formatMoney } from "@/lib/money";
import { Badge } from "@/components/ui/Badge";

export function ProductTile({ product }: { product: Product }) {
  const minPrice = product.variants.reduce((m, v) => (v.price.amount < m ? v.price.amount : m), product.variants[0]!.price.amount);
  const price = { ...product.variants[0]!.price, amount: minPrice };

  return (
    <Link
      href={`/product/${product.slug}`}
      className="group rounded-[var(--radius-lg)] border border-border bg-surface ti-ring overflow-hidden hover:bg-surface-2 transition"
    >
      <div className="relative aspect-[4/3] bg-ti-cream">
        <Image
          src={product.images[0]?.url ?? "/images/nova-bear-1.svg"}
          alt={product.images[0]?.alt ?? product.name}
          fill
          unoptimized
          className="object-cover p-6 group-hover:scale-[1.02] transition"
        />
        <div className="absolute left-4 top-4 flex flex-wrap gap-2">
          {product.badges.slice(0, 2).map((b) => (
            <Badge key={b} tone={b === "Collector" ? "gold" : b === "Limited" ? "cocoa" : "sky"}>
              {b}
            </Badge>
          ))}
        </div>
      </div>
      <div className="p-5 grid gap-2">
        <div className="flex items-start justify-between gap-4">
          <div className="grid gap-1">
            <div className="font-[var(--font-ti-display)] tracking-tight text-ti-cocoa">
              {product.name}
            </div>
            <div className="text-sm text-muted line-clamp-2">{product.tagline}</div>
          </div>
          <div className="text-sm font-medium text-ti-cocoa">{formatMoney(price)}</div>
        </div>
        <div className="text-xs text-muted">{product.categories.slice(0, 2).join(" • ")}</div>
      </div>
    </Link>
  );
}

