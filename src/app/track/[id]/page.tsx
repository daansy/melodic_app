import Link from "next/link";
import { notFound } from "next/navigation";
import { getTrack } from "@/lib/spotify";
import { getMyRating } from "@/lib/ratings";
import { RatingControl } from "@/components/rating-control";

function formatDuration(ms: number): string {
  const totalSeconds = Math.round(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

export default async function TrackPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const track = await getTrack(id);
  if (!track) {
    notFound();
  }

  const initialScore = await getMyRating("track", track.id);
  const artistText = track.artists.map((a) => a.name).join(", ");
  const backHref = track.album ? `/album/${track.album.id}` : "/search";
  const backLabel = track.album ? track.album.name : "search";

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

      <div className="mx-auto w-full max-w-[760px] px-5 pb-24 pt-10 md:px-10">
        <Link
          href={backHref}
          className="truncate text-sm font-medium text-white/60 transition hover:text-white"
        >
          ← {backLabel}
        </Link>

        <div className="mt-8 flex flex-col items-center gap-5 text-center sm:flex-row sm:items-end sm:gap-6 sm:text-left">
          <div className="h-48 w-48 shrink-0 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] shadow-2xl">
            {track.album?.imageUrl ? (
              <img
                src={track.album.imageUrl}
                alt={track.name}
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
              Single
            </p>
            <h1 className="mt-1 break-words text-3xl font-semibold tracking-tight md:text-4xl">
              {track.name}
              {track.explicit ? (
                <span className="ml-2 align-middle rounded border border-white/15 px-1 text-[10px] font-semibold uppercase text-white/40">
                  E
                </span>
              ) : null}
            </h1>
            <p className="mt-2 text-sm text-white/55">
              {track.artists.map((a, i) => (
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
            {track.album ? (
              <p className="mt-1 text-sm text-white/35">
                From{" "}
                <Link
                  href={`/album/${track.album.id}`}
                  className="transition hover:text-white hover:underline"
                >
                  {track.album.name}
                </Link>
                {track.album.releaseYear ? ` · ${track.album.releaseYear}` : ""} ·{" "}
                {formatDuration(track.durationMs)}
              </p>
            ) : (
              <p className="mt-1 text-sm text-white/35">
                {formatDuration(track.durationMs)}
              </p>
            )}
          </div>
        </div>

        <div className="mt-8 flex justify-center sm:justify-start">
          <RatingControl
            variant="prominent"
            itemType="track"
            itemId={track.id}
            itemName={track.name}
            itemArtist={artistText}
            itemImageUrl={track.album?.imageUrl ?? null}
            initialScore={initialScore}
          />
        </div>
      </div>
    </main>
  );
}
