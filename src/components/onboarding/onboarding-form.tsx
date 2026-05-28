"use client";

import Image from "next/image";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

const MAX_AVATAR_SIZE = 1024 * 1024; // 1MB
const ALLOWED_AVATAR_TYPES = ["image/jpeg", "image/png", "image/webp"];

export function OnboardingForm({
  userId,
  email,
  fullName,
}: {
  userId: string;
  email: string;
  fullName: string;
}) {
  const router = useRouter();
  const supabase = createClient();

  const suggestedUsername = email
    .split("@")[0]
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, "")
    .slice(0, 20);

  const suggestedDisplayName = fullName.slice(0, 32);

  const [step, setStep] = useState(1);

  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const progressPercentage = (step / 3) * 100;

  function goToNextStep() {
    setError("");
    setStep((currentStep) => Math.min(currentStep + 1, 3));
  }

  function goToPreviousStep() {
    setError("");
    setStep((currentStep) => Math.max(currentStep - 1, 1));
  }

  function handleAvatarChange(file: File | null) {
    setError("");
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
  }
  function removeSelectedAvatar() {
    setError("");
    setAvatarFile(null);
    setAvatarPreview("");
  }

  async function saveBasicInfo() {
    setError("");

    const cleanUsername = username
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9_]/g, "")
      .slice(0, 20);

    const cleanDisplayName = displayName.trim().slice(0, 32);

    if (cleanUsername.length < 3) {
      setError("Username must be at least 3 characters.");
      return;
    }

    setLoading(true);

    const { error } = await supabase
      .from("profiles")
      .update({
        username: cleanUsername,
        display_name: cleanDisplayName || cleanUsername,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId);

    if (error) {
      if (error.message.toLowerCase().includes("duplicate")) {
        setError("That username is already taken.");
      } else {
        setError(error.message);
      }

      setLoading(false);
      return;
    }

    setLoading(false);
    goToNextStep();
  }

  async function saveBio({ skipped = false }: { skipped?: boolean } = {}) {
    setError("");
    setLoading(true);

    const cleanBio = skipped ? null : bio.trim().slice(0, 160) || null;

    const { error } = await supabase
      .from("profiles")
      .update({
        bio: cleanBio,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId);

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    setLoading(false);
    goToNextStep();
  }

  async function finishOnboarding({
    skipped = false,
  }: {
    skipped?: boolean;
  } = {}) {
    setError("");
    setLoading(true);

    let avatarUrl: string | null = null;

    if (!skipped && avatarFile) {
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

      avatarUrl = data.publicUrl;
    }

    const { error } = await supabase
      .from("profiles")
      .update({
        avatar_url: avatarUrl,
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
        <div className="w-full rounded-3xl border border-white/10 bg-white/[0.03] p-8 shadow-2xl">
          <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-violet-300/80">
            Welcome to Melodic
          </p>

          <div className="mt-4">
            <div className="flex items-center justify-between text-xs text-white/40">
              <span>Step {step} of 3</span>
              <span>{Math.round(progressPercentage)}%</span>
            </div>

            <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-violet-500 transition-all duration-300"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>

          {step === 1 ? (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                saveBasicInfo();
              }}
            >
              <h1 className="mt-8 text-3xl font-semibold tracking-tight">
                Choose your identity
              </h1>

              <p className="mt-3 text-sm leading-relaxed text-white/50">
                Your Google or Spotify account is only used for login. Your
                Melodic profile can have its own username and style.
              </p>

              <div className="mt-8 space-y-5">
                <div>
                  <label className="text-sm text-white/70">Username *</label>
                  <input
                    maxLength={20}
                    value={username}
                    onChange={(e) =>
                      setUsername(
                        e.target.value
                          .toLowerCase()
                          .replace(/[^a-z0-9_]/g, "")
                          .slice(0, 20)
                      )
                    }
                    placeholder={suggestedUsername || "your_username"}
                    className="mt-2 w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-white placeholder:text-white/35 outline-none transition focus:border-violet-400/40"
                  />

                  <div className="mt-2 flex items-center justify-between gap-4 text-xs text-white/35">
                    <p>Lowercase letters, numbers and underscores only.</p>
                    <p className="shrink-0 tabular-nums">
                      {username.length}/20
                    </p>
                  </div>
                </div>

                <div>
                  <label className="text-sm text-white/70">Display name</label>
                  <input
                    maxLength={32}
                    value={displayName}
                    onChange={(e) =>
                      setDisplayName(e.target.value.slice(0, 32))
                    }
                    placeholder={suggestedDisplayName || "Your display name"}
                    className="mt-2 w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-white placeholder:text-white/35 outline-none transition focus:border-violet-400/40"
                  />

                  <p className="mt-2 text-right text-xs tabular-nums text-white/35">
                    {displayName.length}/32
                  </p>
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
                {loading ? "Saving..." : "Continue"}
              </button>
            </form>
          ) : null}

          {step === 2 ? (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                saveBio();
              }}
            >
              <h1 className="mt-8 text-3xl font-semibold tracking-tight">
                Add a short bio
              </h1>

              <p className="mt-3 text-sm leading-relaxed text-white/50">
                Tell people a little bit about your music taste. You can always
                change this later.
              </p>

              <div className="mt-8">
                <label className="text-sm text-white/70">Bio</label>
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

              {error ? (
                <p className="mt-5 rounded-xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                  {error}
                </p>
              ) : null}

              <button
                disabled={loading}
                className="mt-8 w-full rounded-full bg-violet-500 px-6 py-3 text-sm font-medium text-white transition hover:bg-violet-400 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Saving..." : "Save bio"}
              </button>

              <button
                type="button"
                disabled={loading}
                onClick={() => saveBio({ skipped: true })}
                className="mt-4 w-full text-sm font-medium text-white/40 transition hover:text-white/70 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Skip for now
              </button>

              <button
                type="button"
                disabled={loading}
                onClick={goToPreviousStep}
                className="mt-4 w-full text-xs text-white/25 transition hover:text-white/50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Back
              </button>
            </form>
          ) : null}

          {step === 3 ? (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                finishOnboarding();
              }}
            >
              <h1 className="mt-8 text-3xl font-semibold tracking-tight">
                Add a profile picture
              </h1>

              <p className="mt-3 text-sm leading-relaxed text-white/50">
                Choose an image for your Melodic profile. JPG, PNG and WebP are
                supported. Max file size is 1MB.
              </p>

              <div className="mt-8 flex flex-col items-center rounded-2xl border border-white/10 bg-black/20 p-6">
                <div className="relative h-28 w-28 overflow-hidden rounded-3xl border border-white/10 bg-black">
                  {avatarPreview ? (
                    <Image
                      src={avatarPreview}
                      alt="Profile preview"
                      fill
                      sizes="112px"
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-3xl font-semibold text-white/30">
                      {displayName?.[0]?.toUpperCase() ||
                        username?.[0]?.toUpperCase() ||
                        "M"}
                    </div>
                  )}
                </div>

                <label className="mt-6 cursor-pointer rounded-full border border-white/10 bg-white/[0.04] px-5 py-2 text-sm font-medium text-white/75 transition hover:bg-white/[0.08] hover:text-white">
                  Choose image
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    onChange={(e) =>
                      handleAvatarChange(e.target.files?.[0] ?? null)
                    }
                  />
                </label>

                {avatarFile ? (
  <div className="mt-3 flex max-w-full flex-col items-center gap-3">
    <p className="max-w-full truncate text-xs text-white/35">
      {avatarFile.name}
    </p>

    <button
      type="button"
      onClick={removeSelectedAvatar}
      className="text-xs font-medium text-white/40 transition hover:text-red-200"
    >
      Remove selected image
    </button>
  </div>
) : (
  <p className="mt-3 text-xs text-white/35">
    JPG, PNG or WebP only. Max 1MB.
  </p>
)}
              </div>

              {error ? (
                <p className="mt-5 rounded-xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                  {error}
                </p>
              ) : null}

              <button
                disabled={loading || !avatarFile}
                className="mt-8 w-full rounded-full bg-violet-500 px-6 py-3 text-sm font-medium text-white transition hover:bg-violet-400 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Saving..." : "Finish profile"}
              </button>

              <button
                type="button"
                disabled={loading}
                onClick={() => finishOnboarding({ skipped: true })}
                className="mt-4 w-full text-sm font-medium text-white/40 transition hover:text-white/70 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Skip for now
              </button>

              <button
                type="button"
                disabled={loading}
                onClick={goToPreviousStep}
                className="mt-4 w-full text-xs text-white/25 transition hover:text-white/50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Back
              </button>
            </form>
          ) : null}

          <p className="mt-6 text-center text-xs text-white/35">
            Signed in as {email}
          </p>
        </div>
      </div>
    </main>
  );
}