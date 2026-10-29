import Link from "next/link";
import { INGOT_PACKS, VIP_OFFERS } from "@/domain";
import { formatEuros } from "@/lib/money";
import { ODDS_PATH, TERMS_OF_USE_PATH } from "@/lib/supabase/routes";
import { EDITOR } from "../lib/editor";
import { LegalPage, ToComplete } from "./LegalPage";

/** Conditions générales de vente : pass VIP et lingots. */
export function TermsOfSale() {
  return (
    <LegalPage
      title="Conditions générales de vente"
      updatedOn="29 octobre 2026"
    >
      <section>
        <h2>Le vendeur</h2>
        <p>
          {EDITOR.name}, {EDITOR.status}, SIRET {EDITOR.siret}, {EDITOR.town}.
          Contact : <a href={`mailto:${EDITOR.email}`}>{EDITOR.email}</a>.
        </p>
        <p>
          Ces conditions s&apos;appliquent aux achats faits dans Rugby TCG, en
          plus des{" "}
          <Link href={TERMS_OF_USE_PATH}>
            conditions générales d&apos;utilisation
          </Link>
          . Elles sont acceptées à chaque achat.
        </p>
      </section>

      <section>
        <h2>Ce qui est vendu</h2>
        <ul>
          <li>
            <strong>Le pass VIP</strong> :{" "}
            {VIP_OFFERS.map(
              (offer) =>
                `${offer.label.toLowerCase()} (${offer.days} jours) pour ${formatEuros(offer.priceCents)}`,
            ).join(", ")}
            . Il agrandit la réserve de boosters gratuits, ajoute un booster et
            des missions chaque jour, et un badge. Il ne se renouvelle pas tout
            seul : chaque période est achetée à part.
          </li>
          <li>
            <strong>Les paquets de lingots</strong> :{" "}
            {INGOT_PACKS.map(
              (pack) =>
                `${pack.ingots} lingots pour ${formatEuros(pack.priceCents)}`,
            ).join(", ")}
            . Les lingots s&apos;échangent dans le jeu contre des boosters et
            des cosmétiques.
          </li>
        </ul>
        <p>
          Un booster contient des cartes tirées au sort : les probabilités sont
          publiées sur la page <Link href={ODDS_PATH}>Probabilités</Link>.
          L&apos;achat ne garantit aucune carte en particulier.
        </p>
      </section>

      <section>
        <h2>Prix et paiement</h2>
        <p>
          Les prix sont indiqués en euros, toutes taxes comprises. TVA non
          applicable, article 293 B du Code général des impôts. Le paiement se
          fait par carte bancaire chez notre prestataire Stripe ; il est débité
          au moment de la commande.
        </p>
        <p>
          Un mineur doit avoir l&apos;accord de ses parents avant tout achat.
        </p>
      </section>

      <section>
        <h2>Livraison</h2>
        <p>
          Le contenu acheté arrive sur votre compte dès que le paiement est
          confirmé, en général en quelques secondes. S&apos;il n&apos;apparaît
          pas, écrivez-nous avec la référence du paiement : nous le créditons ou
          vous remboursons.
        </p>
      </section>

      <section>
        <h2>Droit de rétractation</h2>
        <p>
          Les lingots et le pass VIP sont des contenus numériques fournis
          immédiatement. En validant l&apos;achat, vous demandez qu&apos;ils
          soient fournis tout de suite et vous renoncez à votre droit de
          rétractation de quatorze jours (article L221-28 du Code de la
          consommation). Cette renonciation vous est demandée à chaque achat.
        </p>
      </section>

      <section>
        <h2>Fin du pass VIP</h2>
        <p>
          Le pass VIP prend fin à la date indiquée sur la page VIP. Ses
          avantages cessent alors ; les cartes, lingots et cosmétiques obtenus
          restent acquis. Un achat pendant un pass en cours le prolonge, sans
          perdre de jours.
        </p>
      </section>

      <section>
        <h2>Réclamations et médiation</h2>
        <p>
          Pour toute réclamation, écrivez à{" "}
          <a href={`mailto:${EDITOR.email}`}>{EDITOR.email}</a> : nous répondons
          sous quinze jours. Si le désaccord persiste, vous pouvez saisir
          gratuitement le médiateur de la consommation :{" "}
          <ToComplete>nom, site et adresse du médiateur choisi</ToComplete>. Le
          droit français s&apos;applique.
        </p>
      </section>
    </LegalPage>
  );
}
