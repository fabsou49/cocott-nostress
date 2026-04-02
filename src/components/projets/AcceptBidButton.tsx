"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";

export function AcceptBidButton({ projectId, bidId }: { projectId: string; bidId: string }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleAccept() {
    if (!confirm("Confirmer la sélection de ce fournisseur ? Vous serez redirigé vers le paiement pour démarrer le projet.")) return;
    setLoading(true);
    setError(null);

    const acceptRes = await fetch(`/api/projets/${projectId}/offres/${bidId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "ACCEPT" }),
    });

    const acceptData = await acceptRes.json();
    if (!acceptRes.ok) {
      setError(acceptData.error || "Erreur lors de la sélection");
      setLoading(false);
      return;
    }

    // Redirect to escrow payment
    const payRes = await fetch(`/api/client/projets/${projectId}/paiement`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ origin: window.location.origin }),
    });

    const payData = await payRes.json();
    if (payData.url) {
      window.location.href = payData.url;
    } else {
      setError(payData.error || "Erreur lors de la création du paiement");
      setLoading(false);
    }
  }

  return (
    <div>
      <Button variant="success" size="sm" onClick={handleAccept} disabled={loading}>
        <CheckCircle className="h-4 w-4" />
        {loading ? "..." : "Sélectionner & Payer"}
      </Button>
      {error && <p className="text-xs text-red-600 mt-1 max-w-[200px]">{error}</p>}
    </div>
  );
}
