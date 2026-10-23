import { BOOSTER_SIZE } from "@/domain";
import { cn } from "@/lib/utils";
import styles from "./BoosterPack.module.css";

interface BoosterPackProps {
  /** Sachet grisé : plus de booster disponible. */
  readonly spent?: boolean;
  readonly className?: string;
}

export function BoosterPack({ spent = false, className }: BoosterPackProps) {
  return (
    <div
      className={cn(styles.pack, spent && styles.spent, className)}
      aria-hidden
    >
      <div className={styles.foil}>
        <span className={styles.ball} />
        <span className={styles.title}>
          Rugby
          <br />
          TCG
        </span>
        <span className={styles.caption}>{BOOSTER_SIZE} cartes</span>
      </div>
    </div>
  );
}
