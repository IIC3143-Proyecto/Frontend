import { Button } from "@/components/ui/button";
import {
  IconBookmark,
  IconX,
  IconCheck,
  IconCurrencyDollar,
  IconArrowBack,
} from "@tabler/icons-react";

export function SaveButton({ onClick }: { onClick?: () => void }) {
  return (
    <Button size="icon-lg" variant="outline" onClick={onClick}>
      <IconBookmark className="text-yellow-600" />
    </Button>
  );
}

export function IgnoreButton({ className, onClick }: { className?: string; onClick?: () => void }) {
  return (
    <Button size="icon-xl" variant="outline" className={className} onClick={onClick}>
      <IconX className="text-red-600" />
    </Button>
  );
}

export function LikeButton({ className, onClick }: { className?: string; onClick?: () => void }) {
  return (
    <Button size="icon-xl" variant="outline" className={className} onClick={onClick}>
      <IconCheck className="text-green-600" />
    </Button>
  );
}

export function OfferButton({ onClick }: { onClick?: () => void }) {
  return (
    <Button size="icon-lg" variant="outline" onClick={onClick}>
      <IconCurrencyDollar className="text-yellow-600" />
    </Button>
  );
}

export function RewindButton({ onClick, disabled, className }: { onClick?: () => void; disabled?: boolean; className?: string }) {
  return (
    <Button size="icon-lg" variant="outline" onClick={onClick} disabled={disabled} className={className}>
      <IconArrowBack className="text-blue-500" />
    </Button>
  );
}
