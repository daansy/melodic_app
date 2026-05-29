"use client";

import { useState } from "react";
import Link from "next/link";

const MIN_QUERY_LENGTH = 2;

type AlbumResult = {
  id: string;
  name: string;
  artist: string;
  imageUrl: string | null;
  releaseYear: string;
  totalTracks: number;
};

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [albums, setAlbums] = useState<AlbumResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  async function handleSearch() {
    const trimmed = query.trim();
    if (trimmed.length < MIN_QUERY_LENGTH) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/spotify/search?q=${encodeURIComponent(trimmed)}`
      );
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Er ging iets mis.");
      }

      setAlbums(data.albums ?? []);
      setHasSearched(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Er ging iets mis.");
      setAlbums([]);
    } finally {
      setIsLoading(false);
    }
  }

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
          href="/"
          className="text-sm font-medium text-white/60 transition hover:text-white"
        >
          ← Back to Home
        </Link>

        <h1 className="mt-6 text-3xl font-semibold tracking-tight md:text-4xl">
          Search albums
        </h1>
        <p className="mt-2 text-sm text-white/45">
          Find an album to rate. Powered by the Spotify catalog.
        </p>

        <div className="mt-6 flex gap-3">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSearch();
            }}
            placeholder="Search for an album or artist..."
            className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-3 text-sm text-white placeholder-white/35 outline-none transition focus:border-violet-400/40 focus:bg-white/[0.06]"
          />
          <button
            type="button"
            onClick={handleSearch}
            disabled={isLoading}
            className="shrink-0 rounded-2xl border border-violet-400/30 bg-violet-500/15 px-5 py-3 text-sm font-medium text-violet-100 transition hover:bg-violet-500/25 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isLoading ? "Searching..." : "Search"}
          </button>
        </div>

        {error ? (
          <p className="mt-4 rounded-xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {error}
          </p>
        ) : null}

        {albums.length > 0 ? (
          <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {albums.map((album) => (
              <Link
                key={album.id}
                href={`/album/${album.id}`}
                className="group rounded-2xl border border-white/[0.06] bg-white/[0.02] p-3 transition hover:-translate-y-0.5 hover:border-violet-400/30 hover:bg-white/[0.04]"
              >
                <div className="aspect-square w-full overflow-hidden rounded-xl bg-white/[0.04]">
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
                <p className="mt-3 truncate text-sm font-semibold text-white">
                  {album.name}
                </p>
                <p className="truncate text-xs text-white/45">{album.artist}</p>
                <p className="mt-1 text-[11px] text-white/30">
                  {album.releaseYear}
                </p>
              </Link>
            ))}
          </div>
        ) : null}

        {hasSearched && !isLoading && albums.length === 0 && !error ? (
          <div className="mt-8 rounded-2xl border border-dashed border-white/10 bg-black/20 p-8 text-center">
            <p className="text-sm font-medium text-white/70">No albums found</p>
            <p className="mt-1 text-sm text-white/40">Try a different search.</p>
          </div>
        ) : null}

        {!hasSearched && !isLoading ? (
          <div className="mt-8 rounded-2xl border border-dashed border-white/10 bg-black/20 p-8 text-center">
            <p className="text-sm font-medium text-white/70">
              Start by searching for an album
            </p>
            <p className="mt-1 text-sm text-white/40">
              For example: an artist name or an album title.
            </p>
          </div>
        ) : null}
      </div>
    </main>
  );
}
