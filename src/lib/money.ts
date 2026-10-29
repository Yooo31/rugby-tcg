/** Montant en euros, à la française (« 5,99 € »), depuis des centimes. */
export function formatEuros(cents: number): string {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
  }).format(cents / 100);
}
