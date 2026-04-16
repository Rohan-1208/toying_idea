import Link from "next/link";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { AdminProductEditClient } from "@/app/admin/products/[id]/edit/productEditClient";

async function apiUrl(pathname: string): Promise<string> {
  const h = await headers();
  const host = h.get("host");
  const proto = h.get("x-forwarded-proto") ?? "http";
  const base = host ? `${proto}://${host}` : "http://localhost:3000";
  return new URL(pathname, base).toString();
}

export default async function AdminProductEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const jar = await cookies();

  const meRes = await fetch(await apiUrl("/api/auth/me"), { cache: "no-store", headers: { cookie: jar.toString() } });
  if (!meRes.ok) redirect("/admin");
  const me = (await meRes.json()) as { is_admin?: boolean };
  if (!me?.is_admin) redirect("/admin");

  const res = await fetch(await apiUrl(`/api/admin/products/${encodeURIComponent(id)}`), {
    cache: "no-store",
    headers: { cookie: jar.toString() },
  });
  if (res.status === 401 || res.status === 403) redirect("/admin");
  if (!res.ok) redirect("/admin/products");

  const product = (await res.json()) as any;

  return (
    <AppShell>
      <div className="mx-auto w-full max-w-6xl px-5 py-10 grid gap-6">
        <div className="flex items-end justify-between gap-4">
          <div className="grid gap-2">
            <h1 className="font-[var(--font-ti-display)] text-4xl tracking-tight">Edit product</h1>
            <p className="text-sm text-muted">Update fields and save changes to MongoDB.</p>
          </div>
          <Link href="/admin/products" className="text-sm font-medium hover:underline">
            Back to products
          </Link>
        </div>

        <AdminProductEditClient initial={product} />
      </div>
    </AppShell>
  );
}

