"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus, X } from "lucide-react";

export function CreateOfferModal() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    code: "",
    description: "",
    target: "REGISTRATION",
    discountType: "PERCENTAGE",
    discountValue: "",
    durationMonths: "",
    maxUses: "",
    expiresAt: "",
    active: true,
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await fetch("/api/admin/offres", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        discountValue: Number(form.discountValue),
        durationMonths: form.durationMonths ? Number(form.durationMonths) : null,
        maxUses: form.maxUses ? Number(form.maxUses) : null,
        expiresAt: form.expiresAt ? new Date(form.expiresAt).toISOString() : null,
      }),
    });

    setLoading(false);

    if (!res.ok) {
      const { error: msg } = await res.json();
      setError(msg || "Erreur lors de la création");
      return;
    }

    setOpen(false);
    setForm({ code: "", description: "", target: "REGISTRATION", discountType: "PERCENTAGE", discountValue: "", durationMonths: "", maxUses: "", expiresAt: "", active: true });
    router.refresh();
  }

  if (!open) {
    return (
      <Button onClick={() => setOpen(true)}>
        <Plus className="h-4 w-4" />
        Nouvelle offre
      </Button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <h2 className="text-lg font-semibold">Créer une offre commerciale</h2>
          <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Code promo *"
              placeholder="EX: LAUNCH50"
              value={form.code}
              onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
              required
            />
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">Cible *</label>
              <select
                className="h-10 rounded-lg border border-gray-300 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={form.target}
                onChange={(e) => setForm({ ...form, target: e.target.value })}
              >
                <option value="REGISTRATION">Frais d&apos;inscription</option>
                <option value="COMMISSION_RATE">Taux de commission</option>
              </select>
            </div>
          </div>

          <Textarea
            label="Description *"
            placeholder="Ex: Offre de lancement — 50% de réduction sur l'inscription"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            rows={2}
            required
          />

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">Type de réduction *</label>
              <select
                className="h-10 rounded-lg border border-gray-300 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={form.discountType}
                onChange={(e) => setForm({ ...form, discountType: e.target.value })}
                disabled={form.target === "COMMISSION_RATE"}
              >
                <option value="PERCENTAGE">Pourcentage (%)</option>
                {form.target === "REGISTRATION" && (
                  <option value="FIXED_CENTS">Montant fixe (€)</option>
                )}
              </select>
            </div>
            <div className="relative">
              <Input
                label="Valeur de la réduction *"
                type="number"
                min="0"
                step="0.01"
                placeholder={form.discountType === "PERCENTAGE" ? "50" : "5000"}
                value={form.discountValue}
                onChange={(e) => setForm({ ...form, discountValue: e.target.value })}
                required
              />
              <span className="absolute right-3 top-9 text-gray-400 text-sm">
                {form.discountType === "PERCENTAGE" ? "%" : "cts"}
              </span>
              {form.discountType === "FIXED_CENTS" && (
                <p className="text-xs text-gray-400 mt-1">En centimes (ex: 5000 = 50€)</p>
              )}
            </div>
          </div>

          {form.target === "COMMISSION_RATE" && (
            <Input
              label="Durée (mois)"
              type="number"
              min="1"
              placeholder="Ex: 6 (vide = permanent)"
              value={form.durationMonths}
              onChange={(e) => setForm({ ...form, durationMonths: e.target.value })}
            />
          )}

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Nb max d'utilisations"
              type="number"
              min="1"
              placeholder="Vide = illimité"
              value={form.maxUses}
              onChange={(e) => setForm({ ...form, maxUses: e.target.value })}
            />
            <Input
              label="Date d'expiration"
              type="datetime-local"
              value={form.expiresAt}
              onChange={(e) => setForm({ ...form, expiresAt: e.target.value })}
            />
          </div>

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.active}
              onChange={(e) => setForm({ ...form, active: e.target.checked })}
              className="rounded"
            />
            Activer immédiatement
          </label>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>
          )}

          <div className="flex gap-3 pt-2">
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? "Création..." : "Créer l'offre"}
            </Button>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Annuler
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
