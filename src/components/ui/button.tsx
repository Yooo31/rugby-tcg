import { cva, type VariantProps } from "class-variance-authority";
import Link from "next/link";
import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "font-display inline-flex min-h-12 items-center justify-center gap-2 rounded-control px-5 text-lg font-bold tracking-wide uppercase transition duration-200 ease-out-expo select-none active:scale-[0.97] disabled:pointer-events-none disabled:opacity-40",
  {
    variants: {
      variant: {
        primary: "bg-pitch text-night shadow-glow-pitch hover:bg-chalk",
        secondary:
          "border-line-strong bg-surface-raised text-chalk hover:bg-surface-hover border",
        ghost: "text-chalk-muted hover:text-chalk hover:bg-surface-raised",
      },
      size: {
        md: "",
        lg: "min-h-14 px-7 text-xl",
      },
      block: {
        true: "w-full",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

type ButtonStyleProps = VariantProps<typeof buttonVariants>;

export function Button({
  className,
  variant,
  size,
  block,
  ...props
}: ComponentProps<"button"> & ButtonStyleProps) {
  return (
    <button
      type="button"
      className={cn(buttonVariants({ variant, size, block }), className)}
      {...props}
    />
  );
}

/** Lien de navigation qui a l'apparence d'un bouton. */
export function ButtonLink({
  className,
  variant,
  size,
  block,
  ...props
}: ComponentProps<typeof Link> & ButtonStyleProps) {
  return (
    <Link
      className={cn(buttonVariants({ variant, size, block }), className)}
      {...props}
    />
  );
}
