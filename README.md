# Cocott NoStress

Plateforme de mise en relation **clients / fournisseurs** avec système d'enchères, réputation vérifiée et paiements sécurisés via Stripe.

> Documentation complète : [`docs/guide-client.md`](docs/guide-client.md) · [`docs/guide-fournisseur.md`](docs/guide-fournisseur.md)

---

## Concept

- Les **clients** déposent des projets avec un prix de référence **confidentiel** (jamais visible des fournisseurs).
- Les **fournisseurs** soumettent des offres librement.
- Le client sélectionne la meilleure offre (prix + réputation), paie en séquestre, et déclenche le virement au fournisseur à la fin du projet.
- La plateforme prélève une commission automatiquement sur chaque transaction.

---

## Stack technique

| Couche | Technologie |
|--------|-------------|
| Framework | Next.js 14 (App Router, TypeScript) |
| UI | Tailwind CSS v4 + composants custom |
| Auth | NextAuth v5 (credentials, JWT) |
| ORM | Prisma v5 + PostgreSQL |
| Paiements | Stripe v16 (Checkout, Connect Express, Webhooks) |
| Validation | Zod v3 |

---

## Installation

### Prérequis

- Node.js 18+
- Docker (pour PostgreSQL)
- Compte Stripe (clés test suffisantes)
- CLI `gh` (GitHub) si besoin de gérer le dépôt

### 1. Cloner et installer

```bash
git clone https://github.com/fabsou49/cocott-nostress.git
cd cocott-nostress
npm install
```

### 2. Variables d'environnement

Créer `.env.local` à la racine :

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/cocott_nostress"
NEXTAUTH_SECRET="une-chaine-aleatoire-longue"
NEXTAUTH_URL="http://localhost:3000"
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
```

### 3. Base de données

```bash
# Démarrer PostgreSQL via Docker
docker run --name cocott-pg \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=cocott_nostress \
  -p 5432:5432 -d postgres:15

# Appliquer les migrations
npx prisma migrate deploy

# Créer l'admin initial
node scripts/create-admin.mjs
```

### 4. Stripe Webhook (développement local)

```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

Copier le `whsec_...` affiché dans `STRIPE_WEBHOOK_SECRET`.

### 5. Lancer le serveur

```bash
npm run dev
```

Application disponible sur `http://localhost:3000`.

---

## Rôles utilisateurs

| Rôle | Accès | Coût |
|------|-------|------|
| `CLIENT` | Déposer et gérer des projets, recevoir des offres, payer | Gratuit |
| `SUPPLIER` | Parcourir les projets, soumettre des offres, recevoir des paiements | 100€ inscription (configurable) + commissions |
| `ADMIN` | Tableau de bord complet, configuration, gestion utilisateurs | — |

---

## Modèle économique

| Source de revenus | Détail |
|-------------------|--------|
| Inscription fournisseur | Frais unique configurable (défaut : 100€) |
| Commission succès | % du montant de la prestation si projet terminé (défaut : 10%) |
| Commission échec | % du montant de la prestation si projet échoué (défaut : 5%) |
| Sponsoring | Mise en avant du profil fournisseur (19€/7j · 49€/30j · 99€/90j) |

Tous les taux sont modifiables en temps réel depuis l'interface admin (`/admin/offres-commerciales`).

---

## Flux de paiement

```
[Fournisseur] Connecte son compte Stripe (Stripe Connect Express)
                          ↓
[Client] Sélectionne une offre → Paie le montant en séquestre (Stripe Checkout)
                          ↓
              Fonds bloqués sur la plateforme
                          ↓
[Client] Valide "Terminé" → virement automatique au fournisseur (montant - commission succès)
[Client] Valide "Échoué"  → remboursement client (montant - commission échec)
```

---

## Anti-fraude

- **Filtrage des coordonnées** : emails, téléphones, URLs et handles sociaux sont détectés et bloqués dans les lettres de motivation et descriptions de projets (voir `src/lib/utils/detectContact.ts`).
- **Séquestre obligatoire** : aucun projet ne peut démarrer sans paiement préalable.
- **Prix de référence confidentiel** : jamais exposé aux fournisseurs via l'API.
- **Stripe Connect requis** : un fournisseur ne peut être sélectionné que s'il a connecté son compte bancaire.

---

## Structure du projet

```
src/
├── app/
│   ├── (auth)/            # Connexion, inscription
│   ├── (client)/          # Espace client
│   ├── (fournisseur)/     # Espace fournisseur
│   ├── (admin)/           # Back-office admin
│   └── api/               # Routes API
│       ├── admin/         # Config, utilisateurs, offres commerciales
│       ├── client/        # Paiement séquestre
│       ├── fournisseur/   # Stripe Connect, sponsoring, profil
│       ├── paiements/     # Inscription fournisseur
│       ├── projets/       # CRUD projets + offres
│       └── webhooks/      # Stripe webhook
├── components/
│   ├── layout/            # Sidebar, navigation
│   ├── projets/           # Composants projet/offres
│   ├── ratings/           # Système de notation
│   └── ui/                # Composants de base
├── lib/
│   ├── auth.ts            # Config NextAuth
│   ├── prisma.ts          # Client Prisma
│   ├── stripe.ts          # Client Stripe
│   └── utils/
│       ├── detectContact.ts   # Filtre anti-fraude
│       ├── offers.ts          # Config commissions, codes promo
│       └── sponsoring.ts      # Packages de mise en avant
prisma/
├── schema.prisma          # Schéma de données
└── migrations/            # Historique des migrations
scripts/
└── create-admin.mjs       # Création du compte admin initial
```

---

## Administration

Accès : `http://localhost:3000/admin/tableau-de-bord`
Compte par défaut créé par `scripts/create-admin.mjs` : `admin@cocott.fr` / `admin123`

### Fonctionnalités admin

- **Tableau de bord** : statistiques globales
- **Utilisateurs** : liste, statut inscription, note, gestion du sponsoring manuel
- **Projets** : vue globale de tous les projets
- **Paiements** : historique de toutes les transactions
- **Offres commerciales** : configuration des taux de commission, codes promo (REGISTRATION ou COMMISSION_RATE)

---

## Codes promo

Deux types disponibles :

| Type | Effet |
|------|-------|
| `REGISTRATION` | Réduction (% ou montant fixe) sur les frais d'inscription fournisseur |
| `COMMISSION_RATE` | Réduction temporaire du taux de commission (N mois) |

Si le code promo réduit les frais d'inscription à 0€, aucune CB n'est demandée.
