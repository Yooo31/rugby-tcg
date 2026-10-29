import Link from "next/link";
import { INACTIVE_ACCOUNT_YEARS, MINIMUM_AGE } from "@/domain";
import {
  ODDS_PATH,
  PRIVACY_PATH,
  TERMS_OF_SALE_PATH,
} from "@/lib/supabase/routes";
import { EDITOR } from "../lib/editor";
import { LegalPage } from "./LegalPage";

/** Conditions générales d'utilisation : les règles du compte et du jeu. */
export function TermsOfUse() {
  return (
    <LegalPage
      title="Conditions générales d'utilisation"
      updatedOn="29 octobre 2026"
    >
      <section>
        <h2>Le jeu</h2>
        <p>
          Rugby TCG, édité par {EDITOR.name}, est un jeu de cartes à
          collectionner sur les clubs de rugby français. Il est gratuit : on y
          ouvre des boosters, on collectionne des cartes, on complète des
          albums. Certains contenus sont payants ; leur achat suit les{" "}
          <Link href={TERMS_OF_SALE_PATH}>conditions générales de vente</Link>.
        </p>
        <p>
          En créant un compte, vous acceptez ces conditions. Nous pouvons les
          faire évoluer : la date de mise à jour figure en tête de page, et un
          changement important vous est annoncé dans le jeu.
        </p>
      </section>

      <section>
        <h2>Votre compte</h2>
        <ul>
          <li>
            Le jeu est réservé aux personnes de {MINIMUM_AGE} ans et plus.
          </li>
          <li>
            Un compte par personne. Il est personnel : vous gardez votre mot de
            passe pour vous et ne vendez ni ne prêtez votre compte.
          </li>
          <li>
            Votre pseudo est public. Il ne doit ni insulter, ni usurper
            l&apos;identité de quelqu&apos;un, ni faire de publicité ; nous
            pouvons le réinitialiser.
          </li>
          <li>
            Vous pouvez supprimer votre compte à tout moment depuis la page
            Compte. Un compte sans activité pendant {INACTIVE_ACCOUNT_YEARS} ans
            est supprimé (voir la{" "}
            <Link href={PRIVACY_PATH}>politique de confidentialité</Link>).
          </li>
        </ul>
      </section>

      <section>
        <h2>Cartes, lingots et contenus du jeu</h2>
        <ul>
          <li>
            Cartes, lingots, boosters et cosmétiques sont des contenus
            numériques du jeu : ils n&apos;ont aucune valeur en argent, ne se
            remboursent pas en euros et ne s&apos;échangent ni ne se vendent en
            dehors du jeu.
          </li>
          <li>
            La rareté d&apos;une carte est tirée au sort ; les probabilités sont
            publiées sur la page <Link href={ODDS_PATH}>Probabilités</Link>.
          </li>
          <li>
            Nous pouvons faire évoluer le jeu (équilibrage, nouvelles saisons,
            clubs d&apos;une nouvelle saison). Une carte obtenue reste dans
            votre collection.
          </li>
        </ul>
      </section>

      <section>
        <h2>Jouer loyalement</h2>
        <p>
          Sont interdits : la triche, l&apos;exploitation volontaire d&apos;un
          bug, les programmes qui jouent à votre place, la création de comptes
          pour profiter du parrainage, et toute tentative d&apos;atteinte au
          service. En cas de manquement, nous pouvons corriger le compte, le
          suspendre ou le supprimer, après vous avoir prévenu sauf urgence.
          Signaler un bug rend service : écrivez à{" "}
          <a href={`mailto:${EDITOR.email}`}>{EDITOR.email}</a>.
        </p>
      </section>

      <section>
        <h2>Disponibilité et responsabilité</h2>
        <p>
          Nous faisons de notre mieux pour que le jeu reste accessible, sans
          pouvoir le garantir à chaque instant (maintenance, panne d&apos;un
          prestataire). Rugby TCG est indépendant de la Fédération française de
          rugby, de la Ligue nationale de rugby et des clubs cités.
        </p>
      </section>

      <section>
        <h2>Droit applicable</h2>
        <p>
          Ces conditions sont soumises au droit français. En cas de désaccord,
          écrivez-nous d&apos;abord : nous cherchons une solution à
          l&apos;amiable.
        </p>
      </section>
    </LegalPage>
  );
}
