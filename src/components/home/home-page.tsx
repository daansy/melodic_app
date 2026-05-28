"use client";

import { useState } from "react";
import { Toast } from "@/components/ui/primitives";
import { Sidebar } from "./sidebar";
import { SiteHeader } from "./site-header";
import { TrendingAlbums } from "./trending-albums";
import { FeaturedReviews } from "./featured-reviews";
import { BrowseGenres } from "./browse-genres";
import { RightRail } from "./right-rail";
import { MusicPlayer } from "./music-player";
import {
  featuredReviews,
  genres,
  navItems,
  networkActivity,
  trendingAlbums,
} from "@/lib/data";
import type { Album, Genre } from "@/lib/types";

type HomeProfile = {
  username: string | null;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  onboarding_completed: boolean | null;
};

export function HomePage({ profile }: { profile: HomeProfile }) {
  const displayName = profile.display_name || profile.username || "there";

  const [searchQuery, setSearchQuery] = useState("");
  const [isPlaying, setIsPlaying] = useState(false);
  const [playerSaved, setPlayerSaved] = useState(false);
  const [helpful, setHelpful] = useState<Record<string, boolean>>({});
  const [toast, setToast] = useState<string | null>(null);

  function showToast(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(null), 2200);
  }

  return (
    <main className="min-h-screen bg-[#05050d] font-sans text-white">
      <Toast message={toast} />

      <div
        className="pointer-events-none fixed inset-0 -z-10"
        aria-hidden
        style={{
          background:
            "radial-gradient(ellipse 80% 50% at 20% -10%, rgba(124,58,237,0.12), transparent), radial-gradient(ellipse 60% 40% at 100% 0%, rgba(217,70,239,0.06), transparent), #05050d",
        }}
      />

      <div className="mx-auto w-full max-w-[1560px] px-5 pb-24 pt-8 md:px-10 md:pb-[6rem] md:pt-10 2xl:max-w-[1680px] 2xl:px-14">
        <div className="flex gap-10 lg:gap-14">
          <Sidebar items={navItems} />

          <div className="min-w-0 flex-1">
            <div className="lg:sticky lg:top-6 lg:z-20">
              <div className="rounded-3xl border border-white/[0.06] bg-[#05050d]/65 p-4 backdrop-blur-xl md:p-5">
                <SiteHeader
                  searchQuery={searchQuery}
                  onSearchChange={setSearchQuery}
                  onRateAlbum={() => showToast("Album rating flow coming soon")}
                  onNotify={() => showToast("Notifications")}
                  userName={displayName.split(" ")[0]}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-16 xl:grid-cols-[minmax(0,1fr)_320px] xl:gap-16 2xl:grid-cols-[minmax(0,1fr)_360px]">
              <div className="space-y-16 lg:space-y-20">
                <div className="melodic-fade-up relative overflow-hidden rounded-3xl border border-white/[0.08] bg-white/[0.02] p-6 shadow-[0_28px_90px_-65px_rgba(168,85,247,0.5)] backdrop-blur-xl">
                  <div
                    aria-hidden="true"
                    className="absolute inset-0 opacity-80"
                    style={{
                      background:
                        "radial-gradient(ellipse 70% 45% at 20% 0%, rgba(168,85,247,0.22), transparent 55%), radial-gradient(ellipse 60% 45% at 90% 20%, rgba(236,72,153,0.12), transparent 55%)",
                    }}
                  />
                  <div className="relative flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                    <div className="max-w-2xl">
                      <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-violet-300/80">
                        Critic’s note
                      </p>
                      <h2 className="mt-2 text-xl font-semibold tracking-tight text-white md:text-2xl">
                        Tonight’s thread: late-night clarity.
                      </h2>
                      <p className="mt-3 text-sm leading-relaxed text-white/55">
                        Melodic’s reviewers are rewarding sequencing, texture,
                        and restraint. If it’s glossy without feeling loud, it’s
                        in.
                      </p>
                    </div>

                    <div className="rounded-2xl border border-white/[0.08] bg-gradient-to-r from-violet-500/15 to-fuchsia-500/10 p-4">
                      <p className="text-[11px] font-medium uppercase tracking-wider text-violet-200/70">
                        Community momentum
                      </p>
                      <p className="mt-2 text-3xl font-semibold tabular-nums tracking-tight text-white">
                        8.9<span className="text-lg text-white/40">/10</span>
                      </p>
                      <p className="mt-1 text-xs text-white/45">
                        avg across top-rated picks
                      </p>
                    </div>
                  </div>
                </div>

                <TrendingAlbums
                  albums={trendingAlbums}
                  onSelect={(album: Album) =>
                    showToast(
                      `Opening ${album.title} — avg ${album.avgRating}/10`
                    )
                  }
                />

                <FeaturedReviews
                  reviews={featuredReviews}
                  helpful={helpful}
                  onToggleHelpful={(id) =>
                    setHelpful((prev) => ({ ...prev, [id]: !prev[id] }))
                  }
                />

                <BrowseGenres
                  genres={genres}
                  onSelect={(genre: Genre) =>
                    showToast(
                      `${genre.name} — community avg ${genre.avgScore}/10`
                    )
                  }
                />
              </div>

              <RightRail
                activity={networkActivity}
                profile={profile}
                onEditProfile={() => showToast("Profile editor coming soon")}
              />
            </div>
          </div>
        </div>
      </div>

      <MusicPlayer
        isPlaying={isPlaying}
        onTogglePlay={() => setIsPlaying((p) => !p)}
        saved={playerSaved}
        onToggleSave={() => setPlayerSaved((p) => !p)}
      />
    </main>
  );
}