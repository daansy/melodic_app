/** Clamp and round for display on Melodic's 1–10 scale */
export function clampScore(score: number): number {
  return Math.max(1, Math.min(10, score));
}

export function formatScore(score: number, decimals = 1): string {
  const s = clampScore(score);
  return decimals === 0 ? String(Math.round(s)) : s.toFixed(decimals);
}

export type ScoreTier = "exceptional" | "great" | "good" | "fair" | "low";

export function scoreTier(score: number): ScoreTier {
  const s = clampScore(score);
  if (s >= 9) return "exceptional";
  if (s >= 7.5) return "great";
  if (s >= 6) return "good";
  if (s >= 4) return "fair";
  return "low";
}

const tierStyles: Record<
  ScoreTier,
  { badge: string; text: string; ring: string }
> = {
  exceptional: {
    badge: "bg-violet-500/20 text-violet-100 ring-violet-400/30",
    text: "text-violet-200",
    ring: "ring-violet-400/25",
  },
  great: {
    badge: "bg-fuchsia-500/15 text-fuchsia-100 ring-fuchsia-400/25",
    text: "text-fuchsia-200",
    ring: "ring-fuchsia-400/20",
  },
  good: {
    badge: "bg-white/10 text-white/90 ring-white/15",
    text: "text-white/85",
    ring: "ring-white/10",
  },
  fair: {
    badge: "bg-amber-500/10 text-amber-100/90 ring-amber-400/20",
    text: "text-amber-100/80",
    ring: "ring-amber-400/15",
  },
  low: {
    badge: "bg-white/5 text-white/60 ring-white/10",
    text: "text-white/55",
    ring: "ring-white/10",
  },
};

export function scoreStyles(score: number) {
  return tierStyles[scoreTier(score)];
}
