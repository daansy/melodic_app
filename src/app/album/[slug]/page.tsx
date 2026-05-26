import Link from "next/link";
import Image from "next/image";
import { RatingBadge } from "@/components/ui/rating-badge";
import { featuredReviews, trendingAlbums } from "@/lib/data";
import { albumSlug } from "@/lib/slug";

export default async function AlbumPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const album =
    trendingAlbums.find((a) => albumSlug(a.title, a.artist) === slug) ?? null;

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
        <div className="flex items-center justify-between gap-6">
          <Link
            href="/"
            className="text-sm font-medium text-white/60 transition hover:text-white"
          >
            ← Back to Home
          </Link>
          <Link
            href="/profile"
            className="text-sm font-medium text-violet-300/90 transition hover:text-violet-200"
          >
            Profile
          </Link>
        </div>

        {album ? (
          <div className="mt-10 grid grid-cols-1 gap-10 lg:grid-cols-[320px_minmax(0,1fr)] lg:gap-12">
            <div className="space-y-4">
              <div className="relative aspect-square overflow-hidden rounded-2xl ring-1 ring-white/10 bg-white/5">
                <Image
                  src={album.coverUrl}
                  alt={`${album.title} cover`}
                  fill
                  priority
                  sizes="(max-width: 1024px) 90vw, 320px"
                  className="object-cover"
                />
              </div>
              <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-5">
                <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-violet-300/80">
                  Community average
                </p>
                <div className="mt-3 flex items-center gap-4">
                  <RatingBadge score={album.avgRating} size="xl" />
                  <div className="text-sm text-white/45">
                    <p className="text-white/70 font-medium">
                      {album.ratingCount.toLocaleString()} ratings
                    </p>
                    <p className="mt-1">
                      Weighted score over the last 7 days.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  className="mt-5 w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-3 text-sm font-medium text-white/80 transition hover:bg-white/[0.06] hover:text-white active:scale-[0.99]"
                >
                  Rate this album (demo)
                </button>
              </div>
            </div>

            <div className="min-w-0">
              <h1 className="font-sans text-4xl font-semibold tracking-tight text-white md:text-5xl">
                {album.title}
              </h1>
              <p className="mt-3 text-lg text-white/50">
                {album.artist} · {album.year}
              </p>

              <div className="mt-10">
                <h2 className="text-sm font-medium uppercase tracking-wider text-white/40">
                  Featured reviews
                </h2>
                <div className="mt-4 space-y-5">
                  {featuredReviews.map((r) => (
                    <article
                      key={r.id}
                      className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-6 transition hover:bg-white/[0.04]"
                    >
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <p className="text-sm font-medium text-white">
                            {r.user.name}{" "}
                            <span className="text-white/40">{r.user.handle}</span>
                          </p>
                          <p className="mt-1 text-xs text-white/35">
                            {r.wordCount} words · {r.helpful} marked helpful
                          </p>
                        </div>
                        <RatingBadge score={r.rating} size="lg" />
                      </div>
                      <p className="mt-4 text-[15px] leading-[1.65] text-white/70">
                        {r.blurb}
                      </p>
                    </article>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="mt-14 rounded-2xl border border-white/[0.08] bg-white/[0.02] p-8">
            <h1 className="text-2xl font-semibold tracking-tight text-white">
              Album not found
            </h1>
            <p className="mt-2 text-white/50">
              This is a demo route. Try opening an album from the Home page.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}

