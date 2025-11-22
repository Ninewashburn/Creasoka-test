import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mentions Légales | Crea'Soka",
  description: "Mentions légales et conditions d'utilisation du site Crea'Soka",
};

export default function MentionsLegalesPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl md:text-4xl font-bold mb-8 text-center">
        Mentions Légales
      </h1>

      <div className="max-w-3xl mx-auto prose dark:prose-invert">
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">1. Édition du site</h2>
          <p>
            Le présent site, accessible à l&apos;URL <strong>www.creasoka.fr</strong>{" "}
            (le « Site »), est édité par :
          </p>
          <p>
            [Prénom Nom], résidant [adresse], de nationalité Française (France),
            né(e) le [date de naissance],
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">2. Hébergement</h2>
          <p>
            Le Site est hébergé par la société [Nom Hébergeur], immatriculée au
            RCS de [Ville] sous le numéro [numéro RCS], dont le siège social est
            situé [adresse hébergeur].
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">
            3. Directeur de publication
          </h2>
          <p>Le Directeur de la publication du Site est [Prénom Nom].</p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">4. Nous contacter</h2>
          <p>
            Par email :{" "}
            <a href="mailto:contact@creasoka.fr">contact@creasoka.fr</a>
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">
            5. Données personnelles
          </h2>
          <p>
            Les données à caractère personnel collectées par le Site sont les
            suivantes :
          </p>
          <ul>
            <li>Informations de connexion (adresse IP, horodatage)</li>
            <li>Données de contact (email) si fournies par l&apos;utilisateur</li>
          </ul>

          <p className="mt-4">
            Le responsable du traitement est : [Prénom Nom], joignable à
            l&apos;adresse email suivante :{" "}
            <a href="mailto:contact@creasoka.fr">contact@creasoka.fr</a>
          </p>

          <p className="mt-4">
            L&apos;utilisateur est informé qu&apos;il dispose d&apos;un droit d&apos;accès,
            d&apos;interrogation, de modification, d&apos;opposition et de rectification
            sur les données personnelles le concernant.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">
            6. Propriété intellectuelle
          </h2>
          <p>
            Tous les éléments de ce Site, y compris les textes, images,
            photographies, logos, marques, vidéos et architecture du Site, sont
            la propriété exclusive de Crea&apos;Soka ou de ses partenaires.
          </p>
          <p className="mt-4">
            Toute reproduction, représentation, modification, publication,
            transmission, dénaturation, totale ou partielle du Site ou de son
            contenu, par quelque procédé que ce soit, et sur quelque support que
            ce soit est interdite sans l&apos;autorisation écrite préalable de
            Crea&apos;Soka.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">7. Liens hypertextes</h2>
          <p>
            Le Site peut contenir des liens hypertextes vers d&apos;autres sites
            internet ou applications. Crea&apos;Soka n&apos;exerce aucun contrôle sur ces
            sites et applications et n&apos;assume aucune responsabilité quant à leur
            contenu.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">
            8. Loi applicable et juridiction
          </h2>
          <p>
            Les présentes mentions légales sont régies par la loi française. En
            cas de différend, les tribunaux français seront seuls compétents.
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
