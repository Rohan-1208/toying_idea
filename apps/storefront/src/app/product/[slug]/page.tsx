import Link from "next/link";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { ProductTile } from "@/components/ProductTile";
import { getProduct } from "@/services/catalog";
import { AddToCartPanel } from "@/app/product/[slug]/purchasePanel";
import { ProductGalleryClient } from "@/app/product/[slug]/ProductGalleryClient";

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug: rawSlug } = await params;
  let slug = rawSlug;
  try {
    slug = decodeURIComponent(rawSlug);
  } catch {
    slug = rawSlug;
  }

  let data: Awaited<ReturnType<typeof getProduct>>;
  try {
    data = await getProduct(slug);
  } catch {
    notFound();
  }

  const { product, related } = data;

  return (
    <AppShell>
      <div className="mx-auto w-full max-w-6xl px-5 py-10 grid gap-6">
        <div className="text-sm text-muted">
          <Link href="/shop" className="hover:underline">
            Shop
          </Link>{" "}
          / <span className="text-ti-cocoa">{product.name}</span>
        </div>

        <div className="grid gap-6 lg:grid-cols-2 items-start">
          <ProductGalleryClient name={product.name} images={product.images} />

          <div className="grid gap-5">
            <div className="flex flex-wrap items-center gap-2">
              {product.badges.map((b) => (
                <Badge
                  key={b}
                  tone={b === "Collector" ? "gold" : b === "Limited" ? "cocoa" : "sky"}
                >
                  {b}
                </Badge>
              ))}
              <Badge tone="cream">{product.categories.slice(0, 2).join(" • ")}</Badge>
            </div>

            <div className="grid gap-2">
              <h1 className="font-[var(--font-ti-display)] text-4xl tracking-tight">
                {product.name}
              </h1>
              <p className="text-base text-muted">{product.tagline}</p>
            </div>

            <Card className="p-6 grid gap-4">
              <AddToCartPanel product={product} />
              <div className="text-xs text-muted">
                Shipping notes: handcrafted finishing + careful packaging. Tracking updates appear in{" "}
                <Link href="/track-order" className="underline hover:text-ti-cocoa">
                  Track Order
                </Link>
                .
              </div>
            </Card>

            <div className="rounded-[var(--radius-lg)] border border-border bg-surface p-6 ti-ring">
              <div className="font-medium">Story</div>
              <p className="mt-2 text-sm text-muted">{product.description}</p>
            </div>
          </div>
        </div>

        {related.length ? (
          <section className="pt-10 grid gap-4">
            <div className="flex items-end justify-between gap-6">
              <div className="grid gap-1">
                <h2 className="font-[var(--font-ti-display)] text-2xl tracking-tight">
                  Related
                </h2>
                <p className="text-sm text-muted">More from similar categories.</p>
              </div>
              <Link href="/shop" className="text-sm font-medium hover:underline">
                Browse
              </Link>
            </div>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {related.map((p) => (
                <ProductTile key={p.id} product={p} />
              ))}
            </div>
          </section>
        ) : null}
      </div>
    </AppShell>
  );
}
