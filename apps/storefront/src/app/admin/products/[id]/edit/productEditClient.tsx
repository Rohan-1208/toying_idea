"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";

type ImageInput = { id: string; url: string; alt: string };
type VariantInput = {
  id: string;
  label: string;
  material: string;
  finish: string;
  size: string;
  inStock: boolean;
  currency: string;
  amount: number;
};

function uid(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

function joinCsv(values: unknown): string {
  if (!Array.isArray(values)) return "";
  return values.map((v) => String(v)).join(", ");
}

function toBool(v: unknown): boolean {
  if (typeof v === "boolean") return v;
  if (typeof v === "string") return v === "true";
  return Boolean(v);
}

function toNumber(v: unknown): number {
  if (typeof v === "number") return v;
  if (typeof v === "string") {
    const n = Number(v);
    return Number.isFinite(n) ? n : 0;
  }
  return 0;
}

export function AdminProductEditClient({ initial }: { initial: any }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [uploading, setUploading] = useState<Record<string, boolean>>({});

  const productId = String(initial?.id ?? "");

  const [slug, setSlug] = useState(String(initial?.slug ?? ""));
  const [name, setName] = useState(String(initial?.name ?? ""));
  const [tagline, setTagline] = useState(String(initial?.tagline ?? ""));
  const [description, setDescription] = useState(String(initial?.description ?? ""));
  const [categoriesText, setCategoriesText] = useState(joinCsv(initial?.categories));
  const [badgesText, setBadgesText] = useState(joinCsv(initial?.badges));
  const [featuredRank, setFeaturedRank] = useState(
    initial?.featuredRank === null || initial?.featuredRank === undefined ? "" : String(initial?.featuredRank ?? ""),
  );
  const [active, setActive] = useState(toBool(initial?.active ?? true));

  const [images, setImages] = useState<ImageInput[]>(() => {
    const imgs = Array.isArray(initial?.images) ? (initial.images as any[]) : [];
    const mapped = imgs
      .map((i) => ({ id: String(i.id ?? uid("img")), url: String(i.url ?? ""), alt: String(i.alt ?? "") }))
      .filter((i) => i.url || i.alt);
    if (mapped.length > 0) return mapped;
    return [{ id: uid("img"), url: "", alt: "" }];
  });

  const [variants, setVariants] = useState<VariantInput[]>(() => {
    const vars = Array.isArray(initial?.variants) ? (initial.variants as any[]) : [];
    const mapped = vars.map((v) => ({
      id: String(v.id ?? uid("v")),
      label: String(v.label ?? ""),
      material: String(v.material ?? "PLA"),
      finish: String(v.finish ?? "Matte"),
      size: String(v.size ?? "Small"),
      inStock: toBool(v.inStock ?? v.in_stock ?? true),
      currency: String(v.price?.currency ?? "INR"),
      amount: toNumber(v.price?.amount ?? 0),
    }));
    if (mapped.length > 0) return mapped;
    return [
      {
        id: uid("v"),
        label: "PLA / Matte / Small",
        material: "PLA",
        finish: "Matte",
        size: "Small",
        inStock: true,
        currency: "INR",
        amount: 0,
      },
    ];
  });

  const categories = useMemo(
    () =>
      categoriesText
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
    [categoriesText],
  );

  const badges = useMemo(
    () =>
      badgesText
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
    [badgesText],
  );

  const canSubmit = useMemo(() => {
    if (!productId) return false;
    if (!slug.trim() || !name.trim()) return false;
    if (variants.length === 0) return false;
    return true;
  }, [name, productId, slug, variants.length]);

  async function uploadImage(imageId: string, file: File) {
    setUploading((prev) => ({ ...prev, [imageId]: true }));
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/admin/uploads/image", { method: "POST", body: form });
      if (!res.ok) {
        const text = await res.text().catch(() => "");
        alert(text || "Upload failed");
        return;
      }
      const json = (await res.json()) as { url: string };
      setImages((prev) =>
        prev.map((p) => (p.id === imageId ? { ...p, url: json.url ?? p.url, alt: p.alt || file.name } : p)),
      );
    } finally {
      setUploading((prev) => ({ ...prev, [imageId]: false }));
    }
  }

  return (
    <form
      className="grid gap-6"
      onSubmit={(e) => {
        e.preventDefault();
        startTransition(async () => {
          const payload = {
            slug: slug.trim(),
            name: name.trim(),
            tagline: tagline.trim(),
            description: description.trim(),
            badges,
            categories,
            featuredRank: featuredRank.trim() ? Number(featuredRank) : null,
            active,
            images: images
              .map((i) => ({ id: i.id, url: i.url.trim(), alt: i.alt.trim() }))
              .filter((i) => Boolean(i.url)),
            variants: variants.map((v) => ({
              id: v.id,
              label: v.label,
              material: v.material,
              finish: v.finish,
              size: v.size,
              inStock: v.inStock,
              price: { currency: v.currency, amount: Number(v.amount) },
            })),
          };

          const res = await fetch(`/api/admin/products/${encodeURIComponent(productId)}`, {
            method: "PUT",
            headers: { "content-type": "application/json" },
            body: JSON.stringify(payload),
          });

          if (res.status === 401 || res.status === 403) {
            window.location.href = "/admin";
            return;
          }

          if (!res.ok) {
            const text = await res.text().catch(() => "");
            alert(text || "Failed to update product");
            return;
          }

          router.replace("/admin/products");
          router.refresh();
        });
      }}
    >
      <Card className="p-6 grid gap-4">
        <div className="grid gap-4 md:grid-cols-2">
          <Input label="Slug" value={slug} onChange={(e) => setSlug(e.target.value)} required />
          <Input label="Name" value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        <Input label="Tagline" value={tagline} onChange={(e) => setTagline(e.target.value)} />
        <Textarea label="Description" value={description} onChange={(e) => setDescription(e.target.value)} rows={6} />
        <div className="grid gap-4 md:grid-cols-2">
          <Input
            label="Categories (comma separated)"
            value={categoriesText}
            onChange={(e) => setCategoriesText(e.target.value)}
          />
          <Input
            label="Badges (comma separated)"
            value={badgesText}
            onChange={(e) => setBadgesText(e.target.value)}
          />
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <Input
            label="Featured rank (number, lower = more featured)"
            value={featuredRank}
            onChange={(e) => setFeaturedRank(e.target.value)}
            inputMode="numeric"
          />
          <label className="grid gap-2 text-sm">
            <span className="font-medium text-ti-cocoa">Active</span>
            <select
              className="h-12 rounded-[var(--radius-md)] border border-border bg-ti-cream px-4 text-sm"
              value={active ? "true" : "false"}
              onChange={(e) => setActive(e.target.value === "true")}
            >
              <option value="true">Active</option>
              <option value="false">Hidden</option>
            </select>
          </label>
        </div>
      </Card>

      <Card className="p-6 grid gap-4">
        <div className="flex items-center justify-between gap-4">
          <div className="font-[var(--font-ti-display)] text-xl tracking-tight">Images</div>
          <Button type="button" variant="ghost" onClick={() => setImages((prev) => [...prev, { id: uid("img"), url: "", alt: "" }])}>
            Add image
          </Button>
        </div>

        <div className="grid gap-4">
          {images.map((img, idx) => (
            <div key={img.id} className="grid gap-4 md:grid-cols-[1fr_1fr_auto] items-end">
              <Input
                label={idx === 0 ? "Image URL" : undefined}
                value={img.url}
                onChange={(e) => setImages((prev) => prev.map((p) => (p.id === img.id ? { ...p, url: e.target.value } : p)))}
              />
              <Input
                label={idx === 0 ? "Alt text" : undefined}
                value={img.alt}
                onChange={(e) => setImages((prev) => prev.map((p) => (p.id === img.id ? { ...p, alt: e.target.value } : p)))}
              />
              <Button type="button" variant="ghost" onClick={() => setImages((prev) => prev.filter((p) => p.id !== img.id))} disabled={images.length <= 1}>
                Remove
              </Button>
              <div className="md:col-span-3 flex flex-col md:flex-row md:items-center gap-3">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) void uploadImage(img.id, f);
                    e.currentTarget.value = "";
                  }}
                  disabled={Boolean(uploading[img.id])}
                />
                {uploading[img.id] ? <div className="text-sm text-muted">Uploading…</div> : null}
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-6 grid gap-4">
        <div className="flex items-center justify-between gap-4">
          <div className="font-[var(--font-ti-display)] text-xl tracking-tight">Variants</div>
          <Button
            type="button"
            variant="ghost"
            onClick={() =>
              setVariants((prev) => [
                ...prev,
                {
                  id: uid("v"),
                  label: "",
                  material: "PLA",
                  finish: "Matte",
                  size: "Small",
                  inStock: true,
                  currency: "INR",
                  amount: 0,
                },
              ])
            }
          >
            Add variant
          </Button>
        </div>

        <div className="grid gap-6">
          {variants.map((v, idx) => (
            <div key={v.id} className="rounded-[var(--radius-lg)] border border-border bg-surface p-4 grid gap-4">
              <div className="flex items-center justify-between gap-4">
                <div className="font-medium">Variant {idx + 1}</div>
                <Button type="button" variant="ghost" onClick={() => setVariants((prev) => prev.filter((p) => p.id !== v.id))} disabled={variants.length <= 1}>
                  Remove
                </Button>
              </div>

              <Input label="Label" value={v.label} onChange={(e) => setVariants((prev) => prev.map((p) => (p.id === v.id ? { ...p, label: e.target.value } : p)))} />

              <div className="grid gap-4 md:grid-cols-3">
                <Input label="Material" value={v.material} onChange={(e) => setVariants((prev) => prev.map((p) => (p.id === v.id ? { ...p, material: e.target.value } : p)))} />
                <Input label="Finish" value={v.finish} onChange={(e) => setVariants((prev) => prev.map((p) => (p.id === v.id ? { ...p, finish: e.target.value } : p)))} />
                <Input label="Size" value={v.size} onChange={(e) => setVariants((prev) => prev.map((p) => (p.id === v.id ? { ...p, size: e.target.value } : p)))} />
              </div>

              <div className="grid gap-4 md:grid-cols-3 items-end">
                <label className="grid gap-2 text-sm">
                  <span className="font-medium text-ti-cocoa">In stock</span>
                  <select
                    className="h-12 rounded-[var(--radius-md)] border border-border bg-ti-cream px-4 text-sm"
                    value={v.inStock ? "true" : "false"}
                    onChange={(e) => setVariants((prev) => prev.map((p) => (p.id === v.id ? { ...p, inStock: e.target.value === "true" } : p)))}
                  >
                    <option value="true">In stock</option>
                    <option value="false">Out of stock</option>
                  </select>
                </label>
                <Input label="Currency" value={v.currency} onChange={(e) => setVariants((prev) => prev.map((p) => (p.id === v.id ? { ...p, currency: e.target.value } : p)))} />
                <Input label="Amount" value={String(v.amount)} onChange={(e) => setVariants((prev) => prev.map((p) => (p.id === v.id ? { ...p, amount: Number(e.target.value) || 0 } : p)))} inputMode="decimal" />
              </div>
            </div>
          ))}
        </div>
      </Card>

      <div className="flex justify-end">
        <Button variant="primary" type="submit" disabled={!canSubmit || pending}>
          {pending ? "Saving…" : "Save changes"}
        </Button>
      </div>
    </form>
  );
}

