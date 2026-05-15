import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Providers } from "@/components/layout/Providers";
import { Sidebar } from "@/components/layout/Sidebar";

export default async function FournisseurLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session || session.user.role !== "SUPPLIER") redirect("/connexion");

  return (
    <Providers>
      <div className="flex h-screen overflow-hidden">
        <Sidebar role="SUPPLIER" userName={session.user.name || session.user.email || ""} />
        <main className="flex-1 overflow-y-auto bg-gray-50 p-8">
          {children}
        </main>
      </div>
    </Providers>
  );
}
