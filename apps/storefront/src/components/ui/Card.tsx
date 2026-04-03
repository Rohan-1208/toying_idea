type Props = {
  className?: string;
  children: React.ReactNode;
};

function cx(...parts: Array<string | undefined | false>) {
  return parts.filter(Boolean).join(" ");
}

export function Card({ className, children }: Props) {
  return (
    <div
      className={cx(
        "rounded-[var(--radius-lg)] border border-border bg-surface ti-ring",
        className,
      )}
    >
      {children}
    </div>
  );
}

