import { productPrice, type Promotion, type PurchaseProduct } from "@/domain";
import { formatEuros } from "@/lib/money";
import { cn } from "@/lib/utils";

/**
 * Prix d'un produit. Pendant une promotion, le prix normal est barré : c'est
 * le plus bas des 30 derniers jours, puisque deux promotions sont toujours
 * séparées de 30 jours (art. L112-1-1 du Code de la consommation).
 */
export function PriceTag({
  product,
  promotion,
  className,
}: {
  readonly product: PurchaseProduct;
  readonly promotion: Pick<Promotion, "percentOff"> | null;
  readonly className?: string;
}) {
  const { priceCents, regularCents } = productPrice(product, promotion);
  if (priceCents === regularCents)
    return <span className={className}>{formatEuros(priceCents)}</span>;
  return (
    <span className={cn("inline-flex items-baseline gap-2", className)}>
      <s className="text-chalk-muted text-[0.7em] font-medium">
        <span className="sr-only">au lieu de </span>
        {formatEuros(regularCents)}
      </s>
      <span>{formatEuros(priceCents)}</span>
    </span>
  );
}
