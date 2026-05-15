const AI_KEYWORDS = ["ia", "gpt", "claude", "midjourney", "cursor", "copilot", "llm", "machine learning", "deep learning", "intelligence artificielle", "automatisation", "prompt", "stable diffusion", "dall-e"];

export type SupplierLabel = {
  text: string;
  color: "blue" | "violet" | "green" | "amber" | "emerald";
};

export function getSupplierLabels(profile: {
  skills: string[];
  experienceLevel?: string | null;
  description?: string | null;
  averageRating: number;
  totalRatings: number;
}): SupplierLabel[] {
  const labels: SupplierLabel[] = [];
  const desc = (profile.description || "").toLowerCase();

  // IA label — skills or description
  const hasAI =
    profile.skills.some((s) => s.toLowerCase().includes("intelligence artificielle")) ||
    AI_KEYWORDS.some((kw) => desc.includes(kw));
  if (hasAI) labels.push({ text: "Expert IA", color: "violet" });

  // No-code label
  const hasNoCode = profile.skills.some((s) => s.toLowerCase().includes("no-code") || s.toLowerCase().includes("automatisation"));
  if (hasNoCode) labels.push({ text: "No-code", color: "blue" });

  // Experience level
  if (profile.experienceLevel === "EXPERT") {
    labels.push({ text: "Expert", color: "amber" });
  } else if (profile.experienceLevel === "SENIOR") {
    labels.push({ text: "Senior", color: "blue" });
  }

  // Rating
  if (profile.averageRating >= 4.5 && profile.totalRatings >= 3) {
    labels.push({ text: "Très bien noté", color: "green" });
  } else if (profile.averageRating >= 4 && profile.totalRatings >= 2) {
    labels.push({ text: "Bien noté", color: "green" });
  }

  // Speed claim — based on "rapide" in description
  if (desc.includes("rapide") || desc.includes("délai court") || desc.includes("livraison rapide")) {
    labels.push({ text: "Livraison rapide", color: "emerald" });
  }

  return labels.slice(0, 3); // max 3 labels per profile
}
