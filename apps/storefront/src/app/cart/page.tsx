import { AppShell } from "@/components/AppShell";
import { CartClient } from "@/app/cart/cartClient";

export default function CartPage() {
  return (
    <AppShell>
      <div className="mx-auto w-full max-w-6xl px-5 py-10 grid gap-6">
        <div className="grid gap-2">
          <h1 className="font-[var(--font-ti-display)] text-4xl tracking-tight">Cart</h1>
          <p className="text-sm text-muted">
            Backend-driven cart items, live quantity changes, and checkout-ready summary.
          </p>
        </div>
        <CartClient />
      </div>
    </AppShell>
  );
}

