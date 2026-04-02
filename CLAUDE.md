# Instructions pour Claude — Cocott NoStress

## Règle absolue : mise à jour de la documentation

**À chaque fois qu'une nouvelle fonctionnalité est ajoutée, modifiée ou supprimée, tu DOIS mettre à jour les fichiers de documentation suivants en même temps que le code :**

| Fichier | Quand le mettre à jour |
|---------|------------------------|
| `README.md` | Toute nouvelle route API, modèle de données, source de revenus, ou changement d'architecture |
| `docs/guide-client.md` | Toute modification de l'expérience client (nouveaux écrans, flux de paiement, statuts projet...) |
| `docs/guide-fournisseur.md` | Toute modification de l'expérience fournisseur (onboarding, offres, paiements, visibilité...) |

Ne jamais livrer du code sans avoir vérifié si l'une de ces docs doit être mise à jour.

---

## Stack et contraintes importantes

- **Prisma v5** (PAS v7) — ne pas upgrader, breaking changes
- **Zod v3** (PAS v4) — ne pas upgrader, breaking changes
- **Next.js 14** App Router
- **Tailwind CSS v4** — pas de `tailwind.config.js`, utilise `@import "tailwindcss"` dans le CSS
- **NextAuth v5 beta** — JWT avec `id` et `role` embarqués dans le token
- **Stripe v16** — `apiVersion: "2024-12-18.acacia" as never`
- **Windows** — variables d'env via `set -a && source .env.local &&` avant les commandes Prisma
- Tuer le serveur dev avant `prisma generate` sur Windows : `powershell -Command "Get-Process node | Stop-Process -Force"`

## Modèle de données clé

- `CommissionConfig id="global"` — singleton pour taux et frais d'inscription
- `SupplierProfile.registrationPaid` — accès plateforme
- `SupplierProfile.stripeAccountActive` — peut recevoir des paiements
- `Project.escrowPaymentIntentId` — PaymentIntent Stripe du séquestre client
- `referencePrice` — **jamais exposé aux fournisseurs** via l'API

## Flux de paiement

1. Inscription fournisseur → Stripe Checkout (type=REGISTRATION) ou gratuit si 0€
2. Client accepte offre → vérif `stripeAccountActive` → Stripe Checkout (type=ESCROW)
3. Webhook `checkout.session.completed` → active selon `metadata.type`
4. Projet COMPLETED → `stripe.transfers.create` vers `supplier.stripeAccountId`
5. Projet FAILED → `stripe.refunds.create` (montant - commission échec)

## Anti-fraude

- `src/lib/utils/detectContact.ts` — filtre emails, tél, URLs, handles dans coverLetter et description projet
- Prix de référence client : jamais dans les requêtes Prisma côté fournisseur

## Revenus plateforme

- Frais inscription (configurable)
- Commission succès (configurable, défaut 10%)
- Commission échec (configurable, défaut 5%)
- Sponsoring : 19€/7j · 49€/30j · 99€/90j
- Codes promo : REGISTRATION (réduction inscription) ou COMMISSION_RATE (réduction taux N mois)
