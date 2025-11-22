import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Politique de Cookies | Crea'Soka",
  description:
    "Informations sur l'utilisation des cookies sur le site Crea'Soka",
};

export default function PolitiqueCookiesPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl md:text-4xl font-bold mb-8 text-center">
        Politique de Cookies
      </h1>

      <div className="max-w-3xl mx-auto prose dark:prose-invert">
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">
            1. Qu&apos;est-ce qu&apos;un cookie ?
          </h2>
          <p>
            Un cookie est un petit fichier texte déposé sur votre terminal
            (ordinateur, tablette ou téléphone mobile) lors de votre visite sur
            notre site. Il nous permet de collecter des informations relatives à
            votre navigation et de vous adresser des services adaptés à votre
            terminal.
          </p>
          <p className="mt-4">
            Les cookies sont gérés par votre navigateur internet et seul
            l&apos;émetteur d&apos;un cookie est susceptible de lire ou de modifier les
            informations qui y sont contenues.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">
            2. Les cookies que nous utilisons
          </h2>
          <p>
            Différents types de cookies sont utilisés sur notre site, ils ont
            des finalités différentes. Certains sont nécessaires à votre
            navigation sur le site.
          </p>

          <h3 className="text-xl font-medium mt-6 mb-3">
            2.1. Cookies strictement nécessaires au fonctionnement du site
          </h3>
          <p>
            Ces cookies permettent d&apos;utiliser les principales fonctionnalités du
            site (par exemple l&apos;accès à votre compte). Sans ces cookies, vous ne
            pourrez pas utiliser notre site normalement.
          </p>

          <h3 className="text-xl font-medium mt-6 mb-3">
            2.2. Cookies de mesure d&apos;audience
          </h3>
          <p>
            Ces cookies permettent d&apos;établir des statistiques de fréquentation
            de notre site et de détecter des problèmes de navigation afin de
            suivre et d&apos;améliorer la qualité de nos services.
          </p>

          <h3 className="text-xl font-medium mt-6 mb-3">
            2.3. Cookies fonctionnels
          </h3>
          <p>
            Ces cookies permettent de mémoriser vos préférences, vos choix afin
            de personnaliser votre expérience sur notre site.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">
            3. Gestion des cookies
          </h2>
          <p>
            Vous pouvez à tout moment exprimer et modifier vos souhaits en
            matière de cookies.
          </p>
          <p className="mt-4">
            La configuration de chaque navigateur est différente. Elle est
            décrite dans le menu d&apos;aide de votre navigateur, qui vous permettra
            de savoir de quelle manière modifier vos souhaits en matière de
            cookies.
          </p>

          <h3 className="text-xl font-medium mt-6 mb-3">Google Chrome</h3>
          <p>
            Menu → Paramètres → Afficher les paramètres avancés →
            Confidentialité → Paramètres de contenu → Cookies
          </p>

          <h3 className="text-xl font-medium mt-4 mb-3">Firefox</h3>
          <p>
            Menu → Options → Vie privée → Historique → Paramètres pour
            l&apos;historique → Cookies
          </p>

          <h3 className="text-xl font-medium mt-4 mb-3">Safari</h3>
          <p>Safari → Préférences → Confidentialité</p>

          <h3 className="text-xl font-medium mt-4 mb-3">Edge</h3>
          <p>Menu → Paramètres → Afficher les paramètres avancés → Cookies</p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">
            4. Durée de conservation des cookies
          </h2>
          <p>
            Les cookies sont conservés pour une durée maximale de 13 mois. À
            l&apos;expiration de ce délai, votre consentement sera à nouveau
            nécessaire.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">
            5. Mise à jour de la politique de cookies
          </h2>
          <p>
            Nous nous réservons le droit de modifier cette politique de cookies
            à tout moment. Nous vous encourageons à consulter régulièrement
            cette page pour prendre connaissance des modifications éventuelles.
          </p>
        </section>

        <p className="text-sm text-gray-500 mt-8">
          Date de dernière mise à jour :{" "}
          {new Date().toLocaleDateString("fr-FR")}
        </p>
      </div>
    </div>
  );
}
