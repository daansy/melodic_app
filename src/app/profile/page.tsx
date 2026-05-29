import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ProfilePageClient } from "@/components/profile/profile-page-client";

type RatingRow = {
  item_type: string | null;
  item_id: string | null;
  score: number | null;
  item_name: string | null;
  item_artist: string | null;
  item_image_url: string | null;
  created_at: string | null;
};

export default async function ProfilePage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile, error } = await supabase
    .from("profiles")
    .select(
      "username, display_name, avatar_url, bio, featured_badge_id, onboarding_completed"
    )
    .eq("id", user.id)
    .single();

  if (error || !profile || !profile.onboarding_completed) {
    redirect("/onboarding");
  }

  const [
    { count: albumRankingsCount },
    { count: trackRankingsCount },
    { data: recentRatingsData },
  ] = await Promise.all([
    supabase
      .from("ratings")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("item_type", "album"),

    supabase
      .from("ratings")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("item_type", "track"),

    supabase
      .from("ratings")
      .select(
        "item_type, item_id, score, item_name, item_artist, item_image_url, created_at"
      )
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(6),
  ]);

  const displayName = profile.display_name || profile.username || "Melodic User";
  const username = profile.username || "user";

  const albumRankings = albumRankingsCount ?? 0;
  const trackRankings = trackRankingsCount ?? 0;
  const totalRankings = albumRankings + trackRankings;
  const points = albumRankings * 20 + trackRankings * 8;

  return (
    <ProfilePageClient
      profile={{
        displayName,
        username,
        bio: profile.bio || "",
        avatarUrl: profile.avatar_url,
        featuredBadgeId: profile.featured_badge_id,
      }}
      albumRankings={albumRankings}
      trackRankings={trackRankings}
      totalRankings={totalRankings}
      points={points}
      recentRatings={(recentRatingsData ?? []) as RatingRow[]}
    />
  );
}