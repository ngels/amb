import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

const AUTH_COOKIES = ['amb_access_token', 'amb_login_token'];
const PUBLIC_PATH_PREFIXES = ['/', '/signin', '/signup', '/help', '/forgot-password'];

function isPublicPath(pathname: string) {
  return PUBLIC_PATH_PREFIXES.some((publicPath) =>
    pathname === publicPath || pathname.startsWith(`${publicPath}/`)
  );
}

export default function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (isPublicPath(pathname)) {
    return NextResponse.next();
  }

  const hasAuthCookie = AUTH_COOKIES.some((cookieName) => {
    const cookie = request.cookies.get(cookieName);
    return Boolean(cookie?.value);
  });

  if (!hasAuthCookie) {
    const signInUrl = request.nextUrl.clone();
    signInUrl.pathname = '/signin';
    signInUrl.searchParams.set('redirectTo', `${pathname}${request.nextUrl.search}`);
    return NextResponse.redirect(signInUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api).*)'],
};
