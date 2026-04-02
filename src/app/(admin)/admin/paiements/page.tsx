import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CreditCard, Euro } from "lucide-react";

export default async function AdminPaiementsPage() {
  const [commissions, payments] = await Promise.all([
    prisma.commission.findMany({
      include: {
        project: { select: { title: true } },
        bid: {
          include: {
            supplier: { select: { companyName: true, user: { select: { name: true } } } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.payment.findMany({
      include: { user: { select: { name: true, email: true } } },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
  ]);

  const totalPendingCommissions = commissions
    .filter((c) => c.status === "PENDING")
    .reduce((sum, c) => sum + Number(c.commissionAmount), 0);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
        <CreditCard className="h-6 w-6" />
        Paiements & Commissions
      </h1>

      {/* Summary */}
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 flex items-center gap-3">
        <Euro className="h-5 w-5 text-amber-600" />
        <div>
          <p className="text-sm font-semibold text-amber-800">
            {totalPendingCommissions.toLocaleString("fr-FR")}€ de commissions en attente
          </p>
          <p className="text-xs text-amber-700">
            {commissions.filter((c) => c.status === "PENDING").length} commission(s) à facturer
          </p>
        </div>
      </div>

      {/* Commissions table */}
      <Card>
        <CardHeader><CardTitle>Commissions</CardTitle></CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Projet</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Fournisseur</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Type</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Montant prestation</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Taux</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Commission</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Statut</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Date</th>
                </tr>
              </thead>
              <tbody>
                {commissions.map((c) => (
                  <tr key={c.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900 max-w-xs">
                      <p className="truncate">{c.project.title}</p>
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {c.bid.supplier.companyName || c.bid.supplier.user.name}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={c.type === "SUCCESS" ? "success" : "destructive"}>
                        {c.type === "SUCCESS" ? "Réussie" : "Échouée"}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 font-medium">
                      {Number(c.baseAmount).toLocaleString("fr-FR")}€
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {(Number(c.commissionRate) * 100).toFixed(0)}%
                    </td>
                    <td className="px-4 py-3 font-semibold text-green-700">
                      {Number(c.commissionAmount).toLocaleString("fr-FR")}€
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={c.status === "PAID" ? "success" : c.status === "INVOICED" ? "default" : "warning"}>
                        {c.status === "PAID" ? "Payée" : c.status === "INVOICED" ? "Facturée" : "En attente"}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-gray-500">
                      {new Date(c.createdAt).toLocaleDateString("fr-FR")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {commissions.length === 0 && (
              <p className="text-center text-gray-500 py-8">Aucune commission</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Registration payments */}
      <Card>
        <CardHeader><CardTitle>Paiements d'inscription</CardTitle></CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Utilisateur</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Type</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Montant</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Statut</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Date</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((p) => (
                  <tr key={p.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900">{p.user.name}</p>
                      <p className="text-xs text-gray-500">{p.user.email}</p>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant="default">
                        {p.type === "REGISTRATION" ? "Inscription" : "Commission"}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 font-semibold">
                      {Number(p.amount).toLocaleString("fr-FR")}€
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={p.status === "SUCCEEDED" ? "success" : p.status === "FAILED" ? "destructive" : "warning"}>
                        {p.status === "SUCCEEDED" ? "Réussi" : p.status === "FAILED" ? "Échoué" : "En attente"}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-gray-500">
                      {new Date(p.createdAt).toLocaleDateString("fr-FR")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {payments.length === 0 && (
              <p className="text-center text-gray-500 py-8">Aucun paiement</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
