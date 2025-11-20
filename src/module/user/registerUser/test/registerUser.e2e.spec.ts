/**
 * Tests d'intégration : RegisterUserUseCase + Repository (US-9)
 *
 * Ces tests vérifient l'intégration use case + repository
 * avec une vraie base de données PostgreSQL (testcontainers).
 *
 * Architecture testée :
 * - RegisterUserUseCase (logique métier)
 * - RegisterUserPrismaRepository (accès données)
 * - Base PostgreSQL réelle (testcontainer)
 *
 * Scénarios testés (conformément aux specs) :
 * ✅ Inscription réussie avec nom
 * ✅ Inscription réussie sans nom
 * ✅ Rejection si email existe déjà (409)
 * ✅ Rejection si email invalide (400)
 * ✅ Rejection si mot de passe invalide (400)
 * ✅ Rejection si champs manquants (400)
 */

import { PostgreSqlContainer, StartedPostgreSqlContainer } from '@testcontainers/postgresql';
import { PrismaClient } from '@/generated/prisma';
import { RegisterUserUseCase } from '../RegisterUserUseCase';
import { RegisterUserPrismaRepository } from '../RegisterUserPrismaRepository';
import { verifyPassword } from '@/lib/password';

// ==================== SETUP ====================

let container: StartedPostgreSqlContainer;
let prisma: PrismaClient;
let useCase: RegisterUserUseCase;
let repository: RegisterUserPrismaRepository;

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
  repository = new RegisterUserPrismaRepository(prisma);
  useCase = new RegisterUserUseCase(repository);
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

describe('RegisterUser Integration (E2E - US-9)', () => {
  // ==================== SCÉNARIO 1 : Inscription réussie avec nom ====================
  it('devrait créer un utilisateur en base de données (avec nom)', async () => {
    // Étant donné
    const command = {
      email: 'alice@example.com',
      password: 'SecureP@ss123',
      name: 'Alice Dupont',
    };

    // Quand
    const result = await useCase.execute(command);

    // Alors
    expect(result.userId).toBeDefined();
    expect(result.email).toBe('alice@example.com');
    expect(result.name).toBe('Alice Dupont');

    // Vérifier en base de données
    const user = await prisma.user.findUnique({
      where: { email: 'alice@example.com' },
    });

    expect(user).not.toBeNull();
    expect(user!.email).toBe('alice@example.com');
    expect(user!.name).toBe('Alice Dupont');

    // Vérifier que le mot de passe est bien haché
    expect(user!.password).not.toBe('SecureP@ss123');
    expect(user!.password.startsWith('$2')).toBe(true); // Format bcrypt

    // Vérifier que le hash correspond au mot de passe
    const isPasswordValid = await verifyPassword('SecureP@ss123', user!.password);
    expect(isPasswordValid).toBe(true);
  });

  // ==================== SCÉNARIO 2 : Inscription réussie sans nom ====================
  it('devrait créer un utilisateur en base de données (sans nom)', async () => {
    // Étant donné
    const command = {
      email: 'bob@example.com',
      password: 'MyP@ssw0rd',
    };

    // Quand
    const result = await useCase.execute(command);

    // Alors
    expect(result.userId).toBeDefined();
    expect(result.email).toBe('bob@example.com');
    expect(result.name).toBeUndefined(); // undefined dans le use case result

    // Vérifier en base de données
    const user = await prisma.user.findUnique({
      where: { email: 'bob@example.com' },
    });

    expect(user).not.toBeNull();
    expect(user!.name).toBeNull(); // null dans la DB
  });

  // ==================== SCÉNARIO 3 : Inscription échouée - email déjà utilisé ====================
  it('devrait rejeter si email existe déjà', async () => {
    // Étant donné - Créer un utilisateur existant
    await prisma.user.create({
      data: {
        email: 'existing@example.com',
        password: 'hashedPassword123',
      },
    });

    const command = {
      email: 'existing@example.com',
      password: 'SecureP@ss123',
    };

    // Quand / Alors
    await expect(useCase.execute(command)).rejects.toThrow('déjà utilisé');
  });

  // ==================== SCÉNARIO 4 : Inscription échouée - email invalide ====================
  it('devrait rejeter un email invalide', async () => {
    // Étant donné
    const command = {
      email: 'invalid-email',
      password: 'SecureP@ss123',
    };

    // Quand / Alors
    await expect(useCase.execute(command)).rejects.toThrow('email');
  });

  // ==================== SCÉNARIO 5 : Inscription échouée - mot de passe trop court ====================
  it('devrait rejeter un mot de passe trop court', async () => {
    // Étant donné
    const command = {
      email: 'test@example.com',
      password: 'Short1!',
    };

    // Quand / Alors
    await expect(useCase.execute(command)).rejects.toThrow('8 caractères');
  });

  // ==================== SCÉNARIO 6 : Inscription échouée - mot de passe sans majuscule ====================
  it('devrait rejeter un mot de passe sans majuscule', async () => {
    // Étant donné
    const command = {
      email: 'test@example.com',
      password: 'password123!',
    };

    // Quand / Alors
    await expect(useCase.execute(command)).rejects.toThrow('majuscule');
  });

  // ==================== SCÉNARIO 7 : Inscription échouée - mot de passe sans chiffre ====================
  it('devrait rejeter un mot de passe sans chiffre', async () => {
    // Étant donné
    const command = {
      email: 'test@example.com',
      password: 'Password!',
    };

    // Quand / Alors
    await expect(useCase.execute(command)).rejects.toThrow('chiffre');
  });

  // ==================== SCÉNARIO 8 : Inscription échouée - mot de passe sans caractère spécial ====================
  it('devrait rejeter un mot de passe sans caractère spécial', async () => {
    // Étant donné
    const command = {
      email: 'test@example.com',
      password: 'Password123',
    };

    // Quand / Alors
    await expect(useCase.execute(command)).rejects.toThrow('caractère spécial');
  });

  // ==================== SCÉNARIO 9 : Inscription échouée - champs manquants ====================
  it('devrait rejeter si email manquant', async () => {
    // Étant donné
    const command = {
      email: '',
      password: 'SecureP@ss123',
    };

    // Quand / Alors
    await expect(useCase.execute(command)).rejects.toThrow('email');
  });

  it('devrait rejeter si mot de passe manquant', async () => {
    // Étant donné
    const command = {
      email: 'test@example.com',
      password: '',
    };

    // Quand / Alors
    await expect(useCase.execute(command)).rejects.toThrow('mot de passe');
  });
});
