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
