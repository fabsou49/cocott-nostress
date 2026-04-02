"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Zap, X } from "lucide-react";

interface Props {
  userId: string;
  sponsoredUntil: string | null;
}

const QUICK_PACKAGES = [
  { label: "7j", days: 7 },
  { label: "30j", days: 30 },
  { label: "90j", days: 90 },
];

export function SponsoringAdminToggle({ userId, sponsoredUntil: initial }: Props) {
  const [sponsoredUntil, setSponsoredUntil] = useState(initial);
  const [loading, setLoading] = useState(false);

  const isActive = sponsoredUntil ? new Date(sponsoredUntil) > new Date() : false;

  async function setDays(days: number) {
    setLoading(true);
    const res = await fetch(`/api/admin/utilisateurs/${userId}/sponsoring`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ days }),
    });
    const data = await res.json();
    setSponsoredUntil(data.sponsoredUntil ?? null);
    setLoading(false);
  }

  if (isActive) {
    return (
      <div className="flex items-center gap-2">
        <Badge className="bg-yellow-400 text-yellow-900 hover:bg-yellow-400 gap-1 text-xs">
          <Zap className="h-3 w-3" />
          {new Date(sponsoredUntil!).toLocaleDateString("fr-FR")}
        </Badge>
        <button
          onClick={() => setDays(0)}
          disabled={loading}
          className="text-gray-400 hover:text-red-500 transition-colors"
          title="Retirer le sponsoring"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1">
      {QUICK_PACKAGES.map((pkg) => (
        <Button
          key={pkg.days}
          size="sm"
          variant="outline"
          className="h-6 px-2 text-xs"
          disabled={loading}
          onClick={() => setDays(pkg.days)}
        >
          +{pkg.label}
        </Button>
      ))}
    </div>
  );
}
