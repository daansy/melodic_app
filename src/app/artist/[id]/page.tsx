import Link from "next/link";
import { notFound } from "next/navigation";
import { getArtist, getArtistReleases, type AlbumSummary } from "@/lib/spotify";

function AlbumCard({ album }: { album: AlbumSummary }) {
  return (
    <Link
      href={`/album/${album.id}`}
      className="group rounded-2xl border border-white/[0.06] bg-white/[0.02] p-3 transition hover:border-violet-400/30 hover:bg-white/[0.04]"
    >
      <div className="relative">
        <div className="aspect-square w-full overflow-hidden rounded-xl bg-white/[0.04]">
          {album.imageUrl ? (
            <img
              src={album.imageUrl}
              alt={album.name}
              className="h-full w-full object-cover transition group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-xs text-white/25">
              No image
            </div>
          )}
        </div>
        <span className="absolute left-2 top-2 rounded-full border border-white/10 bg-black/60 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-white/85 backdrop-blur-sm">
          {album.kind}
        </span>
      </div>
      <p className="mt-3 truncate text-sm font-semibold text-white group-hover:text-violet-100">
        {album.name}
      </p>
      <p className="mt-1 text-[11px] text-white/30">
        {album.releaseYear}
        {album.totalTracks ? ` · ${album.totalTracks} tracks` : ""}
      </p>
    </Link>
  );
}

export default async function ArtistPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [artist, releases] = await Promise.all([
    getArtist(id),
    getArtistReleases(id),
  ]);

  if (!artist) {
    notFound();
  }

  const { albums, singles } = releases;

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

        <header className="mt-8 flex flex-col items-start gap-5 sm:flex-row sm:items-center">
          <div className="h-28 w-28 shrink-0 overflow-hidden rounded-full border border-white/10 bg-white/[0.04] md:h-32 md:w-32">
            {artist.imageUrl ? (
              <img
                src={artist.imageUrl}
                alt={artist.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-3xl font-semibold text-white/40">
                {artist.name?.[0]?.toUpperCase() ?? "A"}
              </div>
            )}
          </div>

          <div className="min-w-0">
            <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-violet-300/80">
              Artist
            </p>
            <h1 className="mt-1 break-words text-3xl font-semibold tracking-tight md:text-5xl">
              {artist.name}
            </h1>
            <p className="mt-2 text-sm text-white/45">
              {albums.length} albums · {singles.length} singles &amp; EPs
            </p>
          </div>
        </header>

        <section className="mt-10">
          <h2 className="text-lg font-semibold tracking-tight">Albums</h2>

          {albums.length > 0 ? (
            <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              {albums.map((album) => (
                <AlbumCard key={album.id} album={album} />
              ))}
            </div>
          ) : (
            <div className="mt-4 rounded-2xl border border-dashed border-white/10 bg-black/20 p-8 text-center">
              <p className="text-sm font-medium text-white/70">No albums found</p>
              <p className="mt-1 text-sm text-white/40">
                Spotify returned no albums for this artist.
              </p>
            </div>
          )}
        </section>

        {singles.length > 0 ? (
          <section className="mt-10">
            <h2 className="text-lg font-semibold tracking-tight">Singles &amp; EPs</h2>
            <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              {singles.map((album) => (
                <AlbumCard key={album.id} album={album} />
              ))}
            </div>
          </section>
        ) : null}
      </div>
    </main>
  );
}
