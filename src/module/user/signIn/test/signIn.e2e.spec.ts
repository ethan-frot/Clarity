import {
  PostgreSqlContainer,
  StartedPostgreSqlContainer,
} from '@testcontainers/postgresql';
import { PrismaClient } from '@/generated/prisma';
import { SignInUseCase } from '../SignInUseCase';
import { SignInPrismaRepository } from '../SignInPrismaRepository';
import { hashPassword } from '@/lib/password';

let container: StartedPostgreSqlContainer;
let prisma: PrismaClient;
let useCase: SignInUseCase;
let repository: SignInPrismaRepository;

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

  repository = new SignInPrismaRepository(prisma);
  useCase = new SignInUseCase(repository);
}, 60000);

afterAll(async () => {
  await prisma.$disconnect();
  await container.stop();
});

beforeEach(async () => {
  await prisma.user.deleteMany();
});

describe('SignIn Integration (E2E - US-10)', () => {
  it('devrait authentifier un utilisateur avec des credentials valides', async () => {
    // Étant donné
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
    expect(result).not.toHaveProperty('password');
  });

  it("devrait rejeter un email qui n'existe pas en base", async () => {
    // Étant donné
    const command = {
      email: 'unknown@example.com',
      password: 'SomePassword123!',
    };

    // Quand / Alors
    await expect(useCase.execute(command)).rejects.toThrow(
      'Email ou mot de passe incorrect'
    );
  });

  it('devrait rejeter un mot de passe incorrect', async () => {
    // Étant donné
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

  it('devrait rejeter un email vide', async () => {
    // Étant donné
    const command = {
      email: '',
      password: 'SecureP@ss123',
    };

    // Quand / Alors
    await expect(useCase.execute(command)).rejects.toThrow('email');
  });

  it('devrait rejeter un mot de passe vide', async () => {
    // Étant donné
    const command = {
      email: 'alice@example.com',
      password: '',
    };

    // Quand / Alors
    await expect(useCase.execute(command)).rejects.toThrow('mot de passe');
  });

  it('devrait authentifier un utilisateur sans nom (name null)', async () => {
    // Étant donné
    const hashedPassword = await hashPassword('SecureP@ss123');
    await prisma.user.create({
      data: {
        email: 'bob@example.com',
        password: hashedPassword,
        name: null,
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
    expect(result.name).toBeUndefined();
  });

  it("devrait retourner le même message d'erreur pour email inexistant et password incorrect", async () => {
    // Étant donné
    const hashedPassword = await hashPassword('CorrectPassword123!');
    await prisma.user.create({
      data: {
        email: 'alice@example.com',
        password: hashedPassword,
      },
    });

    // Quand
    let errorMessage1 = '';
    try {
      await useCase.execute({
        email: 'unknown@example.com',
        password: 'AnyPassword123!',
      });
    } catch (error) {
      errorMessage1 = (error as Error).message;
    }

    let errorMessage2 = '';
    try {
      await useCase.execute({
        email: 'alice@example.com',
        password: 'WrongPassword123!',
      });
    } catch (error) {
      errorMessage2 = (error as Error).message;
    }

    // Alors
    expect(errorMessage1).toBe(errorMessage2);
    expect(errorMessage1).toBe('Email ou mot de passe incorrect');
  });
});
