# Guide Fournisseur — Cocott NoStress

Ce guide explique comment utiliser la plateforme en tant que **fournisseur** (prestataire).

---

## 1. Créer un compte et s'inscrire

### 1.1 Inscription

1. Depuis la page d'accueil, cliquez **"Devenir fournisseur"**.
2. Renseignez votre nom, email, mot de passe et le nom de votre entreprise.
3. Vous êtes redirigé vers la page de **finalisation de l'inscription**.

### 1.2 Paiement des frais d'inscription

L'accès à la plateforme nécessite un **paiement unique** (tarif configurable par l'admin, affiché sur la page).

- Un **code promo** peut être appliqué pour obtenir une réduction ou un accès gratuit.
- Si le montant est réduit à 0€, aucune carte bancaire n'est demandée.
- Le paiement est sécurisé via Stripe.

Une fois l'inscription payée, vous accédez à votre tableau de bord.

---

## 2. Connecter votre compte bancaire

**Obligatoire pour recevoir des paiements.** Sans cette étape, les clients ne peuvent pas vous sélectionner.

1. Dans le menu latéral, cliquez **"Compte bancaire"**.
2. Cliquez **"Connecter mon compte bancaire"**.
3. Vous êtes redirigé vers **Stripe Express** pour créer ou connecter votre compte (processus guidé, ~5 minutes).
4. Une fois terminé, vous revenez automatiquement sur la plateforme avec le statut **"Actif"**.

> Stripe Express gère la conformité bancaire (KYC). Vos coordonnées bancaires ne transitent jamais par nos serveurs.

---

## 3. Parcourir les projets

Depuis **"Parcourir les projets"** dans le menu, vous accédez à tous les projets ouverts.

Chaque projet affiche :
- Titre, description, catégorie
- Nom du client (entreprise ou pseudonyme)
- Date limite
- Nombre d'offres déjà reçues

> Le **prix de référence du client est confidentiel** — vous ne le verrez jamais. Proposez le tarif qui correspond à votre évaluation réelle du projet.

---

## 4. Soumettre une offre

1. Cliquez sur un projet pour en voir le détail.
2. Remplissez le formulaire d'offre :

| Champ | Description |
|-------|-------------|
| **Montant** | Votre tarif en euros (HT ou TTC selon votre usage) |
| **Lettre de motivation** | Présentez votre approche et vos compétences (min. 50 caractères) |
| **Délai estimé** | Nombre de jours pour réaliser le projet (optionnel) |

### Règle anti-fraude

Il est **strictement interdit** d'inclure des coordonnées personnelles (email, téléphone, URL, réseaux sociaux) dans la lettre de motivation. La plateforme les détecte et bloque la soumission. Toute mise en relation doit passer par la plateforme.

---

## 5. Être sélectionné et recevoir le paiement

### Sélection

Si le client choisit votre offre, elle passe au statut **"Acceptée"** et le client effectue le paiement en séquestre.

### Pendant le projet

Le projet passe en statut **"En cours"**. Livrez le travail convenu.

### À la fin du projet

- **Projet terminé** : le client valide la livraison → vous recevez automatiquement un virement sur votre compte Stripe du **montant de l'offre moins la commission succès**.
- **Projet échoué** : le client déclare l'échec → le client est remboursé partiellement, la plateforme conserve la **commission d'échec**.

Les virements arrivent sur votre compte bancaire selon le calendrier de paiement Stripe (généralement 2 à 7 jours ouvrés).

### Commissions

| Résultat | Commission |
|----------|-----------|
| Projet terminé avec succès | % du montant (défaut : 10%) |
| Projet échoué | % du montant (défaut : 5%) |

Les taux exacts sont définis par l'administrateur et affichés dans votre espace. Un code promo de type `COMMISSION_RATE` peut réduire ces taux temporairement.

---

## 6. Votre réputation

Après chaque projet terminé, le client peut vous attribuer une note de **1 à 5 étoiles** avec un commentaire.

- Votre **note moyenne** et le **nombre d'évaluations** sont visibles par tous les clients.
- Une bonne réputation vous différencie de la concurrence et augmente vos chances d'être sélectionné.

---

## 7. Booster votre visibilité (Sponsoring)

Pour apparaître en **premier dans les listes d'offres** reçues par les clients, vous pouvez activer le sponsoring.

Depuis **"Visibilité"** dans le menu :

| Pack | Durée | Prix |
|------|-------|------|
| Starter | 7 jours | 19€ |
| Essentiel | 30 jours | 49€ |
| Premium | 90 jours | 99€ |

Avantages :
- Votre offre apparaît **en premier** dans la liste (avant les offres non sponsorisées)
- Badge **"Mis en avant"** jaune visible par le client
- Les packs sont **cumulatifs** : acheter un nouveau pack prolonge la durée

---

## 8. Questions fréquentes

**Puis-je retirer une offre ?**
Oui, tant qu'elle est en statut "En attente" et que le client n'a pas encore sélectionné un fournisseur.

**Que se passe-t-il si je n'ai pas encore connecté mon compte bancaire ?**
Les clients ne peuvent pas vous sélectionner. Un message les en informe et les invite à choisir un autre fournisseur.

**Mon inscription est-elle remboursable ?**
Non. Les frais d'inscription sont définitifs (conformément aux CGU).

**Puis-je soumettre plusieurs offres simultanément ?**
Oui, sur autant de projets que vous le souhaitez, sans limite.

**Quand les fonds me sont-ils virés ?**
Le virement est déclenché automatiquement lorsque le client valide le projet. Le délai d'arrivée sur votre compte bancaire dépend de Stripe (2–7 jours ouvrés en général).

**Comment contacter un client ?**
Tous les échanges doivent passer par la plateforme (lettre de motivation, mise à jour de statut). L'échange de coordonnées personnelles est interdit et détecté automatiquement.
