const SPOTIFY_TOKEN_URL = "https://accounts.spotify.com/api/token";
const SPOTIFY_API_BASE = "https://api.spotify.com/v1";
const EP_MIN_TRACKS = 3; // album_type 'single' met >= dit aantal nummers tonen we als EP
const PAGE_SIZE = 20; // Spotify's standaard paginagrootte; we sturen GEEN 'limit'
const ARTIST_SEARCH_PAGES = 6; // aantal zoekpagina's voor de discografie van een artiest
const TRACK_MAX_PAGES = 10; // veiligheidsgrens voor lange tracklijsten

type SpotifyTokenCache = { accessToken: string; expiresAt: number };
type SpotifyImage = { url: string };
type SpotifyArtistRef = { id: string; name: string };

type ArtistResponse = {
  id: string;
  name: string;
  images?: SpotifyImage[];
};

type AlbumItemResponse = {
  id: string;
  name: string;
  album_type?: string;
  total_tracks?: number;
  images?: SpotifyImage[];
  release_date?: string;
  artists?: SpotifyArtistRef[];
};

type SearchAlbumsResponse = {
  albums?: { items?: AlbumItemResponse[]; next?: string | null };
};

type TrackItemResponse = {
  id: string;
  name: string;
  track_number?: number;
  disc_number?: number;
  duration_ms?: number;
  explicit?: boolean;
  artists?: SpotifyArtistRef[];
};

type AlbumResponse = {
  id: string;
  name: string;
  album_type?: string;
  total_tracks?: number;
  images?: SpotifyImage[];
  release_date?: string;
  artists?: SpotifyArtistRef[];
  tracks?: { items?: TrackItemResponse[]; total?: number };
};

type AlbumTracksResponse = { items?: TrackItemResponse[]; next?: string | null };

type TrackResponse = {
  id: string;
  name: string;
  duration_ms?: number;
  explicit?: boolean;
  track_number?: number;
  artists?: SpotifyArtistRef[];
  album?: {
    id: string;
    name: string;
    images?: SpotifyImage[];
    release_date?: string;
  };
};

export type Artist = { id: string; name: string; imageUrl: string | null };

export type AlbumSummary = {
  id: string;
  name: string;
  imageUrl: string | null;
  releaseYear: string;
  releaseDate: string;
  kind: string;
  totalTracks: number;
};

export type AlbumTrack = {
  id: string;
  name: string;
  trackNumber: number;
  discNumber: number;
  durationMs: number;
  explicit: boolean;
  artists: { id: string; name: string }[];
};

export type AlbumDetail = {
  id: string;
  name: string;
  artists: { id: string; name: string }[];
  imageUrl: string | null;
  releaseYear: string;
  kind: string;
  totalTracks: number;
  tracks: AlbumTrack[];
};

export type TrackDetail = {
  id: string;
  name: string;
  durationMs: number;
  explicit: boolean;
  trackNumber: number;
  artists: { id: string; name: string }[];
  album: {
    id: string;
    name: string;
    imageUrl: string | null;
    releaseYear: string;
  } | null;
};

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
    throw new Error("Spotify-token ontbreekt in het antwoord.");
  }

  cachedToken = {
    accessToken: data.access_token,
    expiresAt: now + data.expires_in * 1000,
  };

  return cachedToken.accessToken;
}

async function spotifyGet<T>(path: string): Promise<T | null> {
  const token = await getAccessToken();
  const response = await fetch(`${SPOTIFY_API_BASE}${path}`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });

  if (!response.ok) {
    const detail = await response.text();
    console.error("Spotify GET failed:", response.status, path, detail);
    return null;
  }

  return (await response.json()) as T;
}

function albumKind(albumType: string | undefined, totalTracks: number): string {
  if (albumType === "compilation") return "Compilation";
  if (albumType === "single") return totalTracks >= EP_MIN_TRACKS ? "EP" : "Single";
  return "Album";
}

function mapAlbumSummary(item: AlbumItemResponse): AlbumSummary {
  const total = item.total_tracks ?? 0;
  return {
    id: item.id,
    name: item.name,
    imageUrl: item.images?.[0]?.url ?? null,
    releaseYear: item.release_date ? item.release_date.slice(0, 4) : "",
    releaseDate: item.release_date ?? "",
    kind: albumKind(item.album_type, total),
    totalTracks: total,
  };
}

