"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Zap, Star, TrendingUp, CheckCircle, Crown } from "lucide-react";
import { SPONSORING_PACKAGES } from "@/lib/utils/sponsoring";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function SuccessBanner() {
  const params = useSearchParams();
  if (!params.get("success")) return null;
  return (
    <div className="rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-800 flex items-center gap-2">
      <CheckCircle className="h-4 w-4 shrink-0" />
      Paiement confirmé ! Votre profil est maintenant mis en avant.
    </div>
  );
}

function CancelledBanner() {
  const params = useSearchParams();
  if (!params.get("cancelled")) return null;
  return (
    <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
      Paiement annulé. Vous pouvez réessayer quand vous le souhaitez.
    </div>
  );
}

export default function VisibilitePage() {
  const [sponsoredUntil, setSponsoredUntil] = useState<string | null>(null);
  const [loading, setLoading] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/fournisseur/profil")
      .then((r) => r.json())
      .then((data) => {
        if (data?.sponsoredUntil) setSponsoredUntil(data.sponsoredUntil);
      })
      .catch(() => {});
  }, []);

  const isActive = sponsoredUntil ? new Date(sponsoredUntil) > new Date() : false;

  async function handleBuy(packageId: string) {
    setLoading(packageId);
    const res = await fetch("/api/fournisseur/sponsoring", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ packageId, origin: window.location.origin }),
    });
    const { url, error } = await res.json();
    if (url) {
      window.location.href = url;
    } else {
      alert(error || "Erreur lors du paiement");
      setLoading(null);
    }
  }

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Zap className="h-6 w-6 text-yellow-500" />
          Visibilité & Mise en avant
        </h1>
        <p className="text-gray-500 mt-1">
          Apparaissez en premier dans les offres reçues par les clients et démarquez-vous de la concurrence.
        </p>
      </div>

      <Suspense fallback={null}>
        <SuccessBanner />
        <CancelledBanner />
      </Suspense>

      {/* Current status */}
      <Card>
        <CardContent className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Crown className="h-5 w-5 text-yellow-500" />
            <div>
              <p className="font-semibold text-gray-900">Statut actuel</p>
              {isActive ? (
                <p className="text-sm text-green-600">
                  Mis en avant jusqu&apos;au{" "}
                  {new Date(sponsoredUntil!).toLocaleDateString("fr-FR", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
              ) : (
                <p className="text-sm text-gray-500">Non sponsorisé</p>
              )}
            </div>
          </div>
          <Badge variant={isActive ? "success" : "secondary"}>
            {isActive ? "Actif" : "Inactif"}
          </Badge>
        </CardContent>
      </Card>

      {/* What you get */}
      <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-4 space-y-3">
        <p className="text-sm font-semibold text-yellow-800">Avantages du profil mis en avant :</p>
        {[
          { icon: <TrendingUp className="h-4 w-4 text-yellow-600" />, text: "Votre offre apparaît en premier dans la liste des clients" },
          { icon: <Star className="h-4 w-4 text-yellow-600" />, text: "Badge \"Mis en avant\" visible par les clients" },
          { icon: <Zap className="h-4 w-4 text-yellow-600" />, text: "Jusqu'à 3× plus de visibilité sur vos offres" },
        ].map((item, i) => (
          <div key={i} className="flex items-center gap-3">
            {item.icon}
            <span className="text-sm text-yellow-800">{item.text}</span>
          </div>
        ))}
      </div>

      {/* Packages */}
      <div className="grid gap-4 sm:grid-cols-3">
        {SPONSORING_PACKAGES.map((pkg) => (
          <Card
            key={pkg.id}
            className={`relative ${"popular" in pkg && pkg.popular ? "border-2 border-yellow-400" : ""}`}
          >
            {"popular" in pkg && pkg.popular && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <Badge className="bg-yellow-400 text-yellow-900 hover:bg-yellow-400">Populaire</Badge>
              </div>
            )}
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">{pkg.label}</CardTitle>
              <p className="text-3xl font-bold text-gray-900">
                {(pkg.priceCents / 100).toLocaleString("fr-FR")}€
              </p>
              <p className="text-sm text-gray-500">{pkg.description}</p>
            </CardHeader>
            <CardContent>
              <Button
                onClick={() => handleBuy(pkg.id)}
                disabled={loading !== null}
                className="w-full"
                variant={"popular" in pkg && pkg.popular ? "default" : "outline"}
              >
                {loading === pkg.id ? "Redirection..." : "Choisir ce pack"}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <p className="text-xs text-center text-gray-400">
        Le sponsoring est cumulatif : acheter un nouveau pack prolonge votre mise en avant.
      </p>
    </div>
  );
}
