import type { ReactNode } from "react";

export function SectionHeader({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div className="max-w-2xl">
        <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-violet-300/80">
          {eyebrow}
        </p>
        <h2 className="mt-1.5 font-sans text-xl font-semibold tracking-tight text-white md:text-2xl">
          {title}
        </h2>
        {description ? (
          <p className="mt-2 text-sm leading-relaxed text-white/50">{description}</p>
        ) : null}
      </div>
      {action}
    </div>
  );
}

/** Flat section — no heavy glass */
export function Section({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <section className={className}>{children}</section>;
}

/** Subtle elevated panel for grouped content */
export function Panel({
  children,
  className,
  glow,
}: {
  children: ReactNode;
  className?: string;
  glow?: boolean;
}) {
  return (
    <div
      className={[
        "relative overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.02]",
        glow ? "shadow-[0_0_80px_-40px_rgba(168,85,247,0.25)]" : "",
        className ?? "",
      ].join(" ")}
    >
      {children}
    </div>
  );
}
