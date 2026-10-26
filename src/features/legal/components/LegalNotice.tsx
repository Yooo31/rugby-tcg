import { LegalPage, ToComplete } from "./LegalPage";

/** Mentions légales (LCEN). Les mentions « À compléter » sont à remplir par l'éditeur. */
export function LegalNotice() {
  return (
    <LegalPage title="Mentions légales" updatedOn="23 octobre 2026">
      <section>
        <h2>Éditeur</h2>
        <p>
          <ToComplete>
            nom ou raison sociale, forme juridique, adresse, numéro SIREN
            s&apos;il y a lieu
          </ToComplete>
          <br />
          Contact : <ToComplete>adresse e-mail</ToComplete>
          <br />
          Directeur de la publication : <ToComplete>nom</ToComplete>
        </p>
      </section>

      <section>
        <h2>Hébergement</h2>
        <p>
          Site : Vercel Inc.{" "}
          <ToComplete>
            adresse et téléphone de Vercel (voir vercel.com/legal)
          </ToComplete>
          <br />
          Base de données et comptes : Supabase Inc.,{" "}
          <ToComplete>
            adresse de Supabase (voir supabase.com/privacy)
          </ToComplete>
        </p>
      </section>

      <section>
        <h2>Clubs, données et marques</h2>
        <p>
          Rugby TCG est un jeu indépendant, sans lien avec la Fédération
          française de rugby, la Ligue nationale de rugby ou les clubs cités.
          Les noms des clubs servent à les désigner ; leurs marques et logos
          appartiennent à leurs détenteurs et ne sont pas utilisés. Les blasons
          affichés sont générés par le jeu.
        </p>
        <p>
          Les données des clubs proviennent de Wikipédia (licence CC BY-SA 4.0)
          et de Wikidata (CC0). Les divisions régionales sont indicatives.
        </p>
      </section>
    </LegalPage>
  );
}
