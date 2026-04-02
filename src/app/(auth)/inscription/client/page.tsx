"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { UserCheck } from "lucide-react";

export default function InscriptionClientPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      type: "CLIENT",
      name: formData.get("name"),
      email: formData.get("email"),
      password: formData.get("password"),
      companyName: formData.get("companyName") || undefined,
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

    router.push("/connexion?inscrit=client");
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <div className="flex justify-center mb-2">
          <div className="rounded-full bg-blue-100 p-3">
            <UserCheck className="h-6 w-6 text-blue-600" />
          </div>
        </div>
        <CardTitle className="text-2xl text-center">Créer un compte client</CardTitle>
        <p className="text-center text-sm text-gray-500">
          Déposez vos projets et recevez des offres de fournisseurs qualifiés
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input id="name" name="name" label="Nom complet" placeholder="Jean Dupont" required />
          <Input
            id="email"
            name="email"
            type="email"
            label="Email"
            placeholder="vous@exemple.fr"
            required
          />
          <Input
            id="companyName"
            name="companyName"
            label="Nom de l'entreprise (optionnel)"
            placeholder="Mon Entreprise SAS"
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
            {loading ? "Création en cours..." : "Créer mon compte client"}
          </Button>
        </form>

        <div className="mt-4 text-center text-sm text-gray-500">
          <p>
            Déjà un compte ?{" "}
            <Link href="/connexion" className="text-blue-600 hover:underline font-medium">
              Se connecter
            </Link>
          </p>
          <p className="mt-2">
            Vous êtes fournisseur ?{" "}
            <Link href="/inscription/fournisseur" className="text-blue-600 hover:underline font-medium">
              Inscription fournisseur
            </Link>
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
