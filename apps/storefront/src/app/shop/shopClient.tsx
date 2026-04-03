"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { Product } from "@/types/catalog";
import { ProductTile } from "@/components/ProductTile";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Card } from "@/components/ui/Card";

type Initial = { items: Product[]; facets: { categories: string[] } };

export function ShopClient({
  initial,
  initialQuery,
}: {
  initial: Initial;
  initialQuery: { q: string; category: string; sort: "featured" | "price-asc" | "price-desc" };
}) {
  const router = useRouter();
  const sp = useSearchParams();

  const [q, setQ] = useState(initialQuery.q);
  const [category, setCategory] = useState(initialQuery.category);
  const [sort, setSort] = useState(initialQuery.sort);
  const [data, setData] = useState<Initial>(initial);
  const [loading, setLoading] = useState(false);

  const categories = useMemo(() => data.facets.categories, [data.facets.categories]);

  useEffect(() => {
    const nextQ = sp.get("q") ?? "";
    const nextCat = sp.get("category") ?? "";
    const nextSort = (sp.get("sort") as typeof sort) ?? "featured";
    setQ(nextQ);
    setCategory(nextCat);
    setSort(nextSort === "price-asc" || nextSort === "price-desc" ? nextSort : "featured");
  }, [sp]);

  async function refresh(next: { q: string; category: string; sort: string }) {
    const qs = new URLSearchParams();
    if (next.q) qs.set("q", next.q);
    if (next.category) qs.set("category", next.category);
    if (next.sort && next.sort !== "featured") qs.set("sort", next.sort);

    router.replace(`/shop${qs.toString() ? `?${qs.toString()}` : ""}`);

    setLoading(true);
    try {
      const res = await fetch(`/api/products${qs.toString() ? `?${qs.toString()}` : ""}`, {
        cache: "no-store",
      });
      const json = (await res.json()) as Initial;
      setData(json);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid gap-6">
      <Card className="p-6">
        <div className="grid gap-4 md:grid-cols-3 items-end">
          <Input
            label="Search"
            placeholder="Search products, finishes, categories…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          <Select
            label="Category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            options={[
              { value: "", label: "All categories" },
              ...categories.map((c) => ({ value: c, label: c })),
            ]}
          />
          <Select
            label="Sort"
            value={sort}
            onChange={(e) => setSort(e.target.value as typeof sort)}
            options={[
              { value: "featured", label: "Featured" },
              { value: "price-asc", label: "Price: Low → High" },
              { value: "price-desc", label: "Price: High → Low" },
            ]}
          />
        </div>
        <div className="mt-4 flex items-center justify-between gap-4">
          <div className="text-sm text-muted">
            {loading ? "Updating…" : `${data.items.length} items`}
          </div>
          <button
            onClick={() => refresh({ q, category, sort })}
            className="rounded-full border border-border bg-surface px-4 py-2 text-sm hover:bg-surface-2 transition"
          >
            Apply
          </button>
        </div>
      </Card>

      {data.items.length === 0 ? (
        <div className="rounded-[var(--radius-lg)] border border-border bg-surface p-10 ti-ring text-center">
          <div className="font-[var(--font-ti-display)] text-2xl tracking-tight">
            No matches.
          </div>
          <div className="mt-2 text-sm text-muted">Try a different query or clear filters.</div>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {data.items.map((p) => (
            <ProductTile key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
