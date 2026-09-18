import { NextResponse, type NextRequest } from 'next/server';
// Overwrite, never trust a caller-supplied route header.
export function middleware(request: NextRequest) {
  const headers = new Headers(request.headers);
  headers.set('x-newneo-path', request.nextUrl.pathname);
  return NextResponse.next({ request: { headers } });
}
export const config = {
  matcher: ['/((?!api|_next|assets|favicon.ico|icon.svg).*)'],
};
