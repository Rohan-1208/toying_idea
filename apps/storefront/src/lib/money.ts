import type { Money } from "@/types/catalog";

export function formatMoney(m: Money): string {
  const fmt = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: m.currency,
    maximumFractionDigits: 0,
  });
  return fmt.format(m.amount);
}

