"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";

export function BidForm({ projectId }: { projectId: string }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      amount: Number(formData.get("amount")),
      coverLetter: formData.get("coverLetter") || undefined,
      estimatedDays: formData.get("estimatedDays")
        ? Number(formData.get("estimatedDays"))
        : undefined,
    };

    const res = await fetch(`/api/projets/${projectId}/offres`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    setLoading(false);

    if (!res.ok) {
      const { error: msg } = await res.json();
      setError(msg || "Erreur lors de la soumission");
      return;
    }

    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="relative">
          <Input
            id="amount"
            name="amount"
            type="number"
            min="1"
            step="0.01"
            label="Mon estimation de prix *"
            placeholder="0.00"
            required
          />
          <span className="absolute right-3 top-9 text-gray-500 text-sm">€</span>
        </div>
        <Input
          id="estimatedDays"
          name="estimatedDays"
          type="number"
          min="1"
          max="365"
          label="Délai estimé (jours)"
          placeholder="Ex: 14"
        />
      </div>

      <Textarea
        id="coverLetter"
        name="coverLetter"
        label="Présentation / Lettre de motivation"
        placeholder="Présentez-vous, votre expérience, et pourquoi vous êtes le meilleur choix pour ce projet..."
        rows={5}
      />

      {error && (
        <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>
      )}

      <Button type="submit" disabled={loading} className="w-full">
        <Send className="h-4 w-4" />
        {loading ? "Envoi en cours..." : "Soumettre mon offre"}
      </Button>
    </form>
  );
}
