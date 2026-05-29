"use client";

import Link from "next/link";
import { Avatar, DropdownMenu } from "@/components/ui/primitives";
import { SectionHeader } from "@/components/ui/section";
import type { Activity } from "@/lib/types";

const BADGES: Record<string, { name: string; symbol: string }> = {
  early_member: { name: "Early Member", symbol: "✦" },
};

type HomeProfile = {
  username: string | null;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  featured_badge_id?: string | null;
  created_at?: string | null;
  onboarding_completed: boolean | null;
};

function ProfileCard({ profile }: { profile: HomeProfile }) {
  const displayName = profile.display_name || profile.username || "Melodic User";
  const username = profile.username || "user";
  const avatarInitial =
    displayName?.[0]?.toUpperCase() || username?.[0]?.toUpperCase() || "M";

  const featuredBadge = profile.featured_badge_id
    ? BADGES[profile.featured_badge_id] ?? null
    : null;

  // "Early Member" wordt ontgrendeld bij het aanmaken van je account,
  // dus gebruiken we created_at als unlock-datum.
  const unlockedLabel = profile.created_at
    ? new Date(profile.created_at).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : null;

  const badgeTitle = featuredBadge
    ? unlockedLabel
      ? `${featuredBadge.name} — unlocked ${unlockedLabel}`
      : featuredBadge.name
    : "";

  return (
    <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-5">
      <div className="flex items-start justify-between gap-3">
        <DropdownMenu
          label="Profile menu"
          items={["View profile", "Edit profile", "Rating history", "Sign out"]}
        >
          <Link href="/profile" className="flex items-center gap-3 text-left">
            {profile.avatar_url ? (
              <Avatar url={profile.avatar_url} alt={displayName} />
            ) : (
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/10 bg-violet-500/10 text-sm font-semibold text-violet-200">
                {avatarInitial}
              </div>
            )}

            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <p className="truncate text-sm font-semibold text-white">
                  {displayName}
                </p>

                {featuredBadge ? (
                  <span
                    className="shrink-0 text-sm leading-none text-violet-300"
                    title={badgeTitle}
                    aria-label={badgeTitle}
                  >
                    {featuredBadge.symbol}
                  </span>
                ) : null}
              </div>

              <p className="truncate text-xs text-white/40">@{username}</p>
            </div>
          </Link>
        </DropdownMenu>

        <Link
          href="/settings"
          className="shrink-0 text-xs font-medium text-violet-300/90 transition hover:text-violet-200"
        >
          Edit
        </Link>
      </div>

      <p className="mt-4 line-clamp-3 text-sm leading-relaxed text-white/45">
        {profile.bio || "No bio yet."}
      </p>

      <dl className="mt-5 grid grid-cols-3 gap-2 border-t border-white/[0.06] pt-4">
        {[
          { label: "Ratings", value: "0" },
          { label: "Reviews", value: "0" },
          { label: "Lists", value: "0" },
        ].map((s) => (
          <div key={s.label} className="text-center">
            <dt className="text-[10px] uppercase tracking-wider text-white/35">
              {s.label}
            </dt>
            <dd className="mt-1 text-sm font-semibold tabular-nums text-white">
              {s.value}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

function RecentRatingsEmpty() {
  return (
    <div>
      <SectionHeader eyebrow="Your log" title="Recent ratings" />
      <div className="mt-4 rounded-xl border border-dashed border-white/10 bg-black/20 p-5 text-center">
        <p className="text-sm font-medium text-white/70">No ratings yet</p>
        <p className="mt-1 text-xs text-white/40">
          Albums and tracks you rate will show up here.
        </p>
      </div>
    </div>
  );
}

function NetworkEmpty() {
  return (
    <div>
      <SectionHeader eyebrow="Network" title="Recent scores" />
      <div className="mt-4 rounded-xl border border-dashed border-white/10 bg-black/20 p-5 text-center">
        <p className="text-sm font-medium text-white/70">Nothing here yet</p>
        <p className="mt-1 text-xs text-white/40">
          Ratings from people you follow will appear here.
        </p>
      </div>
    </div>
  );
}

export function RightRail({
  profile,
}: {
  profile: HomeProfile;
  activity?: Activity[];
  onEditProfile?: () => void;
}) {
  return (
    <aside className="space-y-10 lg:sticky lg:top-8 lg:max-h-[calc(100vh-7rem)] lg:space-y-12 lg:overflow-y-auto lg:pb-4">
      <ProfileCard profile={profile} />
      <RecentRatingsEmpty />
      <NetworkEmpty />
    </aside>
  );
}
