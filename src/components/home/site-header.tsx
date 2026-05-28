"use client";

import { DropdownMenu, IconButton } from "@/components/ui/primitives";
import { IconBell, IconPlus, IconSearch } from "@/components/ui/icons";

export function SiteHeader({
  searchQuery,
  onSearchChange,
  onRateAlbum,
  onNotify,
  userName,
}: {
  searchQuery: string;
  onSearchChange: (v: string) => void;
  onRateAlbum: () => void;
  onNotify: () => void;
  userName: string;
}) {
  return (
    <header className="mb-10 space-y-6 lg:mb-12">
      <div className="flex flex-wrap items-start justify-between gap-6">
        <div className="max-w-2xl">
          <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-violet-300/80">
            Welcome back, {userName}
          </p>
          <h1 className="mt-2 font-sans text-3xl font-semibold tracking-tight text-white md:text-[2rem] md:leading-tight">
            Rate albums with intention.
          </h1>
          <p className="mt-3 text-base leading-relaxed text-white/50">
            Discover what your network scores highly — and share reviews that matter.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <DropdownMenu
            label="Notifications"
            items={[
              "Ari rated Afterimage Deluxe — 9/10",
              "Noah published a review — 8/10",
              "Weekly digest: top albums in your taste cluster",
            ]}
          >
            <IconButton label="Notifications">
              <IconBell />
            </IconButton>
          </DropdownMenu>
          <IconButton label="Rate an album" onClick={onRateAlbum}>
            <IconPlus />
          </IconButton>
        </div>
      </div>

      <div className="relative max-w-2xl">
        <span className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-white/40">
          <IconSearch />
        </span>
        <input
          type="search"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search albums, artists, reviewers…"
          className="w-full rounded-xl border border-white/[0.08] bg-white/[0.03] py-3 pl-11 pr-4 text-sm text-white placeholder:text-white/35 outline-none transition focus:border-violet-500/30 focus:bg-white/[0.05] focus:ring-2 focus:ring-violet-500/10"
        />
        {searchQuery ? (
          <p className="mt-2 text-xs text-white/45">
            Showing results for <span className="text-white/70">&quot;{searchQuery}&quot;</span>
          </p>
        ) : null}
      </div>
    </header>
  );
}
