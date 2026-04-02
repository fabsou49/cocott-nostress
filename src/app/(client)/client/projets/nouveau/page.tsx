"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { EyeOff, Info } from "lucide-react";
import { PROJECT_CATEGORIES } from "@/types";

export default function NouveauProjetPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      title: formData.get("title"),
      description: formData.get("description"),
      category: formData.get("category") || undefined,
      deadline: formData.get("deadline") || undefined,
      referencePrice: Number(formData.get("referencePrice")),
    };

    const res = await fetch("/api/projets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    setLoading(false);

    if (!res.ok) {
      const { error: msg } = await res.json();
      setError(msg || "Erreur lors de la création");
      return;
    }

    const project = await res.json();
    router.push(`/client/projets/${project.id}`);
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Nouveau projet</h1>
        <p className="text-gray-500 mt-1">
          Décrivez votre besoin et définissez votre budget de référence
        </p>
      </div>

      <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 flex items-start gap-3">
        <EyeOff className="h-5 w-5 text-blue-600 mt-0.5 shrink-0" />
        <div>
          <p className="text-sm font-semibold text-blue-800">Prix de référence confidentiel</p>
          <p className="text-xs text-blue-700 mt-1">
            Votre prix de référence est strictement confidentiel. Les fournisseurs ne le verront jamais.
            Il vous sert à comparer les offres reçues et à choisir la meilleure proposition.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Détails du projet</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              id="title"
              name="title"
              label="Titre du projet *"
              placeholder="Ex: Création d'un site e-commerce pour ma boutique"
              required
            />

            <Textarea
              id="description"
              name="description"
              label="Description détaillée *"
              placeholder="Décrivez précisément votre besoin, vos attentes, les livrables souhaités..."
              rows={5}
              required
            />

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <label htmlFor="category" className="text-sm font-medium text-gray-700">
                  Catégorie
                </label>
                <select
                  id="category"
                  name="category"
                  className="h-10 rounded-lg border border-gray-300 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Sélectionner...</option>
                  {PROJECT_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <Input
                id="deadline"
                name="deadline"
                type="date"
                label="Date limite (optionnel)"
                min={new Date().toISOString().split("T")[0]}
              />
            </div>

            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
              <div className="flex items-center gap-2 mb-3">
                <EyeOff className="h-4 w-4 text-gray-500" />
                <label htmlFor="referencePrice" className="text-sm font-semibold text-gray-700">
                  Prix de référence confidentiel *
                </label>
              </div>
              <div className="relative">
                <input
                  id="referencePrice"
                  name="referencePrice"
                  type="number"
                  min="1"
                  step="0.01"
                  placeholder="0.00"
                  required
                  className="h-10 w-full rounded-lg border border-gray-300 bg-white pl-3 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">€</span>
              </div>
              <p className="mt-2 text-xs text-gray-500 flex items-center gap-1">
                <Info className="h-3 w-3" />
                Ce montant ne sera jamais divulgué aux fournisseurs
              </p>
            </div>

            {error && (
              <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>
            )}

            <div className="flex gap-3">
              <Button type="submit" disabled={loading} className="flex-1">
                {loading ? "Publication en cours..." : "Publier le projet"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
              >
                Annuler
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
