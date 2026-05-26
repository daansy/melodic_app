"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { NavItem } from "@/lib/types";

export function Sidebar({
  items,
}: {
  items: NavItem[];
}) {
  const pathname = usePathname();
  const activeLabel =
    pathname === "/"
      ? "Home"
      : pathname.startsWith("/discover")
        ? "Discover"
        : pathname.startsWith("/reviews")
          ? "Reviews"
          : pathname.startsWith("/lists")
            ? "Lists"
            : pathname.startsWith("/friends")
              ? "Friends"
              : pathname.startsWith("/stats")
                ? "Stats"
                : pathname.startsWith("/settings")
                  ? "Settings"
                  : "";

  const hrefFor = (label: string) => {
    switch (label) {
      case "Home":
        return "/";
      case "Discover":
        return "/discover";
      case "Reviews":
        return "/reviews";
      case "Lists":
        return "/lists";
      case "Friends":
        return "/friends";
      case "Stats":
        return "/stats";
      case "Settings":
        return "/settings";
      default:
        return "/";
    }
  };

  return (
    <aside className="hidden lg:sticky lg:top-8 lg:flex lg:w-[200px] lg:shrink-0 lg:flex-col lg:gap-10 xl:w-[212px]">
      <div className="flex items-center gap-3">
        <div className="relative h-9 w-9 rounded-xl bg-gradient-to-br from-violet-600 to-fuchsia-600 ring-1 ring-white/10" />
        <div>
          <div className="text-sm font-semibold tracking-tight text-white">Melodic</div>
          <div className="text-[11px] text-white/45">Album ratings</div>
        </div>
      </div>

      <nav className="space-y-0.5">
        {items.map((item) => {
          const active = item.label === activeLabel;
          return (
            <Link
              key={item.label}
              href={hrefFor(item.label)}
              className={[
                "flex w-full items-center justify-between rounded-xl px-3 py-2 text-[13px] font-medium transition duration-200 hover:-translate-y-[1px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400/25",
                active
                  ? "bg-white/[0.08] text-white shadow-[0_10px_40px_-30px_rgba(124,58,237,0.6)]"
                  : "text-white/55 hover:bg-white/[0.04] hover:text-white/90",
              ].join(" ")}
            >
              {item.label}
              {item.badge ? (
                <span className="rounded-md bg-violet-500/20 px-1.5 py-0.5 text-[10px] font-semibold text-violet-200">
                  {item.badge}
                </span>
              ) : null}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto rounded-xl border border-white/[0.08] bg-white/[0.02] p-4">
        <p className="text-[11px] font-medium uppercase tracking-wider text-white/40">Your average</p>
        <p className="mt-2 font-sans text-3xl font-semibold tabular-nums tracking-tight text-white">
          8.2<span className="text-lg text-white/40">/10</span>
        </p>
        <p className="mt-2 text-xs leading-relaxed text-white/45">
          Based on 1,284 album ratings. Consistent taste, strong opinions.
        </p>
      </div>
    </aside>
  );
}
