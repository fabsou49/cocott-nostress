import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CommissionConfigForm } from "./CommissionConfigForm";
import { CreateOfferModal } from "./CreateOfferModal";
import { OffresTable } from "./OffresTable";
import { Tag, TrendingUp } from "lucide-react";

export default async function OffresCommercialesPage() {
  const [config, offers] = await Promise.all([
    prisma.commissionConfig.findUnique({ where: { id: "global" } }),
    prisma.promoOffer.findMany({
      include: { _count: { select: { redemptions: true } } },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const activeOffers = offers.filter((o) => o.active && (!o.expiresAt || o.expiresAt > new Date()));
  const totalSavings = await prisma.promoRedemption.aggregate({
    _sum: { originalAmountCents: true, finalAmountCents: true },
  });
  const savingsCents =
    (totalSavings._sum.originalAmountCents ?? 0) - (totalSavings._sum.finalAmountCents ?? 0);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Tag className="h-6 w-6" />
          Offres commerciales
        </h1>
        <p className="text-gray-500 mt-1">
          Gérez les taux de commission et les codes promo pour les fournisseurs
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <p className="text-2xl font-bold text-gray-900">{offers.length}</p>
          <p className="text-sm text-gray-500 mt-0.5">Offres créées</p>
        </div>
        <div className="rounded-xl border border-green-200 bg-green-50 p-4">
          <p className="text-2xl font-bold text-green-700">{activeOffers.length}</p>
          <p className="text-sm text-green-600 mt-0.5">Offres actives</p>
        </div>
        <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
          <p className="text-2xl font-bold text-blue-700">
            {(savingsCents / 100).toLocaleString("fr-FR")}€
          </p>
          <p className="text-sm text-blue-600 mt-0.5">Total remises accordées</p>
        </div>
      </div>

      {/* Commission config */}
      <CommissionConfigForm initialConfig={config ? {
        successRate: Number(config.successRate),
        failureRate: Number(config.failureRate),
        registrationFeeCents: config.registrationFeeCents,
      } : null} />

      {/* Promo offers */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-purple-600" />
                Codes promo
              </CardTitle>
              <p className="text-sm text-gray-500 mt-1">
                Réductions sur les frais d&apos;inscription ou les taux de commission
              </p>
            </div>
            <CreateOfferModal />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <OffresTable offers={offers.map((o) => ({
            ...o,
            discountValue: Number(o.discountValue),
            expiresAt: o.expiresAt?.toISOString() ?? null,
            createdAt: o.createdAt.toISOString(),
          }))} />
        </CardContent>
      </Card>
    </div>
  );
}
