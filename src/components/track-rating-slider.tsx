"use client";

import { useState, useTransition } from "react";
import { rateItem } from "@/app/actions/ratings";
import { scoreColor, SCORE_TRACK_GRADIENT } from "@/lib/score-color";

type Props = {
  itemId: string;
  itemName: string;
  itemArtist: string;
  itemImageUrl: string | null;
  initialScore: number | null;
};

const SLIDER_CLASSES =
  "h-1.5 w-full cursor-pointer appearance-none rounded-full " +
  "[&::-webkit-slider-runnable-track]:h-1.5 [&::-webkit-slider-runnable-track]:rounded-full [&::-webkit-slider-runnable-track]:bg-transparent " +
  "[&::-moz-range-track]:h-1.5 [&::-moz-range-track]:rounded-full [&::-moz-range-track]:bg-transparent " +
  "[&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border [&::-webkit-slider-thumb]:border-black/30 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:[margin-top:-4px] " +
  "[&::-moz-range-thumb]:h-3.5 [&::-moz-range-thumb]:w-3.5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:bg-white";

export function TrackRatingSlider({
  itemId,
  itemName,
  itemArtist,
  itemImageUrl,
  initialScore,
}: Props) {
  const [draft, setDraft] = useState<number>(initialScore ?? 0);
  const [rated, setRated] = useState<boolean>(initialScore !== null);
  const [dirty, setDirty] = useState(false);
  const [isPending, startTransition] = useTransition();

  const showValue = rated || dirty;

  function commit(raw: number) {
    const finalScore = Math.min(10, Math.max(0, Math.round(raw * 10) / 10));
    setDraft(finalScore);
    startTransition(async () => {
      const res = await rateItem({
        itemType: "track",
        itemId,
        score: finalScore,
        itemName,
        itemArtist,
        itemImageUrl,
      });
      if (res.ok && typeof res.score === "number") setRated(true);
    });
  }

  return (
    <div className="flex shrink-0 items-center gap-2">
      <span
        className="w-7 text-right text-xs font-semibold tabular-nums"
        style={{ color: showValue ? scoreColor(draft) : "rgba(255,255,255,0.3)" }}
      >
        {showValue ? draft.toFixed(1) : "–"}
      </span>
      <div className="w-14 transition-[width] duration-200 ease-out group-hover:w-36 focus-within:w-36">
        <input
          type="range"
          min={0}
          max={10}
          step={0.5}
          value={draft}
          disabled={isPending}
          aria-label={`Rate ${itemName}`}
          onChange={(e) => {
            setDirty(true);
            setDraft(Number(e.target.value));
          }}
          onPointerUp={(e) => commit(Number((e.target as HTMLInputElement).value))}
          onKeyUp={(e) => commit(Number((e.target as HTMLInputElement).value))}
          className={SLIDER_CLASSES}
          style={{ background: SCORE_TRACK_GRADIENT }}
        />
      </div>
    </div>
  );
}
