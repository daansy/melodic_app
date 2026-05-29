"use client";

import { useState, useTransition } from "react";
import { rateItem, removeRating } from "@/app/actions/ratings";
import { scoreColor, SCORE_TRACK_GRADIENT } from "@/lib/score-color";

const MIN = 0.1;
const MAX = 10;
const STEP = 0.1;
const DEFAULT_DRAFT = 7;
const MAX_REVIEW_LENGTH = 500;

const POPOVER_SLIDER_CLASSES =
  "mt-3 h-2 w-full cursor-pointer appearance-none rounded-full " +
  "[&::-webkit-slider-runnable-track]:h-2 [&::-webkit-slider-runnable-track]:rounded-full [&::-webkit-slider-runnable-track]:bg-transparent " +
  "[&::-moz-range-track]:h-2 [&::-moz-range-track]:rounded-full [&::-moz-range-track]:bg-transparent " +
  "[&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border [&::-webkit-slider-thumb]:border-black/30 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:[margin-top:-4px] " +
  "[&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:bg-white";

type Props = {
  itemType: "album" | "track";
  itemId: string;
  itemName: string;
  itemArtist: string;
  itemImageUrl: string | null;
  initialScore: number | null;
  initialReviewText?: string | null;
  variant?: "compact" | "prominent";
  label?: string;
};

function clampScore(n: number): number {
  return Math.min(MAX, Math.max(MIN, Math.round(n * 10) / 10));
}

