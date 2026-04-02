"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ToggleLeft, ToggleRight, Trash2, Tag, Percent, Euro } from "lucide-react";

interface Offer {
  id: string;
  code: string;
  description: string;
  target: string;
  discountType: string;
  discountValue: number;
  durationMonths: number | null;
  maxUses: number | null;
  currentUses: number;
  expiresAt: string | null;
  active: boolean;
  createdAt: string;
  _count: { redemptions: number };
}

export function OffresTable({ offers }: { offers: Offer[] }) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  async function toggleActive(offer: Offer) {
    setLoading(offer.id);
    await fetch(`/api/admin/offres/${offer.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !offer.active }),
    });
    setLoading(null);
    router.refresh();
  }

  async function deleteOffer(offer: Offer) {
    if (!confirm(`Supprimer l'offre "${offer.code}" ?`)) return;
    setLoading(offer.id);
    const res = await fetch(`/api/admin/offres/${offer.id}`, { method: "DELETE" });
    setLoading(null);
    if (!res.ok) {
      const { error } = await res.json();
      alert(error);
      return;
    }
    router.refresh();
  }

  if (offers.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <Tag className="h-10 w-10 text-gray-300 mx-auto mb-3" />
        <p>Aucune offre commerciale créée</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200 bg-gray-50">
            <th className="text-left px-4 py-3 font-semibold text-gray-600">Code</th>
            <th className="text-left px-4 py-3 font-semibold text-gray-600">Description</th>
            <th className="text-left px-4 py-3 font-semibold text-gray-600">Cible</th>
            <th className="text-left px-4 py-3 font-semibold text-gray-600">Réduction</th>
            <th className="text-left px-4 py-3 font-semibold text-gray-600">Utilisations</th>
            <th className="text-left px-4 py-3 font-semibold text-gray-600">Expiration</th>
            <th className="text-left px-4 py-3 font-semibold text-gray-600">Statut</th>
            <th className="text-left px-4 py-3 font-semibold text-gray-600">Actions</th>
          </tr>
        </thead>
        <tbody>
          {offers.map((offer) => {
            const isExpired = offer.expiresAt && new Date(offer.expiresAt) < new Date();
            const isFull = offer.maxUses !== null && offer.currentUses >= offer.maxUses;

            return (
              <tr key={offer.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="px-4 py-3">
                  <code className="font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                    {offer.code}
                  </code>
                </td>
                <td className="px-4 py-3 text-gray-700 max-w-xs">
                  <p className="truncate">{offer.description}</p>
                  {offer.durationMonths && (
                    <p className="text-xs text-gray-400">{offer.durationMonths} mois</p>
                  )}
                </td>
                <td className="px-4 py-3">
                  <Badge variant={offer.target === "REGISTRATION" ? "default" : "secondary"}>
                    {offer.target === "REGISTRATION" ? "Inscription" : "Commission"}
                  </Badge>
                </td>
                <td className="px-4 py-3 font-semibold">
                  <span className="flex items-center gap-1 text-green-700">
                    {offer.discountType === "PERCENTAGE" ? (
                      <>
                        <Percent className="h-3.5 w-3.5" />
                        {Number(offer.discountValue)}%
                      </>
                    ) : (
                      <>
                        <Euro className="h-3.5 w-3.5" />
                        -{(Number(offer.discountValue) / 100).toLocaleString("fr-FR")}€
                      </>
                    )}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-600">
                  <span className={isFull ? "text-red-600 font-semibold" : ""}>
                    {offer.currentUses}
                    {offer.maxUses !== null ? ` / ${offer.maxUses}` : " / ∞"}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-500 text-xs">
                  {offer.expiresAt ? (
                    <span className={isExpired ? "text-red-500 font-semibold" : ""}>
                      {new Date(offer.expiresAt).toLocaleDateString("fr-FR")}
                      {isExpired && " (expiré)"}
                    </span>
                  ) : (
                    <span className="text-gray-400">Pas d&apos;expiration</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <Badge
                    variant={offer.active && !isExpired && !isFull ? "success" : "secondary"}
                  >
                    {offer.active && !isExpired && !isFull ? "Actif" : "Inactif"}
                  </Badge>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => toggleActive(offer)}
                      disabled={loading === offer.id}
                      className="p-1.5 rounded hover:bg-gray-100 text-gray-500 hover:text-blue-600 transition-colors"
                      title={offer.active ? "Désactiver" : "Activer"}
                    >
                      {offer.active ? (
                        <ToggleRight className="h-5 w-5 text-green-600" />
                      ) : (
                        <ToggleLeft className="h-5 w-5 text-gray-400" />
                      )}
                    </button>
                    {offer._count.redemptions === 0 && (
                      <button
                        onClick={() => deleteOffer(offer)}
                        disabled={loading === offer.id}
                        className="p-1.5 rounded hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors"
                        title="Supprimer"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
