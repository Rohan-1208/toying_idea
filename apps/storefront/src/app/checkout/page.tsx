import { AppShell } from "@/components/AppShell";
import { CheckoutClient } from "@/app/checkout/CheckoutClient";

export default function CheckoutPage() {
  return (
    <AppShell>
      <div className="mx-auto w-full max-w-6xl px-5 py-10 grid gap-6">
        <div className="grid gap-2">
          <h1 className="font-[var(--font-ti-display)] text-4xl tracking-tight">Checkout</h1>
          <p className="text-sm text-muted">Add delivery details and place your order.</p>
        </div>
        <CheckoutClient />
      </div>
    </AppShell>
  );
}

