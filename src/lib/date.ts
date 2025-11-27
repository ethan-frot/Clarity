import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

/**
 * Formate une date en temps relatif en français
 *
 * @param date - Date à formatter
 * @returns Chaîne de caractères au format "il y a X minutes/heures/jours"
 *
 * @example
 * ```typescript
 * getRelativeTime(new Date(Date.now() - 5000))  // "il y a quelques secondes"
 * getRelativeTime(new Date(Date.now() - 3600000))  // "il y a environ 1 heure"
 * ```
 */
export function getRelativeTime(date: Date): string {
  return formatDistanceToNow(date, {
    addSuffix: true,
    locale: fr,
  });
}
