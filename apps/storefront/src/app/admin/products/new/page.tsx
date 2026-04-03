import Link from "next/link";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { AdminProductFormClient } from "@/app/admin/products/new/AdminProductFormClient";

async function apiUrl(pathname: string): Promise<string> {
  const h = await headers();
  const host = h.get("host");
  const proto = h.get("x-forwarded-proto") ?? "http";
  const base = host ? `${proto}://${host}` : "http://localhost:3000";
  return new URL(pathname, base).toString();
}

export default async function AdminProductsNewPage() {
  const jar = await cookies();
  const res = await fetch(await apiUrl("/api/auth/me"), { cache: "no-store", headers: { cookie: jar.toString() } });
  if (!res.ok) redirect("/admin");
  const me = (await res.json()) as { is_admin?: boolean };
  if (!me?.is_admin) redirect("/admin");

  return (
    <AppShell>
      <div className="mx-auto w-full max-w-6xl px-5 py-10 grid gap-6">
        <div className="flex items-end justify-between gap-4">
          <div className="grid gap-2">
            <h1 className="font-[var(--font-ti-display)] text-4xl tracking-tight">Add product</h1>
            <p className="text-sm text-muted">Fill details and save to MongoDB.</p>
          </div>
          <Link href="/admin/products" className="text-sm font-medium hover:underline">
            Back to products
          </Link>
        </div>

        <AdminProductFormClient />
      </div>
    </AppShell>
  );
}
