import { LegalPage, ToComplete } from "./LegalPage";

/** Politique de confidentialité (RGPD). Les mentions « À compléter » sont à remplir par l'éditeur. */
export function PrivacyPolicy() {
  return (
    <LegalPage title="Confidentialité" updatedOn="23 octobre 2026">
      <section>
        <h2>Qui est responsable de vos données ?</h2>
        <p>
          <ToComplete>
            nom ou raison sociale de l&apos;éditeur, adresse
          </ToComplete>
          . Pour toute question ou demande :{" "}
          <ToComplete>adresse e-mail de contact</ToComplete>.
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
            connexion, récompenses, et l&apos;historique des boosters ouverts.
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
            Faire fonctionner le jeu et votre compte (exécution du service que
            vous demandez).
          </li>
          <li>Afficher les classements, sous votre seul pseudo.</li>
          <li>
            Protéger le jeu contre la triche et les abus (limite du nombre
            d&apos;actions).
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
        <h2>Où et combien de temps</h2>
        <p>
          Les données sont hébergées par Supabase (base de données et comptes),
          région <ToComplete>région du projet Supabase</ToComplete>, et le site
          par <ToComplete>hébergeur du site</ToComplete>. Les notifications
          passent par le service de votre navigateur (Google, Apple ou Mozilla),
          qui ne reçoit que leur contenu. Les erreurs techniques du jeu sont
          signalées à Sentry (Functional Software Inc.) pour être corrigées :
          page concernée et message d&apos;erreur, sans adresse e-mail, adresse
          IP ni cookie.
        </p>
        <p>
          Nous gardons vos données tant que votre compte existe. Quand vous le
          supprimez, tout est effacé immédiatement.{" "}
          <ToComplete>
            durée après laquelle un compte inactif est supprimé
          </ToComplete>
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
          Le jeu s&apos;adresse aux personnes de 15 ans et plus ; en dessous,
          l&apos;accord d&apos;un parent est nécessaire.{" "}
          <ToComplete>à valider</ToComplete>
        </p>
      </section>
    </LegalPage>
  );
}
