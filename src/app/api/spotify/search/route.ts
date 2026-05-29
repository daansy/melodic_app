import { NextResponse } from "next/server";

const SPOTIFY_TOKEN_URL = "https://accounts.spotify.com/api/token";
const SPOTIFY_SEARCH_URL = "https://api.spotify.com/v1/search";
const SEARCH_RESULT_LIMIT = 24;
const SEARCH_MARKET = "NL";
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
  artists?: SpotifyArtist[];
  images?: SpotifyImage[];
  release_date?: string;
  total_tracks?: number;
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
    throw new Error("Kon geen Spotify-token ophalen.");
  }

  const data = await response.json();
  cachedToken = {
    accessToken: data.access_token,
    expiresAt: now + data.expires_in * 1000,
  };

  return cachedToken.accessToken;
}

async function searchAlbums(query: string) {
  const token = await getAccessToken();

  const url = new URL(SPOTIFY_SEARCH_URL);
  url.searchParams.set("q", query);
  url.searchParams.set("type", "album");
  url.searchParams.set("limit", String(SEARCH_RESULT_LIMIT));
  url.searchParams.set("market", SEARCH_MARKET);

  const response = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Spotify-zoekopdracht mislukt.");
  }

  const data = await response.json();
  const items: SpotifyAlbumItem[] = data.albums?.items ?? [];

  // We sturen alleen de velden terug die we in de UI nodig hebben.
  return items.map((album) => ({
    id: album.id,
    name: album.name,
    artist: album.artists?.map((a) => a.name).join(", ") ?? "",
    imageUrl: album.images?.[0]?.url ?? null,
    releaseYear: album.release_date ? album.release_date.slice(0, 4) : "",
    totalTracks: album.total_tracks ?? 0,
  }));
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
    console.error("Spotify search error:", error);
    return NextResponse.json(
      { error: "Er ging iets mis bij het zoeken." },
      { status: 500 }
    );
  }
}
