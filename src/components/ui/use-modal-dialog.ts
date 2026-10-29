"use client";

import { useEffect, useRef, type MouseEvent } from "react";

/**
 * Fenêtre modale native (`<dialog>`) pilotée par un état React : ouverte
 * quand `isOpen` est vrai, fermée sinon. Échap et un clic sur le fond
 * appellent `onClose`. À étaler sur le `<dialog>` : `<dialog {...props}>`.
 */
export function useModalDialog(isOpen: boolean, onClose: () => void) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (isOpen && !dialog.open) dialog.showModal();
    if (!isOpen && dialog.open) dialog.close();
  }, [isOpen]);

  return {
    ref,
    onClose,
    onClick: (event: MouseEvent<HTMLDialogElement>) => {
      // Un clic sur le fond (le <dialog> lui-même) ferme la fenêtre.
      if (event.target === event.currentTarget) onClose();
    },
  };
}
