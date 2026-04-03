import Link from "next/link";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { Card } from "@/components/ui/Card";
import { AdminProductsClient } from "@/app/admin/products/AdminProductsClient";

async function apiUrl(pathname: string): Promise<string> {
  const h = await headers();
  const host = h.get("host");
  const proto = h.get("x-forwarded-proto") ?? "http";
  const base = host ? `${proto}://${host}` : "http://localhost:3000";
  return new URL(pathname, base).toString();
}

export default async function AdminProductsPage() {
  const jar = await cookies();
  const res = await fetch(await apiUrl("/api/admin/products"), {
    cache: "no-store",
    headers: { cookie: jar.toString() },
  });
  if (res.status === 401 || res.status === 403) redirect("/admin");
  const products = res.ok ? ((await res.json()) as Array<{ id: string; slug: string; name: string }>) : [];

  return (
    <AppShell>
      <div className="mx-auto w-full max-w-6xl px-5 py-10 grid gap-6">
        <div className="flex items-end justify-between gap-4">
          <div className="grid gap-2">
            <h1 className="font-[var(--font-ti-display)] text-4xl tracking-tight">Products</h1>
            <p className="text-sm text-muted">Products stored in MongoDB.</p>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/admin/products/new" className="text-sm font-medium underline">
              Add product
            </Link>
            <Link href="/admin" className="text-sm font-medium hover:underline">
              Back
            </Link>
          </div>
        </div>

        <Card className="p-6 grid gap-3">
          {products.length === 0 ? (
            <div className="text-sm text-muted">No products yet.</div>
          ) : (
            <AdminProductsClient initial={products} />
          )}
        </Card>
      </div>
    </AppShell>
  );
}
