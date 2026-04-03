type Props = {
  tone?: "gold" | "sky" | "cocoa" | "cream";
  children: React.ReactNode;
  className?: string;
};

function cx(...parts: Array<string | undefined | false>) {
  return parts.filter(Boolean).join(" ");
}

export function Badge({ tone = "cream", children, className }: Props) {
  const toneClass =
    tone === "gold"
      ? "bg-ti-gold text-ti-cocoa"
      : tone === "sky"
        ? "bg-ti-sky text-ti-cocoa"
        : tone === "cocoa"
          ? "bg-ti-cocoa text-ti-cream"
          : "bg-surface-2 text-ti-cocoa";

  return (
    <span
      className={cx(
        "inline-flex items-center rounded-full px-3 py-1 text-xs font-medium",
        toneClass,
        className,
      )}
    >
      {children}
    </span>
  );
}

