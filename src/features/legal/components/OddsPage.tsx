import {
  atLeastOnePerBooster,
  BOOSTER_SIZE,
  RARITIES,
  RARITY_ODDS,
  SPECIAL_CARD_ODDS,
  VIP_GUARANTEED_ODDS,
  VIP_SLOT_ODDS,
} from "@/domain";
import { LegalPage } from "./LegalPage";

const PERCENT = new Intl.NumberFormat("fr-FR", {
  style: "percent",
  maximumFractionDigits: 3,
});

/**
 * Probabilités publiques du tirage, lues dans le domaine : la page ne peut
 * pas annoncer autre chose que ce que le serveur tire.
 */
export function OddsPage() {
  return (
    <LegalPage title="Probabilités" updatedOn="29 octobre 2026">
      <section>
        <h2>Ce que contient un booster</h2>
        <p>
          Un booster contient {BOOSTER_SIZE} cartes de clubs, tous différents.
          La rareté de chaque carte est tirée au sort, indépendamment du club et
          des autres cartes : un club de Fédérale peut sortir en légendaire. Le
          tirage est fait par le serveur, avec un hasard cryptographique, et il
          est le même pour tous les joueurs ; seul le booster VIP a ses propres
          probabilités, ci-dessous.
        </p>
      </section>

      <section>
        <h2>Rareté de chaque carte</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-chalk-muted">
              <tr>
                <th scope="col" className="py-2 pr-3 font-medium">
                  Rareté
                </th>
                <th scope="col" className="py-2 pr-3 font-medium">
                  Par carte
                </th>
                <th scope="col" className="py-2 font-medium">
                  Au moins une par booster
                </th>
              </tr>
            </thead>
            <tbody>
              {RARITIES.map(({ id, label }) => (
                <tr key={id} className="border-line border-t">
                  <th scope="row" className="text-chalk py-2 pr-3 font-medium">
                    {label}
                  </th>
                  <td className="py-2 pr-3 tabular-nums">
                    {PERCENT.format(RARITY_ODDS[id])}
                  </td>
                  <td className="py-2 tabular-nums">
                    {PERCENT.format(atLeastOnePerBooster(RARITY_ODDS[id]))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2>Booster VIP</h2>
        <p>
          Réservé aux membres du pass VIP, un toutes les 48 heures. Toujours{" "}
          {BOOSTER_SIZE} clubs différents, mais aucune carte commune :
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-chalk-muted">
              <tr>
                <th scope="col" className="py-2 pr-3 font-medium">
                  Rareté
                </th>
                <th scope="col" className="py-2 pr-3 font-medium">
                  Première carte
                </th>
                <th scope="col" className="py-2 font-medium">
                  {BOOSTER_SIZE - 1} autres cartes
                </th>
              </tr>
            </thead>
            <tbody>
              {RARITIES.filter(({ id }) => id !== "common").map(
                ({ id, label }) => (
                  <tr key={id} className="border-line border-t">
                    <th
                      scope="row"
                      className="text-chalk py-2 pr-3 font-medium"
                    >
                      {label}
                    </th>
                    <td className="py-2 pr-3 tabular-nums">
                      {PERCENT.format(VIP_GUARANTEED_ODDS[id] ?? 0)}
                    </td>
                    <td className="py-2 tabular-nums">
                      {PERCENT.format(VIP_SLOT_ODDS[id] ?? 0)}
                    </td>
                  </tr>
                ),
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2>Carte spéciale</h2>
        <p>
          En plus de ses cartes, un booster peut contenir la carte spéciale
          Équipe de France, avec une chance sur{" "}
          {Math.round(1 / SPECIAL_CARD_ODDS).toLocaleString("fr-FR")} (
          {PERCENT.format(SPECIAL_CARD_ODDS)}) par booster.
        </p>
      </section>
    </LegalPage>
  );
}
