"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import type { UserDto } from "@/lib/types/user";

type Props = {
  user?: Pick<UserDto, "id" | "username"> | null;
  className?: string;
  fallback?: string;
};

export function UserProfileLink({ user, className, fallback = "—" }: Props) {
  const label = user?.username ? `@${user.username}` : fallback;

  if (!user?.id) {
    return <span className={className}>{label}</span>;
  }

  return (
    <Link
      href={`/profile/${user.id}`}
      onClick={(e) => e.stopPropagation()}
      className={cn("hover:underline", className)}
    >
      {label}
    </Link>
  );
}
