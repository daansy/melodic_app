"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { AlbumSummary } from "@/lib/spotify";

function CarouselCard({ album }: { album: AlbumSummary }) {
  return (
    <Link
      href={`/album/${album.id}`}
      className="group w-40 shrink-0 snap-start rounded-2xl border border-white/[0.06] bg-white/[0.02] p-3 transition hover:border-violet-400/30 hover:bg-white/[0.04]"
    >
      <div className="relative">
        <div className="aspect-square w-full overflow-hidden rounded-xl bg-white/[0.04]">
          {album.imageUrl ? (
            <img
              src={album.imageUrl}
              alt={album.name}
              className="h-full w-full object-cover transition group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-xs text-white/25">
              No image
            </div>
          )}
        </div>
        <span className="absolute left-2 top-2 rounded-full border border-white/10 bg-black/60 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-white/85 backdrop-blur-sm">
          {album.kind}
        </span>
      </div>
      <p className="mt-3 truncate text-sm font-semibold text-white group-hover:text-violet-100">
        {album.name}
      </p>
      <p className="mt-1 text-[11px] text-white/30">
        {album.releaseYear}
        {album.totalTracks ? ` · ${album.totalTracks} tracks` : ""}
      </p>
    </Link>
  );
}

export function AlbumCarousel({ albums }: { albums: AlbumSummary[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(false);

  function updateArrows() {
    const el = scrollRef.current;
    if (!el) return;
    setCanLeft(el.scrollLeft > 8);
    setCanRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 8);
  }

  useEffect(() => {
    updateArrows();
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener("scroll", updateArrows, { passive: true });
    window.addEventListener("resize", updateArrows);
    return () => {
      el.removeEventListener("scroll", updateArrows);
      window.removeEventListener("resize", updateArrows);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [albums.length]);

  function scrollByAmount(direction: 1 | -1) {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: direction * el.clientWidth * 0.8, behavior: "smooth" });
  }

  return (
    <div className="relative">
      {canLeft ? (
        <button
          type="button"
          aria-label="Scroll left"
          onClick={() => scrollByAmount(-1)}
          className="absolute left-1 top-1/2 z-10 hidden -translate-y-1/2 items-center justify-center rounded-full border border-white/10 bg-[#0b0b16]/90 p-2 text-white/80 shadow-lg backdrop-blur transition hover:text-white sm:flex"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
      ) : null}

      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto scroll-smooth snap-x pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {albums.map((album) => (
          <CarouselCard key={album.id} album={album} />
        ))}
      </div>

      {canRight ? (
        <button
          type="button"
          aria-label="Scroll right"
          onClick={() => scrollByAmount(1)}
          className="absolute right-1 top-1/2 z-10 hidden -translate-y-1/2 items-center justify-center rounded-full border border-white/10 bg-[#0b0b16]/90 p-2 text-white/80 shadow-lg backdrop-blur transition hover:text-white sm:flex"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      ) : null}
    </div>
  );
}
