import { Providers } from "@/components/layout/Providers";
import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <Providers>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col">
        <div className="flex h-16 items-center px-8">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-xl font-bold text-blue-600">Cocott</span>
            <span className="text-xl font-light text-gray-500">NoStress</span>
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-center p-6">
          {children}
        </div>
      </div>
    </Providers>
  );
}
