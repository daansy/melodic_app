import { NextResponse } from "next/server";

const SPOTIFY_TOKEN_URL = "https://accounts.spotify.com/api/token";
const SPOTIFY_SEARCH_URL = "https://api.spotify.com/v1/search";
const MIN_QUERY_LENGTH = 2;
const EP_MIN_TRACKS = 4; // vanaf dit aantal nummers noemen we een 'single'-release een EP
const PAGE_SIZE = 20; // Spotify's standaard paginagrootte (we mogen geen 'limit' sturen)
const PAGES_TO_FETCH = 2; // aantal pagina's voor meer resultaten; verhoog dit voor nog meer

type SpotifyTokenCache = {
  accessToken: string;
  expiresAt: number; // tijdstip in milliseconden waarop het token verloopt
};

type SpotifyArtist = { name: string };
type SpotifyImage = { url: string };

type SpotifyAlbumItem = {
  id: string;
  name: string;
  album_type?: string;
  total_tracks?: number;
  artists?: SpotifyArtist[];
  images?: SpotifyImage[];
  release_date?: string;
};

type SpotifyTrackItem = {
  id: string;
  name: string;
  artists?: SpotifyArtist[];
  album?: {
    name: string;
    images?: SpotifyImage[];
    release_date?: string;
  };
};

type SearchResult = {
  id: string;
  name: string;
  artist: string;
  imageUrl: string | null;
  releaseYear: string;
  kind: string; // "Album" | "EP" | "Single" | "Compilation" | "Track"
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

function mapAlbum(album: SpotifyAlbumItem): SearchResult {
  return {
    id: album.id,
    name: album.name,
    artist: album.artists?.map((a) => a.name).join(", ") ?? "",
    imageUrl: album.images?.[0]?.url ?? null,
    releaseYear: album.release_date ? album.release_date.slice(0, 4) : "",
    kind: albumKind(album.album_type, album.total_tracks ?? 0),
  };
}

function mapTrack(track: SpotifyTrackItem): SearchResult {
  return {
    id: track.id,
    name: track.name,
    artist: track.artists?.map((a) => a.name).join(", ") ?? "",
    imageUrl: track.album?.images?.[0]?.url ?? null,
    releaseYear: track.album?.release_date
      ? track.album.release_date.slice(0, 4)
      : "",
    kind: "Track",
  };
}

function removeDuplicates(results: SearchResult[]): SearchResult[] {
  const seen = new Set<string>();
  const unique: SearchResult[] = [];
  for (const result of results) {
    const key = `${result.kind}|${result.name.toLowerCase()}|${result.artist.toLowerCase()}`;
    if (!seen.has(key)) {
      seen.add(key);
      unique.push(result);
    }
  }
  return unique;
}

function matchesAllWords(result: SearchResult, queryWords: string[]): boolean {
  const haystack = `${result.artist} ${result.name}`.toLowerCase();
  return queryWords.every((word) => haystack.includes(word));
}

async function fetchSearchPage(query: string, token: string, offset: number) {
  const url = new URL(SPOTIFY_SEARCH_URL);
  url.searchParams.set("q", query);
  url.searchParams.set("type", "album,track");
  if (offset > 0) {
    url.searchParams.set("offset", String(offset));
  }

  const response = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });

  if (!response.ok) {
    const detail = await response.text();
    console.error("Spotify search failed:", response.status, "offset", offset, detail);
    return null; // deze pagina overslaan, niet de hele zoekopdracht laten mislukken
  }

  const data = await response.json();
  return {
    albums: (data.albums?.items ?? []) as SpotifyAlbumItem[],
    tracks: (data.tracks?.items ?? []) as SpotifyTrackItem[],
  };
}

async function searchSpotify(query: string): Promise<SearchResult[]> {
  const token = await getAccessToken();

  // Meerdere pagina's tegelijk ophalen voor meer resultaten.
  const offsets = Array.from({ length: PAGES_TO_FETCH }, (_, i) => i * PAGE_SIZE);
  const pages = await Promise.all(
    offsets.map((offset) => fetchSearchPage(query, token, offset))
  );

  // Mislukt zelfs de eerste pagina, dan is er echt iets mis.
  if (pages[0] === null) {
    throw new Error("Spotify-zoekopdracht mislukt.");
  }

  const albumItems: SpotifyAlbumItem[] = [];
  const trackItems: SpotifyTrackItem[] = [];
  for (const page of pages) {
    if (page) {
      albumItems.push(...page.albums);
      trackItems.push(...page.tracks);
    }
  }

  const albums = albumItems.map(mapAlbum);
  const tracks = trackItems.map(mapTrack);

  // Singles weglaten waarvan hetzelfde nummer ook al als losse track terugkomt.
  const trackSignatures = new Set(
    tracks.map((t) => `${t.name.toLowerCase()}|${t.artist.toLowerCase()}`)
  );
  const albumsWithoutRedundantSingles = albums.filter((album) => {
    if (album.kind !== "Single") return true;
    const signature = `${album.name.toLowerCase()}|${album.artist.toLowerCase()}`;
    return !trackSignatures.has(signature);
  });

  // Releases eerst, daarna losse tracks; dubbele edities samenvoegen.
  const combined = [...albumsWithoutRedundantSingles, ...tracks];
  const unique = removeDuplicates(combined);

  // Relevantiefilter: elk zoekwoord moet in de artiest of titel voorkomen.
  const queryWords = query.toLowerCase().split(/\s+/).filter(Boolean);
  const relevant = unique.filter((item) => matchesAllWords(item, queryWords));

  return relevant.length > 0 ? relevant : unique;
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
