import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Classic shadcn-style className merger. Pass any mix of strings, objects,
 * or arrays; duplicates and conflicts get resolved sensibly by tailwind-merge.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
