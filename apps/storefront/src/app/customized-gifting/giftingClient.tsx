"use client";

import { useState, useTransition } from "react";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";

type GiftingResponse = {
  requestId: string;
  status: string;
  message: string;
  received: unknown;
};

export function GiftingClient() {
  const [pending, startTransition] = useTransition();
  const [result, setResult] = useState<GiftingResponse | null>(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [occasion, setOccasion] = useState<
    "Birthday" | "Anniversary" | "Baby shower" | "Corporate" | "Holiday" | "Other"
  >("Birthday");
  const [quantityRange, setQuantityRange] = useState<"1-10" | "10-50" | "50-200" | "200+">(
    "1-10",
  );
  const [message, setMessage] = useState("");
  const [brandingNotes, setBrandingNotes] = useState("");

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_360px] items-start">
      <Card className="p-6 grid gap-5">
        <div className="grid gap-2">
          <div className="font-[var(--font-ti-display)] text-xl tracking-tight">Inquiry form</div>
          <div className="text-sm text-muted">
            For premium gifting and corporate runs.
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Input label="Name" placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} />
          <Input
            label="Email"
            placeholder="you@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Select
            label="Occasion"
            value={occasion}
            onChange={(e) => setOccasion(e.target.value as typeof occasion)}
            options={[
              { value: "Birthday", label: "Birthday" },
              { value: "Anniversary", label: "Anniversary" },
              { value: "Baby shower", label: "Baby shower" },
              { value: "Corporate", label: "Corporate" },
              { value: "Holiday", label: "Holiday" },
              { value: "Other", label: "Other" },
            ]}
          />
          <Select
            label="Quantity range"
            value={quantityRange}
            onChange={(e) => setQuantityRange(e.target.value as typeof quantityRange)}
            options={[
              { value: "1-10", label: "1–10" },
              { value: "10-50", label: "10–50" },
              { value: "50-200", label: "50–200" },
              { value: "200+", label: "200+" },
            ]}
          />
        </div>

        <Textarea
          label="Gift message"
          placeholder="A short premium note to include with the gift."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <Textarea
          label="Branding notes (optional)"
          placeholder="Logo colors, packaging notes, deadline, shipping regions..."
          value={brandingNotes}
          onChange={(e) => setBrandingNotes(e.target.value)}
        />

        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            disabled={pending || !name.trim() || !email.trim() || !message.trim()}
            onClick={() => {
              setResult(null);
              startTransition(async () => {
                const res = await fetch("/api/requests/gifting", {
                  method: "POST",
                  headers: { "content-type": "application/json" },
                  body: JSON.stringify({
                    name: name.trim(),
                    email: email.trim(),
                    occasion,
                    quantityRange,
                    message: message.trim(),
                    brandingNotes: brandingNotes.trim() ? brandingNotes.trim() : undefined,
                  }),
                });
                setResult((await res.json()) as GiftingResponse);
              });
            }}
          >
            {pending ? "Submitting…" : "Submit inquiry"}
          </Button>
          <Button
            variant="ghost"
            onClick={() => {
              setName("");
              setEmail("");
              setMessage("");
              setBrandingNotes("");
              setOccasion("Birthday");
              setQuantityRange("1-10");
              setResult(null);
            }}
          >
            Reset
          </Button>
        </div>

        {result ? (
          <div className="rounded-[var(--radius-lg)] border border-border bg-ti-cream p-4">
            <div className="text-sm font-medium">Submission status</div>
            <pre className="mt-2 overflow-auto text-xs text-muted">
{JSON.stringify(result, null, 2)}
            </pre>
          </div>
        ) : null}
      </Card>

      <Card className="p-6 grid gap-4">
        <div className="font-[var(--font-ti-display)] text-xl tracking-tight">Premium paths</div>
        <div className="rounded-[var(--radius-lg)] border border-border bg-surface p-4">
          <div className="text-xs text-muted">Ideal for</div>
          <ul className="mt-2 grid gap-2 text-sm">
            <li>Design-forward gifts</li>
            <li>Client appreciation runs</li>
            <li>Limited holiday drops</li>
          </ul>
        </div>
        <div className="rounded-[var(--radius-lg)] border border-border bg-surface p-4">
          <div className="text-xs text-muted">What we confirm</div>
          <ul className="mt-2 grid gap-2 text-sm">
            <li>Finish + material options</li>
            <li>Lead time + delivery regions</li>
            <li>Packaging and inserts</li>
          </ul>
        </div>
      </Card>
    </div>
  );
}
