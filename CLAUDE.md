# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Règle absolue : mise à jour de la documentation

**À chaque fois qu'une nouvelle fonctionnalité est ajoutée, modifiée ou supprimée, tu DOIS mettre à jour les fichiers de documentation suivants en même temps que le code :**

| Fichier | Quand le mettre à jour |
|---------|------------------------|
| `README.md` | Toute nouvelle route API, modèle de données, source de revenus, ou changement d'architecture |
| `docs/guide-client.md` | Toute modification de l'expérience client (nouveaux écrans, flux de paiement, statuts projet...) |
| `docs/guide-fournisseur.md` | Toute modification de l'expérience fournisseur (onboarding, offres, paiements, visibilité...) |

---

## Commandes de développement

```bash
# Démarrer le serveur de développement
npm run dev

# Build de production
npm run build

# Lint
npm run lint

# Migrations Prisma (macOS/Linux)
npx prisma migrate dev --name <nom>
npx prisma migrate deploy
npx prisma generate
npx prisma studio

# Migrations Prisma (Windows — variables d'env nécessaires)
set -a && source .env.local && npx prisma migrate dev --name <nom>

# Créer le compte admin initial
node scripts/create-admin.mjs

# PostgreSQL via Docker
docker run --name cocott-pg -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=cocott_nostress -p 5432:5432 -d postgres:15

# Stripe webhook en local
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

## Stack et contraintes importantes

- **Prisma v5** (PAS v7) — ne pas upgrader, breaking changes
- **Zod v3** (PAS v4) — ne pas upgrader, breaking changes
- **Next.js 14** App Router
- **Tailwind CSS v4** — pas de `tailwind.config.js`, utilise `@import "tailwindcss"` dans le CSS
- **NextAuth v5 beta** — JWT avec `id` et `role` embarqués dans le token
- **Stripe v16** — `apiVersion: "2024-12-18.acacia" as never`
- Sur Windows : tuer le serveur dev avant `prisma generate` : `powershell -Command "Get-Process node | Stop-Process -Force"`

## Architecture

### Structure des routes (App Router)

```
src/app/
├── (auth)/            # /connexion, /inscription/client, /inscription/fournisseur
├── (client)/          # /client/tableau-de-bord, /projets, /projets/[id], /projets/[id]/evaluer
├── (fournisseur)/     # /fournisseur/tableau-de-bord, /projets, /mes-offres, /paiements, /visibilite, /inscription-paiement
├── (admin)/           # /admin/tableau-de-bord, /utilisateurs, /projets, /paiements, /offres-commerciales
├── api/
│   ├── admin/         # config, users, commissions, offres-commerciales
│   ├── client/        # escrow payment
│   ├── fournisseur/   # stripe-connect, sponsoring, profile
│   ├── paiements/     # inscription fournisseur
│   ├── projets/       # CRUD + offres
│   └── webhooks/      # stripe
└── page.tsx           # Landing page publique
```

### Modèle de données clé

- `CommissionConfig id="global"` — singleton pour taux et frais d'inscription
- `SupplierProfile.registrationPaid` — accès plateforme
- `SupplierProfile.stripeAccountActive` — peut recevoir des paiements
- `Project.escrowPaymentIntentId` — PaymentIntent Stripe du séquestre client
- `referencePrice` — **jamais exposé aux fournisseurs** via l'API

### Flux de paiement

1. Inscription fournisseur → Stripe Checkout (`type=REGISTRATION`) ou gratuit si 0€
2. Client accepte offre → vérif `stripeAccountActive` → Stripe Checkout (`type=ESCROW`)
3. Webhook `checkout.session.completed` → active selon `metadata.type`
4. Projet COMPLETED → `stripe.transfers.create` vers `supplier.stripeAccountId`
5. Projet FAILED → `stripe.refunds.create` (montant - commission échec)

### Statuts d'un projet

`DRAFT → OPEN → IN_REVIEW → IN_PROGRESS → COMPLETED / FAILED / CANCELLED`

### Anti-fraude

- `src/lib/utils/detectContact.ts` — filtre emails, tél, URLs, handles dans coverLetter et description projet
- Prix de référence client : jamais dans les requêtes Prisma côté fournisseur

## Revenus plateforme

- Frais inscription fournisseur (configurable, défaut 100€)
- Commission succès (configurable, défaut 10%)
- Commission échec (configurable, défaut 5%)
- Sponsoring : 19€/7j · 49€/30j · 99€/90j
- Codes promo : `REGISTRATION` (réduction inscription) ou `COMMISSION_RATE` (réduction taux N mois)

## Variables d'environnement requises

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/cocott_nostress"
NEXTAUTH_SECRET="..."
NEXTAUTH_URL="http://localhost:3000"
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
```
