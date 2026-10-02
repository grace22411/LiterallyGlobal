import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function proxy(request: NextRequest) {
  // Overwrite the internal return path; never trust a client-supplied value.
  request.headers.set("x-workspace-path", request.nextUrl.pathname + request.nextUrl.search);
  let response = NextResponse.next({ request });
  response.headers.set("Cache-Control", "private, no-store");
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) return response;
  const client = createServerClient(url, key, {
    cookieOptions: { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/" },
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (items) => {
        items.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        items.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        response.headers.set("Cache-Control", "private, no-store");
      },
    },
  });
  await client.auth.getClaims();
  return response;
}

export const config = { matcher: ["/dashboard/:path*", "/signup", "/login", "/eligibility", "/services/:path*", "/applications/:path*", "/admin/:path*", "/grace-ai", "/api/auth/:path*", "/api/assessments/:path*", "/api/applications/:path*", "/api/files/:path*", "/api/admin/:path*", "/api/grace-ai/:path*"] };
