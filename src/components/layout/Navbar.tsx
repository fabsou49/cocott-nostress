"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { LogOut, User, LayoutDashboard } from "lucide-react";

export function Navbar() {
  const { data: session } = useSession();

  const dashboardHref =
    session?.user.role === "CLIENT"
      ? "/client/tableau-de-bord"
      : session?.user.role === "SUPPLIER"
      ? "/fournisseur/tableau-de-bord"
      : session?.user.role === "ADMIN"
      ? "/admin/tableau-de-bord"
      : null;

  return (
    <nav className="border-b border-gray-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-xl font-bold text-blue-600">Cocott</span>
            <span className="text-xl font-light text-gray-500">NoStress</span>
          </Link>

          <div className="flex items-center gap-3">
            {session ? (
              <>
                <span className="hidden text-sm text-gray-600 sm:block">{session.user.name}</span>
                {dashboardHref && (
                  <Link href={dashboardHref}>
                    <Button variant="outline" size="sm">
                      <LayoutDashboard className="h-4 w-4" />
                      <span className="hidden sm:block">Tableau de bord</span>
                    </Button>
                  </Link>
                )}
                <Button variant="ghost" size="sm" onClick={() => signOut({ callbackUrl: "/" })}>
                  <LogOut className="h-4 w-4" />
                </Button>
              </>
            ) : (
              <>
                <Link href="/connexion">
                  <Button variant="outline" size="sm">
                    <User className="h-4 w-4" />
                    Connexion
                  </Button>
                </Link>
                <Link href="/inscription/client">
                  <Button size="sm">Commencer</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
