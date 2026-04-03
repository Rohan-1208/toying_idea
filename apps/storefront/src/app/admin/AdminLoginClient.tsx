"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export function AdminLoginClient() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <div className="grid gap-4 max-w-md">
      <div className="grid gap-1">
        <div className="font-[var(--font-ti-display)] text-2xl tracking-tight">Admin login</div>
        <div className="text-sm text-muted">Sign in to manage products and orders.</div>
      </div>

      <form
        className="grid gap-3"
        onSubmit={(e) => {
          e.preventDefault();
          setError(null);
          startTransition(async () => {
            const res = await fetch("/api/auth/login", {
              method: "POST",
              headers: { "content-type": "application/json" },
              body: JSON.stringify({ email, password }),
            });
            if (!res.ok) {
              setError("Invalid credentials.");
              return;
            }
            const json = (await res.json()) as { access_token?: string };
            if (!json.access_token) {
              setError("Login failed.");
              return;
            }
            router.refresh();
            router.replace("/admin");
          });
        }}
      >
        <Input
          label="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          type="email"
          required
        />
        <Input
          label="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          type="password"
          required
        />

        <Button type="submit" variant="primary" disabled={pending || !email || !password}>
          {pending ? "Signing in…" : "Sign in"}
        </Button>

        {error ? <div className="text-sm text-red-700">{error}</div> : null}
      </form>
    </div>
  );
}

