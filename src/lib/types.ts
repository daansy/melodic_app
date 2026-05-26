export type NavItem = { label: string; badge?: string };

export type Album = {
  title: string;
  artist: string;
  year: string;
  /** Community average on Melodic's 1–10 scale */
  avgRating: number;
  ratingCount: number;
  coverUrl: string;
};

export type Review = {
  id: string;
  user: { name: string; handle: string; avatarUrl: string };
  album: { title: string; artist: string; year: string; coverUrl: string };
  rating: number;
  blurb: string;
  wordCount: number;
  helpful: number;
};

export type Activity = {
  id: string;
  user: { name: string; handle: string; avatarUrl: string };
  action: "rated" | "reviewed";
  album: { title: string; artist: string; coverUrl: string };
  rating?: number;
  time: string;
};

export type Genre = {
  name: string;
  avgScore: number;
  albumCount: number;
};

export type RecentRating = {
  title: string;
  artist: string;
  coverUrl: string;
  rating: number;
  ratedAt: string;
};
