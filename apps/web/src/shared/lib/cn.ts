import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

// The Tailwind class helper:
//   clsx       -> joins class names and skips falsy ones:  cn("p-2", isOn && "bg-red-500")
//   twMerge    -> resolves CONFLICTS, the LAST one wins:   cn("p-2", "p-4")  ->  "p-4"  (plain concatenation would keep both)
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
