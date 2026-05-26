"use client";

import Image from "next/image";
import {
  cloneElement,
  isValidElement,
  useState,
  type ReactElement,
  type ReactNode,
} from "react";

export function AlbumCover({
  url,
  alt,
  className,
  priority,
}: {
  url: string;
  alt: string;
  className?: string;
  priority?: boolean;
}) {
  return (
    <div
      className={[
        "relative shrink-0 overflow-hidden rounded-2xl bg-white/5 ring-1 ring-white/10 transition duration-300",
        className ?? "h-16 w-16",
      ].join(" ")}
    >
      <div
        aria-hidden="true"
        className="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background:
            "radial-gradient(circle at 30% 20%, rgba(168,85,247,0.35), transparent 55%), linear-gradient(to bottom, rgba(255,255,255,0.08), rgba(255,255,255,0) 60%)",
        }}
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background:
            "linear-gradient(to top, rgba(0,0,0,0.55), rgba(0,0,0,0) 55%)",
        }}
      />
      <Image
        src={url}
        alt={alt}
        fill
        sizes="(max-width: 768px) 80px, 120px"
        priority={priority}
        className="object-cover transition-transform duration-500 group-hover:scale-[1.08] group-hover:-rotate-[0.6deg]"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{ boxShadow: "inset 0 0 0 1px rgba(168,85,247,0.22)" }}
      />
    </div>
  );
}

export function Avatar({
  url,
  alt,
  size = "md",
}: {
  url: string;
  alt: string;
  size?: "sm" | "md";
}) {
  const dim = size === "sm" ? "h-8 w-8" : "h-10 w-10";
  return (
    <div className={["relative shrink-0 overflow-hidden rounded-full ring-1 ring-white/10 bg-white/5", dim].join(" ")}>
      <Image src={url} alt={alt} fill sizes="40px" className="object-cover" />
    </div>
  );
}

export function IconButton({
  label,
  children,
  className,
  onClick,
  active,
}: {
  label: string;
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  active?: boolean;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={active}
      onClick={onClick}
      className={[
        "inline-flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04] text-white/75 transition duration-200 hover:border-white/15 hover:bg-white/[0.08] hover:text-white active:scale-95",
        active ? "border-violet-400/30 bg-violet-500/15 text-violet-200" : "",
        className ?? "",
      ].join(" ")}
    >
      {children}
    </button>
  );
}

export function DropdownMenu({
  label,
  items,
  children,
  align = "right",
}: {
  label: string;
  items: string[];
  children: ReactNode;
  align?: "left" | "right";
}) {
  const [open, setOpen] = useState(false);

  const trigger = isValidElement(children)
    ? cloneElement(children as ReactElement<{ onClick?: () => void }>, {
        onClick: () => setOpen((prev) => !prev),
      })
    : children;

  return (
    <div className="relative inline-flex">
      <div aria-label={label} aria-expanded={open}>
        {trigger}
      </div>
      {open ? (
        <div
          className={[
            "absolute top-[calc(100%+0.5rem)] z-50 min-w-[220px] rounded-xl border border-white/10 bg-[#0c0c18]/95 p-1.5 shadow-xl backdrop-blur-xl",
            align === "right" ? "right-0" : "left-0",
          ].join(" ")}
        >
          {items.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setOpen(false)}
              className="flex w-full rounded-lg px-3 py-2 text-left text-sm text-white/75 transition hover:bg-white/10 hover:text-white"
            >
              {item}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

export function Toast({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <div className="pointer-events-none fixed left-1/2 top-5 z-[60] -translate-x-1/2">
      <div className="rounded-xl border border-white/10 bg-[#0c0c18]/95 px-4 py-2 text-sm text-white/90 shadow-lg backdrop-blur-xl">
        {message}
      </div>
    </div>
  );
}
