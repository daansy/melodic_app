import Link from "next/link";

export default function SettingsPage() {
  return (
    <main className="min-h-screen bg-[#05050d] text-white">
      <div className="mx-auto w-full max-w-[1560px] px-5 pb-24 pt-10 md:px-10 2xl:max-w-[1680px] 2xl:px-14">
        <Link
          href="/"
          className="text-sm font-medium text-white/60 transition hover:text-white"
        >
          ← Back to Home
        </Link>
        <h1 className="mt-10 text-3xl font-semibold tracking-tight text-white">
          Settings
        </h1>
        <p className="mt-3 max-w-2xl text-white/50">
          Placeholder route. Preferences for rating scale display, review
          visibility, and feed signals will live here.
        </p>
      </div>
    </main>
  );
}

