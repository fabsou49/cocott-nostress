import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { nextUrl, auth: session } = req;
  const pathname = nextUrl.pathname;

  const isLoggedIn = !!session;
  const role = session?.user?.role;

  // Protect client routes
  if (pathname.startsWith("/(client)") || pathname.startsWith("/tableau-de-bord") || pathname.startsWith("/projets/nouveau")) {
    if (!isLoggedIn) return NextResponse.redirect(new URL("/connexion", req.url));
    if (role !== "CLIENT" && role !== "ADMIN") return NextResponse.redirect(new URL("/connexion", req.url));
  }

  // Protect supplier routes
  if (pathname.startsWith("/fournisseur")) {
    if (!isLoggedIn) return NextResponse.redirect(new URL("/connexion", req.url));
    if (role !== "SUPPLIER" && role !== "ADMIN") return NextResponse.redirect(new URL("/connexion", req.url));
  }

  // Protect admin routes
  if (pathname.startsWith("/admin")) {
    if (!isLoggedIn) return NextResponse.redirect(new URL("/connexion", req.url));
    if (role !== "ADMIN") return NextResponse.redirect(new URL("/", req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
