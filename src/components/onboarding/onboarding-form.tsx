"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export function OnboardingForm({
  userId,
  email,
}: {
  userId: string;
  email: string;
}) {
  const router = useRouter();
  const supabase = createClient();

  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const cleanUsername = username
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9_]/g, "");

    if (cleanUsername.length < 3) {
      setError("Username must be at least 3 characters.");
      setLoading(false);
      return;
    }

    const { error } = await supabase
      .from("profiles")
      .update({
        username: cleanUsername,
        display_name: displayName.trim() || cleanUsername,
        bio: bio.trim() || null,
        onboarding_completed: true,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId);

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    router.push("/");
    router.refresh();
  }

  return (
    <main className="min-h-screen bg-[#05050d] px-6 py-10 text-white">
      <div className="mx-auto flex min-h-[80vh] max-w-xl items-center">
        <form
          onSubmit={handleSubmit}
          className="w-full rounded-3xl border border-white/10 bg-white/[0.03] p-8 shadow-2xl"
        >
          <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-violet-300/80">
            Welcome to Melodic
          </p>

          <h1 className="mt-3 text-3xl font-semibold tracking-tight">
            Choose your identity
          </h1>

          <p className="mt-3 text-sm leading-relaxed text-white/50">
            Your Google or Spotify account is only used for login. Your Melodic
            profile can have its own username and style.
          </p>

          <div className="mt-8 space-y-5">
            <div>
              <label className="text-sm text-white/70">Username *</label>
              <input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="daansy"
                className="mt-2 w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none transition focus:border-violet-400/40"
              />
              <p className="mt-2 text-xs text-white/35">
                Lowercase letters, numbers and underscores only.
              </p>
            </div>

            <div>
              <label className="text-sm text-white/70">Display name</label>
              <input
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Daan"
                className="mt-2 w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none transition focus:border-violet-400/40"
              />
            </div>

            <div>
              <label className="text-sm text-white/70">Bio</label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Albums, late nights, and unnecessary decimals."
                rows={4}
                className="mt-2 w-full resize-none rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none transition focus:border-violet-400/40"
              />
            </div>
          </div>

          {error ? (
            <p className="mt-5 rounded-xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
              {error}
            </p>
          ) : null}

          <button
            disabled={loading}
            className="mt-8 w-full rounded-full bg-violet-500 px-6 py-3 text-sm font-medium text-white transition hover:bg-violet-400 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Saving..." : "Continue to Melodic"}
          </button>

          <p className="mt-5 text-center text-xs text-white/35">
            Signed in as {email}
          </p>
        </form>
      </div>
    </main>
  );
}