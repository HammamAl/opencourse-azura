import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

// Define role types for better type safety
type UserRole = "admin" | "student" | "lecturer";

// Define route patterns and their allowed roles
const routeRoleMap: Record<string, UserRole[]> = {
  "/a": ["admin"],
  "/s": ["student"],
  "/l": ["lecturer"],
};

// Define public routes that don't require authentication
const publicRoutes = [
  "/",
  "/login",
  "/register",
  "/reset",
  "/reset-password",
  "/course",
  "/cart",
  "/invoice",
  "/api/auth/register",
  "/api/auth/signin",
  "/api/auth/callback",
  "/api/auth/session",
  "/api/auth/providers",
  "/api/auth/csrf",
  "/unauthorized",
  "/api/health",
  "/health",
  "/simple",
];

// Helper function to get dashboard URL based on role
function getDashboardUrl(role: UserRole): string {
  switch (role) {
    case "admin":
      return "/a/dash";
    case "lecturer":
      return "/l/dash";
    case "student":
    default:
      return "/s/dash";
  }
}

// Helper function to check if a route is public
function isPublicRoute(pathname: string): boolean {
  return publicRoutes.some((route) => {
    if (route === "/") {
      return pathname === "/";
    }
    return pathname.startsWith(route);
  });
}

// Helper function to handle domain redirects
function handleDomainRedirect(request: NextRequest): NextResponse | null {
  const url = request.nextUrl.clone();
  const hostname = url.hostname;

  // Production domain configuration
  const isProduction = process.env.NODE_ENV === "production";
  const primaryDomain = "hammamal.live";
  const wwwDomain = "www.hammamal.live";
  const azureDomain = "hammamal-elearning-app-prod-fvdua8defrgnece3.indonesiacentral-01.azurewebsites.net";

  if (isProduction) {
    // Redirect Azure default domain to custom domain
    if (hostname === azureDomain) {
      url.hostname = primaryDomain;
      return NextResponse.redirect(url, 301);
    }

    // Redirect www to non-www (or vice versa based on your preference)
    // Option 1: Redirect www to non-www
    if (hostname === wwwDomain) {
      url.hostname = primaryDomain;
      return NextResponse.redirect(url, 301);
    }

    // Option 2: Redirect non-www to www (uncomment if preferred)
    // if (hostname === primaryDomain) {
    //   url.hostname = wwwDomain;
    //   return NextResponse.redirect(url, 301);
    // }
  }

  return null;
}

// Helper function to handle security headers
function addSecurityHeaders(response: NextResponse): void {
  // Security headers for production
  if (process.env.NODE_ENV === "production") {
    response.headers.set("X-Frame-Options", "DENY");
    response.headers.set("X-Content-Type-Options", "nosniff");
    response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
    response.headers.set("X-XSS-Protection", "1; mode=block");
    response.headers.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains; preload");
  }
}

export async function middleware(request: NextRequest) {
  // Handle domain redirects first
  const domainRedirect = handleDomainRedirect(request);
  if (domainRedirect) {
    return domainRedirect;
  }

  const { pathname } = request.nextUrl;

  // Skip authentication for health check endpoints
  if (pathname === "/api/health" || pathname === "/health") {
    const response = NextResponse.next();
    addSecurityHeaders(response);
    return response;
  }

  // Get the token which contains user information
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  // Handle public routes (including register page)
  if (isPublicRoute(pathname)) {
    // Special handling for login and register pages when user is already authenticated
    // Only redirect from login/register pages, NOT from the landing page
    if ((pathname === "/login" || pathname === "/register") && token) {
      const userRole = token.role as UserRole;
      const dashboardUrl = getDashboardUrl(userRole);
      return NextResponse.redirect(new URL(dashboardUrl, request.url));
    }

    // REMOVED: The problematic root path redirect that was preventing students from accessing landing page
    // This allows all users (authenticated and unauthenticated) to access the landing page

    // Allow access to public routes
    const response = NextResponse.next();
    addSecurityHeaders(response);
    return response;
  }

  // If no token (not authenticated) and trying to access protected routes, redirect to login
  if (!token) {
    const loginUrl = new URL("/login", request.url);
    // Add the current path as a callback URL so user can be redirected back after login
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Check role-based access for protected routes
  for (const [routePrefix, allowedRoles] of Object.entries(routeRoleMap)) {
    if (pathname.startsWith(routePrefix + "/")) {
      const userRole = token.role as UserRole;
      if (!allowedRoles.includes(userRole)) {
        // Redirect to unauthorized page with information about the attempted access
        const unauthorizedUrl = new URL("/unauthorized", request.url);
        unauthorizedUrl.searchParams.set("attempted", pathname);
        unauthorizedUrl.searchParams.set("userRole", userRole || "unknown");
        return NextResponse.redirect(unauthorizedUrl);
      }
      // User has correct role, allow access
      break;
    }
  }

  // Add custom headers to track user info and security
  const response = NextResponse.next();
  if (token) {
    response.headers.set("x-user-role", (token.role as string) || "unknown");
    response.headers.set("x-user-id", token.id || "unknown");
  }
  response.headers.set("x-deployment-timestamp", "2025-07-16 06:01:18");
  response.headers.set("x-deployed-by", "HammamAl");

  // Add security headers
  addSecurityHeaders(response);

  return response;
}

// Configure which paths this middleware should run on
export const config = {
  matcher: [
    // Add root path
    "/",
    // Add login page to matcher
    "/login",
    // Add register page to matcher
    "/register",
    // Add reset password pages
    "/reset",
    "/reset-password",
    // Add course pages (public)
    "/course/:path*",
    // Add invoice pages (public but will be protected by logic)
    "/invoice/:path*",
    // Match all admin routes
    "/a/:path*",
    // Match all user routes
    "/s/:path*",
    // Match all lecturer routes
    "/l/:path*",
    // Add unauthorized page
    "/unauthorized",
    // Add health check endpoints
    "/api/health",
    "/health",
    "/simple/:path*",
    "/cart/:courseId?",
    // Exclude static files and most API routes (except auth)
    "/((?!api/(?!auth)|_next/static|_next/image|favicon.ico|public).*)",
  ],
};