// Ontdubbelen op type + naam: zo voegen we markt-duplicaten (zelfde naam) samen,
// maar houden we een album en een gelijknamige single apart.
function dedupeByName(items: AlbumSummary[]): AlbumSummary[] {
  const seen = new Set<string>();
  const unique: AlbumSummary[] = [];
  for (const item of items) {
    const key = `${item.kind}|${item.name.trim().toLowerCase()}`;
    if (!seen.has(key)) {
      seen.add(key);
      unique.push(item);
    }
  }
  return unique;
}

function sortByReleaseDesc(items: AlbumSummary[]): AlbumSummary[] {
  return [...items].sort((a, b) => (a.releaseDate < b.releaseDate ? 1 : -1));
}

// De 'artist albums'-endpoint is geblokkeerd voor dev-apps, dus we halen de
// releases via de zoek-endpoint op (die werkt wel) en filteren op de artiest.
async function fetchArtistAlbumsViaSearch(
  artistId: string,
  artistName: string,
  maxPages: number
): Promise<AlbumItemResponse[]> {
  const all: AlbumItemResponse[] = [];

  for (let page = 0; page < maxPages; page++) {
    const params = new URLSearchParams({ q: artistName, type: "album" });
    const offset = page * PAGE_SIZE;
    if (offset > 0) params.set("offset", String(offset));

    const data = await spotifyGet<SearchAlbumsResponse>(
      `/search?${params.toString()}`
    );

    const items = data?.albums?.items ?? [];
    if (items.length === 0) break;
    all.push(...items);
    if (!data?.albums?.next) break;
  }

  // Alleen releases van déze artiest houden (zoeken geeft soms anderen terug).
  return all.filter((item) =>
    (item.artists ?? []).some((a) => a.id === artistId)
  );
}

export async function getArtist(id: string): Promise<Artist | null> {
  const data = await spotifyGet<ArtistResponse>(`/artists/${id}`);
  if (!data) return null;
  return {
    id: data.id,
    name: data.name,
    imageUrl: data.images?.[0]?.url ?? null,
  };
}

export async function getArtistReleases(
  id: string,
  name: string
): Promise<{ albums: AlbumSummary[]; singles: AlbumSummary[] }> {
  const items = await fetchArtistAlbumsViaSearch(id, name, ARTIST_SEARCH_PAGES);
  const mapped = dedupeByName(items.map(mapAlbumSummary));

  // Zelf indelen op basis van het type, niet op Spotify's groepering.
  const albums = sortByReleaseDesc(
    mapped.filter((a) => a.kind === "Album" || a.kind === "Compilation")
  );
  const singles = sortByReleaseDesc(
    mapped.filter((a) => a.kind === "EP" || a.kind === "Single")
  );

  return { albums, singles };
}

function mapTrack(item: TrackItemResponse): AlbumTrack {
  return {
    id: item.id,
    name: item.name,
    trackNumber: item.track_number ?? 0,
    discNumber: item.disc_number ?? 1,
    durationMs: item.duration_ms ?? 0,
    explicit: Boolean(item.explicit),
    artists: (item.artists ?? []).map((a) => ({ id: a.id, name: a.name })),
  };
}

export async function getAlbum(id: string): Promise<AlbumDetail | null> {
  const data = await spotifyGet<AlbumResponse>(`/albums/${id}`);
  if (!data) return null;

  let trackItems: TrackItemResponse[] = data.tracks?.items ?? [];
  const total = data.tracks?.total ?? trackItems.length;

  let guard = 0;
  while (trackItems.length < total && guard < TRACK_MAX_PAGES) {
    const params = new URLSearchParams({ offset: String(trackItems.length) });
    const more = await spotifyGet<AlbumTracksResponse>(
      `/albums/${id}/tracks?${params.toString()}`
    );
    if (!more || !Array.isArray(more.items) || more.items.length === 0) break;
    trackItems = trackItems.concat(more.items);
    guard++;
  }

  return {
    id: data.id,
    name: data.name,
    artists: (data.artists ?? []).map((a) => ({ id: a.id, name: a.name })),
    imageUrl: data.images?.[0]?.url ?? null,
    releaseYear: data.release_date ? data.release_date.slice(0, 4) : "",
    kind: albumKind(data.album_type, data.total_tracks ?? trackItems.length),
    totalTracks: data.total_tracks ?? trackItems.length,
    tracks: trackItems.map(mapTrack),
  };
}

export async function getTrack(id: string): Promise<TrackDetail | null> {
  const data = await spotifyGet<TrackResponse>(`/tracks/$
