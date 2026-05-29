// Score 0–10 naar een kleur: 0 = rood, 5 = geel, 10 = groen.
export function scoreColor(score: number): string {
  const clamped = Math.min(10, Math.max(0, score));
  const hue = (clamped / 10) * 120; // 0 = rood, 60 = geel, 120 = groen
  return `hsl(${hue.toFixed(0)} 70% 50%)`;
}

// Gradient voor de slider-balk (links rood, rechts groen).
export const SCORE_TRACK_GRADIENT =
  "linear-gradient(to right, hsl(0 70% 48%), hsl(40 80% 50%), hsl(75 70% 45%), hsl(120 60% 42%))";
