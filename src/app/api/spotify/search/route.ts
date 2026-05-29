import { NextResponse } from "next/server";

const SPOTIFY_TOKEN_URL = "https://accounts.spotify.com/api/token";
const SPOTIFY_SEARCH_URL = "https://api.spotify.com/v1/search";
const MIN_QUERY_LENGTH = 2;
const EP_MIN_TRACKS = 3; // vanaf dit aantal nummers noemen we een 'single'-release een EP
const PAGE_SIZE = 20; // Spotify's standaard paginagrootte (we mogen geen 'limit' sturen)
const ALBUM_PAGES = 5; // pagina's albums: hoger = meer van de discografie
const TRACK_PAGES = 2; // pagina's tracks
const ARTIST_PAGES = 1; // pagina's artiesten

// Volgorde waarin types getoond worden: eerst de artiest, dan albums, dan tracks.
const KIND_ORDER: Record<string, number> = {
  Artist: 0,
  Album: 1,
  EP: 2,
  Compilation: 3,
  Track: 4,
};

type SpotifyTokenCache = {
  accessToken: string;
  expiresAt: number; // tijdstip in milliseconden waarop het token verloopt
};

type SpotifyArtistRef = { id: string; name: string };
type SpotifyImage = { url: string };

type SpotifyAlbumItem = {
  id: string;
  name: string;
  album_type?: string;
  total_tracks?: number;
  artists?: SpotifyArtistRef[];
  images?: SpotifyImage[];
  release_date?: string;
};

type SpotifyTrackItem = {
  id: string;
  name: string;
  artists?: SpotifyArtistRef[];
  album?: {
    name: string;
    images?: SpotifyImage[];
    release_date?: string;
  };
};

type SpotifyArtistItem = {
  id: string;
  name: string;
  images?: SpotifyImage[];
};

type ResultArtist = { id: string; name: string };

type SearchResult = {
  id: string;
  name: string;
  artists: ResultArtist[];
  imageUrl: string | null;
  releaseYear: string;
  kind: string; // "Artist" | "Album" | "EP" | "Compilation" | "Track"
};

// Eenvoudige cache zodat we niet bij elke zoekopdracht een nieuw token ophalen.
let cachedToken: SpotifyTokenCache | null = null;

