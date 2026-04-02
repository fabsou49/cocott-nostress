"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { StarRating } from "@/components/ratings/StarRating";
import { Star } from "lucide-react";

export default function EvaluerPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [score, setScore] = useState(0);
  const [comment, setComment] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (score === 0) {
      setError("Veuillez sélectionner une note");
      return;
    }
    setError("");
    setLoading(true);

    const res = await fetch(`/api/projets/${params.id}/evaluation`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ score, comment: comment || undefined }),
    });

    setLoading(false);

    if (!res.ok) {
      const { error: msg } = await res.json();
      setError(msg || "Erreur lors de l'envoi");
      return;
    }

    router.push(`/client/projets/${params.id}?evaluated=true`);
  }

  return (
    <div className="max-w-lg mx-auto">
      <Card>
        <CardHeader>
          <div className="flex justify-center mb-2">
            <div className="rounded-full bg-yellow-100 p-3">
              <Star className="h-6 w-6 text-yellow-500" />
            </div>
          </div>
          <CardTitle className="text-2xl text-center">Évaluer le fournisseur</CardTitle>
          <p className="text-center text-sm text-gray-500">
            Votre avis aide les autres clients à choisir les meilleurs fournisseurs
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="text-center">
              <p className="text-sm font-medium text-gray-700 mb-3">Note globale *</p>
              <div className="flex justify-center">
                <StarRating value={score} interactive onChange={setScore} size="lg" />
              </div>
              <p className="text-sm text-gray-500 mt-2">
                {score === 0
                  ? "Cliquez sur une étoile"
                  : score === 1
                  ? "Très insatisfait"
                  : score === 2
                  ? "Insatisfait"
                  : score === 3
                  ? "Correct"
                  : score === 4
                  ? "Satisfait"
                  : "Très satisfait"}
              </p>
            </div>

            <Textarea
              id="comment"
              label="Commentaire (optionnel)"
              placeholder="Décrivez votre expérience avec ce fournisseur..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
            />

            {error && (
              <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>
            )}

            <div className="flex gap-3">
              <Button type="submit" disabled={loading || score === 0} className="flex-1">
                {loading ? "Envoi..." : "Publier mon évaluation"}
              </Button>
              <Button type="button" variant="outline" onClick={() => router.back()}>
                Annuler
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
