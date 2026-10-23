import { useId, type ComponentProps } from "react";
import { cn } from "@/lib/utils";

interface TextFieldProps extends Omit<ComponentProps<"input">, "id"> {
  readonly label: string;
  readonly error?: string;
  /** Aide affichée sous le champ quand il n'y a pas d'erreur. */
  readonly hint?: string;
}

/** Champ de saisie avec son libellé, son aide et son message d'erreur reliés pour les lecteurs d'écran. */
export function TextField({
  label,
  error,
  hint,
  className,
  ...props
}: TextFieldProps) {
  const id = useId();
  const messageId = `${id}-message`;
  const message = error ?? hint;

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium">
        {label}
      </label>
      <input
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={message ? messageId : undefined}
        className={cn(
          "border-line-strong bg-night text-chalk placeholder:text-chalk-faint rounded-control min-h-12 border px-4 text-base transition",
          "focus-visible:border-pitch focus-visible:outline-none",
          error && "border-danger",
          className,
        )}
        {...props}
      />
      {message ? (
        <p
          id={messageId}
          className={cn("text-sm", error ? "text-danger" : "text-chalk-muted")}
        >
          {message}
        </p>
      ) : null}
    </div>
  );
}
