import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const [
    totalUsers,
    totalClients,
    totalSuppliers,
    registeredSuppliers,
    openProjects,
    completedProjects,
    pendingCommissions,
    paidCommissions,
    totalRegistrationRevenue,
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
    }),
    prisma.commission.aggregate({
      where: { status: "PAID" },
      _sum: { commissionAmount: true },
    }),
    prisma.payment.aggregate({
      where: { type: "REGISTRATION", status: "SUCCEEDED" },
      _sum: { amount: true },
    }),
  ]);

  return NextResponse.json({
    users: { total: totalUsers, clients: totalClients, suppliers: totalSuppliers, registeredSuppliers },
    projects: { open: openProjects, completed: completedProjects },
    commissions: {
      pending: Number(pendingCommissions._sum.commissionAmount || 0),
      paid: Number(paidCommissions._sum.commissionAmount || 0),
    },
    revenue: {
      registrations: Number(totalRegistrationRevenue._sum.amount || 0),
      totalCommissions: Number(pendingCommissions._sum.commissionAmount || 0) + Number(paidCommissions._sum.commissionAmount || 0),
    },
  });
}
