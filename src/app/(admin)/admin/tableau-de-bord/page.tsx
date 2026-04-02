import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, FolderOpen, Euro, TrendingUp, Clock, CheckCircle } from "lucide-react";

export default async function AdminDashboardPage() {
  const [
    totalUsers,
    totalClients,
    totalSuppliers,
    registeredSuppliers,
    openProjects,
    completedProjects,
    pendingCommissions,
    paidCommissions,
    registrationRevenue,
    recentCommissions,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { role: "CLIENT" } }),
    prisma.user.count({ where: { role: "SUPPLIER" } }),
    prisma.supplierProfile.count({ where: { registrationPaid: true } }),
    prisma.project.count({ where: { status: "OPEN" } }),
    prisma.project.count({ where: { status: "COMPLETED" } }),
    prisma.commission.aggregate({
      where: { status: "PENDING" },
      _sum: { commissionAmount: true },
      _count: true,
    }),
    prisma.commission.aggregate({
      where: { status: "PAID" },
      _sum: { commissionAmount: true },
    }),
    prisma.payment.aggregate({
      where: { type: "REGISTRATION", status: "SUCCEEDED" },
      _sum: { amount: true },
    }),
    prisma.commission.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: {
        project: { select: { title: true } },
        bid: { select: { amount: true, supplier: { select: { companyName: true } } } },
      },
    }),
  ]);

  const totalRevenue =
    Number(registrationRevenue._sum.amount || 0) +
    Number(paidCommissions._sum.commissionAmount || 0);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Tableau de bord admin</h1>
        <p className="text-gray-500 mt-1">Vue d'ensemble de la plateforme</p>
      </div>

      {/* Main KPIs */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {[
          { label: "Total utilisateurs", value: totalUsers, icon: <Users className="h-5 w-5 text-blue-600" />, color: "bg-blue-50" },
          { label: "Clients", value: totalClients, icon: <Users className="h-5 w-5 text-purple-600" />, color: "bg-purple-50" },
          { label: "Fournisseurs inscrits", value: registeredSuppliers, icon: <CheckCircle className="h-5 w-5 text-green-600" />, color: "bg-green-50" },
          { label: "Projets ouverts", value: openProjects, icon: <FolderOpen className="h-5 w-5 text-amber-600" />, color: "bg-amber-50" },
          { label: "Commissions en attente", value: pendingCommissions._count, icon: <Clock className="h-5 w-5 text-red-500" />, color: "bg-red-50" },
          { label: "Revenus totaux", value: `${totalRevenue.toLocaleString("fr-FR")}€`, icon: <Euro className="h-5 w-5 text-emerald-600" />, color: "bg-emerald-50" },
        ].map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-4">
              <div className={`inline-flex rounded-lg p-2 ${stat.color} mb-2`}>{stat.icon}</div>
              <p className="text-xl font-bold text-gray-900">{stat.value}</p>
              <p className="text-xs text-gray-500 leading-tight">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Revenue breakdown */}
        <Card>
          <CardHeader><CardTitle>Revenus de la plateforme</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {[
              {
                label: "Inscriptions fournisseurs",
                amount: Number(registrationRevenue._sum.amount || 0),
                desc: `${registeredSuppliers} inscription(s) × 100€`,
                color: "text-blue-600",
              },
              {
                label: "Commissions perçues",
                amount: Number(paidCommissions._sum.commissionAmount || 0),
                desc: "10% réussies + 5% échouées",
                color: "text-green-600",
              },
              {
                label: "Commissions en attente",
                amount: Number(pendingCommissions._sum.commissionAmount || 0),
                desc: `${pendingCommissions._count} commission(s) à facturer`,
                color: "text-amber-600",
              },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                <div>
                  <p className="text-sm font-medium text-gray-900">{item.label}</p>
                  <p className="text-xs text-gray-500">{item.desc}</p>
                </div>
                <p className={`text-lg font-bold ${item.color}`}>
                  {item.amount.toLocaleString("fr-FR")}€
                </p>
              </div>
            ))}
            <div className="border-t pt-3 flex justify-between">
              <p className="font-semibold text-gray-900">Total perçu</p>
              <p className="text-xl font-bold text-gray-900">{totalRevenue.toLocaleString("fr-FR")}€</p>
            </div>
          </CardContent>
        </Card>

        {/* Recent commissions */}
        <Card>
          <CardHeader><CardTitle>Commissions récentes</CardTitle></CardHeader>
          <CardContent>
            {recentCommissions.length === 0 ? (
              <p className="text-gray-500 text-sm text-center py-6">Aucune commission</p>
            ) : (
              <div className="divide-y divide-gray-100">
                {recentCommissions.map((c) => (
                  <div key={c.id} className="py-3">
                    <div className="flex justify-between mb-1">
                      <p className="text-sm font-medium line-clamp-1">{c.project.title}</p>
                      <p className="text-sm font-bold text-green-700">
                        +{Number(c.commissionAmount).toLocaleString("fr-FR")}€
                      </p>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>{c.bid.supplier.companyName}</span>
                      <span>
                        {c.type === "SUCCESS" ? "Réussie (10%)" : "Échouée (5%)"}
                        {" — "}
                        {c.status === "PENDING" ? "En attente" : "Payée"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
