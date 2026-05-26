"use client";

import Image from "next/image";
import { IconButton } from "@/components/ui/primitives";
import { IconHeart, IconNext, IconPause, IconPlay, IconPrev } from "@/components/ui/icons";

export function MusicPlayer({
  isPlaying,
  onTogglePlay,
  saved,
  onToggleSave,
}: {
  isPlaying: boolean;
  onTogglePlay: () => void;
  saved: boolean;
  onToggleSave: () => void;
}) {
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-3 z-50">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-t from-[#05050d]/90 to-transparent"
      />

      <div className="pointer-events-auto mx-auto w-full max-w-[1560px] px-4 md:px-8">
        <div className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-[#06060f]/75 backdrop-blur-xl shadow-[0_18px_70px_-55px_rgba(168,85,247,0.45)]">
          <div
            aria-hidden="true"
            className="absolute inset-0 opacity-80"
            style={{
              background:
                "radial-gradient(ellipse 90% 60% at 20% 20%, rgba(168,85,247,0.22), transparent 60%), radial-gradient(ellipse 60% 55% at 85% 10%, rgba(236,72,153,0.14), transparent 55%)",
            }}
          />

          <div className="relative mx-auto flex h-14 items-center gap-4 px-4 md:px-6">
            <div className="flex min-w-0 flex-1 items-center gap-3">
              <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-xl ring-1 ring-white/10">
                <Image
                  src="https://images.unsplash.com/photo-1511379938547-c1f69419868d?auto=format&fit=crop&w=128&q=60"
                  alt="Now playing"
                  fill
                  sizes="36px"
                  className="object-cover"
                />
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-white">
                  Midnight Bloom
                </p>
                <p className="truncate text-[11px] text-white/40">Lumen Arcade</p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <IconButton label="Previous" className="h-8 w-8">
                <IconPrev className="h-3.5 w-3.5" />
              </IconButton>
              <button
                type="button"
                aria-label={isPlaying ? "Pause" : "Play"}
                onClick={onTogglePlay}
                className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white text-[#06060f] transition active:scale-95 hover:bg-white/90"
              >
                {isPlaying ? <IconPause /> : <IconPlay />}
              </button>
              <IconButton label="Next" className="h-8 w-8">
                <IconNext className="h-3.5 w-3.5" />
              </IconButton>
            </div>

            <div className="hidden flex-1 items-center justify-end gap-3 sm:flex">
              <div className="hidden max-w-xs flex-1 items-center gap-2 lg:flex">
                <span className="text-[10px] tabular-nums text-white/35">
                  1:12
                </span>
                <div className="h-1 flex-1 overflow-hidden rounded-full bg-white/10">
                  <div className="h-full w-[42%] rounded-full bg-violet-500/80" />
                </div>
                <span className="text-[10px] tabular-nums text-white/35">
                  3:48
                </span>
              </div>
              <IconButton
                label={saved ? "Remove from library" : "Save to library"}
                active={saved}
                onClick={onToggleSave}
                className="h-8 w-8"
              >
                <IconHeart filled={saved} className="h-3.5 w-3.5" />
              </IconButton>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
