"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Zap } from "lucide-react";
import { SUPPLIER_SKILLS, EXPERIENCE_LEVEL_LABELS, type ExperienceLevel } from "@/types";

export default function InscriptionFournisseurPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);

  function toggleSkill(skill: string) {
    setSelectedSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    );
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    if (selectedSkills.length === 0) {
      setError("Sélectionnez au moins une compétence");
      return;
    }

    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      type: "SUPPLIER",
      name: formData.get("name"),
      email: formData.get("email"),
      password: formData.get("password"),
      companyName: formData.get("companyName"),
      description: formData.get("description") || undefined,
      skills: selectedSkills,
      experienceLevel: formData.get("experienceLevel") || undefined,
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
          <div className="rounded-full bg-violet-100 p-3">
            <Zap className="h-6 w-6 text-violet-600" />
          </div>
        </div>
        <CardTitle className="text-2xl text-center">Proposer mes services</CardTitle>
        <p className="text-center text-sm text-gray-500">
          Accédez aux projets de clients et montrez ce que vous savez faire
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input id="name" name="name" label="Nom complet" placeholder="Jean Dupont" required />
          <Input
            id="companyName"
            name="companyName"
            label="Nom ou pseudo professionnel"
            placeholder="Jean Dev · Studio Créatif · ..."
            required
          />
          <Input
            id="email"
            name="email"
            type="email"
            label="Email"
            placeholder="vous@exemple.fr"
            required
          />

          {/* Skills */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-700">
              Compétences <span className="text-gray-400">(choisissez tout ce qui s'applique)</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {SUPPLIER_SKILLS.map((skill) => {
                const active = selectedSkills.includes(skill);
                return (
                  <button
                    key={skill}
                    type="button"
                    onClick={() => toggleSkill(skill)}
                    className={`rounded-full px-3 py-1 text-xs font-medium border transition-colors ${
                      active
                        ? "bg-violet-600 text-white border-violet-600"
                        : "bg-white text-gray-600 border-gray-300 hover:border-violet-400"
                    }`}
                  >
                    {skill}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Experience level */}
          <div className="flex flex-col gap-1">
            <label htmlFor="experienceLevel" className="text-sm font-medium text-gray-700">
              Niveau d'expérience
            </label>
            <select
              id="experienceLevel"
              name="experienceLevel"
              className="h-10 rounded-lg border border-gray-300 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
            >
              <option value="">Sélectionner...</option>
              {(Object.entries(EXPERIENCE_LEVEL_LABELS) as [ExperienceLevel, string][]).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>

          <Textarea
            id="description"
            name="description"
            label="Présentation (optionnel)"
            placeholder="Décrivez votre façon de travailler, vos outils (IA, no-code...), vos atouts..."
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

          <Button type="submit" className="w-full bg-violet-600 hover:bg-violet-700" disabled={loading}>
            {loading ? "Création en cours..." : "Créer mon profil"}
          </Button>
        </form>

        <div className="mt-4 text-center text-sm text-gray-500">
          <p>
            Déjà un compte ?{" "}
            <Link href="/connexion" className="text-violet-600 hover:underline font-medium">
              Se connecter
            </Link>
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
