import {
  PostgreSqlContainer,
  StartedPostgreSqlContainer,
} from '@testcontainers/postgresql';
import { PrismaClient } from '@/generated/prisma';
import { ListConversationsUseCase } from '../ListConversationsUseCase';
import { ListConversationsPrismaRepository } from '../ListConversationsPrismaRepository';

let container: StartedPostgreSqlContainer;
let prisma: PrismaClient;
let useCase: ListConversationsUseCase;
let repository: ListConversationsPrismaRepository;

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

  repository = new ListConversationsPrismaRepository(prisma);
  useCase = new ListConversationsUseCase(repository);
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

describe('ListConversations Integration (E2E - US-2)', () => {
  it('devrait récupérer toutes les conversations triées par date (la plus récente en premier)', async () => {
    // Étant donné
    const user = await prisma.user.create({
      data: {
        email: 'alice@example.com',
        password: 'hashedPassword',
        name: 'Alice',
      },
    });

    const conv1 = await prisma.conversation.create({
      data: {
        title: 'Première conversation',
        authorId: user.id,
        createdAt: new Date('2025-01-01'),
      },
    });

    const conv2 = await prisma.conversation.create({
      data: {
        title: 'Deuxième conversation',
        authorId: user.id,
        createdAt: new Date('2025-01-02'),
      },
    });

    const conv3 = await prisma.conversation.create({
      data: {
        title: 'Troisième conversation',
        authorId: user.id,
        createdAt: new Date('2025-01-03'),
      },
    });

    await prisma.message.create({
      data: {
        content: 'Message 1 conv1',
        conversationId: conv1.id,
        authorId: user.id,
      },
    });
    await prisma.message.create({
      data: {
        content: 'Message 2 conv1',
        conversationId: conv1.id,
        authorId: user.id,
      },
    });
    await prisma.message.create({
      data: {
        content: 'Message 1 conv2',
        conversationId: conv2.id,
        authorId: user.id,
      },
    });

    // Quand
    const result = await useCase.execute();

    // Alors
    expect(result.conversations).toHaveLength(3);
    expect(result.conversations[0].id).toBe(conv3.id);
    expect(result.conversations[1].id).toBe(conv2.id);
    expect(result.conversations[2].id).toBe(conv1.id);
  });

  it('devrait exclure les conversations supprimées (deletedAt défini)', async () => {
    // Étant donné
    const user = await prisma.user.create({
      data: {
        email: 'bob@example.com',
        password: 'hashedPassword',
        name: 'Bob',
      },
    });

    const conv1 = await prisma.conversation.create({
      data: {
        title: 'Conversation active',
        authorId: user.id,
        deletedAt: null,
      },
    });

    await prisma.conversation.create({
      data: {
        title: 'Conversation supprimée',
        authorId: user.id,
        deletedAt: new Date(),
      },
    });

    // Quand
    const result = await useCase.execute();

    // Alors
    expect(result.conversations).toHaveLength(1);
    expect(result.conversations[0].id).toBe(conv1.id);
  });

  it('devrait retourner un tableau vide si aucune conversation', async () => {
    // Étant donné (aucune conversation en base)

    // Quand
    const result = await useCase.execute();

    // Alors
    expect(result.conversations).toHaveLength(0);
    expect(result.conversations).toEqual([]);
  });

  it('devrait inclure le nombre de messages pour chaque conversation', async () => {
    // Étant donné
    const user = await prisma.user.create({
      data: {
        email: 'charlie@example.com',
        password: 'hashedPassword',
        name: 'Charlie',
      },
    });

    const conv1 = await prisma.conversation.create({
      data: {
        title: 'Conversation avec messages',
        authorId: user.id,
      },
    });

    await prisma.message.create({
      data: {
        content: 'Message 1',
        conversationId: conv1.id,
        authorId: user.id,
      },
    });
    await prisma.message.create({
      data: {
        content: 'Message 2',
        conversationId: conv1.id,
        authorId: user.id,
      },
    });
    await prisma.message.create({
      data: {
        content: 'Message 3',
        conversationId: conv1.id,
        authorId: user.id,
      },
    });

    // Quand
    const result = await useCase.execute();

    // Alors
    expect(result.conversations).toHaveLength(1);
    expect(result.conversations[0].messageCount).toBe(3);
  });
});
