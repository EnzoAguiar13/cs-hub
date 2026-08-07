import { NextResponse, type NextRequest } from "next/server";

const REFRESH_COOKIE = "cshub_refresh_token";
const PUBLIC_PATHS = ["/login", "/auth/google/callback"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isPublic = PUBLIC_PATHS.some((path) => pathname.startsWith(path));
  const hasSession = request.cookies.has(REFRESH_COOKIE);

  // The refresh token is httpOnly, so middleware can only check whether it's present, not
  // validate it — real validation happens when the client calls POST /auth/refresh. This
  // just avoids a flash of protected content before that call resolves.
  if (!isPublic && !hasSession) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isPublic && hasSession && pathname === "/login") {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
