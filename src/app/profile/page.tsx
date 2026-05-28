import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

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
    .select("username, display_name, avatar_url, bio, onboarding_completed")
    .eq("id", user.id)
    .single();

  if (error || !profile || !profile.onboarding_completed) {
    redirect("/onboarding");
  }

  const displayName = profile.display_name || profile.username || "Melodic User";
  const username = profile.username || "user";

  const avatarInitial =
    displayName?.[0]?.toUpperCase() || username?.[0]?.toUpperCase() || "M";

  const albumRankings = 0;
  const trackRankings = 0;
  const totalRankings = albumRankings + trackRankings;
  const points = 0;
  const badges = 0;

  const stats = [
    { label: "Albums", value: albumRankings.toLocaleString() },
    { label: "Tracks", value: trackRankings.toLocaleString() },
    { label: "Points", value: points.toLocaleString() },
    { label: "Badges", value: badges.toLocaleString() },
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
                  <h1 className="max-w-full break-words text-3xl font-semibold leading-tight tracking-tight md:text-4xl">
                    {displayName}
                  </h1>
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

              <dl className="grid grid-cols-2 gap-3 md:grid-cols-4">
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
                Your album and track rankings will appear here later.
              </p>
            </div>

            <div className="mt-6 rounded-2xl border border-dashed border-white/10 bg-black/20 p-8 text-center">
              <p className="text-sm font-medium text-white/70">
                No activity yet
              </p>
              <p className="mt-2 text-sm text-white/40">
                Once rankings are added, this page will start showing your music
                taste.
              </p>
            </div>
          </div>

          <aside className="rounded-3xl border border-white/[0.08] bg-white/[0.03] p-6">
            <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-violet-300/80">
              Taste profile
            </p>

            <h2 className="mt-3 text-lg font-semibold tracking-tight">
              Still warming up
            </h2>

            <p className="mt-3 text-sm leading-relaxed text-white/50">
              After you rank albums and tracks, Melodic can turn your activity
              into taste stats, favorite genres, top artists and rating patterns.
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