"use client";

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
  featured_badge_id: string | null;
};

type UnlockedBadge = {
  id: string;
  name: string;
  description: string;
  symbol: string;
};

const UNLOCKED_BADGES: UnlockedBadge[] = [
  {
    id: "early_member",
    name: "Early Member",
    description: "Joined Melodic during the early build.",
    symbol: "✦",
  },
];

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

  const [savedDisplayName, setSavedDisplayName] = useState(
    profile.display_name || profile.username || ""
  );
  const [savedBio, setSavedBio] = useState(profile.bio || "");
  const [savedAvatarUrl, setSavedAvatarUrl] = useState(profile.avatar_url || "");

  const [displayName, setDisplayName] = useState(savedDisplayName);
  const [bio, setBio] = useState(savedBio);

  const [currentAvatarUrl, setCurrentAvatarUrl] = useState(savedAvatarUrl);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState("");
  const [avatarRemoved, setAvatarRemoved] = useState(false);

  const [badgePickerOpen, setBadgePickerOpen] = useState(false);
  const initialSelectedBadge =
  UNLOCKED_BADGES.find((badge) => badge.id === profile.featured_badge_id) ??
  null;

const [savedSelectedBadgeId, setSavedSelectedBadgeId] = useState(
  profile.featured_badge_id || ""
);

