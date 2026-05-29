import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

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

function formatDate(date: string | null) {
  if (!date) {
    return "Recently";
  }

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
  }).format(new Date(date));
}

export default async function ProfilePage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile, error } = await supabase
    .from("profiles")
    .select(
      "username, display_name, avatar_url, bio, featured_badge_id, onboarding_completed"
    )
    .eq("id", user.id)
    .single();

  if (error || !profile || !profile.onboarding_completed) {
    redirect("/onboarding");
  }

  const [
    { count: albumRankingsCount },
    { count: trackRankingsCount },
    { data: recentRatingsData },
  ] = await Promise.all([
    supabase
      .from("ratings")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("item_type", "album"),

    supabase
      .from("ratings")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("item_type", "track"),

    supabase
      .from("ratings")
      .select(
        "item_type, item_id, score, item_name, item_artist, item_image_url, created_at"
      )
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(6),
  ]);

  const displayName = profile.display_name || profile.username || "Melodic User";
  const username = profile.username || "user";

  const avatarInitial =
    displayName?.[0]?.toUpperCase() || username?.[0]?.toUpperCase() || "M";

  const albumRankings = albumRankingsCount ?? 0;
  const trackRankings = trackRankingsCount ?? 0;
  const totalRankings = albumRankings + trackRankings;

  const points = albumRankings * 20 + trackRankings * 8;

  const recentRatings = (recentRatingsData ?? []) as RatingRow[];

  const featuredBadge =
    BADGES.find((badge) => badge.id === profile.featured_badge_id) ?? null;

  const unlockedBadges = BADGES.filter((badge) => badge.unlocked);

  const stats = [
    { label: "Albums", value: albumRankings.toLocaleString() },
    { label: "Tracks", value: trackRankings.toLocaleString() },
    { label: "Points", value: points.toLocaleString() },
  ];

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
          <div className="relative h-32 overflow-hidden bg-gradient-to-r from-violet-700/40 via-fuchsia-600/20 to-indigo-600/30 md:h-36">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.18),transparent_25%),radial-gradient(circle_at_75%_10%,rgba(168,85,247,0.28),transparent_28%)]" />
            <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-[#0b0b14] to-transparent" />
          </div>

          <div className="px-5 pb-6 md:px-7 md:pb-7">
            <div className="-mt-12 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
              <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-end sm:gap-5">
                <div className="relative flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-3xl border border-white/10 bg-[#080810] text-4xl font-semibold text-white/45 ring-4 ring-[#0b0b14] md:h-28 md:w-28">
                  {profile.avatar_url ? (
                    <img
                      src={profile.avatar_url}
                      alt={displayName}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    avatarInitial
                  )}
                </div>

                <div className="min-w-0 pb-1">
                  <div className="flex min-w-0 flex-wrap items-center gap-2">
                    <h1 className="max-w-full break-words text-3xl font-semibold leading-tight tracking-tight md:text-4xl">
                      {displayName}
                    </h1>

                    {featuredBadge ? (
                      <span className="shrink-0 rounded-full border border-violet-300/30 bg-violet-500/15 px-3 py-1 text-xs font-medium text-violet-100">
                        {featuredBadge.symbol} {featuredBadge.name}
                      </span>
                    ) : null}
                  </div>

                  <p className="mt-1 break-words text-sm text-white/45">
                    @{username}
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

            <div className="mt-5 max-w-2xl">
              <p className="text-sm leading-relaxed text-white/60">
                {profile.bio || "No bio yet."}
              </p>
            </div>

            <div className="mt-6 border-t border-white/[0.06] pt-5">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
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

              <div className="grid grid-cols-1 gap-3 lg:grid-cols-[minmax(0,1fr)_300px]">
                <dl className="grid grid-cols-3 gap-3">
                  {stats.map((stat) => (
                    <div
                      key={stat.label}
                      className="rounded-2xl border border-white/[0.06] bg-black/20 px-4 py-3 text-center"
                    >
                      <dt className="text-[10px] uppercase tracking-wider text-white/35">
                        {stat.label}
                      </dt>
                      <dd className="mt-1 text-xl font-semibold tabular-nums text-white">
                        {stat.value}
                      </dd>
                    </div>
                  ))}
                </dl>

                <Link
                  href="/profile/badges"
                  className="group rounded-2xl border border-white/[0.06] bg-black/20 px-4 py-3 transition hover:border-violet-400/30 hover:bg-violet-500/[0.06]"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-white/35">
                        Badges
                      </p>
                      <p className="mt-1 text-sm font-semibold text-white">
                        {unlockedBadges.length} unlocked
                      </p>
                    </div>

                    <span className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-xs text-white/45 transition group-hover:border-violet-400/30 group-hover:text-violet-200">
                      View
                    </span>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2">
                    {BADGES.slice(0, 3).map((badge) => (
                      <span
                        key={badge.id}
                        className={
                          badge.unlocked
                            ? "rounded-full border border-violet-300/30 bg-violet-500/15 px-2.5 py-1 text-xs text-violet-100"
                            : "rounded-full border border-white/[0.06] bg-white/[0.03] px-2.5 py-1 text-xs text-white/30"
                        }
                      >
                        {badge.name}
                      </span>
                    ))}
                  </div>

                  <p className="mt-3 text-xs leading-relaxed text-white/35">
                    Unlock badges by ranking music, writing reviews and building
                    your taste profile.
                  </p>
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
    </main>
  );
}