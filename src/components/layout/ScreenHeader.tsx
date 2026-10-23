import type { ReactNode } from "react";

interface ScreenHeaderProps {
  readonly eyebrow: string;
  readonly title: string;
  readonly children?: ReactNode;
}

/** En-tête commun des écrans : sur-titre, grand titre, contenu libre à droite. */
export function ScreenHeader({ eyebrow, title, children }: ScreenHeaderProps) {
  return (
    <header className="flex items-end justify-between gap-4">
      <div className="min-w-0">
        <p className="eyebrow text-pitch">{eyebrow}</p>
        <h1 className="mt-1 text-4xl font-extrabold sm:text-6xl">{title}</h1>
      </div>
      {children}
    </header>
  );
}
