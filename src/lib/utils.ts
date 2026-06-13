import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// NOTE: This function should be moved to its own utility file if this file gets too big
export function formatPriceCLP(amount: number): string {
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format a number with thousand separators (dots).
 * Removes all non-numeric characters and adds dots every 3 digits.
 * @example formatNumberWithSeparators('25000') => '25.000'
 * @example formatNumberWithSeparators('1234567') => '1.234.567'
 */
export function formatNumberWithSeparators(value: string | number): string {
  if (!value && value !== 0) return "";
  const numValue = String(value).replace(/\D/g, "");
  return numValue.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

export function formatRelativeDate(iso: string): string {
  const date = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60_000);
  const diffHours = Math.floor(diffMs / 3_600_000);
  const diffDays = Math.floor(diffMs / 86_400_000);

  if (diffMins < 1) return "Ahora";
  if (diffMins < 60) return `Hace ${diffMins} min`;
  if (diffHours < 24) return `Hace ${diffHours} h`;
  if (diffDays === 1) return "Ayer";
  if (diffDays < 7) return `Hace ${diffDays} días`;

  return date.toLocaleDateString("es-CL", { day: "numeric", month: "short" });
}
