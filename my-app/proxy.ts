import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyToken } from "./helpers/jwt";
import type { JWTPayload } from "./types/jwt";

// Daftar endpoint yang tidak memerlukan authorization
const PUBLIC_ENDPOINTS = ["/api/login", "/api/register", "/api/auth/"];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

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

  const authHeader =
    request.headers.get("authorization") ||
    request.headers.get("Authorization");

  if (!authHeader) {
    console.log("❌ No authorization header");
    return NextResponse.json(
      { message: "Unauthorized. Authentication token required." },
      { status: 401 }
    );
  }

  // Ekstrak token dari "Bearer <token>"
  const token = authHeader.split(" ")[1];

  if (!token) {
    console.log("❌ Invalid token format");
    return NextResponse.json(
      { message: "Unauthorized. Invalid token format." },
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
  matcher: ["/api/:path*"], // Semua API routes
};
