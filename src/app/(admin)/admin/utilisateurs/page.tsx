import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StarRating } from "@/components/ratings/StarRating";
import { Users } from "lucide-react";
import { SponsoringAdminToggle } from "./SponsoringAdminToggle";

export default async function AdminUsersPage() {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
      supplierProfile: {
        select: { registrationPaid: true, averageRating: true, totalRatings: true, companyName: true, sponsoredUntil: true },
      },
      clientProfile: {
        select: { companyName: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const roleLabels: Record<string, string> = {
    CLIENT: "Client",
    SUPPLIER: "Fournisseur",
    ADMIN: "Admin",
  };
  const roleVariants: Record<string, "default" | "success" | "secondary"> = {
    CLIENT: "default",
    SUPPLIER: "success",
    ADMIN: "secondary",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Users className="h-6 w-6" />
          Utilisateurs ({users.length})
        </h1>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Nom</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Email</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Rôle</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Entreprise</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Statut</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Note</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Sponsoring</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Inscription</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">{user.name}</td>
                    <td className="px-4 py-3 text-gray-600">{user.email}</td>
                    <td className="px-4 py-3">
                      <Badge variant={roleVariants[user.role] || "secondary"}>
                        {roleLabels[user.role] || user.role}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {user.supplierProfile?.companyName || user.clientProfile?.companyName || "—"}
                    </td>
                    <td className="px-4 py-3">
                      {user.role === "SUPPLIER" ? (
                        <Badge variant={user.supplierProfile?.registrationPaid ? "success" : "warning"}>
                          {user.supplierProfile?.registrationPaid ? "Actif" : "Non payé"}
                        </Badge>
                      ) : (
                        <Badge variant="success">Actif</Badge>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {user.role === "SUPPLIER" && user.supplierProfile ? (
                        <StarRating value={user.supplierProfile.averageRating} size="sm" />
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {user.role === "SUPPLIER" ? (
                        <SponsoringAdminToggle
                          userId={user.id}
                          sponsoredUntil={user.supplierProfile?.sponsoredUntil?.toISOString() ?? null}
                        />
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-500">
                      {new Date(user.createdAt).toLocaleDateString("fr-FR")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
