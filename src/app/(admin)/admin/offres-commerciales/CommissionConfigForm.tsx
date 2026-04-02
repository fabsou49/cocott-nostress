"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Settings, Save, CheckCircle } from "lucide-react";

interface CommissionConfigFormProps {
  initialConfig: {
    successRate: number;
    failureRate: number;
    registrationFeeCents: number;
  } | null;
}

export function CommissionConfigForm({ initialConfig }: CommissionConfigFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const [values, setValues] = useState({
    successRate: initialConfig ? Number(initialConfig.successRate) * 100 : 10,
    failureRate: initialConfig ? Number(initialConfig.failureRate) * 100 : 5,
    registrationFeeEuros: initialConfig ? initialConfig.registrationFeeCents / 100 : 100,
  });

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSaved(false);

    const res = await fetch("/api/admin/config", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });

    setLoading(false);

    if (!res.ok) {
      const { error: msg } = await res.json();
      setError(msg || "Erreur lors de la sauvegarde");
      return;
    }

    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
    router.refresh();
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5 text-blue-600" />
          Paramètres de commission
        </CardTitle>
        <p className="text-sm text-gray-500">
          Ces taux s&apos;appliquent à toutes les nouvelles prestations. Les prestations en cours ne sont pas affectées.
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="relative">
              <Input
                label="Commission si réussie"
                type="number"
                min="0"
                max="100"
                step="0.5"
                value={values.successRate}
                onChange={(e) => setValues({ ...values, successRate: Number(e.target.value) })}
                required
              />
              <span className="absolute right-3 top-9 text-gray-400 text-sm">%</span>
              <p className="text-xs text-gray-400 mt-1">Défaut : 10%</p>
            </div>
            <div className="relative">
              <Input
                label="Commission si échouée"
                type="number"
                min="0"
                max="100"
                step="0.5"
                value={values.failureRate}
                onChange={(e) => setValues({ ...values, failureRate: Number(e.target.value) })}
                required
              />
              <span className="absolute right-3 top-9 text-gray-400 text-sm">%</span>
              <p className="text-xs text-gray-400 mt-1">Défaut : 5%</p>
            </div>
            <div className="relative">
              <Input
                label="Frais d'inscription fournisseur"
                type="number"
                min="0"
                step="1"
                value={values.registrationFeeEuros}
                onChange={(e) => setValues({ ...values, registrationFeeEuros: Number(e.target.value) })}
                required
              />
              <span className="absolute right-3 top-9 text-gray-400 text-sm">€</span>
              <p className="text-xs text-gray-400 mt-1">Défaut : 100€</p>
            </div>
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>
          )}

          <div className="flex items-center gap-3">
            <Button type="submit" disabled={loading}>
              <Save className="h-4 w-4" />
              {loading ? "Sauvegarde..." : "Sauvegarder"}
            </Button>
            {saved && (
              <span className="flex items-center gap-1.5 text-sm text-green-600">
                <CheckCircle className="h-4 w-4" />
                Sauvegardé
              </span>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
