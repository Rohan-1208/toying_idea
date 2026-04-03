"use client";

import { useMemo, useState, useTransition } from "react";
import { Card } from "@/components/ui/Card";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

type UploadMeta = { name: string; type: string; size: number };
type PyotResponse = {
  requestId: string;
  status: string;
  message: string;
  received: unknown;
};

export function PyotClient() {
  const [files, setFiles] = useState<FileList | null>(null);
  const [refs, setRefs] = useState<FileList | null>(null);
  const [material, setMaterial] = useState<"PLA" | "PETG" | "Resin">("PLA");
  const [finish, setFinish] = useState<"Matte" | "Satin" | "Gloss">("Matte");
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState("");
  const [pending, startTransition] = useTransition();
  const [result, setResult] = useState<PyotResponse | null>(null);

  const fileMeta = useMemo<UploadMeta[]>(
    () => Array.from(files ?? []).map((f) => ({ name: f.name, type: f.type || "application/octet-stream", size: f.size })),
    [files],
  );
  const refMeta = useMemo<UploadMeta[]>(
    () => Array.from(refs ?? []).map((f) => ({ name: f.name, type: f.type || "application/octet-stream", size: f.size })),
    [refs],
  );

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_360px] items-start">
      <Card className="p-6 grid gap-5">
        <div className="grid gap-2">
          <div className="font-[var(--font-ti-display)] text-xl tracking-tight">
            Upload & quote request
          </div>
          <div className="text-sm text-muted">
            Share your 3D files and preferences to request a quote.
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="grid gap-2 text-sm">
            <span className="font-medium text-ti-cocoa">3D files (STL/OBJ/STEP)</span>
            <input
              type="file"
              multiple
              accept=".stl,.obj,.step,.stp"
              onChange={(e) => setFiles(e.target.files)}
              className="block w-full text-sm"
            />
            <span className="text-xs text-muted">Attach at least 1 file.</span>
          </label>

          <label className="grid gap-2 text-sm">
            <span className="font-medium text-ti-cocoa">Reference images (optional)</span>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={(e) => setRefs(e.target.files)}
              className="block w-full text-sm"
            />
            <span className="text-xs text-muted">Helps with color/finish intent.</span>
          </label>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Select
            label="Material"
            value={material}
            onChange={(e) => setMaterial(e.target.value as typeof material)}
            options={[
              { value: "PLA", label: "PLA" },
              { value: "PETG", label: "PETG" },
              { value: "Resin", label: "Resin" },
            ]}
          />
          <Select
            label="Finish"
            value={finish}
            onChange={(e) => setFinish(e.target.value as typeof finish)}
            options={[
              { value: "Matte", label: "Matte" },
              { value: "Satin", label: "Satin" },
              { value: "Gloss", label: "Gloss" },
            ]}
          />
          <Input
            label="Quantity"
            type="number"
            min={1}
            max={200}
            value={String(quantity)}
            onChange={(e) => setQuantity(Number(e.target.value))}
          />
        </div>

        <Textarea
          label="Notes (optional)"
          placeholder="Tell us what you want: colorway, finish targets, gifting deadline, etc."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />

        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            disabled={pending || fileMeta.length === 0}
            onClick={() => {
              setResult(null);
              startTransition(async () => {
                const res = await fetch("/api/requests/pyot", {
                  method: "POST",
                  headers: { "content-type": "application/json" },
                  body: JSON.stringify({
                    files: fileMeta,
                    referenceImages: refMeta,
                    material,
                    finish,
                    quantity,
                    notes: notes.trim() ? notes.trim() : undefined,
                  }),
                });
                const json = (await res.json()) as PyotResponse;
                setResult(json);
              });
            }}
          >
            {pending ? "Submitting…" : "Request quote"}
          </Button>
          <Button
            variant="ghost"
            onClick={() => {
              setFiles(null);
              setRefs(null);
              setNotes("");
              setQuantity(1);
              setMaterial("PLA");
              setFinish("Matte");
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
        <div className="font-[var(--font-ti-display)] text-xl tracking-tight">
          Preview / status
        </div>
        <div className="text-sm text-muted">
          Files received: <span className="font-medium text-ti-cocoa">{fileMeta.length}</span>
        </div>
        <div className="text-sm text-muted">
          Reference images:{" "}
          <span className="font-medium text-ti-cocoa">{refMeta.length}</span>
        </div>
        <div className="rounded-[var(--radius-lg)] border border-border bg-surface p-4">
          <div className="text-xs text-muted">Next steps</div>
          <ol className="mt-2 grid gap-2 text-sm">
            <li>Printability review</li>
            <li>Quote & lead time</li>
            <li>Approval + production</li>
          </ol>
        </div>
      </Card>
    </div>
  );
}
