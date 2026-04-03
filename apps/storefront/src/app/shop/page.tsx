import { AppShell } from "@/components/AppShell";
import { searchProducts } from "@/services/catalog";
import { ShopClient } from "@/app/shop/shopClient";

export default async function Shop({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const q = typeof sp.q === "string" ? sp.q : "";
  const category = typeof sp.category === "string" ? sp.category : "";
  const sort =
    sp.sort === "price-asc" || sp.sort === "price-desc" || sp.sort === "featured"
      ? sp.sort
      : "featured";

  const initial = await searchProducts({ q, category, sort });

  return (
    <AppShell>
      <div className="mx-auto w-full max-w-6xl px-5 py-10 grid gap-6">
        <div className="grid gap-2">
          <h1 className="font-[var(--font-ti-display)] text-4xl tracking-tight">Shop</h1>
          <p className="text-sm text-muted">
            Editorial, collectible-focused merchandising—filters, sorting, and stock clarity.
          </p>
        </div>

        <ShopClient initial={initial} initialQuery={{ q, category, sort }} />
      </div>
    </AppShell>
  );
}

