import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

const BADGES: Record<string, { name: string; symbol: string }> = {
  early_member: { name: "Early Member", symbol: "✦" },
};

export default async function PublicProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username: rawUsername } = await params;
  const username = decodeURIComponent(rawUsername);

  const supabase = await createClient();

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("username, display_name, avatar_url, bio, featured_badge_id")
    .eq("username", username)
    .single();

  if (error || !profile) {
    notFound();
  }

  const displayName = profile.display_name || profile.username || "Melodic User";
  const handle = profile.username || "user";
  const avatarInitial =
    displayName?.[0]?.toUpperCase() || handle?.[0]?.toUpperCase() || "M";

  const featuredBadge = profile.featured_badge_id
    ? BADGES[profile.featured_badge_id] ?? null
    : null;

  const stats = [
    { label: "Albums", value: "0" },
    { label: "Tracks", value: "0" },
    { label: "Points", value: "0" },
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

      <div className="mx-auto w-full max-w-[1100px] px-5 pb-24 pt-10 md:px-10">
        <Link
          href="/search"
          className="text-sm font-medium text-white/60 transition hover:text-white"
        >
          ← Back to search
        </Link>

        <section className="mt-8 overflow-hidden rounded-3xl border border-white/[0.08] bg-white/[0.03] shadow-2xl">
          <div className="relative h-32 overflow-hidden bg-gradient-to-r from-violet-700/40 via-fuchsia-600/20 to-indigo-600/30 md:h-36">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.18),transparent_25%),radial-gradient(circle_at_75%_10%,rgba(168,85,247,0.28),transparent_28%)]" />
            <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-[#0b0b14] to-transparent" />
          </div>

          <div className="px-5 pb-6 md:px-7 md:pb-7">
            <div className="-mt-12 flex flex-col gap-4 sm:flex-row sm:items-end sm:gap-5">
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
                <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                  <h1 className="min-w-0 max-w-full break-words text-3xl font-semibold leading-tight tracking-tight md:text-4xl">
                    {displayName}
                  </h1>

                  {featuredBadge ? (
                    <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-violet-300/30 bg-violet-500/15 px-3 py-1 text-xs font-medium text-violet-100">
                      <span aria-hidden>{featuredBadge.symbol}</span>
                      {featuredBadge.name}
                    </span>
                  ) : null}
                </div>

                <p className="mt-1 break-words text-sm text-white/45">@{handle}</p>
              </div>
            </div>

            <div className="mt-5 max-w-2xl">
              <p className="text-sm leading-relaxed text-white/60">
                {profile.bio || "No bio yet."}
              </p>
            </div>

            <dl className="mt-6 grid grid-cols-3 gap-3 border-t border-white/[0.06] pt-5">
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
        </section>

        <section className="mt-8 rounded-3xl border border-white/[0.08] bg-white/[0.03] p-6">
          <h2 className="text-lg font-semibold tracking-tight">Recent activity</h2>
          <p className="mt-1 text-sm text-white/45">
            This user&apos;s rankings will appear here later.
          </p>

          <div className="mt-6 rounded-2xl border border-dashed border-white/10 bg-black/20 p-8 text-center">
            <p className="text-sm font-medium text-white/70">No activity yet</p>
            <p className="mt-2 text-sm text-white/40">
              Once this user starts ranking music, it will show up here.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
