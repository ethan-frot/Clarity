import {
  PostgreSqlContainer,
  StartedPostgreSqlContainer,
} from '@testcontainers/postgresql';
import { PrismaClient } from '@/generated/prisma';
import { SignOutUseCase } from '../SignOutUseCase';
import { SignOutPrismaRepository } from '../SignOutPrismaRepository';
import { hashPassword } from '@/lib/password';

let container: StartedPostgreSqlContainer;
let prisma: PrismaClient;
let useCase: SignOutUseCase;
let repository: SignOutPrismaRepository;

beforeAll(async () => {
  container = await new PostgreSqlContainer('postgres:16-alpine')
    .withDatabase('test_forum')
    .withUsername('test')
    .withPassword('test')
    .start();

  process.env.DATABASE_URL = container.getConnectionUri();

  prisma = new PrismaClient({
    datasources: {
      db: {
        url: container.getConnectionUri(),
      },
    },
  });

  const { execSync } = require('child_process');
  execSync('npx prisma db push --skip-generate', {
    stdio: 'inherit',
    env: { ...process.env, DATABASE_URL: container.getConnectionUri() },
  });

  repository = new SignOutPrismaRepository(prisma);
  useCase = new SignOutUseCase(repository);
}, 60000);

afterAll(async () => {
  await prisma.$disconnect();
  await container.stop();
});

beforeEach(async () => {
  await prisma.session.deleteMany();
  await prisma.user.deleteMany();
});

describe('SignOut Integration (E2E - US-11)', () => {
  it("devrait révoquer toutes les sessions actives de l'utilisateur", async () => {
    // Étant donné
    const hashedPassword = await hashPassword('SecureP@ss123');
    const user = await prisma.user.create({
      data: {
        email: 'alice@example.com',
        password: hashedPassword,
        name: 'Alice Dupont',
      },
    });

    await prisma.session.createMany({
      data: [
        {
          userId: user.id,
          accessToken: 'access-token-1',
          refreshToken: 'refresh-token-1',
          expiresAt: new Date(Date.now() + 5 * 60 * 1000),
        },
        {
          userId: user.id,
          accessToken: 'access-token-2',
          refreshToken: 'refresh-token-2',
          expiresAt: new Date(Date.now() + 5 * 60 * 1000),
        },
        {
          userId: user.id,
          accessToken: 'access-token-3',
          refreshToken: 'refresh-token-3',
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

    const sessions = await prisma.session.findMany({
      where: { userId: user.id },
    });

    expect(sessions).toHaveLength(3);
    sessions.forEach((session) => {
      expect(session.revokedAt).not.toBeNull();
      expect(session.revokedAt).toBeInstanceOf(Date);
    });
  });

  it("devrait retourner succès même si l'utilisateur n'a pas de sessions", async () => {
    // Étant donné
    const hashedPassword = await hashPassword('SecureP@ss123');
    const user = await prisma.user.create({
      data: {
        email: 'bob@example.com',
        password: hashedPassword,
        name: 'Bob Martin',
      },
    });

    // Quand
    const result = await useCase.execute({
      userId: user.id,
    });

    // Alors
    expect(result).toBeDefined();
    expect(result.success).toBe(true);
    expect(result.revokedSessions).toBe(0);
  });

  it('devrait ne pas compter les sessions déjà révoquées', async () => {
    // Étant donné
    const hashedPassword = await hashPassword('SecureP@ss123');
    const user = await prisma.user.create({
      data: {
        email: 'charlie@example.com',
        password: hashedPassword,
        name: 'Charlie Brown',
      },
    });

    await prisma.session.createMany({
      data: [
        {
          userId: user.id,
          accessToken: 'access-token-active-1',
          refreshToken: 'refresh-token-active-1',
          expiresAt: new Date(Date.now() + 5 * 60 * 1000),
          revokedAt: null,
        },
        {
          userId: user.id,
          accessToken: 'access-token-active-2',
          refreshToken: 'refresh-token-active-2',
          expiresAt: new Date(Date.now() + 5 * 60 * 1000),
          revokedAt: null,
        },
        {
          userId: user.id,
          accessToken: 'access-token-revoked',
          refreshToken: 'refresh-token-revoked',
          expiresAt: new Date(Date.now() + 5 * 60 * 1000),
          revokedAt: new Date(Date.now() - 10000),
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
    expect(result.revokedSessions).toBe(2);

    const sessions = await prisma.session.findMany({
      where: { userId: user.id },
    });

    expect(sessions).toHaveLength(3);
    sessions.forEach((session) => {
      expect(session.revokedAt).not.toBeNull();
    });
  });

  it("devrait révoquer uniquement les sessions de l'utilisateur spécifié", async () => {
    // Étant donné
    const hashedPassword = await hashPassword('SecureP@ss123');

    const alice = await prisma.user.create({
      data: {
        email: 'alice@example.com',
        password: hashedPassword,
        name: 'Alice',
      },
    });

    const bob = await prisma.user.create({
      data: {
        email: 'bob@example.com',
        password: hashedPassword,
        name: 'Bob',
      },
    });

    await prisma.session.createMany({
      data: [
        {
          userId: alice.id,
          accessToken: 'alice-access-1',
          refreshToken: 'alice-refresh-1',
          expiresAt: new Date(Date.now() + 5 * 60 * 1000),
        },
        {
          userId: alice.id,
          accessToken: 'alice-access-2',
          refreshToken: 'alice-refresh-2',
          expiresAt: new Date(Date.now() + 5 * 60 * 1000),
        },
        {
          userId: bob.id,
          accessToken: 'bob-access-1',
          refreshToken: 'bob-refresh-1',
          expiresAt: new Date(Date.now() + 5 * 60 * 1000),
        },
        {
          userId: bob.id,
          accessToken: 'bob-access-2',
          refreshToken: 'bob-refresh-2',
          expiresAt: new Date(Date.now() + 5 * 60 * 1000),
        },
      ],
    });

    // Quand
    const result = await useCase.execute({
      userId: alice.id,
    });

    // Alors
    expect(result.success).toBe(true);
    expect(result.revokedSessions).toBe(2);

    const aliceSessions = await prisma.session.findMany({
      where: { userId: alice.id },
    });
    expect(aliceSessions).toHaveLength(2);
    aliceSessions.forEach((session) => {
      expect(session.revokedAt).not.toBeNull();
    });

    const bobSessions = await prisma.session.findMany({
      where: { userId: bob.id },
    });
    expect(bobSessions).toHaveLength(2);
    bobSessions.forEach((session) => {
      expect(session.revokedAt).toBeNull();
    });
  });

  it('devrait retourner succès même avec un userId inexistant', async () => {
    // Étant donné
    const fakeUserId = 'clxxx-fake-user-id-xxx';

    // Quand
    const result = await useCase.execute({
      userId: fakeUserId,
    });

    // Alors
    expect(result).toBeDefined();
    expect(result.success).toBe(true);
    expect(result.revokedSessions).toBe(0);
  });

  it('devrait rejeter un userId vide', async () => {
    // Étant donné
    const command = {
      userId: '',
    };

    // Quand / Alors
    await expect(useCase.execute(command)).rejects.toThrow('userId');
  });
});
