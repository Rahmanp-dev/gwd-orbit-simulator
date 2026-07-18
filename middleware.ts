import NextAuth from "next-auth";
import { authConfig } from "@/auth.config";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const { auth } = NextAuth(authConfig);

/**
 * GWD Orbit Simulator — Route Protection Middleware
 *
 * Three protection tiers:
 * 1. Public routes — no auth needed
 * 2. Protected routes — any authenticated user
 * 3. Role-gated routes — specific roles only
 */

// Routes that DO NOT require authentication
const PUBLIC_ROUTES = ["/", "/login", "/register", "/leaderboard", "/suspended"];
const PUBLIC_PREFIXES = ["/api/auth", "/_next", "/favicon.ico"];

// Routes that require a specific minimum role
const ROLE_ROUTES: { pattern: RegExp; roles: string[] }[] = [
  { pattern: /^\/admin(\/.*)?$/,     roles: ["admin", "organizer"] },
  { pattern: /^\/organizer(\/.*)?$/, roles: ["organizer"] },
  { pattern: /^\/judge(\/.*)?$/,     roles: ["judge", "organizer"] },
  { pattern: /^\/api\/admin(\/.*)?$/,roles: ["admin", "organizer"] },
];

export default auth((req: NextRequest & { auth: any }) => {
  const { pathname } = req.nextUrl;
  const session = req.auth;

  // Check if user is suspended (and not already on /suspended)
  if (session && (session.user as any).suspended) {
    if (pathname !== "/suspended" && !PUBLIC_PREFIXES.some((p) => pathname.startsWith(p))) {
      // For API requests, return 403 Forbidden
      if (pathname.startsWith("/api/")) {
        return new NextResponse(
          JSON.stringify({ error: "Your account is suspended. Please contact the administrator." }),
          { status: 403, headers: { "Content-Type": "application/json" } }
        );
      }
      return NextResponse.redirect(new URL("/suspended", req.url));
    }
  }

  // 1. Allow public prefixes (Next.js internals, auth, static)
  if (PUBLIC_PREFIXES.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  // 2. Allow fully public routes
  if (PUBLIC_ROUTES.includes(pathname)) {
    // Redirect authenticated users away from login/register/landing to their role dashboard
    if (session && (pathname === "/login" || pathname === "/register" || pathname === "/")) {
      const user = session.user as any;
      const role = user?.role || "participant";
      const pRole = user?.participantRole;
      
      let redirectPath = "/dashboard";
      if (role === "organizer") redirectPath = "/organizer";
      else if (role === "admin") redirectPath = "/admin/deals";
      else if (role === "judge") redirectPath = "/judge";
      else if (role === "participant" && pRole === "project_manager") redirectPath = "/dashboard/pm";

      return NextResponse.redirect(new URL(redirectPath, req.url));
    }
    return NextResponse.next();
  }

  // 3. Require authentication for all other routes
  if (!session?.user) {
    // API routes — return 401 JSON
    if (pathname.startsWith("/api/")) {
      return new NextResponse(
        JSON.stringify({ error: "Unauthorized — please authenticate" }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }
    // Page routes — redirect to login
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 4. Check role-gated routes
  const userRole = (session.user as any)?.role ?? "participant";
  for (const { pattern, roles } of ROLE_ROUTES) {
    if (pattern.test(pathname)) {
      if (!roles.includes(userRole)) {
        // API routes — return 403 JSON
        if (pathname.startsWith("/api/")) {
          return new NextResponse(
            JSON.stringify({ error: `Forbidden — requires one of: ${roles.join(", ")}` }),
            { status: 403, headers: { "Content-Type": "application/json" } }
          );
        }
        // Page routes — redirect to dashboard (the layout barrier handles the visual message)
        return NextResponse.redirect(new URL("/dashboard", req.url));
      }
      break;
    }
  }

  return NextResponse.next();
});

export const config = {
  /*
   * Match all routes EXCEPT:
   * - _next/static (static files)
   * - _next/image (image optimization)
   * - favicon.ico
   * - public folder files (.png, .jpg, .svg, .webp, .ico)
   */
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|gif|svg|webp|ico)$).*)"],
};
