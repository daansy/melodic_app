"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const MAX_AVATAR_SIZE = 1024 * 1024; // 1MB
const ALLOWED_AVATAR_TYPES = ["image/jpeg", "image/png", "image/webp"];

type SettingsProfile = {
  username: string | null;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
};

export function SettingsForm({
  userId,
  email,
  profile,
}: {
  userId: string;
  email: string;
  profile: SettingsProfile;
}) {
  const router = useRouter();
  const supabase = createClient();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const username = profile.username || "user";
  const initialDisplayName = profile.display_name || profile.username || "";

  const [displayName, setDisplayName] = useState(initialDisplayName);
  const [bio, setBio] = useState(profile.bio || "");

  const [currentAvatarUrl, setCurrentAvatarUrl] = useState(
    profile.avatar_url || ""
  );
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState("");
  const [avatarRemoved, setAvatarRemoved] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const avatarInitial =
    displayName?.[0]?.toUpperCase() || username?.[0]?.toUpperCase() || "M";

  const visibleAvatarUrl = avatarPreview || currentAvatarUrl;

  function openFilePicker() {
    fileInputRef.current?.click();
  }

  function handleAvatarChange(file: File | null) {
    setError("");
    setSuccess("");
    setAvatarFile(null);
    setAvatarPreview("");

    if (!file) {
      return;
    }

    if (!ALLOWED_AVATAR_TYPES.includes(file.type)) {
      setError("Please upload a JPG, PNG or WebP image.");
      return;
    }

    if (file.size > MAX_AVATAR_SIZE) {
      setError("Profile picture must be smaller than 1MB.");
      return;
    }

    const previewUrl = URL.createObjectURL(file);

    setAvatarFile(file);
    setAvatarPreview(previewUrl);
    setAvatarRemoved(false);
  }

  function removeSelectedAvatar() {
    setError("");
    setSuccess("");
    setAvatarFile(null);
    setAvatarPreview("");
  }

  function removeCurrentAvatar() {
    setError("");
    setSuccess("");
    setAvatarFile(null);
    setAvatarPreview("");
    setCurrentAvatarUrl("");
    setAvatarRemoved(true);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();

    setError("");
    setSuccess("");
    setLoading(true);

    const cleanDisplayName = displayName.trim().slice(0, 32);
    const cleanBio = bio.trim().slice(0, 160);

    if (!cleanDisplayName) {
      setError("Display name cannot be empty.");
      setLoading(false);
      return;
    }

    let nextAvatarUrl: string | null = currentAvatarUrl || null;

    if (avatarRemoved) {
      nextAvatarUrl = null;
    }

    if (avatarFile) {
      if (!ALLOWED_AVATAR_TYPES.includes(avatarFile.type)) {
        setError("Please upload a JPG, PNG or WebP image.");
        setLoading(false);
        return;
      }

      if (avatarFile.size > MAX_AVATAR_SIZE) {
        setError("Profile picture must be smaller than 1MB.");
        setLoading(false);
        return;
      }

      const fileExtension =
        avatarFile.type === "image/png"
          ? "png"
          : avatarFile.type === "image/webp"
            ? "webp"
            : "jpg";

      const filePath = `${userId}/avatar-${Date.now()}.${fileExtension}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, avatarFile, {
          cacheControl: "3600",
          contentType: avatarFile.type,
          upsert: true,
        });

      if (uploadError) {
        setError(uploadError.message);
        setLoading(false);
        return;
      }

      const { data } = supabase.storage.from("avatars").getPublicUrl(filePath);

      nextAvatarUrl = data.publicUrl;
    }

    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        display_name: cleanDisplayName,
        bio: cleanBio || null,
        avatar_url: nextAvatarUrl,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId);

    if (updateError) {
      setError(updateError.message);
      setLoading(false);
      return;
    }

    setCurrentAvatarUrl(nextAvatarUrl || "");
    setAvatarFile(null);
    setAvatarPreview("");
    setAvatarRemoved(false);
    setSuccess("Profile updated.");

    setLoading(false);
    router.refresh();
  }

  return (
    <main className="min-h-screen bg-[#05050d] px-5 py-10 text-white md:px-10">
      <div
        className="pointer-events-none fixed inset-0 -z-10"
        aria-hidden
        style={{
          background:
            "radial-gradient(ellipse 80% 50% at 20% -10%, rgba(124,58,237,0.14), transparent), radial-gradient(ellipse 60% 40% at 100% 0%, rgba(217,70,239,0.08), transparent), #05050d",
        }}
      />

      <div className="mx-auto w-full max-w-[1180px]">
        <Link
          href="/profile"
          className="text-sm font-medium text-white/60 transition hover:text-white"
        >
          ← Back to profile
        </Link>

        <div className="mt-8">
          <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-violet-300/80">
            Settings
          </p>

          <h1 className="mt-3 text-3xl font-semibold tracking-tight">
            Manage your account
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/50">
            Edit your public profile. Account, privacy and notification settings
            can live here later.
          </p>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-[260px_minmax(0,1fr)]">
          <aside className="h-fit rounded-3xl border border-white/[0.08] bg-white/[0.03] p-3">
            {[
              { label: "Profile", active: true },
              { label: "Account", active: false },
              { label: "Privacy", active: false },
              { label: "Notifications", active: false },
              { label: "Connected accounts", active: false },
            ].map((item) => (
              <button
                key={item.label}
                type="button"
                disabled={!item.active}
                className={
                  item.active
                    ? "flex w-full items-center justify-between rounded-2xl bg-violet-500/15 px-4 py-3 text-left text-sm font-medium text-violet-100"
                    : "flex w-full cursor-not-allowed items-center justify-between rounded-2xl px-4 py-3 text-left text-sm font-medium text-white/35"
                }
              >
                <span>{item.label}</span>
                {!item.active ? (
                  <span className="text-[10px] font-medium uppercase tracking-wider text-white/25">
                    Soon
                  </span>
                ) : null}
              </button>
            ))}
          </aside>

          <form onSubmit={handleSave} className="space-y-6">
            <section className="overflow-hidden rounded-3xl border border-white/[0.08] bg-white/[0.03] shadow-2xl">
              <div className="relative h-24 bg-gradient-to-r from-violet-700/35 via-fuchsia-600/20 to-indigo-600/30 md:h-28">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.16),transparent_25%),radial-gradient(circle_at_75%_10%,rgba(168,85,247,0.28),transparent_28%)]" />
                <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-[#0b0b14] to-transparent" />
              </div>

              <div className="px-6 pb-6 md:px-8">
                <div className="-mt-10 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
                  <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-end sm:gap-5">
                    <button
                      type="button"
                      onClick={openFilePicker}
                      className="group relative flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-3xl border border-white/10 bg-[#080810] text-4xl font-semibold text-white/45 ring-4 ring-[#0b0b14]"
                      aria-label="Change profile picture"
                    >
                      {visibleAvatarUrl ? (
                        <img
                          src={visibleAvatarUrl}
                          alt="Profile preview"
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        avatarInitial
                      )}

                      <div className="absolute inset-0 flex items-center justify-center bg-black/60 text-xs font-semibold text-white opacity-0 transition group-hover:opacity-100">
                        Change photo
                      </div>
                    </button>

                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      className="hidden"
                      onChange={(e) =>
                        handleAvatarChange(e.target.files?.[0] ?? null)
                      }
                    />

                    <div className="min-w-0 pb-1">
                      <div className="flex min-w-0 flex-wrap items-center gap-2">
                        <h2 className="max-w-full break-words text-2xl font-semibold leading-tight tracking-tight md:text-3xl">
                          {displayName || username}
                        </h2>

                        <button
                          type="button"
                          disabled
                          className="shrink-0 cursor-not-allowed rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-[11px] font-medium text-white/35"
                        >
                          Choose badge
                        </button>
                      </div>

                      <p className="mt-1 break-words text-sm text-white/45">
                        @{username}
                      </p>

                      <p className="mt-2 text-xs text-white/30">
                        Your username is permanent and cannot be changed.
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {avatarFile ? (
                      <button
                        type="button"
                        onClick={removeSelectedAvatar}
                        className="rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-xs font-medium text-white/45 transition hover:border-red-300/30 hover:text-red-200"
                      >
                        Remove selected
                      </button>
                    ) : null}

                    {currentAvatarUrl ? (
                      <button
                        type="button"
                        onClick={removeCurrentAvatar}
                        className="rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-xs font-medium text-white/45 transition hover:border-red-300/30 hover:text-red-200"
                      >
                        Remove photo
                      </button>
                    ) : null}
                  </div>
                </div>

                <p className="mt-5 text-xs leading-relaxed text-white/35">
                  JPG, PNG or WebP only. Max 1MB. Hover over your avatar to
                  change it.
                </p>

                {avatarFile ? (
                  <p className="mt-2 max-w-full truncate text-xs text-white/35">
                    Selected: {avatarFile.name}
                  </p>
                ) : null}
              </div>
            </section>

            <section className="rounded-3xl border border-white/[0.08] bg-white/[0.03] p-6 md:p-8">
              <div>
                <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-violet-300/80">
                  Public profile
                </p>

                <h2 className="mt-3 text-xl font-semibold tracking-tight">
                  Profile details
                </h2>

                <p className="mt-2 text-sm leading-relaxed text-white/45">
                  These details are shown on your public Melodic profile.
                </p>
              </div>

              <div className="mt-7 space-y-6">
                <div>
                  <label className="text-sm font-medium text-white/75">
                    Username
                  </label>
                  <input
                    value={`@${username}`}
                    disabled
                    className="mt-2 w-full cursor-not-allowed rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-white/35 outline-none"
                  />
                  <p className="mt-2 text-xs text-white/35">
                    Your username is permanent and cannot be changed.
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-white/75">
                    Display name
                  </label>
                  <input
                    maxLength={32}
                    value={displayName}
                    onChange={(e) =>
                      setDisplayName(e.target.value.slice(0, 32))
                    }
                    className="mt-2 w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-white placeholder:text-white/35 outline-none transition focus:border-violet-400/40"
                  />
                  <p className="mt-2 text-right text-xs tabular-nums text-white/35">
                    {displayName.length}/32
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-white/75">
                    Bio
                  </label>
                  <textarea
                    maxLength={160}
                    value={bio}
                    onChange={(e) => setBio(e.target.value.slice(0, 160))}
                    placeholder="Tell people about your taste."
                    rows={5}
                    className="mt-2 w-full resize-none rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-white placeholder:text-white/35 outline-none transition focus:border-violet-400/40"
                  />
                  <p className="mt-2 text-right text-xs tabular-nums text-white/35">
                    {bio.length}/160
                  </p>
                </div>
              </div>
            </section>

            {error ? (
              <p className="rounded-xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                {error}
              </p>
            ) : null}

            {success ? (
              <p className="rounded-xl border border-emerald-400/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
                {success}
              </p>
            ) : null}

            <div className="sticky bottom-4 z-10 rounded-2xl border border-white/[0.08] bg-[#080810]/90 p-3 backdrop-blur-xl">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-xs text-white/35">Signed in as {email}</p>

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  <Link
                    href="/profile"
                    className="rounded-full border border-white/10 bg-white/[0.03] px-6 py-3 text-center text-sm font-medium text-white/60 transition hover:bg-white/[0.06] hover:text-white"
                  >
                    Cancel
                  </Link>

                  <button
                    disabled={loading}
                    className="rounded-full bg-violet-500 px-6 py-3 text-sm font-medium text-white transition hover:bg-violet-400 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {loading ? "Saving..." : "Save changes"}
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}