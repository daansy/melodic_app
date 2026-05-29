"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

type Badge = {
  id: string;
  name: string;
  symbol: string;
  unlocked: boolean;
};

type RatingRow = {
  item_type: string | null;
  item_id: string | null;
  score: number | null;
  item_name: string | null;
  item_artist: string | null;
  item_image_url: string | null;
  created_at: string | null;
};

type RankIconKind =
  | "note"
  | "headphones"
  | "vinyl"
  | "catalog_stack"
  | "catalog_shelves"
  | "catalog_crown"
  | "microphone"
  | "spark"
  | "wave"
  | "vision_peak"
  | "crown";

type Rank = {
  id: string;
  name: string;
  minPoints: number;
  icon: RankIconKind;
  tier?: 1 | 2 | 3;
  colorClasses: string;
  iconClasses: string;
  description: string;
};

type ProfilePageClientProps = {
  profile: {
    displayName: string;
    username: string;
    bio: string;
    avatarUrl: string | null;
    featuredBadgeId: string | null;
  };
  albumRankings: number;
  trackRankings: number;
  totalRankings: number;
  points: number;
  recentRatings: RatingRow[];
};

const BADGES: Badge[] = [
  {
    id: "early_member",
    name: "Early Member",
    symbol: "✦",
    unlocked: true,
  },
  {
    id: "first_ranker",
    name: "First Ranker",
    symbol: "◆",
    unlocked: false,
  },
  {
    id: "tastemaker",
    name: "Tastemaker",
    symbol: "◇",
    unlocked: false,
  },
  {
    id: "early_listener",
    name: "Early Listener",
    symbol: "●",
    unlocked: false,
  },
];

