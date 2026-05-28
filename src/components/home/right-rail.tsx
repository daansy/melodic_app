"use client";

import Image from "next/image";
import Link from "next/link";
import { AlbumCover, Avatar, DropdownMenu } from "@/components/ui/primitives";
import { RatingBadge } from "@/components/ui/rating-badge";
import { SectionHeader } from "@/components/ui/section";
import { yourRecentRatings } from "@/lib/data";
import { albumSlug } from "@/lib/slug";
import type { Activity, RecentRating } from "@/lib/types";

type HomeProfile = {
  username: string | null;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  onboarding_completed: boolean | null;
};

function ProfileCard({
  profile,
  onEdit,
}: {
  profile: HomeProfile;
  onEdit: () => void;
}) {
  const displayName = profile.display_name || profile.username || "Melodic User";
  const username = profile.username || "user";
  const avatarInitial =
    displayName?.[0]?.toUpperCase() || username?.[0]?.toUpperCase() || "M";

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
              <p className="truncate text-sm font-semibold text-white">
                {displayName}
              </p>
              <p className="truncate text-xs text-white/40">@{username}</p>
            </div>
          </Link>
        </DropdownMenu>

        <button
          type="button"
          onClick={onEdit}
          className="text-xs font-medium text-violet-300/90 transition hover:text-violet-200"
        >
          Edit
        </button>
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

function RecentRatingsList({ items }: { items: RecentRating[] }) {
  return (
    <div>
      <SectionHeader eyebrow="Your log" title="Recent ratings" />
      <ul className="mt-4 space-y-1">
        {items.map((item) => (
          <li key={`${item.title}-${item.ratedAt}`}>
            <Link
              href={`/album/${albumSlug(item.title, item.artist)}`}
              className="melodic-fade-up group flex w-full items-center gap-3 rounded-xl px-2 py-2.5 text-left transition hover:-translate-y-[1px] hover:bg-white/[0.04]"
            >
              <AlbumCover
                url={item.coverUrl}
                alt={item.title}
                className="h-12 w-12"
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-white/90 group-hover:text-white">
                  {item.title}
                </p>
                <p className="truncate text-xs text-white/40">{item.artist}</p>
              </div>
              <div className="flex shrink-0 flex-col items-end gap-0.5">
                <RatingBadge score={item.rating} size="sm" showScale={false} />
                <span className="text-[10px] text-white/30">
                  {item.ratedAt}
                </span>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

function NetworkActivity({ items }: { items: Activity[] }) {
  return (
    <div>
      <div className="flex items-end justify-between gap-3">
        <SectionHeader eyebrow="Network" title="Recent scores" />
        <button
          type="button"
          className="mb-1 text-xs font-medium text-violet-300/90 transition hover:text-violet-200"
        >
          See all
        </button>
      </div>

      <ul className="mt-4 space-y-3">
        {items.map((item) => (
          <li
            key={item.id}
            className="melodic-fade-up flex gap-3 rounded-xl border border-transparent p-2 transition hover:-translate-y-[1px] hover:border-white/[0.08] hover:bg-white/[0.04]"
          >
            <Avatar url={item.user.avatarUrl} alt={item.user.name} size="sm" />

            <div className="min-w-0 flex-1">
              <p className="text-sm leading-snug text-white/80">
                <span className="font-medium text-white">{item.user.name}</span>{" "}
                <span className="text-white/45">
                  {item.action === "rated" ? "rated" : "reviewed"}
                </span>{" "}
                <span className="font-medium text-white">
                  {item.album.title}
                </span>
              </p>
              <p className="mt-0.5 text-xs text-white/35">{item.time} ago</p>
            </div>

            {item.rating != null ? (
              <RatingBadge
                score={item.rating}
                size="sm"
                showScale={false}
                className="shrink-0 self-center"
              />
            ) : (
              <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg ring-1 ring-white/10">
                <Image
                  src={item.album.coverUrl}
                  alt=""
                  fill
                  sizes="40px"
                  className="object-cover"
                />
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function RightRail({
  activity,
  profile,
  onEditProfile,
}: {
  activity: Activity[];
  profile: HomeProfile;
  onEditProfile: () => void;
}) {
  return (
    <aside className="space-y-10 lg:sticky lg:top-8 lg:max-h-[calc(100vh-7rem)] lg:space-y-12 lg:overflow-y-auto lg:pb-4">
      <ProfileCard profile={profile} onEdit={onEditProfile} />
      <RecentRatingsList items={yourRecentRatings} />
      <NetworkActivity items={activity} />
    </aside>
  );
}