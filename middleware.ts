import { NextRequest, NextResponse } from "next/server";

/**
 * Protects the /admin configurator behind HTTP Basic Auth, but ONLY if
 * ADMIN_USERNAME and ADMIN_PASSWORD are configured as environment
 * variables. This keeps local development frictionless while letting you
 * lock the route down before/when you deploy publicly (see README).
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!pathname.startsWith("/admin")) {
    return NextResponse.next();
  }

  const adminUser = process.env.ADMIN_USERNAME;
  const adminPass = process.env.ADMIN_PASSWORD;

  // No credentials configured -> admin route is left open (dev convenience).
  if (!adminUser || !adminPass) {
    return NextResponse.next();
  }

  const authHeader = request.headers.get("authorization");

  if (authHeader?.startsWith("Basic ")) {
    const base64Credentials = authHeader.slice("Basic ".length);
    try {
      const decoded = atob(base64Credentials);
      const separatorIndex = decoded.indexOf(":");
      const user = decoded.slice(0, separatorIndex);
      const pass = decoded.slice(separatorIndex + 1);

      if (user === adminUser && pass === adminPass) {
        return NextResponse.next();
      }
    } catch {
      // fall through to 401 below
    }
  }

  return new NextResponse("Authentication required.", {
    status: 401,
    headers: { "WWW-Authenticate": 'Basic realm="Admin Area", charset="UTF-8"' },
  });
}

export const config = {
  matcher: ["/admin/:path*"],
};
