import type { ReactNode } from "react";

/** Mise en page commune des pages légales : titre, date, sections lisibles. */
export function LegalPage({
  title,
  updatedOn,
  children,
}: {
  readonly title: string;
  readonly updatedOn: string;
  readonly children: ReactNode;
}) {
  return (
    <article className="[&_h2]:text-chalk [&_p]:text-chalk-muted [&_ul]:text-chalk-muted flex flex-col gap-6 text-sm leading-relaxed text-pretty [&_h2]:mt-2 [&_h2]:text-2xl [&_h2]:font-bold [&_li]:ml-5 [&_li]:list-disc [&_ul]:flex [&_ul]:flex-col [&_ul]:gap-1">
      <header>
        <h1 className="text-4xl font-extrabold">{title}</h1>
        <p className="text-chalk-faint mt-1 text-xs">
          Dernière mise à jour : {updatedOn}
        </p>
      </header>
      {children}
    </article>
  );
}

/** Information que seul l'éditeur peut fournir, à remplir avant l'ouverture au public. */
export function ToComplete({ children }: { readonly children: ReactNode }) {
  return (
    <mark className="bg-gold/20 text-gold rounded px-1">
      [À compléter : {children}]
    </mark>
  );
}
