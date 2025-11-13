import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyToken } from "./helpers/jwt";
import { JwtPayload } from "jsonwebtoken";

interface Payload extends JwtPayload {
  id: string;
  email?: string;
}

export async function proxy(request: NextRequest) {
  const cookieStore = await cookies();
  let authorization = cookieStore.get("Authorization") as
    | { name: string; value: string }
    | undefined;
  const headerAuth =
    request.headers.get("authorization") ||
    request.headers.get("Authorization");
  if (!authorization && headerAuth) {
    authorization = { name: "Authorization", value: headerAuth };
  }
  const { pathname } = request.nextUrl;

  if (pathname === "/login" && authorization) {
    console.log("<<<< User sudah login, redirect ke home");
    return NextResponse.redirect(new URL("/", request.url));
  }

  if (
    pathname.startsWith("/api/wishlist") ||
    pathname.startsWith("/api/match-making")
  ) {
    console.log("ini dari proxy wishlist/match-making", pathname);
    if (!authorization) {
      console.log("<<<< if proxy - no authorization");
      return NextResponse.json(
        {
          message: `Authentication Failed`,
        },
        {
          status: 401,
        }
      );
    } else {
      const accessToken = authorization.value.split(" ")[1];
      const payload = verifyToken(accessToken);
      const data = payload as Payload;
      const requestHeaders = new Headers(request.headers);
      requestHeaders.set("X-User-Id", data?.id);
      requestHeaders.set("X-User-Email", data?.email || "");

      console.log("Payload dari token:", data);
      console.log(requestHeaders, " Headers di proxy wishlist");

      return NextResponse.next({
        request: { headers: requestHeaders },
      });
    }
  }
}

export const config = {
  matcher: ["/api/match-making", "/login"],
};
