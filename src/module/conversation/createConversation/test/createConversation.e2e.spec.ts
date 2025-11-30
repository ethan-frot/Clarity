import {
  PostgreSqlContainer,
  StartedPostgreSqlContainer,
} from '@testcontainers/postgresql';
import { PrismaClient } from '@/generated/prisma';
import { CreateConversationUseCase } from '../CreateConversationUseCase';
import { CreateConversationPrismaRepository } from '../CreateConversationPrismaRepository';

let container: StartedPostgreSqlContainer;
let prisma: PrismaClient;
let useCase: CreateConversationUseCase;
let repository: CreateConversationPrismaRepository;

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

  repository = new CreateConversationPrismaRepository(prisma);
  useCase = new CreateConversationUseCase(repository);
}, 60000);

afterAll(async () => {
  await prisma.$disconnect();
  await container.stop();
});

beforeEach(async () => {
  await prisma.message.deleteMany();
  await prisma.conversation.deleteMany();
  await prisma.user.deleteMany();
});

describe('CreateConversation Integration (E2E - US-1)', () => {
  it('devrait créer une conversation avec un premier message en base de données', async () => {
    // Étant donné
    const user = await prisma.user.create({
      data: {
        email: 'alice@example.com',
        password: 'hashedPassword',
        name: 'Alice',
      },
    });

    const command = {
      title: 'Bienvenue sur le forum',
      content: 'Bonjour à tous !',
      authorId: user.id,
    };

    // Quand
    const result = await useCase.execute(command);

    // Alors
    expect(result.conversationId).toBeDefined();

    const conversation = await prisma.conversation.findUnique({
      where: { id: result.conversationId },
      include: { messages: true },
    });

    expect(conversation).not.toBeNull();
    expect(conversation!.title).toBe('Bienvenue sur le forum');
    expect(conversation!.authorId).toBe(user.id);
    expect(conversation!.messages).toHaveLength(1);
    expect(conversation!.messages[0].content).toBe('Bonjour à tous !');
    expect(conversation!.messages[0].authorId).toBe(user.id);
  });

  it('devrait rejeter un titre vide', async () => {
    // Étant donné
    const user = await prisma.user.create({
      data: {
        email: 'alice@example.com',
        password: 'hashedPassword',
      },
    });

    const command = {
      title: '',
      content: 'Contenu valide',
      authorId: user.id,
    };

    // Quand / Alors
    await expect(useCase.execute(command)).rejects.toThrow('titre');
  });

  it('devrait rejeter un titre trop long', async () => {
    // Étant donné
    const user = await prisma.user.create({
      data: {
        email: 'alice@example.com',
        password: 'hashedPassword',
      },
    });

    const command = {
      title: 'a'.repeat(201),
      content: 'Contenu valide',
      authorId: user.id,
    };

    // Quand / Alors
    await expect(useCase.execute(command)).rejects.toThrow('titre');
  });

  it('devrait rejeter un contenu vide', async () => {
    // Étant donné
    const user = await prisma.user.create({
      data: {
        email: 'alice@example.com',
        password: 'hashedPassword',
      },
    });

    const command = {
      title: 'Titre valide',
      content: '',
      authorId: user.id,
    };

    // Quand / Alors
    await expect(useCase.execute(command)).rejects.toThrow('contenu');
  });

  it('devrait rejeter un contenu trop long', async () => {
    // Étant donné
    const user = await prisma.user.create({
      data: {
        email: 'alice@example.com',
        password: 'hashedPassword',
      },
    });

    const command = {
      title: 'Titre valide',
      content: 'a'.repeat(2001),
      authorId: user.id,
    };

    // Quand / Alors
    await expect(useCase.execute(command)).rejects.toThrow('contenu');
  });

  it('devrait créer une conversation avec titre de 200 caractères', async () => {
    // Étant donné
    const user = await prisma.user.create({
      data: {
        email: 'alice@example.com',
        password: 'hashedPassword',
      },
    });

    const command = {
      title: 'a'.repeat(200),
      content: 'Contenu valide',
      authorId: user.id,
    };

    // Quand
    const result = await useCase.execute(command);

    // Alors
    expect(result.conversationId).toBeDefined();

    const conversation = await prisma.conversation.findUnique({
      where: { id: result.conversationId },
    });

    expect(conversation).not.toBeNull();
    expect(conversation!.title).toHaveLength(200);
  });

  it('devrait créer une conversation avec contenu de 2000 caractères', async () => {
    // Étant donné
    const user = await prisma.user.create({
      data: {
        email: 'alice@example.com',
        password: 'hashedPassword',
      },
    });

    const command = {
      title: 'Titre valide',
      content: 'a'.repeat(2000),
      authorId: user.id,
    };

    // Quand
    const result = await useCase.execute(command);

    // Alors
    expect(result.conversationId).toBeDefined();

    const conversation = await prisma.conversation.findUnique({
      where: { id: result.conversationId },
      include: { messages: true },
    });

    expect(conversation).not.toBeNull();
    expect(conversation!.messages[0].content).toHaveLength(2000);
  });
});
