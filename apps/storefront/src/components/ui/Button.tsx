import Link from "next/link";
import { forwardRef } from "react";

type CommonProps = {
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md" | "lg";
  className?: string;
  children: React.ReactNode;
};

const styles = {
  base: "inline-flex items-center justify-center gap-2 rounded-full font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ti-sky/70 focus-visible:ring-offset-2 focus-visible:ring-offset-ti-cream disabled:opacity-50 disabled:pointer-events-none",
  variant: {
    primary:
      "bg-ti-orange text-ti-cream shadow-[0_10px_30px_rgba(36,21,11,0.18)] hover:brightness-[0.98]",
    secondary:
      "bg-ti-cocoa text-ti-cream hover:bg-ti-cocoa/95 shadow-[0_10px_30px_rgba(36,21,11,0.14)]",
    ghost:
      "bg-transparent text-ti-cocoa border border-border hover:bg-surface-2",
  },
  size: {
    sm: "h-10 px-4 text-sm",
    md: "h-12 px-5 text-sm",
    lg: "h-14 px-7 text-base",
  },
} as const;

function cx(...parts: Array<string | undefined | false>) {
  return parts.filter(Boolean).join(" ");
}

export const Button = forwardRef<
  HTMLButtonElement,
  CommonProps & React.ButtonHTMLAttributes<HTMLButtonElement>
>(function Button(
  { variant = "primary", size = "md", className, children, ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      className={cx(styles.base, styles.variant[variant], styles.size[size], className)}
      {...props}
    >
      {children}
    </button>
  );
});

export function ButtonLink(
  props: CommonProps & { href: string; prefetch?: boolean },
) {
  const { variant = "primary", size = "md", className, children, href, prefetch } = props;
  return (
    <Link
      href={href}
      prefetch={prefetch}
      className={cx(styles.base, styles.variant[variant], styles.size[size], className)}
    >
      {children}
    </Link>
  );
}

