import { Button } from "@/components/ui/button";
import {
  IconBookmark,
  IconX,
  IconCheck,
  IconCurrencyDollar,
} from "@tabler/icons-react";

export function SaveButton() {
  return (
    <Button size="icon-lg" variant="outline">
      <IconBookmark className="text-yellow-600" />
    </Button>
  );
}

export function IgnoreButton({ className }: { className: string }) {
  return (
    <Button size="icon-xl" variant="outline" className={className}>
      <IconX className="text-red-600" />
    </Button>
  );
}

export function LikeButton({ className }: { className: string }) {
  return (
    <Button size="icon-xl" variant="outline" className={className}>
      <IconCheck className="text-green-600" />
    </Button>
  );
}

export function OfferButton() {
  return (
    <Button size="icon-lg" variant="outline">
      <IconCurrencyDollar className="text-yellow-600" />
    </Button>
  );
}
