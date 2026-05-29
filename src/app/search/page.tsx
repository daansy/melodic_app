"use client";

import { useState } from "react";
import Link from "next/link";

const MIN_QUERY_LENGTH = 2;

const FILTERS = [
  { id: "all", label: "All" },
  { id: "albums", label: "Albums" },
  { id: "eps", label: "EPs" },
  { id: "tracks", label: "Tracks" },
  { id: "artists", label: "Artists" },
  { id: "users", label: "Users" },
];

type ResultArtist = { id: string; name: string };

type SearchResult = {
  id: string;
  name: string;
  artists: ResultArtist[];
  imageUrl: string | null;
  releaseYear: string;
  kind: string;
  username?: string; // alleen voor User-resultaten
};

type ApiUser = {
  username: string;
  displayName: string;
  avatarUrl: string | null;
  badgeId: string | null;
};

function matchesFilter(kind: string, filter: string): boolean {
  if (filter === "all") return true;
  if (filter === "albums") return kind === "Album" || kind === "Compilation";
  if (filter === "eps") return kind === "EP";
  if (filter === "tracks") return kind === "Track";
  if (filter === "artists") return kind === "Artist";
  if (filter === "users") return kind === "User";
  return true;
}

function detailHref(result: SearchResult): string {
  if (result.kind === "User") return `/u/${result.username ?? result.id}`;
  if (result.kind === "Artist") return `/artist/${result.id}`;
  if (result.kind === "Track") return `/track/${result.id}`;
  return `/album/${result.id}`;
}

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [activeFilter, setActiveFilter] = useState("all");
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
      const [musicRes, usersRes] = await Promise.all([
        fetch(`/api/spotify/search?q=${encodeURIComponent(trimmed)}`),
        fetch(`/api/users/search?q=${encodeURIComponent(trimmed)}`),
      ]);

      const musicData = await musicRes.json();
      if (!musicRes.ok) {
        throw new Error(musicData.error || "Er ging iets mis.");
      }
      const musicResults: SearchResult[] = musicData.results ?? [];

      // Gebruikers zijn 'best effort': als dat misgaat tonen we gewoon de muziek.
      let userResults: SearchResult[] = [];
      if (usersRes.ok) {
        const usersData = await usersRes.json();
        userResults = (usersData.users ?? []).map((u: ApiUser) => ({
          id: u.username,
          name: u.displayName,
          artists: [],
          imageUrl: u.avatarUrl,
          releaseYear: "",
          kind: "User",
          username: u.username,
        }));
      }

      setResults([...userResults, ...musicResults]);
      setActiveFilter("all");
      setHasSearched(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Er ging iets mis.");
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }

  const visibleResults = results.filter((r) => matchesFilter(r.kind, activeFilter));

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
          Search music
        </h1>
        <p className="mt-2 text-sm text-white/45">
          Find albums, EPs, tracks, artists and people to follow.
        </p>

        <div className="mt-6 flex gap-3">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSearch();
            }}
            placeholder="Search for an artist, album, track or user..."
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

        {results.length > 0 ? (
          <div className="mt-6 flex flex-wrap gap-2">
            {FILTERS.map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setActiveFilter(f.id)}
                className={
                  activeFilter === f.id
                    ? "rounded-full border border-violet-400/40 bg-violet-500/20 px-4 py-1.5 text-sm font-medium text-violet-100"
                    : "rounded-full border border-white/10 bg-white/[0.03] px-4 py-1.5 text-sm text-white/60 transition hover:bg-white/[0.06] hover:text-white"
                }
              >
                {f.label}
              </button>
            ))}
          </div>
        ) : null}

        {visibleResults.length > 0 ? (
          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {visibleResults.map((result) => {
              const isArtist = result.kind === "Artist";
              const isUser = result.kind === "User";
              const isRound = isArtist || isUser;
              const href = detailHref(result);
              return (
                <div
                  key={`${result.kind}-${result.id}`}
                  className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-3 transition hover:border-violet-400/30 hover:bg-white/[0.04]"
                >
                  <Link href={href} className="group block">
                    <div className="relative">
                      <div
                        className={`aspect-square w-full overflow-hidden bg-white/[0.04] ${
                          isRound ? "rounded-full" : "rounded-xl"
                        }`}
                      >
                        {result.imageUrl ? (
                          <img
                            src={result.imageUrl}
                            alt={result.name}
                            className="h-full w-full object-cover transition group-hover:scale-105"
                          />
                        ) : isUser ? (
                          <div className="flex h-full w-full items-center justify-center bg-violet-500/10 text-2xl font-semibold text-violet-200">
                            {(result.name?.[0] || "U").toUpperCase()}
                          </div>
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-xs text-white/25">
                            No image
                          </div>
                        )}
                      </div>
                      <span className="absolute left-2 top-2 rounded-full border border-white/10 bg-black/60 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-white/85 backdrop-blur-sm">
                        {result.kind}
                      </span>
                    </div>
                  </Link>

                  <Link
                    href={href}
                    className="mt-3 block truncate text-sm font-semibold text-white transition hover:text-violet-100 hover:underline"
                  >
                    {result.name}
                  </Link>

                  {isUser ? (
                    <p className="truncate text-xs text-white/45">
                      @{result.username}
                    </p>
                  ) : !isArtist && result.artists.length > 0 ? (
                    <p className="truncate text-xs text-white/45">
                      {result.artists.map((a, i) => (
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
                  ) : null}

                  {result.releaseYear ? (
                    <p className="mt-1 text-[11px] text-white/30">
                      {result.releaseYear}
                    </p>
                  ) : null}
                </div>
              );
            })}
          </div>
        ) : null}

        {hasSearched &&
        !isLoading &&
        results.length > 0 &&
        visibleResults.length === 0 ? (
          <div className="mt-6 rounded-2xl border border-dashed border-white/10 bg-black/20 p-8 text-center">
            <p className="text-sm font-medium text-white/70">
              Nothing in this filter
            </p>
            <p className="mt-1 text-sm text-white/40">
              Try another filter or a different search.
            </p>
          </div>
        ) : null}

        {hasSearched && !isLoading && results.length === 0 && !error ? (
          <div className="mt-8 rounded-2xl border border-dashed border-white/10 bg-black/20 p-8 text-center">
            <p className="text-sm font-medium text-white/70">No results found</p>
            <p className="mt-1 text-sm text-white/40">Try a different search.</p>
          </div>
        ) : null}

        {!hasSearched && !isLoading ? (
          <div className="mt-8 rounded-2xl border border-dashed border-white/10 bg-black/20 p-8 text-center">
            <p className="text-sm font-medium text-white/70">
              Start by searching
            </p>
            <p className="mt-1 text-sm text-white/40">
              For example: an artist, an album, a song or a username.
            </p>
          </div>
        ) : null}
      </div>
    </main>
  );
}
