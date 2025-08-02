
import { NextResponse, type NextRequest } from 'next/server'

// This middleware is intentionally disabled by using an empty matcher.
// Server-side logic is not compatible with Next.js static exports (output: 'export').
// Client-side routing protection is now handled in src/context/UserDataProvider.tsx.
export async function middleware(request: NextRequest) {
  return NextResponse.next()
}

export const config = {
  matcher: [],
}
