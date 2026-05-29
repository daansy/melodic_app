import { scoreColor } from "@/lib/score-color";

export function ScoreBadge({
  score,
  className,
}: {
  score: number;
  className?: string;
}) {
  return (
    <span
      className={`pointer-events-none inline-flex items-center justify-center rounded-md px-1.5 py-0.5 text-xs font-bold tabular-nums text-black shadow-md ring-1 ring-black/20 ${
        className ?? ""
      }`}
      style={{ backgroundColor: scoreColor(score) }}
    >
      {score.toFixed(1)}
    </span>
  );
}
