import type { Activity, Album, Genre, NavItem, RecentRating, Review } from "./types";

export const navItems: NavItem[] = [
  { label: "Home" },
  { label: "Discover" },
  { label: "Reviews" },
  { label: "Lists" },
  { label: "Friends", badge: "12" },
  { label: "Stats" },
  { label: "Settings" },
];

export const trendingAlbums: Album[] = [
  {
    title: "Eclipse City",
    artist: "Vanta Bloom",
    year: "2026",
    avgRating: 9.1,
    ratingCount: 2847,
    coverUrl:
      "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=900&q=70",
  },
  {
    title: "Afterimage Deluxe",
    artist: "Silk Arcade",
    year: "2026",
    avgRating: 9.4,
    ratingCount: 1923,
    coverUrl:
      "https://images.unsplash.com/photo-1510915228340-29c85a43dcfe?auto=format&fit=crop&w=900&q=70",
  },
  {
    title: "Glass Horizons",
    artist: "Nova Static",
    year: "2025",
    avgRating: 8.6,
    ratingCount: 3102,
    coverUrl:
      "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=900&q=70",
  },
  {
    title: "Neon Archive",
    artist: "Paper Satellites",
    year: "2026",
    avgRating: 8.8,
    ratingCount: 1564,
    coverUrl:
      "https://images.unsplash.com/photo-1506157786151-b8491531f063?auto=format&fit=crop&w=900&q=70",
  },
];

export const featuredReviews: Review[] = [
  {
    id: "r1",
    user: {
      name: "Elle R.",
      handle: "@ellerhythm",
      avatarUrl:
        "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=128&q=60",
    },
    album: {
      title: "Eclipse City",
      artist: "Vanta Bloom",
      year: "2026",
      coverUrl:
        "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=700&q=70",
    },
    rating: 9,
    blurb:
      "A glossy noir soundtrack for the commute you wish you had. The sequencing earns its runtime — every bridge feels intentional, and the low end never swallows the vocal.",
    wordCount: 412,
    helpful: 86,
  },
  {
    id: "r2",
    user: {
      name: "Kai M.",
      handle: "@kaimetrics",
      avatarUrl:
        "https://images.unsplash.com/photo-1544723795-3fb6469f5b39?auto=format&fit=crop&w=128&q=60",
    },
    album: {
      title: "Neon Archive",
      artist: "Paper Satellites",
      year: "2026",
      coverUrl:
        "https://images.unsplash.com/photo-1506157786151-b8491531f063?auto=format&fit=crop&w=700&q=70",
    },
    rating: 8,
    blurb:
      "Momentum without clutter. Hooks land because the mix leaves space — it's pop architecture done with taste, not volume. A few tracks run long, but the peaks justify the sprawl.",
    wordCount: 298,
    helpful: 54,
  },
];

export const networkActivity: Activity[] = [
  {
    id: "a1",
    user: {
      name: "Ari W.",
      handle: "@ariwave",
      avatarUrl:
        "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=128&q=60",
    },
    action: "rated",
    album: {
      title: "Afterimage Deluxe",
      artist: "Silk Arcade",
      coverUrl:
        "https://images.unsplash.com/photo-1510915228340-29c85a43dcfe?auto=format&fit=crop&w=512&q=60",
    },
    rating: 9,
    time: "12m",
  },
  {
    id: "a2",
    user: {
      name: "Noah K.",
      handle: "@noahknows",
      avatarUrl:
        "https://images.unsplash.com/photo-1502685104226-ee32379fefbe?auto=format&fit=crop&w=128&q=60",
    },
    action: "reviewed",
    album: {
      title: "Glass Horizons",
      artist: "Nova Static",
      coverUrl:
        "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=512&q=60",
    },
    rating: 8,
    time: "43m",
  },
  {
    id: "a3",
    user: {
      name: "June P.",
      handle: "@junepulse",
      avatarUrl:
        "https://images.unsplash.com/photo-1548142813-c348350df52b?auto=format&fit=crop&w=128&q=60",
    },
    action: "rated",
    album: {
      title: "Deep Violet FM",
      artist: "Orchid Theory",
      coverUrl:
        "https://images.unsplash.com/photo-1520166012956-add9ba0835cb?auto=format&fit=crop&w=512&q=60",
    },
    rating: 7,
    time: "2h",
  },
];

export const genres: Genre[] = [
  { name: "Synth Noir", avgScore: 8.4, albumCount: 1240 },
  { name: "Alt Pop", avgScore: 7.9, albumCount: 2104 },
  { name: "Future Bass", avgScore: 7.6, albumCount: 890 },
  { name: "Indie Bloom", avgScore: 8.1, albumCount: 1567 },
];

export const yourRecentRatings: RecentRating[] = [
  {
    title: "Midnight Bloom",
    artist: "Lumen Arcade",
    coverUrl:
      "https://images.unsplash.com/photo-1511379938547-c1f69419868d?auto=format&fit=crop&w=256&q=60",
    rating: 8,
    ratedAt: "Yesterday",
  },
  {
    title: "Deep Violet FM",
    artist: "Orchid Theory",
    coverUrl:
      "https://images.unsplash.com/photo-1520166012956-add9ba0835cb?auto=format&fit=crop&w=256&q=60",
    rating: 7,
    ratedAt: "3 days ago",
  },
  {
    title: "Eclipse City",
    artist: "Vanta Bloom",
    coverUrl:
      "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=256&q=60",
    rating: 9,
    ratedAt: "Last week",
  },
];

export const profileStats = {
  name: "Daan",
  handle: "@melodic_daan",
  avatarUrl:
    "https://images.unsplash.com/photo-1544723795-3fb6469f5b39?auto=format&fit=crop&w=256&q=60",
  avgRating: 8.2,
  totalRatings: 1284,
  totalReviews: 214,
  following: 68,
};
