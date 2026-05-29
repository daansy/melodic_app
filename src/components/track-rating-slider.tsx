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

function clampScore(n: number): number {
  return Math.min(10, Math.max(0, Math.round(n * 10) / 10));
}

export function TrackRatingSlider({
  itemId,
  itemName,
  itemArtist,
  itemImageUrl,
  initialScore,
}: Props) {
  const [draft, setDraft] = useState<number>(initialScore ?? 0);
  const [text, setText] = useState<string>(
    initialScore !== null ? initialScore.toFixed(1) : ""
  );
  const [rated, setRated] = useState<boolean>(initialScore !== null);
  const [isPending, startTransition] = useTransition();

  const showColor = rated || text !== "";

  function commit(value: number) {
    const finalScore = clampScore(value);
    setDraft(finalScore);
    setText(finalScore.toFixed(1));
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

  function onSlider(value: number) {
    setDraft(value);
    setText(value.toFixed(1));
  }

  function onText(value: string) {
    setText(value);
    const parsed = Number(value);
    if (value !== "" && !Number.isNaN(parsed)) setDraft(clampScore(parsed));
  }

  function commitFromText() {
    if (text === "") {
      if (rated) setText(draft.toFixed(1)); // herstel naar opgeslagen score
      return;
    }
    const parsed = Number(text);
    if (Number.isNaN(parsed)) {
      setText(rated ? draft.toFixed(1) : "");
      return;
    }
    commit(parsed);
  }

  return (
    <div className="flex shrink-0 items-center gap-2">
      <input
        type="text"
        inputMode="decimal"
        value={text}
        placeholder="–"
        aria-label={`Score for ${itemName}`}
        onChange={(e) => onText(e.target.value)}
        onBlur={commitFromText}
        onKeyDown={(e) => {
          if (e.key === "Enter") (e.target as HTMLInputElement).blur();
        }}
        className="w-10 rounded-md bg-transparent px-1 py-0.5 text-right text-xs font-semibold tabular-nums outline-none placeholder:text-white/30 focus:bg-white/[0.06]"
        style={{ color: showColor ? scoreColor(draft) : undefined }}
      />
      <div className="w-14 transition-[width] duration-200 ease-out group-hover:w-36 focus-within:w-36">
        <input
          type="range"
          min={0}
          max={10}
          step={0.1}
          value={draft}
          disabled={isPending}
          aria-label={`Rate ${itemName}`}
          onChange={(e) => onSlider(Number(e.target.value))}
          onPointerUp={(e) => commit(Number((e.target as HTMLInputElement).value))}
          onKeyUp={(e) => commit(Number((e.target as HTMLInputElement).value))}
          className={SLIDER_CLASSES}
          style={{ background: SCORE_TRACK_GRADIENT }}
        />
      </div>
    </div>
  );
}
