'use client'

import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const supabase = createClient()

  const handleGoogleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
  }

  const handleSpotifyLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'spotify',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-black p-6">
      <div className="w-full max-w-md space-y-8 rounded-2xl bg-zinc-900 p-8 ring-1 ring-white/10">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight text-white">Melodic</h1>
          <p className="mt-2 text-sm text-zinc-400">Rate albums. Discover taste.</p>
        </div>
        <div className="space-y-3">
          <button
            onClick={handleGoogleLogin}
            className="w-full rounded-full bg-white px-6 py-3 text-sm font-medium text-black transition hover:bg-zinc-200"
          >
            Continue with Google
          </button>
          <button
            onClick={handleSpotifyLogin}
            className="w-full rounded-full bg-[#1DB954] px-6 py-3 text-sm font-medium text-white transition hover:bg-[#1ed760]"
          >
            Continue with Spotify
          </button>
        </div>
      </div>
    </div>
  )
}
