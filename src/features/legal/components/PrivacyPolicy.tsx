import { INACTIVE_ACCOUNT_YEARS, MINIMUM_AGE } from "@/domain";
import { EDITOR } from "../lib/editor";
import { LegalPage } from "./LegalPage";

/** Politique de confidentialité (RGPD). */
export function PrivacyPolicy() {
  return (
    <LegalPage title="Confidentialité" updatedOn="29 octobre 2026">
      <section>
        <h2>Qui est responsable de vos données ?</h2>
        <p>
          {EDITOR.name}, {EDITOR.status}, {EDITOR.town}. Pour toute question ou
          demande : <a href={`mailto:${EDITOR.email}`}>{EDITOR.email}</a>.
        </p>
      </section>

      <section>
        <h2>Ce que nous gardons</h2>
        <ul>
          <li>
            Votre adresse e-mail et votre mot de passe (chiffré : nous ne le
            voyons jamais).
          </li>
          <li>
            Votre pseudo, affiché publiquement dans les classements. Votre
            adresse e-mail, jamais.
          </li>
          <li>
            Votre partie : cartes, lingots, boosters, missions, série de
            connexion, passe de saison, cosmétiques, pass VIP, récompenses, et
            l&apos;historique des boosters ouverts.
          </li>
          <li>
            Vos achats : contenu acheté, prix, date et référence du paiement.
            Vos coordonnées bancaires sont saisies chez notre prestataire de
            paiement et ne nous parviennent jamais.
          </li>
          <li>
            Votre parrain ou vos filleuls, si vous utilisez le parrainage.
          </li>
          <li>
            Si vous les acceptez, l&apos;adresse technique de notification de
            votre appareil.
          </li>
          <li>
            Les corrections faites par l&apos;équipe sur votre compte (geste
            commercial, réparation d&apos;un bug).
          </li>
        </ul>
      </section>

      <section>
        <h2>Pourquoi</h2>
        <ul>
          <li>
            Faire fonctionner le jeu, votre compte et vos achats (exécution du
            service que vous demandez).
          </li>
          <li>Afficher les classements, sous votre seul pseudo.</li>
          <li>
            Protéger le jeu contre la triche et les abus (limite du nombre
            d&apos;actions).
          </li>
          <li>
            Tenir notre comptabilité, pour les achats (obligation légale).
          </li>
          <li>
            Mesurer, en chiffres globaux, si le jeu plaît (nombre de joueurs qui
            reviennent).
          </li>
          <li>
            Vous prévenir quand vos boosters sont prêts, seulement si vous
            l&apos;avez accepté. Vous pouvez retirer cette autorisation à tout
            moment.
          </li>
        </ul>
        <p>
          Pas de publicité, pas de revente, pas de pistage : le seul cookie est
          celui qui garde votre session ouverte.
        </p>
      </section>

      <section>
        <h2>Qui les traite pour nous</h2>
        <ul>
          <li>
            Supabase Pte. Ltd. : base de données et comptes, sur des serveurs
            situés à Paris.
          </li>
          <li>
            Vercel Inc. (États-Unis) : hébergement du site. Les traitements côté
            serveur s&apos;exécutent à Paris ; les fichiers sans donnée
            personnelle (images, code du jeu) sont distribués par son réseau
            mondial.
          </li>
          <li>
            Stripe (Irlande) : paiements. Stripe reçoit vos coordonnées
            bancaires et votre adresse e-mail, et agit aussi en responsable de
            traitement pour la lutte contre la fraude (stripe.com/privacy).
          </li>
          <li>
            Sentry (Functional Software Inc.) : signalement des erreurs
            techniques, pour les corriger. Page concernée et message
            d&apos;erreur seulement, sans adresse e-mail, adresse IP ni cookie.
          </li>
          <li>
            Le service de notification de votre navigateur (Google, Apple ou
            Mozilla), qui ne reçoit que le contenu des notifications.
          </li>
        </ul>
        <p>
          Les transferts hors de l&apos;Union européenne (Vercel, Sentry) sont
          encadrés par les clauses contractuelles types de la Commission
          européenne.
        </p>
      </section>

      <section>
        <h2>Combien de temps</h2>
        <p>
          Nous gardons vos données tant que votre compte existe. Quand vous le
          supprimez, tout est effacé immédiatement. Un compte sans aucune
          activité pendant {INACTIVE_ACCOUNT_YEARS} ans est supprimé, avec tout
          son contenu.
        </p>
        <p>
          Seules les pièces comptables de vos achats (montant, date, référence)
          sont gardées dix ans, comme la loi l&apos;impose, chez notre
          prestataire de paiement et dans notre comptabilité.
        </p>
      </section>

      <section>
        <h2>Vos droits</h2>
        <p>
          Depuis la page Compte, vous pouvez à tout moment télécharger toutes
          vos données et supprimer votre compte. Pour les rectifier, vous
          opposer à un traitement ou en limiter l&apos;usage, écrivez-nous. Vous
          pouvez aussi saisir la CNIL (cnil.fr).
        </p>
        <p>
          Le jeu est réservé aux personnes de {MINIMUM_AGE} ans et plus : chaque
          joueur le confirme à son inscription.
        </p>
      </section>
    </LegalPage>
  );
}
