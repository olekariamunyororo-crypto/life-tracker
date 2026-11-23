import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

// shadcn/ui class merge helper
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// "vitamin_c" -> "Vitamin C", "creatine" -> "Creatine"
export function prettySupplementName(name: string): string {
  return name
    .replace(/_/g, " ")
    .split(" ")
    .map((word) => (word ? word[0].toUpperCase() + word.slice(1) : word))
    .join(" ");
}
