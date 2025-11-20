import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

export function getRelativeTime(date: Date): string {
  return formatDistanceToNow(date, {
    addSuffix: true,
    locale: fr,
  });
}
