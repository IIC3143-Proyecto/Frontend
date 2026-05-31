import { cn } from "@/lib/utils";

const VARIANTS = {
  action: "bg-primary text-primary-foreground border-primary",
  secondary: "bg-transparent text-secondary-foreground",
} as const;

type Variant = keyof typeof VARIANTS;

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
};

export function PillButton({
  variant = "action",
  className,
  children,
  ...rest
}: Props) {
  return (
    <button
      type="button"
      className={cn(
        "py-2 px-4 font-bold text-xs uppercase cursor-pointer rounded-full border-2 transition active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100",
        VARIANTS[variant],
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  );
}
