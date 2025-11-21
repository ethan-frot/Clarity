/**
 * Ces tests vérifient l'intégration use case + repository
 * avec une vraie base de données PostgreSQL (testcontainers).
 *
 * Architecture testée :
 * - SignOutUseCase (logique métier)
 * - SignOutPrismaRepository (accès données)
 * - Base PostgreSQL réelle (testcontainer)
 *
 * Scénarios testés (conformément aux specs) :
 * ✅ Déconnexion réussie avec sessions actives
 * ✅ Déconnexion réussie sans sessions actives
 * ✅ Déconnexion réussie avec sessions déjà révoquées (ne les compte pas)
 * ✅ Déconnexion révoque uniquement les sessions de l'utilisateur concerné
 */

import {
  PostgreSqlContainer,
  StartedPostgreSqlContainer,
} from "@testcontainers/postgresql";
import { PrismaClient } from "@/generated/prisma";
import { SignOutUseCase } from "../SignOutUseCase";
import { SignOutPrismaRepository } from "../SignOutPrismaRepository";
import { hashPassword } from "@/lib/password";

// ==================== SETUP ====================

let container: StartedPostgreSqlContainer;
let prisma: PrismaClient;
let useCase: SignOutUseCase;
let repository: SignOutPrismaRepository;

beforeAll(async () => {
  // Démarrer le container PostgreSQL
  container = await new PostgreSqlContainer("postgres:16-alpine")
    .withDatabase("test_forum")
    .withUsername("test")
    .withPassword("test")
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
  const { execSync } = require("child_process");
  execSync("npx prisma db push --skip-generate", {
    stdio: "inherit",
    env: { ...process.env, DATABASE_URL: container.getConnectionUri() },
  });

  // Initialiser le repository et use case avec le Prisma de test
  repository = new SignOutPrismaRepository(prisma);
  useCase = new SignOutUseCase(repository);
}, 60000); // Timeout 60s pour le démarrage du container

afterAll(async () => {
  await prisma.$disconnect();
  await container.stop();
});

beforeEach(async () => {
  // Nettoyer la base avant chaque test
  await prisma.session.deleteMany();
  await prisma.user.deleteMany();
});

// ==================== TESTS ====================

