import {
  PostgreSqlContainer,
  StartedPostgreSqlContainer,
} from '@testcontainers/postgresql';
import { PrismaClient } from '@/generated/prisma';
import { RegisterUserUseCase } from '../RegisterUserUseCase';
import { RegisterUserPrismaRepository } from '../RegisterUserPrismaRepository';
import { verifyPassword } from '@/lib/password';

let container: StartedPostgreSqlContainer;
let prisma: PrismaClient;
let useCase: RegisterUserUseCase;
let repository: RegisterUserPrismaRepository;

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

  repository = new RegisterUserPrismaRepository(prisma);
  useCase = new RegisterUserUseCase(repository);
}, 60000);

afterAll(async () => {
  await prisma.$disconnect();
  await container.stop();
});

beforeEach(async () => {
  await prisma.user.deleteMany();
});

describe('RegisterUser Integration (E2E - US-9)', () => {
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

    const user = await prisma.user.findUnique({
      where: { email: 'alice@example.com' },
    });

    expect(user).not.toBeNull();
    expect(user!.email).toBe('alice@example.com');
    expect(user!.name).toBe('Alice Dupont');
    expect(user!.password).not.toBe('SecureP@ss123');
    expect(user!.password.startsWith('$2')).toBe(true);

    const isPasswordValid = await verifyPassword(
      'SecureP@ss123',
      user!.password
    );
    expect(isPasswordValid).toBe(true);
  });

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
    expect(result.name).toBeUndefined();

    const user = await prisma.user.findUnique({
      where: { email: 'bob@example.com' },
    });

    expect(user).not.toBeNull();
    expect(user!.name).toBeNull();
  });

  it('devrait rejeter si email existe déjà', async () => {
    // Étant donné
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

  it('devrait rejeter un email invalide', async () => {
    // Étant donné
    const command = {
      email: 'invalid-email',
      password: 'SecureP@ss123',
    };

    // Quand / Alors
    await expect(useCase.execute(command)).rejects.toThrow('email');
  });

  it('devrait rejeter un mot de passe trop court', async () => {
    // Étant donné
    const command = {
      email: 'test@example.com',
      password: 'Short1!',
    };

    // Quand / Alors
    await expect(useCase.execute(command)).rejects.toThrow('8 caractères');
  });

  it('devrait rejeter un mot de passe sans majuscule', async () => {
    // Étant donné
    const command = {
      email: 'test@example.com',
      password: 'password123!',
    };

    // Quand / Alors
    await expect(useCase.execute(command)).rejects.toThrow('majuscule');
  });

  it('devrait rejeter un mot de passe sans chiffre', async () => {
    // Étant donné
    const command = {
      email: 'test@example.com',
      password: 'Password!',
    };

    // Quand / Alors
    await expect(useCase.execute(command)).rejects.toThrow('chiffre');
  });

  it('devrait rejeter un mot de passe sans caractère spécial', async () => {
    // Étant donné
    const command = {
      email: 'test@example.com',
      password: 'Password123',
    };

    // Quand / Alors
    await expect(useCase.execute(command)).rejects.toThrow('caractère spécial');
  });

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
