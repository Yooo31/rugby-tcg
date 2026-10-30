import { fireEvent, render, screen } from "@testing-library/react";
import { useModalDialog } from "./use-modal-dialog";

function Modal({
  isOpen,
  onClose,
}: {
  readonly isOpen: boolean;
  readonly onClose: () => void;
}) {
  const dialogProps = useModalDialog(isOpen, onClose);
  return (
    <dialog {...dialogProps} aria-label="Fenêtre">
      <p>Contenu</p>
    </dialog>
  );
}

describe("useModalDialog", () => {
  it("ouvre et ferme la fenêtre selon l'état", () => {
    const onClose = vi.fn();
    const { rerender } = render(<Modal isOpen={false} onClose={onClose} />);
    const dialog = screen.getByRole("dialog", { hidden: true });
    expect(dialog).not.toHaveAttribute("open");
    rerender(<Modal isOpen onClose={onClose} />);
    expect(dialog).toHaveAttribute("open");
    rerender(<Modal isOpen={false} onClose={onClose} />);
    expect(dialog).not.toHaveAttribute("open");
  });

  it("appelle onClose sur un clic sur le fond, pas sur le contenu, et à la fermeture native (Échap)", () => {
    const onClose = vi.fn();
    render(<Modal isOpen onClose={onClose} />);
    const dialog = screen.getByRole("dialog");
    fireEvent.click(screen.getByText("Contenu"));
    expect(onClose).not.toHaveBeenCalled();
    fireEvent.click(dialog);
    expect(onClose).toHaveBeenCalledTimes(1);
    // Échap ferme le <dialog> natif, qui émet « close ».
    fireEvent(dialog, new Event("close"));
    expect(onClose).toHaveBeenCalledTimes(2);
  });
});
