"use client";

import Link from "next/link";
import { AlbumCover, Avatar } from "@/components/ui/primitives";
import { RatingBadge } from "@/components/ui/rating-badge";
import { SectionHeader } from "@/components/ui/section";
import { IconChevron } from "@/components/ui/icons";
import { albumSlug } from "@/lib/slug";
import type { Review } from "@/lib/types";

export function FeaturedReviews({
  reviews,
  helpful,
  onToggleHelpful,
}: {
  reviews: Review[];
  helpful: Record<string, boolean>;
  onToggleHelpful: (id: string) => void;
}) {
  return (
    <section>
      <SectionHeader
        eyebrow="Written reviews"
        title="Featured criticism"
        description="Long-form takes from reviewers you follow — scored on the same 1–10 scale."
      />
      <div className="mt-6 space-y-5">
        {reviews.map((review) => {
          const marked = Boolean(helpful[review.id]);
          const href = `/album/${albumSlug(review.album.title, review.album.artist)}`;

          return (
            <article
              key={review.id}
              className="group melodic-fade-up rounded-2xl border border-white/[0.08] bg-gradient-to-br from-white/[0.03] to-transparent p-5 transition duration-300 hover:-translate-y-[1px] hover:border-white/[0.14] hover:bg-white/[0.04] hover:shadow-[0_28px_90px_-70px_rgba(168,85,247,0.45)] md:p-6"
            >
              <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                <div className="flex items-start gap-5">
                  <RatingBadge
                    score={review.rating}
                    size="xl"
                    className="shrink-0 self-start"
                  />

                  <Link
                    href={href}
                    className="group flex min-w-0 flex-1 items-start gap-4"
                  >
                    <AlbumCover
                      url={review.album.coverUrl}
                      alt={`${review.album.title} cover`}
                      className="h-20 w-20 sm:h-24 sm:w-24"
                    />
                    <div className="min-w-0">
                      <h3 className="truncate font-semibold text-white transition group-hover:text-violet-100">
                        {review.album.title}
                      </h3>
                      <p className="mt-0.5 truncate text-sm text-white/45">
                        {review.album.artist} · {review.album.year}
                      </p>
                      <div className="mt-3 flex items-center gap-3">
                        <Avatar
                          url={review.user.avatarUrl}
                          alt={review.user.name}
                          size="sm"
                        />
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-white/90">
                            {review.user.name}
                          </p>
                          <p className="truncate text-xs text-white/40">
                            {review.user.handle}
                          </p>
                        </div>
                      </div>
                    </div>
                  </Link>
                </div>

                <div className="min-w-0 flex-1">
                  <p className="text-[15px] leading-[1.65] text-white/70">
                    {review.blurb}
                  </p>

                  <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-white/[0.06] pt-4">
                    <div className="flex flex-wrap items-center gap-4 text-xs text-white/40">
                      <span>{review.wordCount} words</span>
                      <button
                        type="button"
                        onClick={() => onToggleHelpful(review.id)}
                        className={[
                          "font-medium transition active:scale-[0.98]",
                          marked
                            ? "text-violet-300"
                            : "hover:text-white/70",
                        ].join(" ")}
                      >
                        {marked ? "Marked helpful" : "Mark helpful"} ·{" "}
                        {review.helpful + (marked ? 1 : 0)}
                      </button>
                    </div>
                    <Link
                      href={href}
                      className="inline-flex items-center gap-1 text-sm font-medium text-white/60 transition hover:text-white"
                    >
                      Read full review
                      <IconChevron className="opacity-60 transition group-hover:translate-x-0.5" />
                    </Link>
                  </div>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
