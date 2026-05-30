"use client";

import { useState, useTransition } from "react";
import { rateItem, removeRating } from "@/app/actions/ratings";
import { scoreColor, SCORE_TRACK_GRADIENT } from "@/lib/score-color";

type Props = {
  itemId: string;
  itemName: string;
  itemArtist: string;
  itemImageUrl: string | null;
  initialScore: number | null;
};

const MIN_SCORE = 0.1;
const MAX_SCORE = 10;
const STEP = 0.1;
const DEFAULT_DRAFT = 7;

const SLIDER_CLASSES =
  "h-1.5 w-full cursor-pointer appearance-none rounded-full " +
  "[&::-webkit-slider-runnable-track]:h-1.5 [&::-webkit-slider-runnable-track]:rounded-full [&::-webkit-slider-runnable-track]:bg-transparent " +
  "[&::-moz-range-track]:h-1.5 [&::-moz-range-track]:rounded-full [&::-moz-range-track]:bg-transparent " +
  "[&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border [&::-webkit-slider-thumb]:border-black/30 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:[margin-top:-4px] " +
  "[&::-moz-range-thumb]:h-3.5 [&::-moz-range-thumb]:w-3.5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:bg-white";

function clampScore(n: number): number {
  return Math.min(MAX_SCORE, Math.max(MIN_SCORE, Math.round(n * 10) / 10));
}

export function TrackRatingSlider({
  itemId,
  itemName,
  itemArtist,
  itemImageUrl,
  initialScore,
}: Props) {
  const [draft, setDraft] = useState<number>(initialScore ?? DEFAULT_DRAFT);
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

      if (res.ok && typeof res.score === "number") {
        setDraft(res.score);
        setText(res.score.toFixed(1));
        setRated(true);
      }
    });
  }

  function removeTrackRating() {
    startTransition(async () => {
      const res = await removeRating({
        itemType: "track",
        itemId,
      });

      if (res.ok) {
        setDraft(DEFAULT_DRAFT);
        setText("");
        setRated(false);
      }
    });
  }

  function onSlider(value: number) {
    const clamped = clampScore(value);
    setDraft(clamped);
    setText(clamped.toFixed(1));
  }

  function onText(value: string) {
    setText(value);

    if (value === "") {
      return;
    }

    const parsed = Number(value);

    if (!Number.isNaN(parsed)) {
      setDraft(clampScore(parsed));
    }
  }

  function commitFromText() {
    if (text === "") {
      if (rated) {
        setText(draft.toFixed(1));
      }
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
    <div className="grid w-[184px] shrink-0 grid-cols-[2.5rem_minmax(0,1fr)_1.5rem] items-center gap-2">
      <input
        type="text"
        inputMode="decimal"
        value={text}
        placeholder="–"
        aria-label={`Score for ${itemName}`}
        onChange={(e) => onText(e.target.value)}
        onBlur={commitFromText}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            (e.target as HTMLInputElement).blur();
          }
        }}
        className="w-10 rounded-md bg-transparent px-1 py-0.5 text-right text-xs font-semibold tabular-nums outline-none placeholder:text-white/30 focus:bg-white/[0.06]"
        style={{ color: showColor ? scoreColor(draft) : undefined }}
      />

      <input
        type="range"
        min={MIN_SCORE}
        max={MAX_SCORE}
        step={STEP}
        value={draft}
        disabled={isPending}
        aria-label={`Rate ${itemName}`}
        onChange={(e) => onSlider(Number(e.target.value))}
        onPointerUp={(e) =>
          commit(Number((e.target as HTMLInputElement).value))
        }
        onKeyUp={(e) => commit(Number((e.target as HTMLInputElement).value))}
        className={SLIDER_CLASSES}
        style={{ background: SCORE_TRACK_GRADIENT }}
      />

      <div className="flex h-6 w-6 items-center justify-center">
        {rated ? (
          <button
            type="button"
            onClick={removeTrackRating}
            disabled={isPending}
            aria-label={`Remove rating for ${itemName}`}
            title="Remove rating"
            className="flex h-6 w-6 items-center justify-center rounded-full border border-white/10 bg-white/[0.03] text-xs font-medium text-white/35 opacity-0 transition hover:border-red-300/30 hover:text-red-200 disabled:cursor-not-allowed disabled:opacity-40 group-hover:opacity-100 focus:opacity-100"
          >
            ×
          </button>
        ) : null}
      </div>
    </div>
  );
}
