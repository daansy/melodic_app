import { formatScore, scoreStyles } from "@/lib/rating";

type Size = "sm" | "md" | "lg" | "xl";

const sizeClasses: Record<Size, { box: string; score: string; suffix: string }> = {
  sm: { box: "min-w-[2.25rem] px-2 py-0.5", score: "text-sm font-semibold tabular-nums", suffix: "text-[9px]" },
  md: { box: "min-w-[2.75rem] px-2.5 py-1", score: "text-base font-semibold tabular-nums", suffix: "text-[10px]" },
  lg: { box: "min-w-[3.25rem] px-3 py-1.5", score: "text-xl font-semibold tabular-nums tracking-tight", suffix: "text-[10px]" },
  xl: { box: "min-w-[4rem] px-3.5 py-2", score: "text-3xl font-semibold tabular-nums tracking-tight", suffix: "text-xs" },
};

export function RatingBadge({
  score,
  size = "md",
  showScale = true,
  className,
}: {
  score: number;
  size?: Size;
  showScale?: boolean;
  className?: string;
}) {
  const styles = scoreStyles(score);
  const s = sizeClasses[size];

  return (
    <div
      className={[
        "inline-flex flex-col items-center justify-center rounded-xl ring-1",
        styles.badge,
        styles.ring,
        s.box,
        className ?? "",
      ].join(" ")}
      aria-label={`Rating ${formatScore(score)} out of 10`}
    >
      <span className={s.score}>{formatScore(score, size === "xl" ? 0 : 1)}</span>
      {showScale ? (
        <span className={["font-medium uppercase tracking-wider opacity-60", s.suffix].join(" ")}>
          /10
        </span>
      ) : null}
    </div>
  );
}
