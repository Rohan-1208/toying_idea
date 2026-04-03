import { forwardRef } from "react";

type Props = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  hint?: string;
};

export const Input = forwardRef<HTMLInputElement, Props>(function Input(
  { label, hint, className, ...props },
  ref,
) {
  return (
    <label className="grid gap-2 text-sm">
      {label ? <span className="font-medium text-ti-cocoa">{label}</span> : null}
      <input
        ref={ref}
        className={[
          "h-12 rounded-[var(--radius-md)] border border-border bg-ti-cream px-4",
          "text-ti-cocoa placeholder:text-muted/80",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ti-sky/70 focus-visible:ring-offset-2 focus-visible:ring-offset-ti-cream",
          className,
        ]
          .filter(Boolean)
          .join(" ")}
        {...props}
      />
      {hint ? <span className="text-xs text-muted">{hint}</span> : null}
    </label>
  );
});

