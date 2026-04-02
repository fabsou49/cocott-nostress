"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

interface UpdateStatusButtonProps {
  projectId: string;
  newStatus: string;
  label: string;
  variant?: "success" | "destructive" | "default";
}

export function UpdateStatusButton({ projectId, newStatus, label, variant = "default" }: UpdateStatusButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const confirmMessages: Record<string, string> = {
    COMPLETED: "Confirmer que le projet est terminé avec succès ? Une commission de 10% sera applicable.",
    FAILED: "Marquer le projet comme échoué ? Une commission de 5% sera applicable.",
  };

  async function handleUpdate() {
    const msg = confirmMessages[newStatus];
    if (msg && !confirm(msg)) return;
    setLoading(true);

    await fetch(`/api/projets/${projectId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });

    setLoading(false);
    router.refresh();
  }

  return (
    <Button variant={variant} size="sm" onClick={handleUpdate} disabled={loading}>
      {loading ? "..." : label}
    </Button>
  );
}
