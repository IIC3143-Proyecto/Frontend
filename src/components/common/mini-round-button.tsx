import { cn } from "@/lib/utils";

export function MiniRoundButton({
  children,
  className,
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      className={cn(
        "flex items-center justify-center p-2 rounded-full border-0 bg-popover cursor-pointer shadow-sm transition active:scale-95",
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  );
}
