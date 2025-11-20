/**
 * Setup global pour les tests Jest
 *
 * Ce fichier est exécuté avant chaque fichier de test.
 * Utilisé pour configurer l'environnement de test global.
 */

// Désactiver les logs console pendant les tests (optionnel)
// global.console = {
//   ...console,
//   log: jest.fn(),
//   debug: jest.fn(),
//   info: jest.fn(),
//   warn: jest.fn(),
//   error: jest.fn(),
// };

// Configuration des timeouts pour les tests E2E (testcontainers)
jest.setTimeout(60000); // 60 secondes
