import Link from "next/link";
import Image from "next/image";
import { AppShell } from "@/components/AppShell";
import { ButtonLink } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ProductTile } from "@/components/ProductTile";
import { getFeaturedCollections, searchProducts } from "@/services/catalog";

export default async function Home() {
  const [collections, productSearch] = await Promise.all([
    getFeaturedCollections(),
    searchProducts({ sort: "featured" }),
  ]);

  const featured = productSearch.items.slice(0, 4);

  return (
    <AppShell>
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute -top-24 -left-24 h-80 w-80 rounded-full bg-ti-sky/35 blur-3xl" />
          <div className="absolute -bottom-24 -right-24 h-96 w-96 rounded-full bg-ti-orange/30 blur-3xl" />
        </div>

        <div className="relative mx-auto w-full max-w-6xl px-5 py-14 md:py-18">
          <div className="grid gap-10 items-center md:grid-cols-2">
            <div className="grid gap-6">
              <div className="flex flex-wrap items-center gap-2">
                <Badge tone="gold">Premium 3D Printed</Badge>
                <Badge tone="sky">Customization-first</Badge>
                <Badge tone="cream">Collector-ready</Badge>
              </div>

              <h1 className="font-[var(--font-ti-display)] text-[40px] leading-[1.03] tracking-tight md:text-[56px]">
                3D printed toys built like future collectibles.
              </h1>
              <p className="text-base md:text-lg text-muted max-w-xl">
                Upload, customize, gift, and collect—precision-built toys that feel like design
                objects, not disposables.
              </p>

              <div className="flex flex-col sm:flex-row gap-3">
                <ButtonLink href="/pyot" size="lg">
                  PYOT
                </ButtonLink>
                <ButtonLink href="/shop" variant="ghost" size="lg">
                  Shop the Collection
                </ButtonLink>
              </div>
            </div>

            <div className="grid place-items-center">
              <div className="w-full max-w-md">
                <div className="rounded-[var(--radius-lg)] border border-border bg-surface ti-ring overflow-hidden">
                  <div className="relative aspect-square bg-ti-cream">
                    <div className="absolute inset-0">
                      <div className="absolute -top-20 -left-20 h-56 w-56 rounded-full bg-ti-sky/35 blur-3xl" />
                      <div className="absolute -bottom-20 -right-20 h-64 w-64 rounded-full bg-ti-orange/30 blur-3xl" />
                    </div>
                    <div className="relative grid h-full place-items-center p-10">
                      <Image
                        src="/brand/logo.png"
                        alt="TOYING IDEA logo"
                        width={520}
                        height={520}
                        unoptimized
                        className="h-auto w-full max-w-[320px] md:max-w-[360px] object-contain drop-shadow-[0_22px_42px_rgba(36,21,11,0.22)]"
                        priority
                      />
                    </div>
                  </div>
                </div>
                <div className="mt-4 text-center text-xs text-muted">
                  Signature mark for the TOYING IDEA world.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-5 py-14 grid gap-10">
        <div className="flex items-end justify-between gap-6">
          <div className="grid gap-2">
            <h2 className="font-[var(--font-ti-display)] text-3xl tracking-tight">Featured Drops</h2>
            <p className="text-sm text-muted">
              Editorial product presentation—clean, collectible-first, and built for gifting.
            </p>
          </div>
          <Link href="/shop" className="text-sm font-medium hover:underline">
            View all
          </Link>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {featured.map((p) => (
            <ProductTile key={p.id} product={p} />
          ))}
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-5 py-14 grid gap-5 md:grid-cols-2">
        <div className="rounded-[var(--radius-lg)] border border-border bg-surface p-8 ti-ring grid gap-4">
          <h3 className="font-[var(--font-ti-display)] text-2xl tracking-tight">
            PYOT — Print Your Own Toy
          </h3>
          <p className="text-sm text-muted">
            Upload STL/OBJ/STEP + references. Pick material & finish. Request a quote for custom
            builds.
          </p>
          <div className="flex gap-3">
            <ButtonLink href="/pyot" variant="primary">
              Upload files
            </ButtonLink>
            <ButtonLink href="/pyot" variant="ghost">
              Learn flow
            </ButtonLink>
          </div>
        </div>
        <div className="rounded-[var(--radius-lg)] border border-border bg-surface p-8 ti-ring grid gap-4">
          <h3 className="font-[var(--font-ti-display)] text-2xl tracking-tight">
            Customized Gifting
          </h3>
          <p className="text-sm text-muted">
            Occasion-ready gifting with premium notes, brand options, and scale ranges for B2B.
          </p>
          <div className="flex gap-3">
            <ButtonLink href="/customized-gifting" variant="primary">
              Start inquiry
            </ButtonLink>
            <ButtonLink href="/shop" variant="ghost">
              Shop giftables
            </ButtonLink>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-5 py-14 grid gap-6">
        <div className="grid gap-2">
          <h2 className="font-[var(--font-ti-display)] text-3xl tracking-tight">
            Featured Collections
          </h2>
          <p className="text-sm text-muted">
            Clear hierarchy, strong rhythm, and merchandising that feels premium.
          </p>
        </div>
        <div className="grid gap-5 md:grid-cols-2">
          {collections.map((c) => (
            <Link
              key={c.id}
              href={`/shop?collection=${encodeURIComponent(c.slug)}`}
              className="rounded-[var(--radius-lg)] border border-border bg-surface p-8 ti-ring hover:bg-surface-2 transition grid gap-2"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="font-[var(--font-ti-display)] text-2xl tracking-tight">
                  {c.title}
                </div>
                <Badge tone="gold">{c.productSlugs.length} items</Badge>
              </div>
              <div className="text-sm text-muted">{c.description}</div>
              <div className="text-xs text-muted">Explore →</div>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-5 py-16">
        <div className="rounded-[var(--radius-lg)] border border-border bg-ti-cocoa text-ti-cream p-10 ti-ring grid gap-5 md:grid-cols-2 items-center">
          <div className="grid gap-3">
            <h2 className="font-[var(--font-ti-display)] text-3xl tracking-tight">
              A world-class brand that happens to sell toys.
            </h2>
            <p className="text-sm text-ti-cream/80">
              Premium motion, sculptural product presentation, and backend-driven content—built for
              the next generation of collectors.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 md:justify-end">
            <ButtonLink href="/shop" variant="primary" size="lg" className="bg-ti-orange">
              Shop now
            </ButtonLink>
            <ButtonLink href="/track-order" variant="ghost" size="lg" className="text-ti-cream border-ti-cream/25 hover:bg-ti-cream/10">
              Track an order
            </ButtonLink>
          </div>
        </div>
      </section>
    </AppShell>
  );
}