const USER_RANKS: Rank[] = [
  {
    id: "newcomer",
    name: "Newcomer",
    minPoints: 0,
    icon: "note",
    colorClasses: "border-slate-400/20 bg-slate-500/10 text-slate-100",
    iconClasses: "border-slate-300/25 bg-slate-400/15 text-slate-100",
    description: "Your first step into Melodic.",
  },

  {
    id: "rookie_listener_1",
    name: "Rookie Listener I",
    minPoints: 250,
    icon: "headphones",
    tier: 1,
    colorClasses: "border-sky-400/20 bg-sky-500/10 text-sky-100",
    iconClasses: "border-sky-300/25 bg-sky-400/15 text-sky-100",
    description: "Starting to build a listening identity.",
  },
  {
    id: "rookie_listener_2",
    name: "Rookie Listener II",
    minPoints: 750,
    icon: "headphones",
    tier: 2,
    colorClasses: "border-sky-400/20 bg-sky-500/10 text-sky-100",
    iconClasses: "border-sky-300/25 bg-sky-400/20 text-sky-100",
    description: "Your ratings are becoming more consistent.",
  },
  {
    id: "rookie_listener_3",
    name: "Rookie Listener III",
    minPoints: 1500,
    icon: "headphones",
    tier: 3,
    colorClasses: "border-sky-400/20 bg-sky-500/10 text-sky-100",
    iconClasses: "border-sky-300/25 bg-sky-400/25 text-sky-50",
    description: "You are no longer just passing through.",
  },

  {
    id: "album_scout_1",
    name: "Album Scout I",
    minPoints: 3000,
    icon: "vinyl",
    tier: 1,
    colorClasses: "border-emerald-400/20 bg-emerald-500/10 text-emerald-100",
    iconClasses: "border-emerald-300/25 bg-emerald-400/15 text-emerald-100",
    description: "You are actively scouting albums and projects.",
  },
  {
    id: "album_scout_2",
    name: "Album Scout II",
    minPoints: 6000,
    icon: "vinyl",
    tier: 2,
    colorClasses: "border-emerald-400/20 bg-emerald-500/10 text-emerald-100",
    iconClasses: "border-emerald-300/25 bg-emerald-400/20 text-emerald-100",
    description: "Your catalog is getting wider.",
  },
  {
    id: "album_scout_3",
    name: "Album Scout III",
    minPoints: 10000,
    icon: "vinyl",
    tier: 3,
    colorClasses: "border-emerald-400/20 bg-emerald-500/10 text-emerald-100",
    iconClasses: "border-emerald-300/25 bg-emerald-400/25 text-emerald-50",
    description: "You are exploring albums with real intent.",
  },

  {
    id: "catalog_curator_1",
    name: "Catalog Curator I",
    minPoints: 17500,
    icon: "catalog_stack",
    tier: 1,
    colorClasses: "border-yellow-400/20 bg-yellow-500/10 text-yellow-100",
    iconClasses: "border-yellow-300/30 bg-yellow-400/20 text-yellow-100",
    description: "Your profile is becoming a curated music catalog.",
  },
  {
    id: "catalog_curator_2",
    name: "Catalog Curator II",
    minPoints: 30000,
    icon: "catalog_shelves",
    tier: 2,
    colorClasses: "border-yellow-400/20 bg-yellow-500/10 text-yellow-100",
    iconClasses: "border-yellow-300/30 bg-yellow-400/25 text-yellow-100",
    description: "Your taste archive is gaining depth.",
  },
  {
    id: "catalog_curator_3",
    name: "Catalog Curator III",
    minPoints: 50000,
    icon: "catalog_crown",
    tier: 3,
    colorClasses: "border-yellow-400/20 bg-yellow-500/10 text-yellow-100",
    iconClasses: "border-yellow-300/30 bg-yellow-400/30 text-yellow-50",
    description: "A serious and recognizable catalog is forming.",
  },

  {
    id: "certified_critic_1",
    name: "Certified Critic I",
    minPoints: 75000,
    icon: "microphone",
    tier: 1,
    colorClasses: "border-rose-400/20 bg-rose-500/10 text-rose-100",
    iconClasses: "border-rose-300/25 bg-rose-400/15 text-rose-100",
    description: "Your scores start to carry weight.",
  },
  {
    id: "certified_critic_2",
    name: "Certified Critic II",
    minPoints: 110000,
    icon: "microphone",
    tier: 2,
    colorClasses: "border-rose-400/20 bg-rose-500/10 text-rose-100",
    iconClasses: "border-rose-300/25 bg-rose-400/20 text-rose-100",
    description: "Sharper ratings and stronger opinions.",
  },
  {
    id: "certified_critic_3",
    name: "Certified Critic III",
    minPoints: 160000,
    icon: "microphone",
    tier: 3,
    colorClasses: "border-rose-400/20 bg-rose-500/10 text-rose-100",
    iconClasses: "border-rose-300/25 bg-rose-400/25 text-rose-50",
    description: "A serious voice in music ranking.",
  },

  {
    id: "vibe_virtuoso_1",
    name: "Vibe Virtuoso I",
    minPoints: 225000,
    icon: "spark",
    tier: 1,
    colorClasses: "border-fuchsia-400/20 bg-fuchsia-500/10 text-fuchsia-100",
    iconClasses: "border-fuchsia-300/25 bg-fuchsia-400/15 text-fuchsia-100",
    description: "Your taste has a clear signature.",
  },
  {
    id: "vibe_virtuoso_2",
    name: "Vibe Virtuoso II",
    minPoints: 325000,
    icon: "spark",
    tier: 2,
    colorClasses: "border-fuchsia-400/20 bg-fuchsia-500/10 text-fuchsia-100",
    iconClasses: "border-fuchsia-300/25 bg-fuchsia-400/20 text-fuchsia-100",
    description: "You shape mood and taste with confidence.",
  },
  {
    id: "vibe_virtuoso_3",
    name: "Vibe Virtuoso III",
    minPoints: 450000,
    icon: "spark",
    tier: 3,
    colorClasses: "border-fuchsia-400/20 bg-fuchsia-500/10 text-fuchsia-100",
    iconClasses: "border-fuchsia-300/25 bg-fuchsia-400/25 text-fuchsia-50",
    description: "A rare level of taste presence.",
  },

  {
    id: "sonic_visionary_1",
    name: "Sonic Visionary I",
    minPoints: 600000,
    icon: "wave",
    tier: 1,
    colorClasses: "border-indigo-400/20 bg-indigo-500/10 text-indigo-100",
    iconClasses: "border-indigo-300/25 bg-indigo-400/15 text-indigo-100",
    description: "You start seeing patterns most listeners miss.",
  },
  {
    id: "sonic_visionary_2",
    name: "Sonic Visionary II",
    minPoints: 850000,
    icon: "wave",
    tier: 2,
    colorClasses: "border-indigo-400/20 bg-indigo-500/10 text-indigo-100",
    iconClasses: "border-indigo-300/25 bg-indigo-400/20 text-indigo-100",
    description: "A very high-status music identity.",
  },
  {
    id: "sonic_visionary_3",
    name: "Sonic Visionary III",
    minPoints: 1150000,
    icon: "vision_peak",
    tier: 3,
    colorClasses: "border-indigo-400/20 bg-indigo-500/10 text-indigo-100",
    iconClasses: "border-indigo-300/25 bg-indigo-400/25 text-indigo-50",
    description: "Almost untouchable taste territory.",
  },

  {
    id: "melodic_legend",
    name: "Melodic Legend",
    minPoints: 1500000,
    icon: "crown",
    colorClasses: "border-violet-400/25 bg-violet-500/10 text-violet-100",
    iconClasses: "border-violet-300/25 bg-violet-400/25 text-violet-50",
    description: "The rarest status in Melodic.",
  },
];

