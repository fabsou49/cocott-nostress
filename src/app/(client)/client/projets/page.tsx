import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FolderOpen, PlusCircle, Calendar, Users } from "lucide-react";
import Link from "next/link";
import { PROJECT_STATUS_LABELS, ProjectStatus } from "@/types";

export default async function ClientProjectsPage() {
  const session = await auth();

  const client = await prisma.clientProfile.findUnique({ where: { userId: session!.user.id } });
  const projects = await prisma.project.findMany({
    where: { clientId: client!.id },
    include: { _count: { select: { bids: true } } },
    orderBy: { createdAt: "desc" },
  });

  const statusVariants: Record<string, "default" | "success" | "warning" | "secondary" | "destructive"> = {
    OPEN: "default",
    IN_PROGRESS: "warning",
    COMPLETED: "success",
    FAILED: "destructive",
    CANCELLED: "secondary",
    DRAFT: "secondary",
    IN_REVIEW: "default",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Mes projets</h1>
        <Link href="/client/projets/nouveau">
          <Button>
            <PlusCircle className="h-4 w-4" />
            Nouveau projet
          </Button>
        </Link>
      </div>

      {projects.length === 0 ? (
        <div className="text-center py-20">
          <FolderOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-lg font-medium text-gray-900">Aucun projet</h2>
          <p className="text-gray-500 mt-1">Créez votre premier projet pour recevoir des offres</p>
          <Link href="/client/projets/nouveau" className="mt-4 inline-block">
            <Button>Créer un projet</Button>
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <Link key={project.id} href={`/client/projets/${project.id}`}>
              <Card className="h-full hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <Badge variant={statusVariants[project.status] || "secondary"}>
                      {PROJECT_STATUS_LABELS[project.status as ProjectStatus]}
                    </Badge>
                    {project.category && (
                      <span className="text-xs text-gray-400">{project.category}</span>
                    )}
                  </div>
                  <h3 className="font-semibold text-gray-900 line-clamp-2 mb-2">{project.title}</h3>
                  <p className="text-sm text-gray-500 line-clamp-2 mb-4">{project.description}</p>

                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-1 text-gray-500">
                      <Users className="h-4 w-4" />
                      {project._count.bids} offre{project._count.bids !== 1 ? "s" : ""}
                    </div>
                    <div className="font-semibold text-gray-700">
                      {Number(project.referencePrice).toLocaleString("fr-FR")}€
                    </div>
                  </div>

                  {project.deadline && (
                    <div className="flex items-center gap-1 text-xs text-gray-400 mt-2">
                      <Calendar className="h-3.5 w-3.5" />
                      {new Date(project.deadline).toLocaleDateString("fr-FR")}
                    </div>
                  )}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
