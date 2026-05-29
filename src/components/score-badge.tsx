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
      className={`pointer-events-none inline-flex items-center justify-center rounded-full border border-white/10 bg-black/60 px-2 py-0.5 text-xs font-bold tabular-nums backdrop-blur-sm ${
        className ?? ""
      }`}
      style={{ color: scoreColor(score) }}
    >
      {score.toFixed(1)}
    </span>
  );
}
