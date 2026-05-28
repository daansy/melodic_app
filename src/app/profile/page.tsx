import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

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
    .select("username, display_name, avatar_url, bio, onboarding_completed")
    .eq("id", user.id)
    .single();

  if (error || !profile || !profile.onboarding_completed) {
    redirect("/onboarding");
  }

  const displayName = profile.display_name || profile.username || "Melodic User";
  const username = profile.username || "user";

  const avatarUrl =
    profile.avatar_url ||
    user.user_metadata.avatar_url ||
    user.user_metadata.picture ||
    "https://placehold.co/200x200/png";

  return (
    <main className="min-h-screen bg-[#05050d] text-white">
      <div
        className="pointer-events-none fixed inset-0 -z-10"
        aria-hidden
        style={{
          background:
            "radial-gradient(ellipse 80% 50% at 20% -10%, rgba(124,58,237,0.12), transparent), radial-gradient(ellipse 60% 40% at 100% 0%, rgba(217,70,239,0.06), transparent), #05050d",
        }}
      />

      <div className="mx-auto w-full max-w-[1200px] px-5 pb-24 pt-10 md:px-10">
        <Link
          href="/"
          className="text-sm font-medium text-white/60 transition hover:text-white"
        >
          ← Back to Home
        </Link>

        <section className="mt-10 overflow-hidden rounded-3xl border border-white/[0.08] bg-white/[0.03] shadow-2xl">
          <div className="h-36 bg-gradient-to-r from-violet-600/30 via-fuchsia-500/20 to-indigo-500/20" />

          <div className="px-6 pb-8 md:px-8">
            <div className="-mt-12 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
              <div className="flex items-end gap-5">
                <div className="relative h-24 w-24 overflow-hidden rounded-3xl border border-white/10 bg-black ring-4 ring-[#05050d]">
                  <Image
                    src={avatarUrl}
                    alt={displayName}
                    fill
                    sizes="96px"
                    className="object-cover"
                  />
                </div>

                <div className="pb-2">
                  <h1 className="text-3xl font-semibold tracking-tight">
                    {displayName}
                  </h1>
                  <p className="mt-1 text-sm text-white/45">@{username}</p>
                </div>
              </div>

              <Link
                href="/settings"
                className="rounded-full border border-white/10 bg-white/[0.04] px-5 py-2 text-sm font-medium text-white/80 transition hover:bg-white/[0.08] hover:text-white"
              >
                Edit profile
              </Link>
            </div>

            <p className="mt-6 max-w-2xl text-sm leading-relaxed text-white/55">
              {profile.bio || "No bio yet."}
            </p>

            <dl className="mt-8 grid grid-cols-3 gap-3 border-t border-white/[0.06] pt-6">
              {[
                { label: "Albums rated", value: "0" },
                { label: "Reviews", value: "0" },
                { label: "Lists", value: "0" },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-2xl border border-white/[0.06] bg-black/20 p-4 text-center"
                >
                  <dt className="text-[10px] uppercase tracking-wider text-white/35">
                    {stat.label}
                  </dt>
                  <dd className="mt-2 text-xl font-semibold tabular-nums text-white">
                    {stat.value}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        <section className="mt-8 rounded-3xl border border-white/[0.08] bg-white/[0.03] p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold tracking-tight">
                Recent activity
              </h2>
              <p className="mt-1 text-sm text-white/45">
                Your ratings and reviews will appear here later.
              </p>
            </div>
          </div>

          <div className="mt-6 rounded-2xl border border-dashed border-white/10 bg-black/20 p-8 text-center">
            <p className="text-sm font-medium text-white/70">
              No activity yet
            </p>
            <p className="mt-2 text-sm text-white/40">
              Once album ratings are added, this page will start showing your
              music taste.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}