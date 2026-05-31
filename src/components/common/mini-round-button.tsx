import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export function MiniRoundButton({
  children,
  className,
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <Button
      variant="ghost"
      size="icon"
      className={cn(
        "h-8 w-8 rounded-full bg-popover shadow-sm active:scale-95 disabled:active:scale-100 cursor-pointer",
        className,
      )}
      {...rest}
    >
      {children}
    </Button>
  );
}
