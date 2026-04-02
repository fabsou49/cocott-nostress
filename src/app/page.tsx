import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import {
  Lightbulb,
  Search,
  Star,
  Shield,
  EyeOff,
  TrendingUp,
  CheckCircle,
  ArrowRight,
  Users,
} from "lucide-react";

export default async function HomePage() {
  const session = await auth();

  // Redirect logged-in users to their dashboard
  if (session) {
    if (session.user.role === "CLIENT") redirect("/client/tableau-de-bord");
    if (session.user.role === "SUPPLIER") redirect("/fournisseur/tableau-de-bord");
    if (session.user.role === "ADMIN") redirect("/admin/tableau-de-bord");
  }

  const config = await prisma.commissionConfig.findUnique({ where: { id: "global" } });
  const registrationFee = config ? config.registrationFeeCents / 100 : 100;
  const successRate = config ? Math.round(Number(config.successRate) * 100) : 10;
  const failureRate = config ? Math.round(Number(config.failureRate) * 100) : 5;

  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="border-b border-gray-200 bg-white/80 backdrop-blur sticky top-0 z-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold text-blue-600">Cocott</span>
              <span className="text-xl font-light text-gray-400">NoStress</span>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/connexion">
                <Button variant="outline" size="sm">Connexion</Button>
              </Link>
              <Link href="/inscription/client">
                <Button size="sm">Déposer un projet</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-blue-500/30 px-4 py-1.5 text-sm text-blue-100 mb-8">
            <Star className="h-4 w-4 fill-yellow-300 text-yellow-300" />
            La plateforme de mise en relation intelligente
          </div>
          <h1 className="text-4xl sm:text-6xl font-bold text-white leading-tight">
            Vos idées méritent
            <br />
            <span className="text-yellow-300">les meilleurs fournisseurs</span>
          </h1>
          <p className="mt-6 text-xl text-blue-100 max-w-2xl mx-auto">
            Déposez votre projet, recevez des offres compétitives et sélectionnez le meilleur
            fournisseur grâce à un système d'enchères transparent et une réputation vérifiée.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/inscription/client">
              <Button size="lg" className="bg-white text-blue-700 hover:bg-blue-50">
                Déposer mon projet
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/inscription/fournisseur">
              <Button size="lg" variant="outline" className="border-white/50 text-white hover:bg-white/10">
                Devenir fournisseur
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-4">Comment ça marche ?</h2>
          <p className="text-center text-gray-500 mb-12">Simple, transparent, efficace</p>
          <div className="grid gap-8 sm:grid-cols-3">
            {[
              {
                step: "01",
                icon: <Lightbulb className="h-6 w-6 text-blue-600" />,
                title: "Déposez votre idée",
                desc: "Décrivez votre projet et indiquez votre budget de référence confidentiel. Les fournisseurs ne le verront jamais.",
                color: "bg-blue-50",
              },
              {
                step: "02",
                icon: <Search className="h-6 w-6 text-purple-600" />,
                title: "Recevez des offres",
                desc: "Les fournisseurs qualifiés proposent leurs estimations tarifaires. Comparez leurs offres et leur réputation.",
                color: "bg-purple-50",
              },
              {
                step: "03",
                icon: <CheckCircle className="h-6 w-6 text-green-600" />,
                title: "Choisissez le meilleur",
                desc: "Sélectionnez la meilleure combinaison prix/réputation et démarrez la collaboration en toute confiance.",
                color: "bg-green-50",
              },
            ].map((item) => (
              <div key={item.step} className="relative">
                <Card>
                  <CardContent className="p-6">
                    <div className={`inline-flex rounded-xl p-3 ${item.color} mb-4`}>
                      {item.icon}
                    </div>
                    <div className="absolute top-4 right-4 text-4xl font-bold text-gray-100">
                      {item.step}
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{item.title}</h3>
                    <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Key features */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Pourquoi choisir Cocott NoStress ?
          </h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: <EyeOff className="h-5 w-5 text-blue-600" />,
                title: "Prix de référence confidentiel",
                desc: "Votre budget n'est jamais révélé aux fournisseurs. Vous gardez tout le contrôle de la négociation.",
                bg: "bg-blue-50",
              },
              {
                icon: <Star className="h-5 w-5 text-yellow-500" />,
                title: "Réputation vérifiée",
                desc: "Chaque fournisseur est noté après chaque prestation. Choisissez en toute confiance.",
                bg: "bg-yellow-50",
              },
              {
                icon: <TrendingUp className="h-5 w-5 text-green-600" />,
                title: "Enchères compétitives",
                desc: "La concurrence entre fournisseurs vous garantit les meilleures offres du marché.",
                bg: "bg-green-50",
              },
              {
                icon: <Shield className="h-5 w-5 text-purple-600" />,
                title: "Fournisseurs qualifiés",
                desc: `Seuls les fournisseurs ayant complété leur inscription (${registrationFee.toLocaleString("fr-FR")}€) accèdent à vos projets.`,
                bg: "bg-purple-50",
              },
              {
                icon: <Users className="h-5 w-5 text-indigo-600" />,
                title: "Communauté active",
                desc: "Une plateforme vivante avec des projets dans tous les secteurs d'activité.",
                bg: "bg-indigo-50",
              },
              {
                icon: <CheckCircle className="h-5 w-5 text-teal-600" />,
                title: "Suivi complet",
                desc: "De la publication à la livraison, suivez l'avancement de vos projets en temps réel.",
                bg: "bg-teal-50",
              },
            ].map((feature) => (
              <div key={feature.title} className="flex gap-4 p-4 rounded-xl border border-gray-100 hover:border-blue-200 transition-colors">
                <div className={`${feature.bg} rounded-lg p-2.5 h-fit shrink-0`}>
                  {feature.icon}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">{feature.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20 bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-4">Tarifs transparents</h2>
          <p className="text-center text-gray-500 mb-12">Aucune surprise, tout est clair dès le départ</p>
          <div className="grid gap-6 sm:grid-cols-2 max-w-2xl mx-auto">
            <Card className="border-2 border-blue-200">
              <CardContent className="p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-1">Pour les clients</h3>
                <p className="text-3xl font-bold text-blue-600 mb-4">
                  Gratuit
                  <span className="text-sm font-normal text-gray-500 ml-2">toujours</span>
                </p>
                <ul className="space-y-2 text-sm text-gray-600">
                  {["Création de compte gratuite", "Publication illimitée de projets", "Réception et comparaison des offres", "Sélection du fournisseur"].map((item) => (
                    <li key={item} className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500 shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
                <Link href="/inscription/client" className="block mt-6">
                  <Button className="w-full">Commencer gratuitement</Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="border-2 border-green-200">
              <CardContent className="p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-1">Pour les fournisseurs</h3>
                <p className="text-3xl font-bold text-green-600 mb-1">
                  {registrationFee.toLocaleString("fr-FR")}€
                  <span className="text-sm font-normal text-gray-500 ml-2">une fois</span>
                </p>
                <p className="text-xs text-gray-400 mb-4">+ commission sur prestations</p>
                <ul className="space-y-2 text-sm text-gray-600">
                  {[
                    "Accès à tous les projets",
                    "Soumission d'offres illimitée",
                    "Profil avec réputation",
                    `${failureRate}% commission si prestation échouée`,
                    `${successRate}% commission si prestation réussie`,
                  ].map((item) => (
                    <li key={item} className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500 shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
                <Link href="/inscription/fournisseur" className="block mt-6">
                  <Button variant="success" className="w-full">Devenir fournisseur</Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center text-sm text-gray-400">
          <p>© 2026 Cocott NoStress — La plateforme de mise en relation clients-fournisseurs</p>
        </div>
      </footer>
    </div>
  );
}
