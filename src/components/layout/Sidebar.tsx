"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils/cn";
import { signOut } from "next-auth/react";
import {
  LayoutDashboard,
  FolderOpen,
  PlusCircle,
  FileText,
  Users,
  CreditCard,
  Tag,
  LogOut,
} from "lucide-react";

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
}

interface SidebarProps {
  role: "CLIENT" | "SUPPLIER" | "ADMIN";
  userName: string;
}

const clientNav: NavItem[] = [
  { href: "/client/tableau-de-bord", label: "Tableau de bord", icon: <LayoutDashboard className="h-4 w-4" /> },
  { href: "/client/projets", label: "Mes projets", icon: <FolderOpen className="h-4 w-4" /> },
  { href: "/client/projets/nouveau", label: "Nouveau projet", icon: <PlusCircle className="h-4 w-4" /> },
];

const supplierNav: NavItem[] = [
  { href: "/fournisseur/tableau-de-bord", label: "Tableau de bord", icon: <LayoutDashboard className="h-4 w-4" /> },
  { href: "/fournisseur/projets", label: "Parcourir les projets", icon: <FolderOpen className="h-4 w-4" /> },
  { href: "/fournisseur/mes-offres", label: "Mes offres", icon: <FileText className="h-4 w-4" /> },
];

const adminNav: NavItem[] = [
  { href: "/admin/tableau-de-bord", label: "Tableau de bord", icon: <LayoutDashboard className="h-4 w-4" /> },
  { href: "/admin/utilisateurs", label: "Utilisateurs", icon: <Users className="h-4 w-4" /> },
  { href: "/admin/projets", label: "Projets", icon: <FolderOpen className="h-4 w-4" /> },
  { href: "/admin/paiements", label: "Paiements", icon: <CreditCard className="h-4 w-4" /> },
  { href: "/admin/offres-commerciales", label: "Offres commerciales", icon: <Tag className="h-4 w-4" /> },
];

export function Sidebar({ role, userName }: SidebarProps) {
  const pathname = usePathname();
  const navItems = role === "CLIENT" ? clientNav : role === "SUPPLIER" ? supplierNav : adminNav;

  return (
    <aside className="flex h-full w-64 flex-col border-r border-gray-200 bg-white">
      <div className="flex h-16 items-center border-b border-gray-200 px-6">
        <Link href="/" className="flex items-center gap-2">
          <span className="font-bold text-blue-600">Cocott</span>
          <span className="font-light text-gray-400">NoStress</span>
        </Link>
      </div>

      <nav className="flex-1 space-y-1 p-4">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
              pathname === item.href || pathname.startsWith(item.href + "/")
                ? "bg-blue-50 text-blue-700"
                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
            )}
          >
            {item.icon}
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="border-t border-gray-200 p-4">
        <div className="mb-3 px-3">
          <p className="text-xs font-medium text-gray-500">Connecté en tant que</p>
          <p className="text-sm font-medium text-gray-900 truncate">{userName}</p>
          <p className="text-xs text-gray-400">
            {role === "CLIENT" ? "Client" : role === "SUPPLIER" ? "Fournisseur" : "Administrateur"}
          </p>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-gray-600 hover:bg-red-50 hover:text-red-600 transition-colors"
        >
          <LogOut className="h-4 w-4" />
          Déconnexion
        </button>
      </div>
    </aside>
  );
}
