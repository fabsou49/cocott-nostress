"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Briefcase, CheckCircle } from "lucide-react";

export default function InscriptionFournisseurPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      type: "SUPPLIER",
      name: formData.get("name"),
      email: formData.get("email"),
      password: formData.get("password"),
      companyName: formData.get("companyName"),
      description: formData.get("description") || undefined,
    };

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    setLoading(false);

    if (!res.ok) {
      const { error: msg } = await res.json();
      setError(msg || "Erreur lors de l'inscription");
      return;
    }

    router.push("/connexion?inscrit=fournisseur");
  }

  return (
    <Card className="w-full max-w-lg">
      <CardHeader>
        <div className="flex justify-center mb-2">
          <div className="rounded-full bg-green-100 p-3">
            <Briefcase className="h-6 w-6 text-green-600" />
          </div>
        </div>
        <CardTitle className="text-2xl text-center">Devenir fournisseur</CardTitle>
        <p className="text-center text-sm text-gray-500">
          Accédez aux projets de clients et développez votre activité
        </p>
      </CardHeader>
      <CardContent>
        {/* Registration fee notice */}
        <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 p-4">
          <div className="flex items-start gap-3">
            <CheckCircle className="h-5 w-5 text-amber-600 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-semibold text-amber-800">Frais d'inscription : 100€</p>
              <p className="text-xs text-amber-700 mt-1">
                Après création de votre compte, un paiement unique de 100€ vous donnera accès à
                l'ensemble des projets disponibles sur la plateforme.
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input id="name" name="name" label="Nom complet" placeholder="Jean Dupont" required />
          <Input
            id="companyName"
            name="companyName"
            label="Nom de l'entreprise"
            placeholder="Ma Société SAS"
            required
          />
          <Input
            id="email"
            name="email"
            type="email"
            label="Email professionnel"
            placeholder="contact@masociete.fr"
            required
          />
          <Textarea
            id="description"
            name="description"
            label="Présentation (optionnel)"
            placeholder="Décrivez votre activité, vos compétences et votre expérience..."
            rows={3}
          />
          <Input
            id="password"
            name="password"
            type="password"
            label="Mot de passe"
            placeholder="8 caractères minimum"
            required
          />

          {error && (
            <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>
          )}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Création en cours..." : "Créer mon compte fournisseur"}
          </Button>
          <p className="text-xs text-center text-gray-400">
            Étape suivante : paiement sécurisé de 100€ via Stripe
          </p>
        </form>

        <div className="mt-4 text-center text-sm text-gray-500">
          <p>
            Déjà un compte ?{" "}
            <Link href="/connexion" className="text-blue-600 hover:underline font-medium">
              Se connecter
            </Link>
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
