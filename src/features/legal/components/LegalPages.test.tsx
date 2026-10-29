import { render, screen, within } from "@testing-library/react";
import { formatEuros } from "@/lib/money";
import { EDITOR } from "../lib/editor";
import { LegalNotice } from "./LegalNotice";
import { OddsPage } from "./OddsPage";
import { PrivacyPolicy } from "./PrivacyPolicy";
import { TermsOfSale } from "./TermsOfSale";
import { TermsOfUse } from "./TermsOfUse";

describe("pages légales", () => {
  it("affiche les probabilités du tirage, lues dans le code", () => {
    render(<OddsPage />);
    const legendary = screen.getByRole("row", { name: /Légendaire/ });
    expect(within(legendary).getByText(/^1\s?%$/)).toBeInTheDocument();
    expect(within(legendary).getByText(/^4,9\d*\s?%$/)).toBeInTheDocument();
    expect(screen.getByText(/une chance sur 100\s000/)).toBeInTheDocument();
  });

  it("identifie l'éditeur et le vendeur, sans mention à compléter hors médiateur", () => {
    const { unmount } = render(<LegalNotice />);
    expect(
      screen.getByText(new RegExp(`SIRET : ${EDITOR.siret}`)),
    ).toBeInTheDocument();
    expect(screen.queryByText(/À compléter/)).not.toBeInTheDocument();
    unmount();
    render(<PrivacyPolicy />);
    expect(screen.getByText(/pendant 2 ans/)).toBeInTheDocument();
    expect(screen.queryByText(/À compléter/)).not.toBeInTheDocument();
  });

  it("reprend les prix du jeu dans les conditions de vente", () => {
    const { container } = render(<TermsOfSale />);
    expect(container).toHaveTextContent(
      `un mois (30 jours) pour ${formatEuros(599).replace(/\s/g, " ")}`,
    );
    expect(container).toHaveTextContent(
      `200 lingots pour ${formatEuros(199).replace(/\s/g, " ")}`,
    );
    expect(screen.getAllByText(/À compléter/)).toHaveLength(1);
  });

  it("réserve le jeu aux 15 ans et plus", () => {
    render(<TermsOfUse />);
    expect(
      screen.getByText("Le jeu est réservé aux personnes de 15 ans et plus."),
    ).toBeInTheDocument();
  });
});
