import { AppShell } from "@/components/AppShell";
import { GiftingClient } from "@/app/customized-gifting/giftingClient";

export default function CustomizedGiftingPage() {
  return (
    <AppShell>
      <div className="mx-auto w-full max-w-6xl px-5 py-10 grid gap-6">
        <div className="grid gap-2">
          <h1 className="font-[var(--font-ti-display)] text-4xl tracking-tight">
            Customized Gifting
          </h1>
          <p className="text-sm text-muted">
            Occasion-ready gifting, premium messaging, and B2B-scale inquiries—fully connected to backend request intake.
          </p>
        </div>
        <GiftingClient />
      </div>
    </AppShell>
  );
}

