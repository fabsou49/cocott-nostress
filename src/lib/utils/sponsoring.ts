export const SPONSORING_PACKAGES = [
  {
    id: "7d",
    label: "Starter",
    days: 7,
    priceCents: 1900,
    description: "Mise en avant pendant 7 jours",
  },
  {
    id: "30d",
    label: "Essentiel",
    days: 30,
    priceCents: 4900,
    description: "Mise en avant pendant 30 jours",
    popular: true,
  },
  {
    id: "90d",
    label: "Premium",
    days: 90,
    priceCents: 9900,
    description: "Mise en avant pendant 90 jours",
  },
] as const;

export type SponsoringPackageId = (typeof SPONSORING_PACKAGES)[number]["id"];

export function getSponsoringPackage(id: string) {
  return SPONSORING_PACKAGES.find((p) => p.id === id) ?? null;
}

export function isSponsored(sponsoredUntil: Date | null | undefined): boolean {
  if (!sponsoredUntil) return false;
  return sponsoredUntil > new Date();
}
