import { EDITOR } from "../lib/editor";
import { LegalPage } from "./LegalPage";

/** Mentions légales (LCEN, article 6). */
export function LegalNotice() {
  return (
    <LegalPage title="Mentions légales" updatedOn="29 octobre 2026">
      <section>
        <h2>Éditeur</h2>
        <p>
          {EDITOR.name}, {EDITOR.status}
          <br />
          SIRET : {EDITOR.siret}
          <br />
          {EDITOR.town}
          <br />
          Contact : <a href={`mailto:${EDITOR.email}`}>{EDITOR.email}</a>
          <br />
          Directeur de la publication : {EDITOR.name}
        </p>
      </section>

      <section>
        <h2>Hébergement</h2>
        <p>
          Site : Vercel Inc., 440 N Barranca Avenue #4133, Covina, CA 91723,
          États-Unis (vercel.com, privacy@vercel.com). Les traitements côté
          serveur s&apos;exécutent à Paris.
          <br />
          Base de données et comptes : Supabase Pte. Ltd., Singapour
          (supabase.com, privacy@supabase.com), sur des serveurs situés à Paris
          (Amazon Web Services, région eu-west-3).
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
          et de Wikidata (CC0), relues à la main club par club. Les divisions
          régionales ne sont pas encore proposées.
        </p>
      </section>

      <section>
        <h2>Litiges</h2>
        <p>
          Le droit français s&apos;applique. Avant toute action, écrivez-nous :
          nous cherchons d&apos;abord une solution à l&apos;amiable. Les
          conditions de vente précisent le recours au médiateur de la
          consommation.
        </p>
      </section>
    </LegalPage>
  );
}
