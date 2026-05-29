import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { HomePage } from "@/components/home/home-page";

export default async function Home() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("username, display_name, avatar_url, bio, featured_badge_id, created_at, onboarding_completed")
    .eq("id", user.id)
    .single();

  if (!profile?.username || !profile?.onboarding_completed) {
    redirect("/onboarding");
  }

  return <HomePage profile={profile} />;
}
