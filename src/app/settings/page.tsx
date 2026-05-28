import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SettingsForm } from "@/components/settings/settings-form";

export default async function SettingsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("username, display_name, avatar_url, bio, onboarding_completed")
    .eq("id", user.id)
    .single();

  if (error || !profile || !profile.onboarding_completed) {
    redirect("/onboarding");
  }

  return (
    <SettingsForm
      userId={user.id}
      email={user.email ?? ""}
      profile={profile}
    />
  );
}