import Link from "next/link";

export default function FriendsPage() {
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
          Friends
        </h1>
        <p className="mt-3 max-w-2xl text-white/50">
          Placeholder route. This is where your network’s scoring patterns make
          recommendations feel earned.
        </p>
      </div>
    </main>
  );
}

