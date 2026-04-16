"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { Card } from "@/components/ui/Card";

type ProductImage = { id: string; url: string; alt: string };

export function ProductGalleryClient({ name, images }: { name: string; images: ProductImage[] }) {
  const safeImages = useMemo(() => {
    const list = images.filter((i) => i?.url);
    if (list.length > 0) return list;
    return [{ id: "fallback", url: "/images/nova-bear-1.svg", alt: name }];
  }, [images, name]);

  const [activeId, setActiveId] = useState<string>(safeImages[0]?.id ?? "fallback");
  const active = safeImages.find((i) => i.id === activeId) ?? safeImages[0]!;

  return (
    <Card className="overflow-hidden">
      <div className="relative aspect-[4/3] bg-ti-cream">
        <Image
          src={active.url}
          alt={active.alt || name}
          fill
          unoptimized
          className="object-cover p-8"
          priority
        />
      </div>

      <div className="p-4 bg-ti-cream/40 border-t border-border">
        <div className="flex gap-3 overflow-x-auto">
          {safeImages.map((img) => {
            const selected = img.id === active.id;
            return (
              <button
                key={img.id}
                type="button"
                onClick={() => setActiveId(img.id)}
                className={[
                  "relative h-24 w-24 shrink-0 rounded-[var(--radius-md)] border bg-ti-cream overflow-hidden",
                  selected ? "border-ti-cocoa" : "border-border hover:border-ti-cocoa/50",
                ].join(" ")}
                aria-pressed={selected}
              >
                <Image
                  src={img.url}
                  alt={img.alt || name}
                  fill
                  unoptimized
                  className="object-cover"
                />
              </button>
            );
          })}
        </div>
      </div>
    </Card>
  );
}

