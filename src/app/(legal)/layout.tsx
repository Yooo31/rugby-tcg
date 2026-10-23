import Link from "next/link";

/** Pages légales : lisibles avec ou sans compte. */
export default function LegalLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-2xl flex-col gap-8 px-4 py-10">
      <Link
        href="/"
        className="font-display flex items-center gap-2 text-2xl font-extrabold tracking-wide uppercase"
      >
        <span
          aria-hidden
          className="bg-pitch h-5 w-3 -skew-x-12 rounded-[3px]"
        />
        Rugby <span className="text-pitch">TCG</span>
      </Link>
      <main className="panel p-6">{children}</main>
    </div>
  );
}
