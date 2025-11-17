import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyToken } from "./helpers/jwt";
import type { JWTPayload } from "./types/jwt";

// Daftar endpoint yang tidak memerlukan authorization
const PUBLIC_ENDPOINTS = ["/api/login", "/api/register", "/api/auth/"];
const AUTH_PAGES = ["/login", "/register"];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Cek apakah user sudah login (ada token)
  let token: string | undefined;

  // Cek di Authorization header
  const authHeader =
    request.headers.get("authorization") ||
    request.headers.get("Authorization");

  if (authHeader) {
    const parts = authHeader.split(" ");
    if (parts.length === 2 && parts[0] === "Bearer") {
      token = parts[1];
    }
  }

  // Jika tidak ada di header, cek di cookies
  if (!token) {
    const cookieHeader = request.headers.get("cookie");
    if (cookieHeader) {
      const cookies = cookieHeader.split(";").map((c) => c.trim());
      const tokenCookie = cookies.find((c) => c.startsWith("token="));
      if (tokenCookie) {
        token = tokenCookie.split("=")[1];
      }
    }
  }

  // Cek jika ini halaman auth (login/register)
  if (AUTH_PAGES.includes(pathname)) {
    if (token) {
      // User sudah login, coba verify dan redirect ke dashboard
      try {
        verifyToken(token); // Verify token valid
        console.log(
          "🔄 Logged in user accessing auth page, redirecting to dashboard"
        );
        return NextResponse.redirect(new URL("/dashboard", request.url));
      } catch {
        // Token invalid, biarkan akses halaman auth
        console.log("🔓 Auth page (invalid token):", pathname);
        return NextResponse.next();
      }
    } else {
      // Tidak ada token, biarkan akses halaman auth
      console.log("🔓 Auth page (no token):", pathname);
      return NextResponse.next();
    }
  }

  // Skip authorization check untuk public endpoints
  const isPublicEndpoint = PUBLIC_ENDPOINTS.some((endpoint) =>
    pathname.startsWith(endpoint)
  );

  if (isPublicEndpoint) {
    console.log("🔓 Public endpoint:", pathname);
    return NextResponse.next();
  }

  // Semua endpoint lainnya butuh authorization
  console.log("🔒 Protected endpoint:", pathname);

  // Token sudah dicek di atas, jika masih belum ada berarti unauthorized
  if (!token) {
    console.log("❌ No authorization token (checked header and cookies)");
    return NextResponse.json(
      { message: "Unauthorized. Authentication token required." },
      { status: 401 }
    );
  }

  try {
    // Verify token
    const payload = verifyToken(token) as JWTPayload;

    // Inject user info ke request headers untuk digunakan di API routes
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("X-User-Id", payload.userId);
    requestHeaders.set("X-User-Email", payload.email);

    console.log("✅ Token valid for user:", payload.email);

    return NextResponse.next({
      request: { headers: requestHeaders },
    });
  } catch (error) {
    console.log("❌ Token verification failed:", error);
    return NextResponse.json(
      { message: "Unauthorized. Invalid or expired token." },
      { status: 401 }
    );
  }
}

export const config = {
  matcher: ["/api/:path*", "/login", "/register"], // API routes + auth pages
};