function formatDate(date: string | null) {
  if (!date) {
    return "Recently";
  }

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
  }).format(new Date(date));
}

function getCurrentRank(points: number) {
  let current = USER_RANKS[0];

  for (const rank of USER_RANKS) {
    if (points >= rank.minPoints) {
      current = rank;
    } else {
      break;
    }
  }

  return current;
}

function getNextRank(points: number) {
  return USER_RANKS.find((rank) => rank.minPoints > points) ?? null;
}

function RankIcon({ kind, tier }: { kind: RankIconKind; tier?: 1 | 2 | 3 }) {
  const detailLevel = tier ?? 1;

  return (
    <svg
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {kind === "note" ? (
        <>
          <path d="M9 18V6l9-2v12" />
          <circle cx="7" cy="18" r="2" />
          <circle cx="16" cy="16" r="2" />
        </>
      ) : null}

      {kind === "headphones" ? (
        <>
          <path d="M4 13a8 8 0 0 1 16 0" />
          <path d="M4 13v4a2 2 0 0 0 2 2h1v-6H6a2 2 0 0 0-2 2" />
          <path d="M20 13v4a2 2 0 0 1-2 2h-1v-6h1a2 2 0 0 1 2 2" />
          {detailLevel >= 2 ? <path d="M9 20h6" /> : null}
          {detailLevel >= 3 ? <path d="M12 3v2" /> : null}
        </>
      ) : null}

      {kind === "vinyl" ? (
        <>
          <circle cx="12" cy="12" r="8" />
          <circle cx="12" cy="12" r="2" />
          {detailLevel >= 2 ? <circle cx="12" cy="12" r="5" /> : null}
          {detailLevel >= 3 ? (
            <>
              <path d="M12 4v3" />
              <path d="M20 12h-3" />
              <path d="M12 20v-3" />
              <path d="M4 12h3" />
            </>
          ) : null}
        </>
      ) : null}

      {kind === "catalog_stack" ? (
        <>
          <path d="M6 7h12" />
          <path d="M7 11h10" />
          <path d="M8 15h8" />
          <path d="M5 19h14" />
          <circle cx="8" cy="7" r="1" />
          <circle cx="16" cy="7" r="1" />
        </>
      ) : null}

      {kind === "catalog_shelves" ? (
        <>
          <path d="M5 5v14" />
          <path d="M19 5v14" />
          <path d="M5 8h14" />
          <path d="M5 14h14" />
          <path d="M8 8v6" />
          <path d="M12 8v6" />
          <path d="M16 8v6" />
          <path d="M9 19h6" />
        </>
      ) : null}

      {kind === "catalog_crown" ? (
        <>
          <path d="M6 6h12v13H6z" />
          <path d="M9 6V4h6v2" />
          <path d="M9 11h6" />
          <path d="M9 15h4" />
          <path d="m8 3 2 2 2-3 2 3 2-2" />
        </>
      ) : null}

      {kind === "microphone" ? (
        <>
          <rect x="9" y="3" width="6" height="10" rx="3" />
          <path d="M5 11a7 7 0 0 0 14 0" />
          <path d="M12 18v3" />
          <path d="M9 21h6" />
          {detailLevel >= 2 ? (
            <>
              <path d="M7 8H5" />
              <path d="M19 8h-2" />
            </>
          ) : null}
          {detailLevel >= 3 ? (
            <>
              <path d="M8 4 6.5 2.5" />
              <path d="m16 4 1.5-1.5" />
            </>
          ) : null}
        </>
      ) : null}

      {kind === "spark" ? (
        <>
          <path d="M12 3 13.8 8.2 19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3Z" />
          {detailLevel >= 2 ? (
            <path d="M5 16.5 5.8 19 8.3 19.8 5.8 20.6 5 23l-.8-2.4L1.7 19.8 4.2 19 5 16.5Z" />
          ) : null}
          {detailLevel >= 3 ? (
            <path d="M19 2 19.7 4.1 22 5l-2.3.8L19 8l-.8-2.2L16 5l2.2-.9L19 2Z" />
          ) : null}
        </>
      ) : null}

      {kind === "wave" ? (
        <>
          <path d="M4 15c2-6 4 6 6 0s4 6 6 0 3-2 4 0" />
          {detailLevel >= 2 ? (
            <path d="M4 10c2-5 4 5 6 0s4 5 6 0 3-2 4 0" />
          ) : null}
        </>
      ) : null}

      {kind === "vision_peak" ? (
        <>
          <path d="M3 12s3.5-6 9-6 9 6 9 6-3.5 6-9 6-9-6-9-6Z" />
          <circle cx="12" cy="12" r="2.2" />
          <path d="M12 3v2" />
          <path d="M12 19v2" />
          <path d="M4.5 5.5 6 7" />
          <path d="m18 7 1.5-1.5" />
          <path d="M7 20 9 17" />
          <path d="m15 17 2 3" />
        </>
      ) : null}

      {kind === "crown" ? (
        <>
          <path d="m3 8 4 4 5-7 5 7 4-4-2 11H5L3 8Z" />
          <path d="M5 19h14" />
          <circle cx="12" cy="5" r="1" />
          <circle cx="7" cy="12" r="1" />
          <circle cx="17" cy="12" r="1" />
        </>
      ) : null}
    </svg>
  );
}

