import { forwardRef } from "react";

type Option = { value: string; label: string };

type Props = React.SelectHTMLAttributes<HTMLSelectElement> & {
  label?: string;
  hint?: string;
  options: Option[];
};

export const Select = forwardRef<HTMLSelectElement, Props>(function Select(
  { label, hint, className, options, ...props },
  ref,
) {
  return (
    <label className="grid gap-2 text-sm">
      {label ? <span className="font-medium text-ti-cocoa">{label}</span> : null}
      <select
        ref={ref}
        className={[
          "h-12 rounded-[var(--radius-md)] border border-border bg-ti-cream px-4",
          "text-ti-cocoa",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ti-sky/70 focus-visible:ring-offset-2 focus-visible:ring-offset-ti-cream",
          className,
        ]
          .filter(Boolean)
          .join(" ")}
        {...props}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      {hint ? <span className="text-xs text-muted">{hint}</span> : null}
    </label>
  );
});

