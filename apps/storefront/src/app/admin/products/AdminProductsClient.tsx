"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";

type AdminProductRow = { id: string; slug: string; name: string };

export function AdminProductsClient({ initial }: { initial: AdminProductRow[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [products, setProducts] = useState<AdminProductRow[]>(initial);

  const sorted = useMemo(() => {
    return [...products].sort((a, b) => a.name.localeCompare(b.name));
  }, [products]);

  return (
    <div className="grid gap-2">
      {sorted.map((p) => (
        <div key={p.id} className="flex items-center justify-between gap-4">
          <div className="grid">
            <div className="font-medium">{p.name}</div>
            <div className="text-xs text-muted">{p.slug}</div>
          </div>
          <Button
            type="button"
            variant="ghost"
            disabled={pending}
            onClick={() => {
              const ok = window.confirm(`Delete "${p.name}"?`);
              if (!ok) return;
              startTransition(async () => {
                const res = await fetch(`/api/admin/products/${encodeURIComponent(p.id)}`, {
                  method: "DELETE",
                });
                if (res.status === 401 || res.status === 403) {
                  window.location.href = "/admin";
                  return;
                }
                if (!res.ok) {
                  const text = await res.text().catch(() => "");
                  alert(text || "Failed to delete product");
                  return;
                }
                setProducts((prev) => prev.filter((x) => x.id !== p.id));
                router.refresh();
              });
            }}
          >
            Delete
          </Button>
        </div>
      ))}
    </div>
  );
}

