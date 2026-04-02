import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FolderOpen, Clock, CheckCircle, TrendingUp, PlusCircle } from "lucide-react";
import Link from "next/link";
import { PROJECT_STATUS_LABELS } from "@/types";

export default async function ClientDashboardPage() {
  const session = await auth();

  const client = await prisma.clientProfile.findUnique({
    where: { userId: session!.user.id },
    include: {
      projects: {
        include: { _count: { select: { bids: true } } },
        orderBy: { createdAt: "desc" },
        take: 5,
      },
    },
  });

  const stats = {
    total: client?.projects.length || 0,
    open: client?.projects.filter((p) => p.status === "OPEN").length || 0,
    inProgress: client?.projects.filter((p) => p.status === "IN_PROGRESS").length || 0,
    completed: client?.projects.filter((p) => p.status === "COMPLETED").length || 0,
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Bonjour, {session?.user.name} 👋
          </h1>
          <p className="text-gray-500 mt-1">Gérez vos projets et suivez vos offres</p>
        </div>
        <Link href="/client/projets/nouveau">
          <Button>
            <PlusCircle className="h-4 w-4" />
            Nouveau projet
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: "Total projets", value: stats.total, icon: <FolderOpen className="h-5 w-5 text-blue-600" />, color: "bg-blue-50" },
          { label: "En attente d'offres", value: stats.open, icon: <Clock className="h-5 w-5 text-amber-600" />, color: "bg-amber-50" },
          { label: "En cours", value: stats.inProgress, icon: <TrendingUp className="h-5 w-5 text-purple-600" />, color: "bg-purple-50" },
          { label: "Terminés", value: stats.completed, icon: <CheckCircle className="h-5 w-5 text-green-600" />, color: "bg-green-50" },
        ].map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-5">
              <div className={`inline-flex rounded-lg p-2 ${stat.color} mb-3`}>{stat.icon}</div>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              <p className="text-sm text-gray-500">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent projects */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Projets récents</CardTitle>
            <Link href="/client/projets">
              <Button variant="ghost" size="sm">Voir tout</Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {client?.projects.length === 0 ? (
            <div className="text-center py-8">
              <FolderOpen className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">Aucun projet pour le moment</p>
              <Link href="/client/projets/nouveau" className="mt-3 inline-block">
                <Button size="sm">Créer mon premier projet</Button>
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {client?.projects.map((project) => (
                <div key={project.id} className="flex items-center justify-between py-3">
                  <div>
                    <Link
                      href={`/client/projets/${project.id}`}
                      className="font-medium text-gray-900 hover:text-blue-600"
                    >
                      {project.title}
                    </Link>
                    <p className="text-sm text-gray-500 mt-0.5">
                      {project._count.bids} offre{project._count.bids !== 1 ? "s" : ""} reçue{project._count.bids !== 1 ? "s" : ""}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold text-gray-700">
                      {Number(project.referencePrice).toLocaleString("fr-FR")}€ <span className="font-normal text-gray-400">(ref.)</span>
                    </span>
                    <StatusBadge status={project.status} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const variants: Record<string, "default" | "success" | "warning" | "secondary" | "destructive"> = {
    OPEN: "default",
    IN_PROGRESS: "warning",
    COMPLETED: "success",
    FAILED: "destructive",
    CANCELLED: "secondary",
    DRAFT: "secondary",
    IN_REVIEW: "default",
  };
  return (
    <Badge variant={variants[status] || "secondary"}>
      {PROJECT_STATUS_LABELS[status as keyof typeof PROJECT_STATUS_LABELS] || status}
    </Badge>
  );
}
