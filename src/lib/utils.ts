import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Smoothly scrolls to the top of the page
 * Useful for form step navigation to ensure users see the new content
 */
export function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}