describe("SignOut Integration (E2E - US-11)", () => {
  // ==================== SCÉNARIO 1 : Déconnexion réussie avec sessions actives ====================
  it("devrait révoquer toutes les sessions actives de l'utilisateur", async () => {
    // Étant donné - Créer un utilisateur avec 3 sessions actives
    const hashedPassword = await hashPassword("SecureP@ss123");
    const user = await prisma.user.create({
      data: {
        email: "alice@example.com",
        password: hashedPassword,
        name: "Alice Dupont",
      },
    });

    // Créer 3 sessions actives
    await prisma.session.createMany({
      data: [
        {
          userId: user.id,
          accessToken: "access-token-1",
          refreshToken: "refresh-token-1",
          expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes
        },
        {
          userId: user.id,
          accessToken: "access-token-2",
          refreshToken: "refresh-token-2",
          expiresAt: new Date(Date.now() + 5 * 60 * 1000),
        },
        {
          userId: user.id,
          accessToken: "access-token-3",
          refreshToken: "refresh-token-3",
          expiresAt: new Date(Date.now() + 5 * 60 * 1000),
        },
      ],
    });

    // Quand
    const result = await useCase.execute({
      userId: user.id,
    });

    // Alors
    expect(result).toBeDefined();
    expect(result.success).toBe(true);
    expect(result.revokedSessions).toBe(3);

    // Vérifier en base que toutes les sessions sont révoquées
    const sessions = await prisma.session.findMany({
      where: { userId: user.id },
    });

    expect(sessions).toHaveLength(3);
    sessions.forEach((session) => {
      expect(session.revokedAt).not.toBeNull();
      expect(session.revokedAt).toBeInstanceOf(Date);
    });
  });

  // ==================== SCÉNARIO 2 : Déconnexion réussie sans sessions actives ====================
  it("devrait retourner succès même si l'utilisateur n'a pas de sessions", async () => {
    // Étant donné - Créer un utilisateur sans sessions
    const hashedPassword = await hashPassword("SecureP@ss123");
    const user = await prisma.user.create({
      data: {
        email: "bob@example.com",
        password: hashedPassword,
        name: "Bob Martin",
      },
    });

    // Quand
    const result = await useCase.execute({
      userId: user.id,
    });

    // Alors
    expect(result).toBeDefined();
    expect(result.success).toBe(true);
    expect(result.revokedSessions).toBe(0); // Aucune session révoquée
  });

  // ==================== SCÉNARIO 3 : Ne révoque pas les sessions déjà révoquées ====================
  it("devrait ne pas compter les sessions déjà révoquées", async () => {
    // Étant donné - Créer un utilisateur avec 2 sessions actives et 1 déjà révoquée
    const hashedPassword = await hashPassword("SecureP@ss123");
    const user = await prisma.user.create({
      data: {
        email: "charlie@example.com",
        password: hashedPassword,
        name: "Charlie Brown",
      },
    });

    await prisma.session.createMany({
      data: [
        {
          userId: user.id,
          accessToken: "access-token-active-1",
          refreshToken: "refresh-token-active-1",
          expiresAt: new Date(Date.now() + 5 * 60 * 1000),
          revokedAt: null, // Active
        },
        {
          userId: user.id,
          accessToken: "access-token-active-2",
          refreshToken: "refresh-token-active-2",
          expiresAt: new Date(Date.now() + 5 * 60 * 1000),
          revokedAt: null, // Active
        },
        {
          userId: user.id,
          accessToken: "access-token-revoked",
          refreshToken: "refresh-token-revoked",
          expiresAt: new Date(Date.now() + 5 * 60 * 1000),
          revokedAt: new Date(Date.now() - 10000), // Déjà révoquée il y a 10s
        },
      ],
    });

    // Quand
    const result = await useCase.execute({
      userId: user.id,
    });

    // Alors
    expect(result).toBeDefined();
    expect(result.success).toBe(true);
    expect(result.revokedSessions).toBe(2); // Seulement les 2 actives

    // Vérifier que toutes les sessions sont maintenant révoquées
    const sessions = await prisma.session.findMany({
      where: { userId: user.id },
    });

    expect(sessions).toHaveLength(3);
    sessions.forEach((session) => {
      expect(session.revokedAt).not.toBeNull();
    });
  });

  // ==================== SCÉNARIO 4 : Révoque uniquement les sessions de l'utilisateur concerné ====================
  it("devrait révoquer uniquement les sessions de l'utilisateur spécifié", async () => {
    // Étant donné - Créer 2 utilisateurs avec des sessions
    const hashedPassword = await hashPassword("SecureP@ss123");

    const alice = await prisma.user.create({
      data: {
        email: "alice@example.com",
        password: hashedPassword,
        name: "Alice",
      },
    });

    const bob = await prisma.user.create({
      data: {
        email: "bob@example.com",
        password: hashedPassword,
        name: "Bob",
      },
    });

    // Créer 2 sessions pour Alice et 2 pour Bob
    await prisma.session.createMany({
      data: [
        {
          userId: alice.id,
          accessToken: "alice-access-1",
          refreshToken: "alice-refresh-1",
          expiresAt: new Date(Date.now() + 5 * 60 * 1000),
        },
        {
          userId: alice.id,
          accessToken: "alice-access-2",
          refreshToken: "alice-refresh-2",
          expiresAt: new Date(Date.now() + 5 * 60 * 1000),
        },
        {
          userId: bob.id,
          accessToken: "bob-access-1",
          refreshToken: "bob-refresh-1",
          expiresAt: new Date(Date.now() + 5 * 60 * 1000),
        },
        {
          userId: bob.id,
          accessToken: "bob-access-2",
          refreshToken: "bob-refresh-2",
          expiresAt: new Date(Date.now() + 5 * 60 * 1000),
        },
      ],
    });

    // Quand - Alice se déconnecte
    const result = await useCase.execute({
      userId: alice.id,
    });

    // Alors
    expect(result.success).toBe(true);
    expect(result.revokedSessions).toBe(2); // 2 sessions d'Alice révoquées

    // Vérifier que seules les sessions d'Alice sont révoquées
    const aliceSessions = await prisma.session.findMany({
      where: { userId: alice.id },
    });
    expect(aliceSessions).toHaveLength(2);
    aliceSessions.forEach((session) => {
      expect(session.revokedAt).not.toBeNull();
    });

    // Vérifier que les sessions de Bob sont toujours actives
    const bobSessions = await prisma.session.findMany({
      where: { userId: bob.id },
    });
    expect(bobSessions).toHaveLength(2);
    bobSessions.forEach((session) => {
      expect(session.revokedAt).toBeNull(); // Toujours actives
    });
  });

  // ==================== SCÉNARIO 5 : Déconnexion avec userId inexistant ====================
  it("devrait retourner succès même avec un userId inexistant", async () => {
    // Étant donné - Aucun utilisateur avec cet ID
    const fakeUserId = "clxxx-fake-user-id-xxx";

    // Quand
    const result = await useCase.execute({
      userId: fakeUserId,
    });

    // Alors
    expect(result).toBeDefined();
    expect(result.success).toBe(true);
    expect(result.revokedSessions).toBe(0); // Aucune session révoquée
  });

  // ==================== SCÉNARIO 6 : Validation - userId vide ====================
  it("devrait rejeter un userId vide", async () => {
    // Étant donné
    const command = {
      userId: "",
    };

    // Quand / Alors
    await expect(useCase.execute(command)).rejects.toThrow("userId");
  });
});
