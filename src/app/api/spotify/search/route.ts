import { NextResponse } from "next/server";

const SPOTIFY_TOKEN_URL = "https://accounts.spotify.com/api/token";
const SPOTIFY_SEARCH_URL = "https://api.spotify.com/v1/search";
const SEARCH_RESULT_LIMIT = 50; // ruime pool ophalen, daarna filteren we op relevantie
const MIN_QUERY_LENGTH = 2;

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
  artists?: SpotifyArtist[];
  images?: SpotifyImage[];
  release_date?: string;
  total_tracks?: number;
};

type AlbumResult = {
  id: string;
  name: string;
  artist: string;
  imageUrl: string | null;
  releaseYear: string;
  totalTracks: number;
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

function mapAlbum(album: SpotifyAlbumItem): AlbumResult {
  return {
    id: album.id,
    name: album.name,
    artist: album.artists?.map((a) => a.name).join(", ") ?? "",
    imageUrl: album.images?.[0]?.url ?? null,
    releaseYear: album.release_date ? album.release_date.slice(0, 4) : "",
    totalTracks: album.total_tracks ?? 0,
  };
}

function removeDuplicates(albums: AlbumResult[]): AlbumResult[] {
  const seen = new Set<string>();
  const unique: AlbumResult[] = [];
  for (const album of albums) {
    const key = `${album.name.toLowerCase()}|${album.artist.toLowerCase()}`;
    if (!seen.has(key)) {
      seen.add(key);
      unique.push(album);
    }
  }
  return unique;
}

function matchesAllWords(album: AlbumResult, queryWords: string[]): boolean {
  const haystack = `${album.artist} ${album.name}`.toLowerCase();
  return queryWords.every((word) => haystack.includes(word));
}

async function searchAlbums(query: string): Promise<AlbumResult[]> {
  const token = await getAccessToken();

  const url = new URL(SPOTIFY_SEARCH_URL);
  url.searchParams.set("q", query);
  url.searchParams.set("type", "album");
  url.searchParams.set("limit", String(SEARCH_RESULT_LIMIT));

  const response = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });

  if (!response.ok) {
    const detail = await response.text();
    console.error("Spotify search failed:", response.status, detail);
    throw new Error(`Spotify-zoekopdracht mislukt (status ${response.status}).`);
  }

  const data = await response.json();
  const items: SpotifyAlbumItem[] = data.albums?.items ?? [];

  // 1. Alleen echte albums, geen losse singles.
  const onlyAlbums = items.filter((item) => item.album_type === "album");

  // 2. Omvormen naar onze eigen vorm en dubbele edities samenvoegen.
  const mapped = removeDuplicates(onlyAlbums.map(mapAlbum));

  // 3. Relevantiefilter: elk zoekwoord moet in de artiest of titel voorkomen.
  const queryWords = query.toLowerCase().split(/\s+/).filter(Boolean);
  const relevant = mapped.filter((album) => matchesAllWords(album, queryWords));

  // 4. Laat het filter niets over, dan tonen we toch de albums zonder dat filter.
  return relevant.length > 0 ? relevant : mapped;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q")?.trim() ?? "";

  if (query.length < MIN_QUERY_LENGTH) {
    return NextResponse.json({ albums: [] });
  }

  try {
    const albums = await searchAlbums(query);
    return NextResponse.json({ albums });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Onbekende fout";
    console.error("Spotify search error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
