import { NextRequest, NextResponse } from "next/server";

// 1. Specify protected and public routes
const protectedRoutes = ["/dashboard", "/trips", "/account"];
const publicRoutes = [
  "/login",
  "/signup",
  "/forgot-password",
  "/reset-password",
  "/",
];

export default async function proxy(req: NextRequest) {
  // 2. Check if the current route is protected or public
  const path = req.nextUrl.pathname;
  const isProtectedRoute = protectedRoutes.some(
    (route) => path === route || path.startsWith(`${route}/`),
  );
  const isPublicRoute = publicRoutes.includes(path);

  // 3. Get the JWT from the cookie
  const jwt = req.cookies.get("jwt")?.value;

  // 4. Redirect to /login if the user is not authenticated
  if (isProtectedRoute && !jwt) {
    return NextResponse.redirect(new URL("/login", req.nextUrl));
  }

  // 5. Redirect to /dashboard if the user is authenticated
  if (isPublicRoute && jwt) {
    return NextResponse.redirect(new URL("/dashboard", req.nextUrl));
  }

  return NextResponse.next();
}

// Routes Proxy should not run on
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|.*\\.png$).*)"],
};
