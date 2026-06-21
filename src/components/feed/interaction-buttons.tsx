import { Button } from "@/components/ui/button";
import {
  IconBookmark,
  IconBookmarkFilled,
  IconX,
  IconCheck,
  IconCurrencyDollar,
} from "@tabler/icons-react";

export function SaveButton({ active, disabled, onClick }: { active: boolean; disabled?:boolean; onClick: () => void }) {
  const Icon = active ? IconBookmarkFilled : IconBookmark;

  return (
    <Button size="icon-lg" variant="outline" onClick={onClick} disabled={disabled}>
      <Icon className="text-yellow-600" />
    </Button>
  );
}

export function IgnoreButton({ className, onClick}: { className: string; onClick: () => void }) {
  return (
    <Button size="icon-xl" variant="outline" className={className} onClick={onClick}>
      <IconX className="text-red-600" />
    </Button>
  );
}

export function LikeButton({ className, onClick }: { className: string; onClick: () => void}) {
  return (
    <Button size="icon-xl" variant="outline" className={className} onClick={onClick}>
      <IconCheck className="text-green-600" />
    </Button>
  );
}

export function OfferButton({ onClick }: { onClick: () => void }) {
  return (
    <Button size="icon-lg" variant="outline" onClick={onClick}>
      <IconCurrencyDollar className="text-yellow-600" />
    </Button>
  );
}
