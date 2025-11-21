/**
 * Tests d'intégration : SignInUseCase + Repository (US-10)
 *
 * Ces tests vérifient l'intégration use case + repository
 * avec une vraie base de données PostgreSQL (testcontainers).
 *
 * Architecture testée :
 * - SignInUseCase (logique métier)
 * - SignInPrismaRepository (accès données)
 * - Base PostgreSQL réelle (testcontainer)
 *
 * Scénarios testés (conformément aux specs) :
 * ✅ Connexion réussie avec credentials valides
 * ✅ Rejection si email inexistant (401)
 * ✅ Rejection si mot de passe incorrect (401)
 * ✅ Rejection si email vide (400)
 * ✅ Rejection si password vide (400)
 */

import { PostgreSqlContainer, StartedPostgreSqlContainer } from '@testcontainers/postgresql';
import { PrismaClient } from '@/generated/prisma';
import { SignInUseCase } from '../SignInUseCase';
import { SignInPrismaRepository } from '../SignInPrismaRepository';
import { hashPassword } from '@/lib/password';

// ==================== SETUP ====================

let container: StartedPostgreSqlContainer;
let prisma: PrismaClient;
let useCase: SignInUseCase;
let repository: SignInPrismaRepository;

beforeAll(async () => {
  // Démarrer le container PostgreSQL
  container = await new PostgreSqlContainer('postgres:16-alpine')
    .withDatabase('test_forum')
    .withUsername('test')
    .withPassword('test')
    .start();

  // Configurer Prisma avec la base de test
  process.env.DATABASE_URL = container.getConnectionUri();

  // Créer une instance Prisma pour les tests
  prisma = new PrismaClient({
    datasources: {
      db: {
        url: container.getConnectionUri(),
      },
    },
  });

  // Pousser le schéma vers la base de test
  const { execSync } = require('child_process');
  execSync('npx prisma db push --skip-generate', {
    stdio: 'inherit',
    env: { ...process.env, DATABASE_URL: container.getConnectionUri() }
  });

  // Initialiser le repository et use case avec le Prisma de test
  repository = new SignInPrismaRepository(prisma);
  useCase = new SignInUseCase(repository);
}, 60000); // Timeout 60s pour le démarrage du container

afterAll(async () => {
  await prisma.$disconnect();
  await container.stop();
});

beforeEach(async () => {
  // Nettoyer la base avant chaque test
  await prisma.user.deleteMany();
});

// ==================== TESTS ====================

describe('SignIn Integration (E2E - US-10)', () => {
  // ==================== SCÉNARIO 1 : Connexion réussie ====================
  it('devrait authentifier un utilisateur avec des credentials valides', async () => {
    // Étant donné - Créer un utilisateur en base avec mot de passe haché
    const hashedPassword = await hashPassword('SecureP@ss123');
    await prisma.user.create({
      data: {
        email: 'alice@example.com',
        password: hashedPassword,
        name: 'Alice Dupont',
      },
    });

    const command = {
      email: 'alice@example.com',
      password: 'SecureP@ss123',
    };

    // Quand
    const result = await useCase.execute(command);

    // Alors
    expect(result).toBeDefined();
    expect(result.userId).toBeDefined();
    expect(result.email).toBe('alice@example.com');
    expect(result.name).toBe('Alice Dupont');

    // Vérifier que le mot de passe n'est PAS retourné
    expect(result).not.toHaveProperty('password');
  });

  // ==================== SCÉNARIO 2 : Connexion échouée - email inexistant ====================
  it('devrait rejeter un email qui n\'existe pas en base', async () => {
    // Étant donné - Aucun utilisateur en base

    const command = {
      email: 'unknown@example.com',
      password: 'SomePassword123!',
    };

    // Quand / Alors
    await expect(useCase.execute(command)).rejects.toThrow(
      'Email ou mot de passe incorrect'
    );
  });

  // ==================== SCÉNARIO 3 : Connexion échouée - mot de passe incorrect ====================
  it('devrait rejeter un mot de passe incorrect', async () => {
    // Étant donné - Créer un utilisateur avec un mot de passe différent
    const hashedPassword = await hashPassword('CorrectPassword123!');
    await prisma.user.create({
      data: {
        email: 'alice@example.com',
        password: hashedPassword,
      },
    });

    const command = {
      email: 'alice@example.com',
      password: 'WrongPassword123!',
    };

    // Quand / Alors
    await expect(useCase.execute(command)).rejects.toThrow(
      'Email ou mot de passe incorrect'
    );
  });

  // ==================== SCÉNARIO 4 : Validation - email vide ====================
  it('devrait rejeter un email vide', async () => {
    // Étant donné
    const command = {
      email: '',
      password: 'SecureP@ss123',
    };

    // Quand / Alors
    await expect(useCase.execute(command)).rejects.toThrow('email');
  });

  // ==================== SCÉNARIO 5 : Validation - password vide ====================
  it('devrait rejeter un mot de passe vide', async () => {
    // Étant donné
    const command = {
      email: 'alice@example.com',
      password: '',
    };

    // Quand / Alors
    await expect(useCase.execute(command)).rejects.toThrow('mot de passe');
  });

  // ==================== SCÉNARIO 6 : Connexion réussie sans nom ====================
  it('devrait authentifier un utilisateur sans nom (name null)', async () => {
    // Étant donné - Créer un utilisateur sans nom
    const hashedPassword = await hashPassword('SecureP@ss123');
    await prisma.user.create({
      data: {
        email: 'bob@example.com',
        password: hashedPassword,
        name: null, // Pas de nom
      },
    });

    const command = {
      email: 'bob@example.com',
      password: 'SecureP@ss123',
    };

    // Quand
    const result = await useCase.execute(command);

    // Alors
    expect(result).toBeDefined();
    expect(result.email).toBe('bob@example.com');
    expect(result.name).toBeUndefined(); // undefined dans le résultat
  });

  // ==================== SCÉNARIO 7 : Sécurité - message d'erreur identique ====================
  it('devrait retourner le même message d\'erreur pour email inexistant et password incorrect', async () => {
    // Étant donné - Créer un utilisateur
    const hashedPassword = await hashPassword('CorrectPassword123!');
    await prisma.user.create({
      data: {
        email: 'alice@example.com',
        password: hashedPassword,
      },
    });

    // Quand - Tester avec email inexistant
    let errorMessage1 = '';
    try {
      await useCase.execute({
        email: 'unknown@example.com',
        password: 'AnyPassword123!',
      });
    } catch (error) {
      errorMessage1 = (error as Error).message;
    }

    // Quand - Tester avec password incorrect
    let errorMessage2 = '';
    try {
      await useCase.execute({
        email: 'alice@example.com',
        password: 'WrongPassword123!',
      });
    } catch (error) {
      errorMessage2 = (error as Error).message;
    }

    // Alors - Les messages doivent être identiques (sécurité)
    expect(errorMessage1).toBe(errorMessage2);
    expect(errorMessage1).toBe('Email ou mot de passe incorrect');
  });
});
