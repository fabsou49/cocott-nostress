"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CreditCard } from "lucide-react";

export function PayEscrowButton({ projectId }: { projectId: string }) {
  const [loading, setLoading] = useState(false);

  async function handlePay() {
    setLoading(true);
    const res = await fetch(`/api/client/projets/${projectId}/paiement`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ origin: window.location.origin }),
    });
    const data = await res.json();
    if (data.url) {
      window.location.href = data.url;
    } else {
      alert(data.error || "Erreur lors du paiement");
      setLoading(false);
    }
  }

  return (
    <Button onClick={handlePay} disabled={loading} className="shrink-0 gap-2">
      <CreditCard className="h-4 w-4" />
      {loading ? "Redirection..." : "Payer maintenant"}
    </Button>
  );
}
