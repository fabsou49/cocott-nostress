import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StarRating } from "@/components/ratings/StarRating";
import { FolderOpen, FileText, TrendingUp, Award, ArrowRight } from "lucide-react";
import Link from "next/link";
import { BID_STATUS_LABELS, BidStatus } from "@/types";

export default async function SupplierDashboardPage() {
  const session = await auth();

  const supplier = await prisma.supplierProfile.findUnique({
    where: { userId: session!.user.id },
    include: {
      bids: {
        include: {
          project: { select: { id: true, title: true, status: true } },
        },
        orderBy: { submittedAt: "desc" },
        take: 5,
      },
      ratings: {
        include: {
          project: { select: { title: true } },
          client: { select: { companyName: true, user: { select: { name: true } } } },
        },
        orderBy: { createdAt: "desc" },
        take: 3,
      },
    },
  });

  const stats = {
    totalBids: supplier?.bids.length || 0,
    accepted: supplier?.bids.filter((b) => b.status === "ACCEPTED").length || 0,
    pending: supplier?.bids.filter((b) => b.status === "PENDING").length || 0,
    rating: supplier?.averageRating || 0,
  };

  const bidVariants: Record<string, "default" | "success" | "warning" | "secondary" | "destructive"> = {
    PENDING: "warning",
    ACCEPTED: "success",
    REJECTED: "secondary",
    WITHDRAWN: "secondary",
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Bonjour, {session?.user.name} 👋
        </h1>
        <p className="text-gray-500 mt-1">{supplier?.companyName}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: "Offres soumises", value: stats.totalBids, icon: <FileText className="h-5 w-5 text-blue-600" />, color: "bg-blue-50" },
          { label: "En attente", value: stats.pending, icon: <TrendingUp className="h-5 w-5 text-amber-600" />, color: "bg-amber-50" },
          { label: "Acceptées", value: stats.accepted, icon: <FolderOpen className="h-5 w-5 text-green-600" />, color: "bg-green-50" },
          {
            label: "Note moyenne",
            value: stats.rating > 0 ? stats.rating.toFixed(1) : "—",
            icon: <Award className="h-5 w-5 text-yellow-500" />,
            color: "bg-yellow-50",
          },
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

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent bids */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Mes offres récentes</CardTitle>
              <Link href="/fournisseur/mes-offres">
                <Button variant="ghost" size="sm">
                  Voir tout <ArrowRight className="h-3.5 w-3.5 ml-1" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {supplier?.bids.length === 0 ? (
              <div className="text-center py-6">
                <p className="text-gray-500 text-sm">Aucune offre soumise</p>
                <Link href="/fournisseur/projets" className="mt-2 inline-block">
                  <Button size="sm" variant="outline">Parcourir les projets</Button>
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {supplier?.bids.map((bid) => (
                  <div key={bid.id} className="py-3 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900 line-clamp-1">
                        {bid.project.title}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {new Date(bid.submittedAt).toLocaleDateString("fr-FR")}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold">{Number(bid.amount).toLocaleString("fr-FR")}€</p>
                      <Badge variant={bidVariants[bid.status] || "secondary"} className="mt-1">
                        {BID_STATUS_LABELS[bid.status as BidStatus]}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent ratings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <StarRating value={stats.rating} size="sm" />
              Évaluations récentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            {supplier?.ratings.length === 0 ? (
              <div className="text-center py-6">
                <p className="text-gray-500 text-sm">Aucune évaluation pour le moment</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {supplier?.ratings.map((rating) => (
                  <div key={rating.id} className="py-3">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-medium text-gray-900 line-clamp-1">
                        {rating.project.title}
                      </p>
                      <StarRating value={rating.score} size="sm" />
                    </div>
                    {rating.comment && (
                      <p className="text-xs text-gray-500 line-clamp-2">{rating.comment}</p>
                    )}
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
