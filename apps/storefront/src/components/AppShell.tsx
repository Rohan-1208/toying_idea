import Link from "next/link";
import Image from "next/image";
import { CartPill } from "@/components/CartPill";

const nav = [
  { href: "/shop", label: "Shop" },
  { href: "/pyot", label: "PYOT" },
  { href: "/customized-gifting", label: "Customized Gifting" },
  { href: "/track-order", label: "Track Order" },
  { href: "/orders", label: "Orders" },
] as const;

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-full flex flex-col">
      <header className="sticky top-0 z-50 border-b border-border bg-ti-cream/80 backdrop-blur">
        <div className="mx-auto w-full max-w-6xl px-5">
          <div className="h-16 flex items-center justify-between gap-4">
            <Link href="/" className="group flex items-center gap-3">
              <div className="h-10 w-10 rounded-2xl bg-ti-cocoa grid place-items-center overflow-hidden ti-ring">
                <Image
                  src="/brand/logo.png"
                  alt="TOYING IDEA logo"
                  width={40}
                  height={40}
                  unoptimized
                  className="h-10 w-10 object-contain p-1"
                />
              </div>
              <div className="leading-tight">
                <div className="font-[var(--font-ti-display)] tracking-tight text-ti-cocoa">
                  TOYING IDEA
                </div>
                <div className="text-xs text-muted">Toys for new Generation</div>
              </div>
            </Link>

            <nav className="hidden md:flex items-center gap-1">
              {nav.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="rounded-full px-4 py-2 text-sm text-ti-cocoa/90 hover:bg-surface-2 transition"
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            <div className="flex items-center gap-2">
              <CartPill />
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="border-t border-border bg-ti-cream">
        <div className="mx-auto w-full max-w-6xl px-5 py-10 grid gap-6 md:grid-cols-3">
          <div className="grid gap-2">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-2xl bg-ti-cocoa overflow-hidden ti-ring">
                <Image
                  src="/brand/logo.png"
                  alt="TOYING IDEA logo"
                  width={36}
                  height={36}
                  unoptimized
                  className="h-9 w-9 object-contain p-1"
                />
              </div>
              <div className="font-[var(--font-ti-display)] tracking-tight">TOYING IDEA</div>
            </div>
            <p className="text-sm text-muted">
              Premium 3D printed toys—collectible-first, customization-ready.
            </p>
          </div>
          <div className="grid gap-2 text-sm">
            <div className="font-medium">Explore</div>
            <div className="grid gap-1 text-muted">
              <Link href="/shop" className="hover:text-ti-cocoa">
                Shop
              </Link>
              <Link href="/pyot" className="hover:text-ti-cocoa">
                Print Your Own Toy
              </Link>
              <Link href="/customized-gifting" className="hover:text-ti-cocoa">
                Customized Gifting
              </Link>
            </div>
          </div>
          <div className="grid gap-2 text-sm">
            <div className="font-medium">Operational</div>
            <div className="grid gap-1 text-muted">
              <Link href="/track-order" className="hover:text-ti-cocoa">
                Track Order
              </Link>
            </div>
          </div>
          <div className="md:col-span-3 text-xs text-muted">
            © {new Date().getFullYear()} TOYING IDEA.
          </div>
        </div>
      </footer>
    </div>
  );
}
