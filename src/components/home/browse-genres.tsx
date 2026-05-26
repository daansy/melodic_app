"use client";

import { RatingBadge } from "@/components/ui/rating-badge";
import { SectionHeader } from "@/components/ui/section";
import type { Genre } from "@/lib/types";

export function BrowseGenres({
  genres,
  onSelect,
}: {
  genres: Genre[];
  onSelect: (genre: Genre) => void;
}) {
  return (
    <section>
      <SectionHeader
        eyebrow="Browse by taste"
        title="Genre averages"
        description="How your community scores entire lanes — useful for discovery, not charts."
      />
      <div className="mt-5 flex flex-wrap gap-2">
        {genres.map((genre) => (
          <button
            key={genre.name}
            type="button"
            onClick={() => onSelect(genre)}
            className="melodic-fade-up group inline-flex items-center gap-3 rounded-full border border-white/[0.08] bg-white/[0.02] py-2 pl-4 pr-2 text-left transition duration-300 hover:-translate-y-[1px] hover:border-violet-500/25 hover:bg-violet-500/[0.06] hover:shadow-[0_18px_60px_-45px_rgba(168,85,247,0.55)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400/25"
          >
            <span>
              <span className="block text-sm font-medium text-white">{genre.name}</span>
              <span className="text-[11px] text-white/40">{genre.albumCount.toLocaleString()} albums</span>
            </span>
            <RatingBadge score={genre.avgScore} size="sm" showScale={false} />
          </button>
        ))}
      </div>
    </section>
  );
}
