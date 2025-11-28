import { ConversationList } from '@/components/app/conversation/ConversationList';

/**
 * Page d'accueil - Home Page
 *
 * Simple orchestrateur qui compose le composant ConversationList.
 * Conformément aux principes agiles et Clean Architecture :
 * - La page ne contient PAS de logique UI directe
 * - Le rendu visuel est délégué aux composants réutilisables
 * - Cette page sert uniquement à orchestrer et composer les composants
 */
export default function Home() {
  return <ConversationList />;
}
