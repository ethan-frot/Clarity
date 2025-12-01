import {
  PostgreSqlContainer,
  StartedPostgreSqlContainer,
} from '@testcontainers/postgresql';
import { PrismaClient } from '@/generated/prisma';
import { CreateMessageUseCase } from '../CreateMessageUseCase';
import { CreateMessagePrismaRepository } from '../CreateMessagePrismaRepository';

let container: StartedPostgreSqlContainer;
let prisma: PrismaClient;
let useCase: CreateMessageUseCase;
let repository: CreateMessagePrismaRepository;

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

  repository = new CreateMessagePrismaRepository(prisma);
  useCase = new CreateMessageUseCase(repository);
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

describe('CreateMessage Integration (E2E - US-6)', () => {
  it('devrait créer un message en base de données', async () => {
    // Étant donné
    const user = await prisma.user.create({
      data: {
        email: 'test@example.com',
        password: 'hashedPassword',
        name: 'Test User',
      },
    });

    const conversation = await prisma.conversation.create({
      data: {
        title: 'Test Conversation',
        authorId: user.id,
      },
    });

    const command = {
      content: 'Super discussion !',
      authorId: user.id,
      conversationId: conversation.id,
    };

    // Quand
    const result = await useCase.execute(command);

    // Alors
    expect(result.messageId).toBeDefined();

    const message = await prisma.message.findUnique({
      where: { id: result.messageId },
    });

    expect(message).not.toBeNull();
    expect(message!.content).toBe('Super discussion !');
    expect(message!.authorId).toBe(user.id);
    expect(message!.conversationId).toBe(conversation.id);
  });

  it('devrait rejeter un contenu vide', async () => {
    // Étant donné
    const user = await prisma.user.create({
      data: {
        email: 'test@example.com',
        password: 'hashedPassword',
      },
    });

    const conversation = await prisma.conversation.create({
      data: {
        title: 'Test Conversation',
        authorId: user.id,
      },
    });

    const command = {
      content: '',
      authorId: user.id,
      conversationId: conversation.id,
    };

    // Quand / Alors
    await expect(useCase.execute(command)).rejects.toThrow(/contenu/i);
  });

  it('devrait rejeter un contenu trop long', async () => {
    // Étant donné
    const user = await prisma.user.create({
      data: {
        email: 'test@example.com',
        password: 'hashedPassword',
      },
    });

    const conversation = await prisma.conversation.create({
      data: {
        title: 'Test Conversation',
        authorId: user.id,
      },
    });

    const command = {
      content: 'a'.repeat(2001),
      authorId: user.id,
      conversationId: conversation.id,
    };

    // Quand / Alors
    await expect(useCase.execute(command)).rejects.toThrow(/2000/i);
  });

  it('devrait rejeter si conversation inexistante', async () => {
    // Étant donné
    const user = await prisma.user.create({
      data: {
        email: 'test@example.com',
        password: 'hashedPassword',
      },
    });

    const command = {
      content: 'Test message',
      authorId: user.id,
      conversationId: 'conv-999',
    };

    // Quand / Alors
    await expect(useCase.execute(command)).rejects.toThrow(/conversation/i);
  });

  it('devrait rejeter si conversation supprimée (soft delete)', async () => {
    // Étant donné
    const user = await prisma.user.create({
      data: {
        email: 'test@example.com',
        password: 'hashedPassword',
      },
    });

    const conversation = await prisma.conversation.create({
      data: {
        title: 'Test Conversation',
        authorId: user.id,
        deletedAt: new Date(),
      },
    });

    const command = {
      content: 'Test message',
      authorId: user.id,
      conversationId: conversation.id,
    };

    // Quand / Alors
    await expect(useCase.execute(command)).rejects.toThrow(/conversation/i);
  });
});
