"use client";

import { useState, useEffect, Suspense } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CreditCard, CheckCircle, AlertCircle, ExternalLink, Shield, Euro } from "lucide-react";
import { useSearchParams } from "next/navigation";

function Banners() {
  const params = useSearchParams();
  if (params.get("connected"))
    return (
      <div className="rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-800 flex items-center gap-2">
        <CheckCircle className="h-4 w-4 shrink-0" />
        Compte Stripe connecté avec succès ! Vous pouvez maintenant recevoir des virements.
      </div>
    );
  if (params.get("refresh"))
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
        Le lien d&apos;inscription a expiré. Cliquez à nouveau pour continuer.
      </div>
    );
  return null;
}

export default function PaiementsFournisseurPage() {
  const [active, setActive] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/fournisseur/stripe-connect")
      .then((r) => r.json())
      .then((d) => setActive(d.active ?? false))
      .catch(() => setActive(false));
  }, []);

  async function handleConnect() {
    setLoading(true);
    const res = await fetch("/api/fournisseur/stripe-connect", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ origin: window.location.origin }),
    });
    const { url, alreadyActive, error } = await res.json();
    if (alreadyActive) {
      setActive(true);
      setLoading(false);
    } else if (url) {
      window.location.href = url;
    } else {
      alert(error || "Erreur lors de la connexion Stripe");
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Euro className="h-6 w-6 text-green-600" />
          Compte de paiement
        </h1>
        <p className="text-gray-500 mt-1">
          Connectez votre compte bancaire pour recevoir vos paiements directement depuis la plateforme.
        </p>
      </div>

      <Suspense fallback={null}>
        <Banners />
      </Suspense>

      {/* Status card */}
      <Card>
        <CardContent className="p-6 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className={`rounded-full p-3 ${active ? "bg-green-100" : "bg-gray-100"}`}>
              <CreditCard className={`h-6 w-6 ${active ? "text-green-600" : "text-gray-400"}`} />
            </div>
            <div>
              <p className="font-semibold text-gray-900">Compte Stripe Express</p>
              {active === null ? (
                <p className="text-sm text-gray-400">Chargement...</p>
              ) : active ? (
                <p className="text-sm text-green-600">Compte actif — virements activés</p>
              ) : (
                <p className="text-sm text-amber-600">Non configuré — requis pour recevoir des paiements</p>
              )}
            </div>
          </div>
          <Badge variant={active ? "success" : "warning"}>
            {active === null ? "..." : active ? "Actif" : "À configurer"}
          </Badge>
        </CardContent>
      </Card>

      {!active && (
        <>
          {/* Explanation */}
          <div className="rounded-xl border border-blue-100 bg-blue-50 p-5 space-y-3">
            <p className="font-semibold text-blue-900 flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Pourquoi connecter un compte Stripe ?
            </p>
            <ul className="space-y-2 text-sm text-blue-800">
              {[
                "Les clients paient directement sur la plateforme — vous ne gérez pas les transactions",
                "À la fin d'un projet, le montant (moins la commission) vous est viré automatiquement",
                "Stripe Express = inscription rapide, sans abonnement. Stripe gère la conformité bancaire.",
                "Obligatoire pour que les clients puissent accepter vos offres",
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-blue-500 shrink-0 mt-0.5" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <Button onClick={handleConnect} disabled={loading} size="lg" className="w-full gap-2">
            <ExternalLink className="h-4 w-4" />
            {loading ? "Redirection vers Stripe..." : "Connecter mon compte bancaire"}
          </Button>
        </>
      )}

      {active && (
        <div className="rounded-xl border border-green-200 bg-green-50 p-5 space-y-2">
          <p className="font-semibold text-green-900 flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            Tout est en place
          </p>
          <p className="text-sm text-green-700">
            Vos paiements sont gérés automatiquement. Lorsqu&apos;un client valide un projet comme terminé,
            le montant convenu (moins la commission plateforme) vous est viré directement sur votre compte bancaire.
          </p>
        </div>
      )}

      {/* Commission reminder */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-blue-600" />
            Rappel des commissions
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-gray-600 space-y-1">
          <p>• Projet <strong>terminé avec succès</strong> : commission déduite du virement</p>
          <p>• Projet <strong>échoué</strong> : commission déduite, le reste est remboursé au client</p>
          <p className="text-xs text-gray-400 mt-2">Les taux exacts sont définis dans la configuration de la plateforme.</p>
        </CardContent>
      </Card>
    </div>
  );
}
