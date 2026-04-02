"use client";

import { Suspense, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CreditCard, CheckCircle, Shield, Star, FolderOpen, Tag, X, ArrowLeft } from "lucide-react";
import Link from "next/link";

function CancelledBanner() {
  const searchParams = useSearchParams();
  if (!searchParams.get("cancelled")) return null;
  return (
    <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
      Paiement annulé. Vous pouvez réessayer quand vous le souhaitez.
    </div>
  );
}

function PaymentContent() {
  const [loading, setLoading] = useState(false);
  const [baseFee, setBaseFee] = useState(100);
  const [successRate, setSuccessRate] = useState(10);
  const [failureRate, setFailureRate] = useState(5);
  const [promoCode, setPromoCode] = useState("");
  const [promoInput, setPromoInput] = useState("");
  const [promoLoading, setPromoLoading] = useState(false);
  const [promoResult, setPromoResult] = useState<{
    valid: boolean;
    finalAmountCents?: number;
    savingsCents?: number;
    description?: string;
    error?: string;
  } | null>(null);

  // Fetch dynamic config (fee + commission rates)
  useEffect(() => {
    fetch("/api/admin/config")
      .then((r) => r.json())
      .then((config) => {
        if (config?.registrationFeeCents) setBaseFee(config.registrationFeeCents / 100);
        if (config?.successRate) setSuccessRate(Math.round(Number(config.successRate) * 100));
        if (config?.failureRate) setFailureRate(Math.round(Number(config.failureRate) * 100));
      })
      .catch(() => {});
  }, []);

  const finalAmount = promoResult?.valid && promoResult.finalAmountCents !== undefined
    ? promoResult.finalAmountCents / 100
    : baseFee;

  async function applyPromo() {
    if (!promoInput.trim()) return;
    setPromoLoading(true);
    setPromoResult(null);
    const res = await fetch("/api/paiements/inscription/validate-promo", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: promoInput.trim() }),
    });
    const data = await res.json();
    setPromoResult(data);
    if (data.valid) setPromoCode(promoInput.trim());
    setPromoLoading(false);
  }

  function removePromo() {
    setPromoCode("");
    setPromoInput("");
    setPromoResult(null);
  }

  async function handlePay() {
    setLoading(true);
    const res = await fetch("/api/paiements/inscription", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        origin: window.location.origin,
        promoCode: promoCode || null,
      }),
    });

    const { url, free, error } = await res.json();
    if (url) {
      window.location.href = url;
    } else if (free) {
      window.location.href = "/fournisseur/tableau-de-bord?inscription=success";
    } else {
      alert(error || "Erreur lors du paiement");
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-center mb-2">
          <div className="rounded-full bg-blue-100 p-3">
            <CreditCard className="h-6 w-6 text-blue-600" />
          </div>
        </div>
        <CardTitle className="text-2xl text-center">Finaliser votre inscription</CardTitle>
        <p className="text-center text-sm text-gray-500">
          Un paiement unique pour accéder à toutes les opportunités
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* What's included */}
        <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 space-y-3">
          <p className="text-sm font-semibold text-gray-700">Ce que vous obtenez :</p>
          {[
            { icon: <FolderOpen className="h-4 w-4 text-blue-600" />, text: "Accès illimité à tous les projets" },
            { icon: <Star className="h-4 w-4 text-yellow-500" />, text: "Système de réputation et notation" },
            { icon: <CheckCircle className="h-4 w-4 text-green-600" />, text: "Soumission d'offres sans limite" },
            { icon: <Shield className="h-4 w-4 text-purple-600" />, text: "Profil vérifié et mis en avant" },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-3">
              {item.icon}
              <span className="text-sm text-gray-700">{item.text}</span>
            </div>
          ))}
        </div>

        {/* Promo code input */}
        {!promoResult?.valid ? (
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
              <Tag className="h-4 w-4" />
              Code promo (optionnel)
            </label>
            <div className="flex gap-2">
              <Input
                placeholder="Ex: LAUNCH50"
                value={promoInput}
                onChange={(e) => setPromoInput(e.target.value.toUpperCase())}
                className="font-mono"
                onKeyDown={(e) => e.key === "Enter" && applyPromo()}
              />
              <Button
                type="button"
                variant="outline"
                onClick={applyPromo}
                disabled={promoLoading || !promoInput.trim()}
              >
                {promoLoading ? "..." : "Appliquer"}
              </Button>
            </div>
            {promoResult?.valid === false && (
              <p className="text-sm text-red-600">{promoResult.error}</p>
            )}
          </div>
        ) : (
          <div className="rounded-xl border border-green-200 bg-green-50 p-4 flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <Tag className="h-5 w-5 text-green-600 mt-0.5 shrink-0" />
              <div>
                <p className="font-semibold text-green-800">
                  Code <code className="font-mono">{promoCode}</code> appliqué !
                </p>
                <p className="text-sm text-green-700 mt-0.5">{promoResult.description}</p>
                <p className="text-sm font-bold text-green-800 mt-1">
                  Vous économisez {((promoResult.savingsCents ?? 0) / 100).toLocaleString("fr-FR")}€
                </p>
              </div>
            </div>
            <button onClick={removePromo} className="text-green-500 hover:text-green-700">
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Price display */}
        <div className="text-center py-2">
          {promoResult?.valid && (
            <p className="text-lg text-gray-400 line-through">{baseFee.toLocaleString("fr-FR")}€</p>
          )}
          <p className="text-4xl font-bold text-gray-900">
            {finalAmount.toLocaleString("fr-FR")}€
          </p>
          <p className="text-sm text-gray-500 mt-1">Paiement unique — Pas d&apos;abonnement</p>
        </div>

        {/* Commission info */}
        <div className="rounded-lg border border-blue-100 bg-blue-50 p-3 text-xs text-blue-700">
          <p className="font-semibold mb-1">Commissions sur les prestations :</p>
          <p>• {successRate}% du montant de la prestation si réussie</p>
          <p>• {failureRate}% du montant de la prestation si échouée</p>
        </div>

        {finalAmount === 0 ? (
          <Button onClick={handlePay} disabled={loading} variant="success" className="w-full" size="lg">
            <CheckCircle className="h-4 w-4" />
            {loading ? "Activation en cours..." : "Accéder gratuitement à la plateforme"}
          </Button>
        ) : (
          <Button onClick={handlePay} disabled={loading} className="w-full" size="lg">
            <CreditCard className="h-4 w-4" />
            {loading
              ? "Redirection vers Stripe..."
              : `Payer ${finalAmount.toLocaleString("fr-FR")}€ et accéder à la plateforme`}
          </Button>
        )}

        <div className="flex items-center justify-center gap-2 text-xs text-gray-400">
          <Shield className="h-3.5 w-3.5" />
          Paiement sécurisé par Stripe
        </div>
      </CardContent>
    </Card>
  );
}

export default function InscriptionPaiementPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-6">
      <div className="w-full max-w-lg space-y-4">
        <Link href="/connexion" className="inline-flex items-center gap-2 text-sm text-blue-200 hover:text-white transition-colors">
          <ArrowLeft className="h-4 w-4" />
          Retour à la connexion
        </Link>
        <Suspense fallback={null}>
          <CancelledBanner />
        </Suspense>
        <PaymentContent />
      </div>
    </div>
  );
}
