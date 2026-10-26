import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import * as actions from "../server/actions";
import { AdjustmentForm } from "./AdjustmentForm";
import { GiveawayForm } from "./GiveawayForm";

vi.mock("../server/actions", () => ({
  adjustPlayerAction: vi.fn(),
  createGiveawayAction: vi.fn(),
}));

const mocked = vi.mocked(actions);

describe("formulaires d'administration", () => {
  it("envoie une correction et affiche la confirmation", async () => {
    const user = userEvent.setup();
    mocked.adjustPlayerAction.mockResolvedValueOnce({
      success: "Correction enregistrée.",
    });
    render(<AdjustmentForm playerId="00000000-0000-0000-0000-000000000001" />);

    await user.type(screen.getByLabelText("Lingots (±)"), "50");
    await user.type(screen.getByLabelText("Raison"), "Geste commercial");
    await user.click(
      screen.getByRole("button", { name: "Appliquer la correction" }),
    );

    expect(await screen.findByRole("status")).toHaveTextContent(
      "Correction enregistrée.",
    );
    const formData = mocked.adjustPlayerAction.mock.calls[0][1];
    expect(formData.get("playerId")).toBe(
      "00000000-0000-0000-0000-000000000001",
    );
    expect(formData.get("ingotsDelta")).toBe("50");
  });

  it("montre l'erreur d'un champ et l'erreur générale", async () => {
    const user = userEvent.setup();
    mocked.adjustPlayerAction.mockResolvedValueOnce({
      error: "Cette correction rendrait un solde négatif.",
      fieldErrors: { reason: "Indiquez la raison." },
    });
    render(<AdjustmentForm playerId="00000000-0000-0000-0000-000000000001" />);
    // Le champ est obligatoire : sans lui, le navigateur bloque l'envoi.
    await user.type(screen.getByLabelText("Raison"), "x");
    await user.click(
      screen.getByRole("button", { name: "Appliquer la correction" }),
    );
    expect(await screen.findByRole("alert")).toHaveTextContent("solde négatif");
    expect(screen.getByText("Indiquez la raison.")).toBeInTheDocument();
  });

  it("programme un cadeau, sur la journée du jour par défaut", async () => {
    const user = userEvent.setup();
    mocked.createGiveawayAction.mockResolvedValueOnce({
      fieldErrors: { title: "Donnez un titre au cadeau." },
    });
    render(<GiveawayForm today="2026-10-23" />);
    expect(screen.getByLabelText("Premier jour")).toHaveValue("2026-10-23");
    expect(screen.getByLabelText("Dernier jour")).toHaveValue("2026-10-23");
    await user.type(screen.getByLabelText("Titre"), "Un");
    await user.click(
      screen.getByRole("button", { name: "Programmer le cadeau" }),
    );
    expect(
      await screen.findByText("Donnez un titre au cadeau."),
    ).toBeInTheDocument();
  });
});
