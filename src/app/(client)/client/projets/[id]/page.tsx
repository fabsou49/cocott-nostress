import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StarRating } from "@/components/ratings/StarRating";
import { AcceptBidButton } from "@/components/projets/AcceptBidButton";
import { UpdateStatusButton } from "@/components/projets/UpdateStatusButton";
import {
  Calendar,
  EyeOff,
  Tag,
  Users,
  Clock,
  CheckCircle,
  Star,
  Zap,
  CreditCard,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";
import { PROJECT_STATUS_LABELS, ProjectStatus } from "@/types";
import { PayEscrowButton } from "@/components/projets/PayEscrowButton";

export default async function ClientProjectDetailPage({ params }: { params: { id: string } }) {
  const session = await auth();

  const client = await prisma.clientProfile.findUnique({ where: { userId: session!.user.id } });
  const project = await prisma.project.findUnique({
    where: { id: params.id },
    include: {
      bids: {
        include: {
          supplier: {
            select: {
              id: true,
              companyName: true,
              averageRating: true,
              totalRatings: true,
              sponsoredUntil: true,
              user: { select: { name: true } },
            },
          },
        },
        orderBy: { submittedAt: "asc" },
      },
      rating: true,
    },
  });

  if (!project || project.clientId !== client?.id) notFound();

  // Sponsored suppliers appear first
  const now = new Date();
  const sortedBids = [...project.bids].sort((a, b) => {
    const aSponsored = a.supplier.sponsoredUntil && a.supplier.sponsoredUntil > now ? 1 : 0;
    const bSponsored = b.supplier.sponsoredUntil && b.supplier.sponsoredUntil > now ? 1 : 0;
    return bSponsored - aSponsored;
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
    <div className="max-w-4xl space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Badge variant={statusVariants[project.status] || "secondary"}>
              {PROJECT_STATUS_LABELS[project.status as ProjectStatus]}
            </Badge>
            {project.category && (
              <span className="flex items-center gap-1 text-sm text-gray-500">
                <Tag className="h-3.5 w-3.5" />
                {project.category}
              </span>
            )}
          </div>
          <h1 className="text-2xl font-bold text-gray-900">{project.title}</h1>
          <p className="text-gray-500 mt-1">
            Publié le {new Date(project.createdAt).toLocaleDateString("fr-FR")}
          </p>
        </div>

        <div className="text-right">
          <div className="flex items-center gap-1.5 text-sm text-gray-500 mb-1">
            <EyeOff className="h-3.5 w-3.5" />
            Prix de référence
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {Number(project.referencePrice).toLocaleString("fr-FR")}€
          </p>
        </div>
      </div>

      {/* Awaiting payment */}
      {project.status === "IN_REVIEW" && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-amber-600 shrink-0" />
            <div>
              <p className="text-sm font-semibold text-amber-800">Paiement requis pour démarrer le projet</p>
              <p className="text-xs text-amber-700">
                Le montant sera conservé en séquestre et versé au fournisseur à la fin du projet.
              </p>
            </div>
          </div>
          <PayEscrowButton projectId={project.id} />
        </div>
      )}

      {/* Actions */}
      {project.status === "IN_PROGRESS" && (
        <div className="flex gap-3">
          <UpdateStatusButton projectId={project.id} newStatus="COMPLETED" label="Marquer comme terminé" variant="success" />
          <UpdateStatusButton projectId={project.id} newStatus="FAILED" label="Marquer comme échoué" variant="destructive" />
        </div>
      )}

      {project.status === "COMPLETED" && !project.rating && (
        <div className="rounded-xl border border-green-200 bg-green-50 p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Star className="h-5 w-5 text-green-600" />
            <div>
              <p className="text-sm font-semibold text-green-800">Projet terminé !</p>
              <p className="text-xs text-green-700">Évaluez le fournisseur pour l'aider à développer sa réputation</p>
            </div>
          </div>
          <Link href={`/client/projets/${project.id}/evaluer`}>
            <Button variant="success" size="sm">Évaluer le fournisseur</Button>
          </Link>
        </div>
      )}

      {/* Description */}
      <Card>
        <CardHeader><CardTitle>Description</CardTitle></CardHeader>
        <CardContent>
          <p className="text-gray-700 whitespace-pre-wrap">{project.description}</p>
          {project.deadline && (
            <div className="flex items-center gap-2 mt-4 text-sm text-gray-500">
              <Calendar className="h-4 w-4" />
              Date limite : {new Date(project.deadline).toLocaleDateString("fr-FR")}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Bids */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Offres reçues ({project.bids.length})
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {project.bids.length === 0 ? (
            <div className="text-center py-8">
              <Clock className="h-10 w-10 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">Aucune offre reçue pour le moment</p>
            </div>
          ) : (
            <div className="space-y-4">
              {sortedBids.map((bid) => {
                const isSponsored = bid.supplier.sponsoredUntil && bid.supplier.sponsoredUntil > now;
                return (
                <div
                  key={bid.id}
                  className={`rounded-xl border p-4 ${
                    bid.status === "ACCEPTED"
                      ? "border-green-300 bg-green-50"
                      : bid.status === "REJECTED"
                      ? "border-gray-200 bg-gray-50 opacity-60"
                      : isSponsored
                      ? "border-yellow-300 bg-yellow-50"
                      : "border-gray-200 bg-white"
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1 flex-wrap">
                        <p className="font-semibold text-gray-900">
                          {bid.supplier.companyName || bid.supplier.user.name}
                        </p>
                        {isSponsored && (
                          <Badge className="bg-yellow-400 text-yellow-900 hover:bg-yellow-400 gap-1">
                            <Zap className="h-3 w-3" />
                            Mis en avant
                          </Badge>
                        )}
                        {bid.status === "ACCEPTED" && (
                          <Badge variant="success">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Sélectionné
                          </Badge>
                        )}
                        {bid.status === "REJECTED" && (
                          <Badge variant="secondary">Refusé</Badge>
                        )}
                      </div>
                      <StarRating value={bid.supplier.averageRating} size="sm" />
                      <p className="text-xs text-gray-400 mt-0.5">
                        {bid.supplier.totalRatings} évaluation{bid.supplier.totalRatings !== 1 ? "s" : ""}
                      </p>
                      {bid.coverLetter && (
                        <p className="text-sm text-gray-600 mt-3 line-clamp-3">{bid.coverLetter}</p>
                      )}
                      {bid.estimatedDays && (
                        <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" />
                          Délai estimé : {bid.estimatedDays} jour{bid.estimatedDays > 1 ? "s" : ""}
                        </p>
                      )}
                    </div>

                    <div className="text-right shrink-0">
                      <p className="text-2xl font-bold text-gray-900">
                        {Number(bid.amount).toLocaleString("fr-FR")}€
                      </p>
                      {project.status === "OPEN" && bid.status === "PENDING" && (
                        <div className="mt-2">
                          <AcceptBidButton projectId={project.id} bidId={bid.id} />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Rating */}
      {project.rating && (
        <Card>
          <CardHeader><CardTitle>Votre évaluation</CardTitle></CardHeader>
          <CardContent>
            <StarRating value={project.rating.score} />
            {project.rating.comment && (
              <p className="text-gray-600 mt-2">{project.rating.comment}</p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
