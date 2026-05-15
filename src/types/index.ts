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
  "Développement web & mobile",
  "Intelligence artificielle & data",
  "Design & UX",
  "Rédaction & contenu",
  "Marketing & SEO",
  "Automatisation & no-code",
  "Vidéo & médias",
  "Conseil & stratégie",
  "Autre",
];

export const SUPPLIER_SKILLS = [
  "Développement web",
  "Développement mobile",
  "Intelligence artificielle",
  "No-code & automatisation",
  "Design & UX",
  "Rédaction & contenu",
  "Marketing & SEO",
  "Data & analyse",
  "Vidéo & médias",
  "Conseil & stratégie",
];

export type ExperienceLevel = "JUNIOR" | "INTERMEDIATE" | "SENIOR" | "EXPERT";

export const EXPERIENCE_LEVEL_LABELS: Record<ExperienceLevel, string> = {
  JUNIOR: "Junior (< 2 ans)",
  INTERMEDIATE: "Intermédiaire (2–5 ans)",
  SENIOR: "Senior (5–10 ans)",
  EXPERT: "Expert (10+ ans)",
};
