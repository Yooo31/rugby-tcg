import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import type { CollectionFilters as Filters } from "../lib/filterCollection";
import { CollectionFilters } from "./CollectionFilters";

const INITIAL: Filters = { rarity: null, division: null, sort: "recent" };

function Harness({
  onChange,
}: {
  readonly onChange: (filters: Filters) => void;
}) {
  const [filters, setFilters] = useState(INITIAL);
  return (
    <CollectionFilters
      filters={filters}
      resultCount={12}
      onChange={(next) => {
        setFilters(next);
        onChange(next);
      }}
    />
  );
}

describe("CollectionFilters", () => {
  it("filtre par rareté et par division, puis retire un filtre actif", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Harness onChange={onChange} />);
    expect(screen.getByText("12 cartes")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /Filtres/ }));
    const sheet = screen.getByRole("dialog", { name: "Filtrer la collection" });
    await user.click(within(sheet).getByRole("button", { name: /Rare/ }));
    await user.click(within(sheet).getByRole("button", { name: "Top 14" }));
    expect(onChange).toHaveBeenLastCalledWith({
      rarity: "rare",
      division: "top14",
      sort: "recent",
    });

    // Un second appui désélectionne.
    await user.click(within(sheet).getByRole("button", { name: "Top 14" }));
    expect(onChange).toHaveBeenLastCalledWith({
      rarity: "rare",
      division: null,
      sort: "recent",
    });
  });

  it("change le tri", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Harness onChange={onChange} />);
    await user.selectOptions(screen.getByRole("combobox"), "power");
    expect(onChange).toHaveBeenLastCalledWith({ ...INITIAL, sort: "power" });
  });
});
