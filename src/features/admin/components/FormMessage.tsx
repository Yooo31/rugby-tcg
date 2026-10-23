import type { AdminFormState } from "../lib/schemas";

/** Erreur générale ou confirmation d'un formulaire d'administration. */
export function FormMessage({ state }: { readonly state: AdminFormState }) {
  if (state.error)
    return (
      <p role="alert" className="text-danger text-sm">
        {state.error}
      </p>
    );
  if (state.success)
    return (
      <p role="status" className="text-pitch text-sm">
        {state.success}
      </p>
    );
  return null;
}
