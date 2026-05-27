import { type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

export async function middleware(request: NextRequest) {
  return await updateSession(request)
}

export const config = {
  matcher: [
    /*
     * Matched alle paden behalve:
     * - _next/static (static bestanden)
     * - _next/image (geoptimaliseerde images)
     * - favicon.ico
     * - bestanden met afbeeldings-extensies
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
