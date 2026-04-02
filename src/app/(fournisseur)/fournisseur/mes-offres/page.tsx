import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, Clock, ArrowRight } from "lucide-react";
import Link from "next/link";
import { BID_STATUS_LABELS, BidStatus, PROJECT_STATUS_LABELS, ProjectStatus } from "@/types";

export default async function MesOffresPage() {
  const session = await auth();
  const supplier = await prisma.supplierProfile.findUnique({ where: { userId: session!.user.id } });

  const bids = await prisma.bid.findMany({
    where: { supplierId: supplier!.id },
    include: {
      project: {
        select: {
          id: true,
          title: true,
          category: true,
          status: true,
          client: { select: { companyName: true, user: { select: { name: true } } } },
        },
      },
    },
    orderBy: { submittedAt: "desc" },
  });

  const bidVariants: Record<string, "default" | "success" | "warning" | "secondary" | "destructive"> = {
    PENDING: "warning",
    ACCEPTED: "success",
    REJECTED: "secondary",
    WITHDRAWN: "secondary",
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Mes offres</h1>
        <p className="text-gray-500 mt-1">
          {bids.length} offre{bids.length !== 1 ? "s" : ""} soumise{bids.length !== 1 ? "s" : ""}
        </p>
      </div>

      {bids.length === 0 ? (
        <div className="text-center py-20">
          <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-lg font-medium text-gray-900">Aucune offre</h2>
          <p className="text-gray-500 mt-1">
            Parcourez les projets disponibles et soumettez vos premières offres
          </p>
          <Link href="/fournisseur/projets" className="mt-4 inline-block">
            <Badge variant="default" className="cursor-pointer text-sm px-4 py-1.5">
              Parcourir les projets
            </Badge>
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {bids.map((bid) => (
            <Card key={bid.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant={bidVariants[bid.status] || "secondary"}>
                        {BID_STATUS_LABELS[bid.status as BidStatus]}
                      </Badge>
                      <Badge variant="outline">
                        {PROJECT_STATUS_LABELS[bid.project.status as ProjectStatus]}
                      </Badge>
                      {bid.project.category && (
                        <span className="text-xs text-gray-400">{bid.project.category}</span>
                      )}
                    </div>
                    <p className="font-semibold text-gray-900">{bid.project.title}</p>
                    <p className="text-sm text-gray-500 mt-0.5">
                      {bid.project.client.companyName || bid.project.client.user.name}
                    </p>
                    {bid.coverLetter && (
                      <p className="text-sm text-gray-600 mt-2 line-clamp-2">{bid.coverLetter}</p>
                    )}
                    <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        {new Date(bid.submittedAt).toLocaleDateString("fr-FR")}
                      </span>
                      {bid.estimatedDays && <span>{bid.estimatedDays} jours</span>}
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <p className="text-xl font-bold text-gray-900">
                      {Number(bid.amount).toLocaleString("fr-FR")}€
                    </p>
                    <Link href={`/fournisseur/projets/${bid.project.id}`}>
                      <Badge variant="outline" className="cursor-pointer mt-2">
                        Voir <ArrowRight className="h-3 w-3 ml-1" />
                      </Badge>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