export function RatingControl({
  itemType,
  itemId,
  itemName,
  itemArtist,
  itemImageUrl,
  initialScore,
  initialReviewText = null,
  variant = "compact",
  label,
}: Props) {
  const [score, setScore] = useState<number | null>(initialScore);
  const [draft, setDraft] = useState<number>(initialScore ?? DEFAULT_DRAFT);
  const [text, setText] = useState<string>(
    (initialScore ?? DEFAULT_DRAFT).toFixed(1)
  );
  const [reviewText, setReviewText] = useState(initialReviewText ?? "");
  const [savedReviewText, setSavedReviewText] = useState(initialReviewText ?? "");
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const hasScore = score !== null;
  const buttonLabel = label ?? `Rate ${itemType}`;
  const canReview = itemType === "album";

  function openPopover() {
    const start = score ?? DEFAULT_DRAFT;

    setDraft(start);
    setText(start.toFixed(1));
    setReviewText(savedReviewText);
    setError(null);
    setOpen(true);
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

  function save() {
    if (text.trim() === "") {
      setError("Fill in a score between 0.1 and 10.");
      return;
    }

    const parsed = Number(text);

    if (Number.isNaN(parsed)) {
      setError("Fill in a score between 0.1 and 10.");
      return;
    }

    const finalScore = clampScore(parsed);
    const cleanReviewText = canReview ? reviewText.trim().slice(0, MAX_REVIEW_LENGTH) : "";

    setError(null);

    startTransition(async () => {
      const res = await rateItem({
        itemType,
        itemId,
        score: finalScore,
        itemName,
        itemArtist,
        itemImageUrl,
        reviewText: canReview ? cleanReviewText : null,
      });

      if (res.ok && typeof res.score === "number") {
        setScore(res.score);
        setDraft(res.score);
        setText(res.score.toFixed(1));
        setSavedReviewText(res.reviewText ?? "");
        setReviewText(res.reviewText ?? "");
        setOpen(false);
      } else {
        setError(res.error ?? "Something went wrong.");
      }
    });
  }

  function clear() {
    setError(null);

    startTransition(async () => {
      const res = await removeRating({ itemType, itemId });

      if (res.ok) {
        setScore(null);
        setDraft(DEFAULT_DRAFT);
        setText(DEFAULT_DRAFT.toFixed(1));
        setReviewText("");
        setSavedReviewText("");
        setOpen(false);
      } else {
        setError(res.error ?? "Something went wrong.");
      }
    });
  }

  const prominentTrigger = hasScore ? (
    <button
      type="button"
      onClick={openPopover}
      className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.04] px-6 py-3 text-[15px] font-semibold transition hover:bg-white/[0.08]"
    >
      <span className="text-xl tabular-nums" style={{ color: scoreColor(score!) }}>
        {score!.toFixed(1)}
      </span>
      <span className="text-white/45">/ 10</span>
      {canReview && savedReviewText ? (
        <span className="ml-1 rounded-full border border-violet-300/20 bg-violet-500/10 px-2 py-0.5 text-[11px] font-medium text-violet-100">
          Review
        </span>
      ) : null}
    </button>
  ) : (
    <button
      type="button"
      onClick={openPopover}
      className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-600 px-6 py-3 text-[15px] font-semibold text-white shadow-lg shadow-violet-900/30 transition hover:from-violet-500 hover:to-fuchsia-500"
    >
      {buttonLabel}
    </button>
  );

  const compactTrigger = (
    <button
      type="button"
      onClick={openPopover}
      className={
        hasScore
          ? "inline-flex h-8 min-w-[3rem] items-center justify-center rounded-full border border-white/15 bg-white/[0.04] px-2 text-xs font-semibold tabular-nums transition hover:bg-white/[0.08]"
          : "inline-flex h-8 min-w-[3rem] items-center justify-center rounded-full border border-white/10 bg-white/[0.04] px-2 text-xs font-medium text-white/50 transition hover:border-violet-400/30 hover:text-violet-100"
      }
      style={hasScore ? { color: scoreColor(score!) } : undefined}
    >
      {hasScore ? score!.toFixed(1) : "Rate"}
    </button>
  );

  return (
    <div className="relative inline-block">
      {variant === "prominent" ? prominentTrigger : compactTrigger}

      {open ? (
        <>
          <button
            type="button"
            aria-label="Close"
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-10 cursor-default"
          />
          <div className="absolute right-0 z-20 mt-2 w-72 rounded-2xl border border-white/10 bg-[#0b0b16] p-4 text-left shadow-2xl">
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs font-medium uppercase tracking-wider text-white/40">
                Your score
              </p>
              <input
                type="text"
                inputMode="decimal"
                value={text}
                onChange={(e) => onText(e.target.value)}
                onBlur={() => {
                  if (text.trim() === "") {
                    setText((score ?? DEFAULT_DRAFT).toFixed(1));
                    setDraft(score ?? DEFAULT_DRAFT);
                    return;
                  }

                  const parsed = Number(text);

                  if (!Number.isNaN(parsed)) {
                    const clamped = clampScore(parsed);
                    setDraft(clamped);
                    setText(clamped.toFixed(1));
                  }
                }}
                aria-label="Score"
                className="w-16 rounded-lg bg-white/[0.04] px-2 py-1 text-right text-2xl font-semibold tabular-nums outline-none focus:bg-white/[0.07]"
                style={{ color: scoreColor(draft) }}
              />
            </div>

            <input
              type="range"
              min={MIN}
              max={MAX}
              step={STEP}
              value={draft}
              onChange={(e) => onSlider(Number(e.target.value))}
              className={POPOVER_SLIDER_CLASSES}
              style={{ background: SCORE_TRACK_GRADIENT }}
            />
            <div className="mt-1 flex justify-between text-[10px] text-white/30">
              <span>0.1</span>
              <span>10</span>
            </div>

            {canReview ? (
              <div className="mt-4">
                <div className="flex items-center justify-between gap-2">
                  <label
                    htmlFor={`review-${itemType}-${itemId}`}
                    className="text-xs font-medium uppercase tracking-wider text-white/40"
                  >
                    Review
                  </label>
                  <span className="text-[10px] tabular-nums text-white/30">
                    {reviewText.length}/{MAX_REVIEW_LENGTH}
                  </span>
                </div>

                <textarea
                  id={`review-${itemType}-${itemId}`}
                  value={reviewText}
                  maxLength={MAX_REVIEW_LENGTH}
                  onChange={(e) =>
                    setReviewText(e.target.value.slice(0, MAX_REVIEW_LENGTH))
                  }
                  placeholder="Write a short thought about this album..."
                  rows={4}
                  className="mt-2 w-full resize-none rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-sm leading-relaxed text-white outline-none placeholder:text-white/30 focus:border-violet-400/35 focus:bg-white/[0.06]"
                />
              </div>
            ) : null}

            {error ? <p className="mt-2 text-xs text-red-300">{error}</p> : null}

            <div className="mt-4 flex items-center gap-2">
              <button
                type="button"
                onClick={save}
                disabled={isPending}
                className="flex-1 rounded-xl border border-violet-400/40 bg-violet-500/25 px-3 py-2 text-sm font-medium text-violet-50 transition hover:bg-violet-500/35 disabled:opacity-50"
              >
                {isPending ? "Saving..." : "Save"}
              </button>

              {hasScore ? (
                <button
                  type="button"
                  onClick={clear}
                  disabled={isPending}
                  className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-white/55 transition hover:text-white disabled:opacity-50"
                >
                  Remove
                </button>
              ) : null}
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}
