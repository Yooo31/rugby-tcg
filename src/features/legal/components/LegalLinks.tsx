import Link from "next/link";
import {
  LEGAL_NOTICE_PATH,
  ODDS_PATH,
  PRIVACY_PATH,
  TERMS_OF_SALE_PATH,
  TERMS_OF_USE_PATH,
} from "@/lib/supabase/routes";

const LEGAL_LINKS = [
  { href: TERMS_OF_USE_PATH, label: "CGU" },
  { href: TERMS_OF_SALE_PATH, label: "CGV" },
  { href: PRIVACY_PATH, label: "Confidentialité" },
  { href: ODDS_PATH, label: "Probabilités" },
  { href: LEGAL_NOTICE_PATH, label: "Mentions légales" },
] as const;

/** Liens vers toutes les pages légales, sur une ligne qui passe à la ligne. */
export function LegalLinks({ className }: { readonly className?: string }) {
  return (
    <nav aria-label="Informations légales" className={className}>
      <ul className="flex flex-wrap justify-center gap-x-3">
        {LEGAL_LINKS.map(({ href, label }) => (
          <li key={href}>
            <Link
              href={href}
              className="inline-flex min-h-11 items-center underline underline-offset-2"
            >
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
