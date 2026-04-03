import type { Collection, Product } from "@/types/catalog";
import { headers } from "next/headers";

async function apiUrl(pathname: string): Promise<string> {
  try {
    const h = await headers();
    const host = h.get("host");
    const proto = h.get("x-forwarded-proto") ?? "http";
    const base = host ? `${proto}://${host}` : "http://localhost:3000";
    return new URL(pathname, base).toString();
  } catch {
    return pathname;
  }
}

export async function getFeaturedCollections(): Promise<Collection[]> {
  const res = await fetch(await apiUrl("/api/collections/featured"), { cache: "no-store" });
  if (!res.ok) return [];
  const data = (await res.json()) as { collections: Collection[] };
  return data.collections ?? [];
}

export async function searchProducts(params: {
  q?: string;
  category?: string;
  sort?: "featured" | "price-asc" | "price-desc";
}): Promise<{ items: Product[]; facets: { categories: string[] } }> {
  const sp = new URLSearchParams();
  if (params.q) sp.set("q", params.q);
  if (params.category) sp.set("category", params.category);
  if (params.sort) sp.set("sort", params.sort);
  const qs = sp.toString();

  const res = await fetch(
    await apiUrl(`/api/products${qs ? `?${qs}` : ""}`),
    { cache: "no-store" },
  );
  if (!res.ok) throw new Error("Failed to load products");
  return (await res.json()) as { items: Product[]; facets: { categories: string[] } };
}

export async function getProduct(slug: string): Promise<{ product: Product; related: Product[] }> {
  const sp = new URLSearchParams();
  sp.set("slug", slug);
  const res = await fetch(await apiUrl(`/api/products/by-slug?${sp.toString()}`), {
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Failed to load product");
  return (await res.json()) as { product: Product; related: Product[] };
}
