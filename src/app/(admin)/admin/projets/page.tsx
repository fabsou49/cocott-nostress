import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FolderOpen } from "lucide-react";
import { PROJECT_STATUS_LABELS, ProjectStatus } from "@/types";

export default async function AdminProjectsPage() {
  const projects = await prisma.project.findMany({
    include: {
      client: { select: { companyName: true, user: { select: { name: true } } } },
      _count: { select: { bids: true } },
    },
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
      <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
        <FolderOpen className="h-6 w-6" />
        Projets ({projects.length})
      </h1>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Titre</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Client</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Catégorie</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Statut</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Offres</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Prix ref.</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Date</th>
                </tr>
              </thead>
              <tbody>
                {projects.map((project) => (
                  <tr key={project.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900 max-w-xs">
                      <p className="truncate">{project.title}</p>
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {project.client.companyName || project.client.user.name}
                    </td>
                    <td className="px-4 py-3 text-gray-500">{project.category || "—"}</td>
                    <td className="px-4 py-3">
                      <Badge variant={statusVariants[project.status] || "secondary"}>
                        {PROJECT_STATUS_LABELS[project.status as ProjectStatus]}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{project._count.bids}</td>
                    <td className="px-4 py-3 font-medium">
                      {Number(project.referencePrice).toLocaleString("fr-FR")}€
                    </td>
                    <td className="px-4 py-3 text-gray-500">
                      {new Date(project.createdAt).toLocaleDateString("fr-FR")}
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
