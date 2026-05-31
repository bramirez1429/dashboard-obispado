import { auth } from "@/auth";
import { NextResponse } from "next/server";


export const proxy = auth((request) => {
  console.log("PROXY HIT", {
    pathname: request.nextUrl.pathname,
    hasAuth: Boolean(request.auth),
    user: request.auth?.user,
  })
  const { pathname } = request.nextUrl;
  const isDashboardRoute = pathname.startsWith("/dashboard");
  const isLoginRoute = pathname === "/login";
  const isLoggedIn = Boolean(request.auth?.user);

  if (isDashboardRoute && !isLoggedIn) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (isLoginRoute && isLoggedIn) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/dashboard/:path*", "/login"],
};
