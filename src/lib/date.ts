import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

/**
 * Formate une date en temps relatif en français
 * @returns Chaîne de caractères au format "il y a X minutes/heures/jours"
 */
export function getRelativeTime(date: Date): string {
  return formatDistanceToNow(date, {
    addSuffix: true,
    locale: fr,
  });
}

/**
 * Formate une date d'inscription en français (sans "il y a")
 * @returns Chaîne au format "depuis X jours/mois/années"
 */
export function formatMemberSince(date: Date): string {
  const distance = formatDistanceToNow(date, {
    addSuffix: false,
    locale: fr,
  });
  return `depuis ${distance}`;
}
