"use client";

import Link from "next/link";
import { AlbumCover } from "@/components/ui/primitives";
import { RatingBadge } from "@/components/ui/rating-badge";
import { SectionHeader } from "@/components/ui/section";
import { albumSlug } from "@/lib/slug";
import type { Album } from "@/lib/types";

function formatCount(n: number) {
  return n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n);
}

export function TrendingAlbums({
  albums,
  onSelect,
}: {
  albums: Album[];
  onSelect: (album: Album) => void;
}) {
  return (
    <section>
      <SectionHeader
        eyebrow="Community scores"
        title="Highest rated this week"
        description="Weighted averages from verified Melodic ratings — not play counts."
      />
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:gap-5">
        {albums.map((album, idx) => {
          const href = `/album/${albumSlug(album.title, album.artist)}`;
          return (
            <Link
              key={`${album.title}-${album.artist}`}
              href={href}
              onClick={() => onSelect(album)}
              className="group melodic-fade-up relative overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.02] p-5 shadow-[0_0_0_1px_rgba(255,255,255,0.04)] transition duration-300 hover:-translate-y-[2px] hover:bg-white/[0.04] hover:border-white/[0.16] hover:shadow-[0_26px_85px_-55px_rgba(168,85,247,0.65)]"
            >
              <div
                aria-hidden="true"
                className="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                style={{
                  background:
                    "radial-gradient(circle at 20% 10%, rgba(168,85,247,0.35), transparent 50%), radial-gradient(circle at 85% 25%, rgba(236,72,153,0.2), transparent 55%)",
                }}
              />

              <div className="relative flex items-start gap-4">
                <div className="flex w-[72px] shrink-0 flex-col items-start gap-2">
                  <span className="text-[11px] font-semibold tabular-nums text-violet-300/50">
                    {String(idx + 1).padStart(2, "0")}
                  </span>
                  <AlbumCover
                    url={album.coverUrl}
                    alt={`${album.title} cover`}
                    className="h-16 w-16 md:h-20 md:w-20"
                    priority={idx < 2}
                  />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold tracking-tight text-white/95 group-hover:text-violet-100 transition">
                    {album.title}
                  </p>
                  <p className="mt-1 truncate text-sm text-white/45">
                    {album.artist} · {album.year}
                  </p>

                  <div className="mt-3 flex items-center justify-between gap-3">
                    <p className="text-xs text-white/35">
                      {formatCount(album.ratingCount)} ratings
                    </p>
                    <div className="shrink-0 transition-transform duration-300 group-hover:translate-y-[-1px]">
                      <RatingBadge score={album.avgRating} size="lg" />
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
