import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Providers } from "@/components/layout/Providers";
import { Sidebar } from "@/components/layout/Sidebar";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") redirect("/");

  return (
    <Providers>
      <div className="flex h-screen overflow-hidden">
        <Sidebar role="ADMIN" userName={session.user.name || session.user.email || ""} />
        <main className="flex-1 overflow-y-auto bg-gray-50 p-8">
          {children}
        </main>
      </div>
    </Providers>
  );
}
