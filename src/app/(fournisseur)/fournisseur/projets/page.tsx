import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FolderOpen, Calendar, Users, ArrowRight } from "lucide-react";
import Link from "next/link";
import { PROJECT_CATEGORIES } from "@/types";

export default async function SupplierProjectsPage({
  searchParams,
}: {
  searchParams: { category?: string };
}) {
  const session = await auth();
  const supplier = await prisma.supplierProfile.findUnique({ where: { userId: session!.user.id } });

  // Get the IDs of projects this supplier already bid on
  const myBids = await prisma.bid.findMany({
    where: { supplierId: supplier!.id, status: { not: "WITHDRAWN" } },
    select: { projectId: true },
  });
  const bidProjectIds = new Set(myBids.map((b) => b.projectId));

  const projects = await prisma.project.findMany({
    where: {
      status: "OPEN",
      ...(searchParams.category && { category: searchParams.category }),
    },
    select: {
      id: true,
      title: true,
      description: true,
      category: true,
      deadline: true,
      status: true,
      createdAt: true,
      client: {
        select: { companyName: true, user: { select: { name: true } } },
      },
      _count: { select: { bids: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Projets disponibles</h1>
        <p className="text-gray-500 mt-1">
          {projects.length} projet{projects.length !== 1 ? "s" : ""} ouvert{projects.length !== 1 ? "s" : ""}
        </p>
      </div>

      {/* Category filter */}
      <div className="flex flex-wrap gap-2">
        <Link href="/fournisseur/projets">
          <Badge variant={!searchParams.category ? "default" : "outline"} className="cursor-pointer">
            Tous
          </Badge>
        </Link>
        {PROJECT_CATEGORIES.map((cat) => (
          <Link key={cat} href={`/fournisseur/projets?category=${encodeURIComponent(cat)}`}>
            <Badge
              variant={searchParams.category === cat ? "default" : "outline"}
              className="cursor-pointer"
            >
              {cat}
            </Badge>
          </Link>
        ))}
      </div>

      {projects.length === 0 ? (
        <div className="text-center py-20">
          <FolderOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-lg font-medium text-gray-900">Aucun projet disponible</h2>
          <p className="text-gray-500 mt-1">Revenez bientôt pour de nouvelles opportunités</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => {
            const alreadyBid = bidProjectIds.has(project.id);
            return (
              <Card key={project.id} className="h-full flex flex-col">
                <CardContent className="p-5 flex flex-col flex-1">
                  <div className="flex items-start justify-between mb-3">
                    {project.category && (
                      <Badge variant="secondary">{project.category}</Badge>
                    )}
                    {alreadyBid && (
                      <Badge variant="success" className="ml-auto">Offre soumise</Badge>
                    )}
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">{project.title}</h3>
                  <p className="text-sm text-gray-500 line-clamp-3 flex-1">{project.description}</p>

                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                      <div className="flex items-center gap-1">
                        <Users className="h-3.5 w-3.5" />
                        {project._count.bids} offre{project._count.bids !== 1 ? "s" : ""}
                      </div>
                      {project.deadline && (
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5" />
                          {new Date(project.deadline).toLocaleDateString("fr-FR")}
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-gray-400 mb-3">
                      Client : {project.client.companyName || project.client.user.name}
                    </p>
                    <Link href={`/fournisseur/projets/${project.id}`}>
                      <Button variant="outline" size="sm" className="w-full">
                        Voir le projet <ArrowRight className="h-3.5 w-3.5 ml-1" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
