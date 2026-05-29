import Link from "next/link";
import { notFound } from "next/navigation";
import { getAlbum } from "@/lib/spotify";
import { getMyRating, getMyRatings } from "@/lib/ratings";
import { RatingControl } from "@/components/rating-control";
import { TrackRatingSlider } from "@/components/track-rating-slider";

function formatDuration(ms: number): string {
  const totalSeconds = Math.round(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

export default async function AlbumPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const album = await getAlbum(slug);
  if (!album) {
    notFound();
  }

  const artistText = album.artists.map((a) => a.name).join(", ");
  const primaryArtist = album.artists[0];
  const backHref = primaryArtist ? `/artist/${primaryArtist.id}` : "/search";
  const backLabel = primaryArtist ? primaryArtist.name : "search";

  // Singles krijgen geen per-track rating; alleen albums, EP's en compilations wel.
  const showTrackRating = album.kind !== "Single";
  const rateLabel =
    album.kind === "EP" ? "Rate EP" : `Rate ${album.kind.toLowerCase()}`;

  const albumArtistIds = new Set(album.artists.map((a) => a.id));
  const trackIds = album.tracks.map((t) => t.id);

  const [albumRating, trackRatings] = await Promise.all([
    getMyRating("album", album.id),
    showTrackRating
      ? getMyRatings("track", trackIds)
      : Promise.resolve({} as Record<string, number>),
  ]);

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

      <div className="mx-auto w-full max-w-[900px] px-5 pb-24 pt-10 md:px-10">
        <Link
          href={backHref}
          className="truncate text-sm font-medium text-white/60 transition hover:text-white"
        >
          ← {backLabel}
        </Link>

        <header className="mt-8 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex min-w-0 flex-col gap-5 sm:flex-row sm:items-end">
            <div className="h-44 w-44 shrink-0 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] shadow-2xl">
              {album.imageUrl ? (
                <img
                  src={album.imageUrl}
                  alt={album.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-xs text-white/25">
                  No image
                </div>
              )}
            </div>

            <div className="min-w-0">
              <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-violet-300/80">
                {album.kind}
              </p>
              <h1 className="mt-1 break-words text-3xl font-semibold tracking-tight md:text-4xl">
                {album.name}
              </h1>
              <p className="mt-2 text-sm text-white/55">
                {album.artists.map((a, i) => (
                  <span key={a.id}>
                    {i > 0 ? ", " : ""}
                    <Link
                      href={`/artist/${a.id}`}
                      className="transition hover:text-white hover:underline"
                    >
                      {a.name}
                    </Link>
                  </span>
                ))}
              </p>
              <p className="mt-1 text-sm text-white/35">
                {album.releaseYear}
                {album.totalTracks ? ` · ${album.totalTracks} tracks` : ""}
              </p>
            </div>
          </div>

          <div className="shrink-0 sm:pb-1">
            <RatingControl
              variant="prominent"
              itemType="album"
              itemId={album.id}
              itemName={album.name}
              itemArtist={artistText}
              itemImageUrl={album.imageUrl}
              initialScore={albumRating}
              label={rateLabel}
            />
          </div>
        </header>

        <section className="mt-8 rounded-2xl border border-white/[0.08] bg-white/[0.02]">
          <ul className="divide-y divide-white/[0.05]">
            {album.tracks.map((track) => {
              const features = track.artists.filter(
                (a) => !albumArtistIds.has(a.id)
              );
              return (
                <li
                  key={track.id}
                  className="group flex items-center gap-3 px-4 py-3 transition hover:bg-white/[0.03]"
                >
                  <span className="w-6 shrink-0 text-right text-sm tabular-nums text-white/35">
                    {track.trackNumber || "•"}
                  </span>

                  <div className="min-w-0 flex-1">
                    <Link
                      href={`/track/${track.id}`}
                      className="block truncate text-sm font-medium text-white/90 transition hover:text-violet-100 hover:underline"
                    >
                      {track.name}
                      {track.explicit ? (
                        <span className="ml-2 align-middle rounded border border-white/15 px-1 text-[9px] font-semibold uppercase text-white/40">
                          E
                        </span>
                      ) : null}
                    </Link>
                    {features.length > 0 ? (
                      <p className="truncate text-xs text-white/40">
                        feat. {features.map((a) => a.name).join(", ")}
                      </p>
                    ) : null}
                  </div>

                  <span className="shrink-0 text-xs tabular-nums text-white/35">
                    {formatDuration(track.durationMs)}
                  </span>

                  {showTrackRating ? (
                    <TrackRatingSlider
                      itemId={track.id}
                      itemName={track.name}
                      itemArtist={track.artists.map((a) => a.name).join(", ")}
                      itemImageUrl={album.imageUrl}
                      initialScore={trackRatings[track.id] ?? null}
                    />
                  ) : null}
                </li>
              );
            })}
          </ul>
        </section>
      </div>
    </main>
  );
}
