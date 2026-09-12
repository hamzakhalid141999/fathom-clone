import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** True while the user has text selected, so click-to-seek doesn't fight selecting quotes. */
export function hasTextSelection() {
  if (typeof window === "undefined") return false;
  return Boolean(window.getSelection()?.toString());
}
