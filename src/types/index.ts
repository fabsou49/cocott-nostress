import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: string;
    } & DefaultSession["user"];
  }
}

export type UserRole = "CLIENT" | "SUPPLIER" | "ADMIN";

export type ProjectStatus =
  | "DRAFT"
  | "OPEN"
  | "IN_REVIEW"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "FAILED"
  | "CANCELLED";

export type BidStatus = "PENDING" | "ACCEPTED" | "REJECTED" | "WITHDRAWN";

export const PROJECT_STATUS_LABELS: Record<ProjectStatus, string> = {
  DRAFT: "Brouillon",
  OPEN: "Ouvert",
  IN_REVIEW: "En révision",
  IN_PROGRESS: "En cours",
  COMPLETED: "Terminé",
  FAILED: "Échoué",
  CANCELLED: "Annulé",
};

export const BID_STATUS_LABELS: Record<BidStatus, string> = {
  PENDING: "En attente",
  ACCEPTED: "Accepté",
  REJECTED: "Refusé",
  WITHDRAWN: "Retiré",
};

export const PROJECT_CATEGORIES = [
  "Développement web",
  "Design graphique",
  "Marketing digital",
  "Rédaction & Contenu",
  "Traduction",
  "Comptabilité & Finance",
  "Conseil & Stratégie",
  "Formation",
  "Photographie & Vidéo",
  "Autre",
];