async function getAccessToken(): Promise<string> {
  const now = Date.now();
  if (cachedToken && cachedToken.expiresAt > now + 5000) {
    return cachedToken.accessToken;
  }

  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error("Spotify-credentials ontbreken in de environment variables.");
  }

  const basicAuth = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

  const response = await fetch(SPOTIFY_TOKEN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${basicAuth}`,
    },
    body: "grant_type=client_credentials",
    cache: "no-store",
  });

  if (!response.ok) {
    const detail = await response.text();
    console.error("Spotify token failed:", response.status, detail);
    throw new Error(`Kon geen Spotify-token ophalen (status ${response.status}).`);
  }

  const data = await response.json();

  if (!data.access_token) {
    console.error("Spotify token response zonder access_token:", data);
    throw new Error("Spotify-token ontbreekt in het antwoord.");
  }

  cachedToken = {
    accessToken: data.access_token,
    expiresAt: now + data.expires_in * 1000,
  };

  return cachedToken.accessToken;
}

function albumKind(albumType: string | undefined, totalTracks: number): string {
  if (albumType === "compilation") return "Compilation";
  if (albumType === "single") return totalTracks >= EP_MIN_TRACKS ? "EP" : "Single";
  return "Album";
}

function toArtists(artists?: SpotifyArtistRef[]): ResultArtist[] {
  return artists?.map((a) => ({ id: a.id, name: a.name })) ?? [];
}

function mapAlbum(album: SpotifyAlbumItem): SearchResult {
  return {
    id: album.id,
    name: album.name,
    artists: toArtists(album.artists),
    imageUrl: album.images?.[0]?.url ?? null,
    releaseYear: album.release_date ? album.release_date.slice(0, 4) : "",
    kind: albumKind(album.album_type, album.total_tracks ?? 0),
  };
}

function mapTrack(track: SpotifyTrackItem): SearchResult {
  return {
    id: track.id,
    name: track.name,
    artists: toArtists(track.artists),
    imageUrl: track.album?.images?.[0]?.url ?? null,
    releaseYear: track.album?.release_date
      ? track.album.release_date.slice(0, 4)
      : "",
    kind: "Track",
  };
}

function mapArtist(artist: SpotifyArtistItem): SearchResult {
  return {
    id: artist.id,
    name: artist.name,
    artists: [{ id: artist.id, name: artist.name }],
    imageUrl: artist.images?.[0]?.url ?? null,
    releaseYear: "",
    kind: "Artist",
  };
}

function artistNames(result: SearchResult): string {
  return result.artists.map((a) => a.name).join(", ");
}

function removeDuplicates(results: SearchResult[]): SearchResult[] {
  const seen = new Set<string>();
  const unique: SearchResult[] = [];
  for (const result of results) {
    const key = `${result.kind}|${result.name.toLowerCase()}|${artistNames(result).toLowerCase()}`;
    if (!seen.has(key)) {
      seen.add(key);
      unique.push(result);
    }
  }
  return unique;
}

function matchesAllWords(result: SearchResult, queryWords: string[]): boolean {
  const haystack = `${artistNames(result)} ${result.name}`.toLowerCase();
  return queryWords.every((word) => haystack.includes(word));
}

async function fetchPage(
  query: string,
  token: string,
  type: "album" | "track" | "artist",
  offset: number
): Promise<unknown[] | null> {
  const url = new URL(SPOTIFY_SEARCH_URL);
  url.searchParams.set("q", query);
  url.searchParams.set("type", type);
  if (offset > 0) {
    url.searchParams.set("offset", String(offset));
  }

  const response = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });

  if (!response.ok) {
    const detail = await response.text();
    console.error("Spotify search failed:", response.status, type, "offset", offset, detail);
    return null; // deze pagina overslaan, niet de hele zoekopdracht laten mislukken
  }

  const data = await response.json();
  const key = type === "album" ? "albums" : type === "track" ? "tracks" : "artists";
  return data[key]?.items ?? [];
}

async function searchSpotify(query: string): Promise<SearchResult[]> {
  const token = await getAccessToken();

  const albumOffsets = Array.from({ length: ALBUM_PAGES }, (_, i) => i * PAGE_SIZE);
  const trackOffsets = Array.from({ length: TRACK_PAGES }, (_, i) => i * PAGE_SIZE);
  const artistOffsets = Array.from({ length: ARTIST_PAGES }, (_, i) => i * PAGE_SIZE);

  const [albumPages, trackPages, artistPages] = await Promise.all([
    Promise.all(albumOffsets.map((o) => fetchPage(query, token, "album", o))),
    Promise.all(trackOffsets.map((o) => fetchPage(query, token, "track", o))),
    Promise.all(artistOffsets.map((o) => fetchPage(query, token, "artist", o))),
  ]);

  // Mislukt zelfs de eerste albumpagina, dan is er echt iets mis.
  if (albumPages[0] === null) {
    throw new Error("Spotify-zoekopdracht mislukt.");
  }

  const albumItems = albumPages.flatMap((p) => (p ?? []) as SpotifyAlbumItem[]);
  const trackItems = trackPages.flatMap((p) => (p ?? []) as SpotifyTrackItem[]);
  const artistItems = artistPages.flatMap((p) => (p ?? []) as SpotifyArtistItem[]);

  // Losse singles weglaten; die horen later op de artiestpagina, niet in de zoekresultaten.
  const albums = albumItems.map(mapAlbum).filter((a) => a.kind !== "Single");
  const tracks = trackItems.map(mapTrack);
  const artists = artistItems.map(mapArtist);

// Resultaten zonder afbeelding weglaten; die zien er rommelig uit.
  const withImage = [...artists, ...albums, ...tracks].filter(
    (r) => r.imageUrl !== null
  );
  const unique = removeDuplicates(withImage);

  // Relevantiefilter: elk zoekwoord moet in de artiest of titel voorkomen.
  const queryWords = query.toLowerCase().split(/\s+/).filter(Boolean);
  const relevant = unique.filter((item) => matchesAllWords(item, queryWords));
  const filtered = relevant.length > 0 ? relevant : unique;

  // Op type sorteren: artiest bovenaan, dan albums, EP's, compilaties, tracks.
  return [...filtered].sort(
    (a, b) => (KIND_ORDER[a.kind] ?? 9) - (KIND_ORDER[b.kind] ?? 9)
  );
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q")?.trim() ?? "";

  if (query.length < MIN_QUERY_LENGTH) {
    return NextResponse.json({ results: [] });
  }

  try {
    const results = await searchSpotify(query);
    return NextResponse.json({ results });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Onbekende fout";
    console.error("Spotify search error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