function RankIconBox({
  rank,
  unlocked,
  size = "normal",
}: {
  rank: Rank;
  unlocked: boolean;
  size?: "small" | "normal";
}) {
  return (
    <div
      className={`relative flex shrink-0 items-center justify-center rounded-xl border ${
        size === "small" ? "h-10 w-10" : "h-11 w-11"
      } ${rank.iconClasses} ${unlocked ? "" : "opacity-45"}`}
    >
      <RankIcon kind={rank.icon} tier={rank.tier} />

      {rank.tier ? (
        <span className="absolute -bottom-1 -right-1 rounded-full border border-black/30 bg-black/80 px-1.5 py-[1px] text-[8px] font-semibold leading-none text-white">
          {rank.tier === 1 ? "I" : rank.tier === 2 ? "II" : "III"}
        </span>
      ) : null}
    </div>
  );
}

export function ProfilePageClient({
  profile,
  albumRankings,
  trackRankings,
  totalRankings,
  points,
  recentRatings,
}: ProfilePageClientProps) {
  const [isRankModalOpen, setIsRankModalOpen] = useState(false);

  const avatarInitial =
    profile.displayName?.[0]?.toUpperCase() ||
    profile.username?.[0]?.toUpperCase() ||
    "M";

  const featuredBadge =
    BADGES.find((badge) => badge.id === profile.featuredBadgeId) ?? null;

  const unlockedBadges = BADGES.filter((badge) => badge.unlocked);
  const currentRank = useMemo(() => getCurrentRank(points), [points]);
  const nextRank = useMemo(() => getNextRank(points), [points]);

  const rankProgressPercent = nextRank
    ? Math.min(
        100,
        Math.max(
          0,
          ((points - currentRank.minPoints) /
            (nextRank.minPoints - currentRank.minPoints)) *
            100
        )
      )
    : 100;

  const pointsToNextRank = nextRank
    ? Math.max(nextRank.minPoints - points, 0)
    : 0;

  return (
    <main className="min-h-screen bg-[#05050d] text-white">
      <div
        className="pointer-events-none fixed inset-0 -z-10"
        aria-hidden
        style={{
          background:
            "radial-gradient(ellipse 80% 50% at 20% -10%, rgba(124,58,237,0.14), transparent), radial-gradient(ellipse 60% 40% at 100% 0%, rgba(217,70,239,0.08), transparent), #05050d",
        }}
      />

      <div className="mx-auto w-full max-w-[1200px] px-5 pb-24 pt-10 md:px-10">
        <Link
          href="/"
          className="text-sm font-medium text-white/60 transition hover:text-white"
        >
          ← Back to Home
        </Link>

        <section className="mt-8 overflow-hidden rounded-3xl border border-white/[0.08] bg-white/[0.03] shadow-2xl">
          <div className="relative h-20 overflow-hidden bg-gradient-to-r from-violet-700/45 via-fuchsia-600/20 to-indigo-600/35 md:h-24">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.16),transparent_25%),radial-gradient(circle_at_75%_10%,rgba(168,85,247,0.25),transparent_28%)]" />
            <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-[#0b0b14] to-transparent" />
          </div>

          <div className="px-5 py-5 md:px-7">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="flex min-w-0 items-center gap-4">
                <div className="relative flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-[#080810] text-2xl font-semibold text-white/45">
                  {profile.avatarUrl ? (
                    <img
                      src={profile.avatarUrl}
                      alt={profile.displayName}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    avatarInitial
                  )}
                </div>

                <div className="min-w-0">
                  <div className="flex min-w-0 flex-wrap items-center gap-2">
                    <h1 className="max-w-full break-words text-2xl font-semibold leading-[1.25] tracking-tight text-white md:text-3xl">
                      {profile.displayName}
                    </h1>

                    {featuredBadge ? (
                      <span className="shrink-0 rounded-full border border-violet-300/30 bg-violet-500/15 px-2.5 py-1 text-[11px] font-medium text-violet-100">
                        {featuredBadge.symbol} {featuredBadge.name}
                      </span>
                    ) : null}
                  </div>

                  <p className="mt-1 break-words text-sm leading-relaxed text-white/45">
                    @{profile.username}
                  </p>
                </div>
              </div>

              <Link
                href="/settings"
                className="shrink-0 rounded-full border border-white/10 bg-white/[0.04] px-5 py-2 text-sm font-medium text-white/80 transition hover:bg-white/[0.08] hover:text-white"
              >
                Edit profile
              </Link>
            </div>

            <div className="mt-4 max-w-2xl">
              <p className="text-sm leading-relaxed text-white/60">
                {profile.bio || "No bio yet."}
              </p>
            </div>

            <div className="mt-4 border-t border-white/[0.06] pt-4">
              <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-white/35">
                  Profile progress
                </p>

                <p className="text-xs text-white/40">
                  Total rankings{" "}
                  <span className="font-semibold text-white/75">
                    {totalRankings.toLocaleString()}
                  </span>
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 lg:grid-cols-[repeat(3,minmax(0,1fr))_200px]">
                <div className="rounded-xl border border-white/[0.06] bg-black/20 px-3 py-2 text-center">
                  <p className="text-[9px] uppercase tracking-wider text-white/35">
                    Albums
                  </p>
                  <p className="mt-0.5 text-lg font-semibold tabular-nums text-white">
                    {albumRankings.toLocaleString()}
                  </p>
                </div>

                <div className="rounded-xl border border-white/[0.06] bg-black/20 px-3 py-2 text-center">
                  <p className="text-[9px] uppercase tracking-wider text-white/35">
                    Tracks
                  </p>
                  <p className="mt-0.5 text-lg font-semibold tabular-nums text-white">
                    {trackRankings.toLocaleString()}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setIsRankModalOpen(true)}
                  className="rounded-xl border border-white/[0.06] bg-black/20 px-3 py-2 text-center transition hover:border-white/10 hover:bg-white/[0.03]"
                >
                  <p className="text-[9px] uppercase tracking-wider text-white/35">
                    Points
                  </p>
                  <p className="mt-0.5 inline-block text-lg font-semibold tabular-nums text-white underline-offset-4 hover:underline hover:decoration-violet-300/70">
                    {points.toLocaleString()}
                  </p>
                </button>

                <Link
                  href="/profile/badges"
                  className="rounded-xl border border-white/[0.06] bg-black/20 px-3 py-2 transition hover:border-violet-400/30 hover:bg-violet-500/[0.06]"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <p className="text-[9px] uppercase tracking-wider text-white/35">
                        Badges
                      </p>
                      <p className="mt-0.5 text-sm font-semibold text-white">
                        {unlockedBadges.length} / {BADGES.length}
                      </p>
                    </div>

                    <span className="rounded-full border border-white/10 bg-white/[0.04] px-2 py-0.5 text-[11px] text-white/45">
                      View
                    </span>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_340px]">
          <div className="rounded-3xl border border-white/[0.08] bg-white/[0.03] p-6">
            <div>
              <h2 className="text-lg font-semibold tracking-tight">
                Recent activity
              </h2>
              <p className="mt-1 text-sm text-white/45">
                Your latest album and track rankings.
              </p>
            </div>

            {recentRatings.length > 0 ? (
              <div className="mt-6 divide-y divide-white/[0.06] overflow-hidden rounded-2xl border border-white/[0.08] bg-black/20">
                {recentRatings.map((rating) => {
                  const content = (
                    <div className="group flex items-center gap-4 px-4 py-4 transition hover:bg-white/[0.04]">
                      <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-white/10 bg-white/[0.03]">
                        {rating.item_image_url ? (
                          <img
                            src={rating.item_image_url}
                            alt={rating.item_name || "Rated item"}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-xs text-white/30">
                            {rating.item_type === "album" ? "Album" : "Track"}
                          </div>
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-white">
                          {rating.item_name || "Untitled"}
                        </p>
                        <p className="truncate text-xs text-white/40">
                          {rating.item_artist || "Unknown artist"}
                        </p>
                        <p className="mt-1 text-[11px] uppercase tracking-wider text-white/25">
                          {rating.item_type === "album" ? "Album" : "Track"} ·{" "}
                          {formatDate(rating.created_at)}
                        </p>
                      </div>

                      <div className="shrink-0 rounded-xl border border-violet-300/20 bg-violet-500/10 px-3 py-2 text-sm font-semibold tabular-nums text-violet-100">
                        {rating.score?.toFixed(1) ?? "—"}
                      </div>
                    </div>
                  );

                  if (rating.item_type === "album" && rating.item_id) {
                    return (
                      <Link
                        key={`${rating.item_type}-${rating.item_id}-${rating.created_at}`}
                        href={`/album/${rating.item_id}`}
                      >
                        {content}
                      </Link>
                    );
                  }

                  return (
                    <div
                      key={`${rating.item_type}-${rating.item_id}-${rating.created_at}`}
                    >
                      {content}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="mt-6 rounded-2xl border border-dashed border-white/10 bg-black/20 p-8 text-center">
                <p className="text-sm font-medium text-white/70">
                  No activity yet
                </p>
                <p className="mt-2 text-sm text-white/40">
                  Once rankings are added, this page will start showing your
                  music taste.
                </p>
              </div>
            )}
          </div>

          <aside className="rounded-3xl border border-white/[0.08] bg-white/[0.03] p-6">
            <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-violet-300/80">
              Taste profile
            </p>

            <h2 className="mt-3 text-lg font-semibold tracking-tight">
              Still warming up
            </h2>

            <p className="mt-3 text-sm leading-relaxed text-white/50">
              After you rank more albums and tracks, Melodic can turn your
              activity into taste stats, favorite genres, top artists and rating
              patterns.
            </p>

            <div className="mt-6 space-y-3">
              {["Favorite genres", "Top artists", "Rating curve"].map(
                (item) => (
                  <div
                    key={item}
                    className="flex items-center justify-between rounded-2xl border border-white/[0.06] bg-black/20 px-4 py-3"
                  >
                    <span className="text-sm text-white/55">{item}</span>
                    <span className="text-xs text-white/30">Soon</span>
                  </div>
                )
              )}
            </div>
          </aside>
        </section>
      </div>

      {isRankModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 py-6 backdrop-blur-sm">
          <div className="flex max-h-[84vh] w-full max-w-4xl flex-col overflow-hidden rounded-3xl border border-white/[0.08] bg-[#0b0b14] shadow-2xl">
            <div className="flex items-start justify-between gap-4 border-b border-white/[0.06] px-5 py-4">
              <div>
                <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-violet-300/80">
                  Melodic ranks
                </p>
                <h2 className="mt-1 text-2xl font-semibold tracking-tight text-white">
                  Point ranks
                </h2>
              </div>

              <button
                type="button"
                onClick={() => setIsRankModalOpen(false)}
                className="shrink-0 rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-sm font-medium text-white/55 transition hover:bg-white/[0.06] hover:text-white"
              >
                Close
              </button>
            </div>

            <div className="border-b border-white/[0.06] px-5 py-4">
              <div className="flex flex-col gap-3 md:flex-row md:items-center">
                <RankIconBox rank={currentRank} unlocked size="small" />

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-white/35">
                        Current rank
                      </p>
                      <p className="mt-0.5 text-sm font-semibold text-white">
                        {currentRank.name}
                      </p>
                    </div>

                    <div className="text-left md:text-right">
                      <p className="text-[10px] uppercase tracking-wider text-white/35">
                        Points
                      </p>
                      <p className="mt-0.5 text-sm font-semibold tabular-nums text-white">
                        {points.toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/[0.06]">
                    <div
                      className="h-full rounded-full bg-violet-400"
                      style={{ width: `${rankProgressPercent}%` }}
                    />
                  </div>

                  <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-xs text-white/40">
                    <span>{currentRank.minPoints.toLocaleString()} pts</span>

                    {nextRank ? (
                      <span>
                        {pointsToNextRank.toLocaleString()} pts to{" "}
                        {nextRank.name}
                      </span>
                    ) : (
                      <span>Max rank reached</span>
                    )}
                  </div>
                </div>

                {nextRank ? (
                  <RankIconBox rank={nextRank} unlocked={false} size="small" />
                ) : null}
              </div>
            </div>

            <div className="overflow-y-auto px-5 py-4">
              <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                {USER_RANKS.map((rank) => {
                  const unlocked = points >= rank.minPoints;
                  const isCurrent = currentRank.id === rank.id;

                  return (
                    <div
                      key={rank.id}
                      className={`group rounded-2xl border p-3 transition duration-200 hover:-translate-y-0.5 hover:border-white/20 ${
                        isCurrent
                          ? `${rank.colorClasses} ring-1 ring-white/10`
                          : unlocked
                            ? rank.colorClasses
                            : "border-white/[0.06] bg-white/[0.02] text-white/40"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <RankIconBox rank={rank} unlocked={unlocked} />

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <p className="truncate text-sm font-semibold text-white">
                              {rank.name}
                            </p>

                            {isCurrent ? (
                              <span className="shrink-0 rounded-full border border-white/10 bg-white/[0.08] px-2 py-0.5 text-[9px] font-medium uppercase tracking-wider text-white/75">
                                Current
                              </span>
                            ) : null}
                          </div>

                          <p className="mt-0.5 text-xs text-white/45">
                            {rank.minPoints.toLocaleString()} points
                          </p>
                        </div>
                      </div>

                      <div className="max-h-0 overflow-hidden opacity-0 transition-all duration-200 group-hover:mt-3 group-hover:max-h-20 group-hover:opacity-100">
                        <p className="text-xs leading-relaxed text-white/55">
                          {rank.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );
}