const [selectedBadge, setSelectedBadge] = useState<UnlockedBadge | null>(
  initialSelectedBadge
);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const avatarInitial =
    displayName?.[0]?.toUpperCase() || username?.[0]?.toUpperCase() || "M";

  const visibleAvatarUrl = avatarPreview || currentAvatarUrl;

  const hasChanges =
  displayName !== savedDisplayName ||
  bio !== savedBio ||
  currentAvatarUrl !== savedAvatarUrl ||
  avatarFile !== null ||
  avatarRemoved ||
  (selectedBadge?.id || "") !== savedSelectedBadgeId;

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

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  function removeCurrentAvatar() {
    setError("");
    setSuccess("");
    setAvatarFile(null);
    setAvatarPreview("");
    setCurrentAvatarUrl("");
    setAvatarRemoved(true);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  function undoChanges() {
    setError("");
    setSuccess("");

    setDisplayName(savedDisplayName);
    setBio(savedBio);

    setCurrentAvatarUrl(savedAvatarUrl);
    setAvatarFile(null);
    setAvatarPreview("");
    setAvatarRemoved(false);
    setSelectedBadge(
        UNLOCKED_BADGES.find((badge) => badge.id === savedSelectedBadgeId) ?? null
      );

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  async function handleSave(e?: React.FormEvent) {
    e?.preventDefault();

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
      featured_badge_id: selectedBadge?.id || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", userId);

    if (updateError) {
      setError(updateError.message);
      setLoading(false);
      return;
    }

    const nextSavedAvatarUrl = nextAvatarUrl || "";

    setSavedDisplayName(cleanDisplayName);
    setSavedBio(cleanBio);
    setSavedAvatarUrl(nextSavedAvatarUrl);
    setSavedSelectedBadgeId(selectedBadge?.id || "");

    setDisplayName(cleanDisplayName);
    setBio(cleanBio);
    setCurrentAvatarUrl(nextSavedAvatarUrl);

    setAvatarFile(null);
    setAvatarPreview("");
    setAvatarRemoved(false);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

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
        <a
          href="/profile"
          className="text-sm font-medium text-white/60 transition hover:text-white"
        >
          ← Back to profile
        </a>

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
            <section className="rounded-3xl border border-white/[0.08] bg-white/[0.03] p-6 shadow-2xl md:p-8">
              <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                <div className="flex min-w-0 flex-col gap-5 sm:flex-row sm:items-center">
                  <button
                    type="button"
                    onClick={openFilePicker}
                    className="group relative flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-3xl border border-white/10 bg-[#080810] text-4xl font-semibold text-white/45"
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

                    <div className="absolute inset-0 flex items-center justify-center bg-black/60 px-3 text-center text-xs font-semibold text-white opacity-0 transition group-hover:opacity-100">
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

                  <div className="min-w-0">
                    <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-violet-300/80">
                      Profile identity
                    </p>

                    <div className="mt-2 flex min-w-0 flex-wrap items-center gap-2">
                      <h2 className="max-w-full break-words text-2xl font-semibold leading-tight tracking-tight text-white md:text-3xl">
                        {displayName || username}
                      </h2>

                      {selectedBadge ? (
                        <button
                          type="button"
                          onClick={() => setBadgePickerOpen(true)}
                          className="shrink-0 rounded-full border border-violet-300/20 bg-violet-500/10 px-3 py-1.5 text-[11px] font-medium text-violet-100 transition hover:border-violet-300/40 hover:bg-violet-500/15"
                        >
                          {selectedBadge.symbol} {selectedBadge.name}
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setBadgePickerOpen(true)}
                          className="shrink-0 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-[11px] font-medium text-white/45 transition hover:border-violet-400/30 hover:text-violet-200"
                        >
                          Choose badge
                        </button>
                      )}
                    </div>

                    <p className="mt-1 break-words text-sm text-white/45">
                      @{username}
                    </p>

                    <p className="mt-3 max-w-xl text-xs leading-relaxed text-white/35">
                      Your username is permanent and cannot be changed. Hover
                      over your avatar to update your profile picture.
                    </p>

                    {avatarFile ? (
                      <p className="mt-2 max-w-full truncate text-xs text-white/35">
                        Selected: {avatarFile.name}
                      </p>
                    ) : null}
                  </div>
                </div>

                <div className="flex shrink-0 flex-wrap gap-2">
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

              <div className="mt-6 rounded-2xl border border-white/[0.06] bg-black/20 px-4 py-3">
                <p className="text-xs leading-relaxed text-white/35">
                  JPG, PNG or WebP only. Max 1MB.
                </p>
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
                    onChange={(e) => {
                      setSuccess("");
                      setDisplayName(e.target.value.slice(0, 32));
                    }}
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
                    onChange={(e) => {
                      setSuccess("");
                      setBio(e.target.value.slice(0, 160));
                    }}
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
          </form>
        </div>
      </div>

      {badgePickerOpen ? (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 px-5 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border border-white/[0.08] bg-[#0b0b14] p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-violet-300/80">
                  Featured badge
                </p>
                <h2 className="mt-2 text-xl font-semibold tracking-tight">
                  Choose a badge
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-white/45">
                  Only badges you have unlocked are shown here.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setBadgePickerOpen(false)}
                className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs font-medium text-white/45 transition hover:bg-white/[0.06] hover:text-white"
              >
                Close
              </button>
            </div>

            <div className="mt-6 space-y-3">
              {UNLOCKED_BADGES.length > 0 ? (
                UNLOCKED_BADGES.map((badge) => (
                  <button
                    key={badge.id}
                    type="button"
                    onClick={() => {
                      setSelectedBadge(badge);
                      setBadgePickerOpen(false);
                    }}
                    className={
                      selectedBadge?.id === badge.id
                        ? "flex w-full items-center gap-4 rounded-2xl border border-violet-300/30 bg-violet-500/10 p-4 text-left"
                        : "flex w-full items-center gap-4 rounded-2xl border border-white/[0.08] bg-white/[0.03] p-4 text-left transition hover:border-violet-300/20 hover:bg-white/[0.05]"
                    }
                  >
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-black/30 text-lg">
                      {badge.symbol}
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-white">
                        {badge.name}
                      </p>
                      <p className="mt-1 text-xs leading-relaxed text-white/40">
                        {badge.description}
                      </p>
                    </div>

                    {selectedBadge?.id === badge.id ? (
                      <span className="text-xs font-medium text-violet-200">
                        Selected
                      </span>
                    ) : null}
                  </button>
                ))
              ) : (
                <div className="rounded-2xl border border-dashed border-white/10 bg-black/20 p-6 text-center">
                  <p className="text-sm font-medium text-white/70">
                    No badges unlocked yet
                  </p>
                  <p className="mt-2 text-sm text-white/40">
                    Once you unlock badges, you can feature one next to your
                    name.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : null}

      {hasChanges ? (
        <div className="fixed inset-x-0 bottom-5 z-30 flex justify-center px-5">
          <div className="flex w-full max-w-md items-center justify-between gap-3 rounded-2xl border border-white/[0.08] bg-[#0b0b14]/95 p-3 shadow-2xl backdrop-blur-xl">
            <p className="hidden text-sm text-white/55 sm:block">
              Unsaved changes
            </p>

            <div className="flex w-full gap-3 sm:w-auto">
              <button
                type="button"
                onClick={undoChanges}
                disabled={loading}
                className="flex-1 rounded-full border border-white/10 bg-white/[0.03] px-5 py-2.5 text-sm font-medium text-white/60 transition hover:bg-white/[0.06] hover:text-white disabled:cursor-not-allowed disabled:opacity-60 sm:flex-none"
              >
                Undo
              </button>

              <button
                type="button"
                onClick={() => handleSave()}
                disabled={loading}
                className="flex-1 rounded-full bg-violet-500 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-violet-400 disabled:cursor-not-allowed disabled:opacity-60 sm:flex-none"
              >
                {loading ? "Saving..." : "Save changes"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );
}