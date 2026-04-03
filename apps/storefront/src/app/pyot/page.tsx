import { AppShell } from "@/components/AppShell";
import { PyotClient } from "@/app/pyot/pyotClient";

export default function PyotPage() {
  return (
    <AppShell>
      <div className="mx-auto w-full max-w-6xl px-5 py-10 grid gap-6">
        <div className="grid gap-2">
          <h1 className="font-[var(--font-ti-display)] text-4xl tracking-tight">PYOT</h1>
          <p className="text-sm text-muted">
            Print Your Own Toy — upload STL/OBJ/STEP, pick material/finish, and request a quote.
          </p>
        </div>
        <PyotClient />
      </div>
    </AppShell>
  );
}

