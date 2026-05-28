import Link from "next/link";
import Image from "next/image";
import { RatingBadge } from "@/components/ui/rating-badge";
import { profileStats, yourRecentRatings } from "@/lib/data";
import { albumSlug } from "@/lib/slug";
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
  const p = {
    name:
      user.user_metadata.full_name ||
      user.user_metadata.name ||
      "Melodic User",
  
    handle: `@${user.email?.split("@")[0] || "user"}`,
  
    avatarUrl:
      user.user_metadata.avatar_url ||
      user.user_metadata.picture ||
      "https://placehold.co/200x200",
  
    avgRating: 8.7,
    totalRatings: 0,
    totalReviews: 0,
    following: 0,
  };

  return (
    <main className="min-h-screen bg-[#05050d] text-white">
      <div
        className="pointer-events-none fixed inset-0 -z-10"
        aria-hidden
        style={{
          background:
            "radial-gradient(ellipse 80% 50% at 20% -10%, rgba(124,58,237,0.12), transparent), radial-gradient(ellipse 60% 40% at 100% 0%, rgba(217,70,239,0.06), transparent), #05050d",
        }}
      />

      <div className="mx-auto w-full max-w-[1560px] px-5 pb-24 pt-10 md:px-10 2xl:max-w-[1680px] 2xl:px-14">
        <Link
          href="/"
          className="text-sm font-medium text-white/60 transition hover:text-white"
        >
          ← Back to Home
        </Link>

        <div className="mt-10 grid grid-cols-1 gap-10 lg:grid-cols-[360px_minmax(0,1fr)] lg:gap-12">
          <div className="space-y-6">
            <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-6">
              <div className="flex items-start gap-4">
                <div className="relative h-14 w-14 overflow-hidden rounded-full ring-1 ring-white/10">
                  <Image
                    src={p.avatarUrl}
                    alt={p.name}
                    fill
                    sizes="56px"
                    className="object-cover"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <h1 className="truncate text-xl font-semibold tracking-tight text-white">
                    {p.name}
                  </h1>
                  <p className="truncate text-sm text-white/45">{p.handle}</p>
                </div>
              </div>

              <div className="mt-6 flex items-center gap-4">
                <RatingBadge score={p.avgRating} size="xl" />
                <div className="text-sm text-white/45">
                  <p className="font-medium text-white/75">Lifetime average</p>
                  <p className="mt-1">
                    Based on {p.totalRatings.toLocaleString()} rated albums
                  </p>
                </div>
              </div>

              <dl className="mt-6 grid grid-cols-3 gap-3 border-t border-white/[0.06] pt-5">
                {[
                  { label: "Ratings", value: p.totalRatings.toLocaleString() },
                  { label: "Reviews", value: String(p.totalReviews) },
                  { label: "Following", value: String(p.following) },
                ].map((s) => (
                  <div key={s.label} className="text-center">
                    <dt className="text-[10px] uppercase tracking-wider text-white/35">
                      {s.label}
                    </dt>
                    <dd className="mt-1 text-sm font-semibold tabular-nums text-white">
                      {s.value}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>

            <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-6">
              <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-violet-300/80">
                Taste note
              </p>
              <p className="mt-3 text-sm leading-relaxed text-white/55">
                You rate generously, but you don’t hand out 9s without a reason.
                Your reviews emphasize sequencing, mix clarity, and replay value.
              </p>
            </div>
          </div>

          <div className="min-w-0">
            <h2 className="text-sm font-medium uppercase tracking-wider text-white/40">
              Recent ratings
            </h2>
            <div className="mt-4 divide-y divide-white/[0.06] rounded-2xl border border-white/[0.08] bg-white/[0.02]">
              {yourRecentRatings.map((r) => (
                <Link
                  key={`${r.title}-${r.ratedAt}`}
                  href={`/album/${albumSlug(r.title, r.artist)}`}
                  className="group flex items-center gap-4 px-5 py-5 transition hover:bg-white/[0.04]"
                >
                  <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl ring-1 ring-white/10">
                    <Image
                      src={r.coverUrl}
                      alt={r.title}
                      fill
                      sizes="56px"
                      className="object-cover transition duration-300 group-hover:scale-[1.03]"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-base font-medium text-white">
                      {r.title}
                    </p>
                    <p className="truncate text-sm text-white/45">{r.artist}</p>
                    <p className="mt-1 text-xs text-white/30">{r.ratedAt}</p>
                  </div>
                  <RatingBadge score={r.rating} size="lg" />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

