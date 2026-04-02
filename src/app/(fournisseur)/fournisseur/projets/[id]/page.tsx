import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BidForm } from "@/components/projets/BidForm";
import { Calendar, Tag, Users, Clock, ArrowLeft, CheckCircle } from "lucide-react";
import Link from "next/link";

export default async function SupplierProjectDetailPage({ params }: { params: { id: string } }) {
  const session = await auth();
  const supplier = await prisma.supplierProfile.findUnique({ where: { userId: session!.user.id } });

  const project = await prisma.project.findUnique({
    where: { id: params.id, status: "OPEN" },
    select: {
      id: true,
      title: true,
      description: true,
      category: true,
      deadline: true,
      status: true,
      createdAt: true,
      _count: { select: { bids: true } },
      client: { select: { companyName: true, user: { select: { name: true } } } },
    },
  });

  if (!project) notFound();

  const existingBid = await prisma.bid.findUnique({
    where: { projectId_supplierId: { projectId: params.id, supplierId: supplier!.id } },
  });

  return (
    <div className="max-w-3xl space-y-6">
      <Link href="/fournisseur/projets">
        <Button variant="ghost" size="sm">
          <ArrowLeft className="h-4 w-4" />
          Retour aux projets
        </Button>
      </Link>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3 mb-2">
            <Badge variant="default">Ouvert</Badge>
            {project.category && (
              <span className="flex items-center gap-1 text-sm text-gray-500">
                <Tag className="h-3.5 w-3.5" />
                {project.category}
              </span>
            )}
          </div>
          <CardTitle className="text-2xl">{project.title}</CardTitle>
          <div className="flex items-center gap-4 text-sm text-gray-500 mt-2">
            <span className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              {project._count.bids} offre{project._count.bids !== 1 ? "s" : ""}
            </span>
            {project.deadline && (
              <span className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                Limite : {new Date(project.deadline).toLocaleDateString("fr-FR")}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              Publié le {new Date(project.createdAt).toLocaleDateString("fr-FR")}
            </span>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-gray-700 whitespace-pre-wrap">{project.description}</p>
          <p className="mt-4 text-sm text-gray-500">
            Client : {project.client.companyName || project.client.user.name}
          </p>
        </CardContent>
      </Card>

      {existingBid && existingBid.status !== "WITHDRAWN" ? (
        <div className="rounded-xl border border-green-200 bg-green-50 p-5 flex items-center gap-4">
          <CheckCircle className="h-8 w-8 text-green-600 shrink-0" />
          <div>
            <p className="font-semibold text-green-800">Offre soumise</p>
            <p className="text-sm text-green-700 mt-1">
              Vous avez soumis une offre de{" "}
              <strong>{Number(existingBid.amount).toLocaleString("fr-FR")}€</strong>
              {existingBid.estimatedDays && ` (${existingBid.estimatedDays} jours)`}
            </p>
            <p className="text-xs text-green-600 mt-1">
              Soumise le {new Date(existingBid.submittedAt).toLocaleDateString("fr-FR")}
            </p>
          </div>
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Soumettre une offre</CardTitle>
            <p className="text-sm text-gray-500">
              Proposez votre estimation de prix. Le client ne verra pas son prix de référence.
            </p>
          </CardHeader>
          <CardContent>
            <BidForm projectId={params.id} />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
