import { cn } from "@/lib/utils";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import type { Icon } from "@tabler/icons-react";

type LinkIconButtonProps = {
    href: string;
    icon: Icon;
    label?: string;
    highlighted?: boolean;
};

export function LinkIconButton({ href, icon: Icon, label, highlighted} : LinkIconButtonProps) {
    return (
        <Button asChild type="button" variant="icon" size="icon" className={cn(highlighted && "bg-muted hover:bg-muted")}>
            <Link href={href} aria-label={label}>
                <Icon/>
            </Link>
        </Button> 
    )
}