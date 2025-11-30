import {
  PostgreSqlContainer,
  StartedPostgreSqlContainer,
} from '@testcontainers/postgresql';
import { PrismaClient } from '@/generated/prisma';
import { UpdateConversationUseCase } from '../UpdateConversationUseCase';
import { UpdateConversationPrismaRepository } from '../UpdateConversationPrismaRepository';

let container: StartedPostgreSqlContainer;
let prisma: PrismaClient;
let useCase: UpdateConversationUseCase;
let repository: UpdateConversationPrismaRepository;

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

  repository = new UpdateConversationPrismaRepository(prisma);
  useCase = new UpdateConversationUseCase(repository);
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

describe('UpdateConversation Integration (E2E - US-4)', () => {
  it("devrait modifier le titre d'une conversation en base de données", async () => {
    // Étant donné
    const user = await prisma.user.create({
      data: {
        email: 'alice@example.com',
        password: 'hashedPassword',
        name: 'Alice',
      },
    });

    const conversation = await prisma.conversation.create({
      data: {
        title: 'Ancien titre',
        authorId: user.id,
      },
    });

    const command = {
      conversationId: conversation.id,
      newTitle: 'Nouveau titre',
      userId: user.id,
    };

    // Quand
    const result = await useCase.execute(command);

    // Alors
    expect(result.success).toBe(true);

    const updatedConversation = await prisma.conversation.findUnique({
      where: { id: conversation.id },
    });

    expect(updatedConversation).not.toBeNull();
    expect(updatedConversation!.title).toBe('Nouveau titre');
    expect(updatedConversation!.updatedAt).not.toBeNull();
  });

  it('devrait rejeter un titre vide', async () => {
    // Étant donné
    const user = await prisma.user.create({
      data: {
        email: 'alice@example.com',
        password: 'hashedPassword',
      },
    });

    const conversation = await prisma.conversation.create({
      data: {
        title: 'Ancien titre',
        authorId: user.id,
      },
    });

    const command = {
      conversationId: conversation.id,
      newTitle: '',
      userId: user.id,
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

    const conversation = await prisma.conversation.create({
      data: {
        title: 'Ancien titre',
        authorId: user.id,
      },
    });

    const command = {
      conversationId: conversation.id,
      newTitle: 'a'.repeat(201),
      userId: user.id,
    };

    // Quand / Alors
    await expect(useCase.execute(command)).rejects.toThrow('titre');
  });

  it("devrait rejeter si la conversation n'existe pas", async () => {
    // Étant donné
    const user = await prisma.user.create({
      data: {
        email: 'alice@example.com',
        password: 'hashedPassword',
      },
    });

    const command = {
      conversationId: 'non-existent-id',
      newTitle: 'Nouveau titre',
      userId: user.id,
    };

    // Quand / Alors
    await expect(useCase.execute(command)).rejects.toThrow(
      'Conversation non trouvée'
    );
  });

  it("devrait rejeter si l'utilisateur n'est pas le propriétaire", async () => {
    // Étant donné
    const owner = await prisma.user.create({
      data: {
        email: 'owner@example.com',
        password: 'hashedPassword',
        name: 'Owner',
      },
    });

    const otherUser = await prisma.user.create({
      data: {
        email: 'other@example.com',
        password: 'hashedPassword',
        name: 'Other',
      },
    });

    const conversation = await prisma.conversation.create({
      data: {
        title: 'Ancien titre',
        authorId: owner.id,
      },
    });

    const command = {
      conversationId: conversation.id,
      newTitle: 'Nouveau titre',
      userId: otherUser.id,
    };

    // Quand / Alors
    await expect(useCase.execute(command)).rejects.toThrow('Non autorisé');
  });

  it('devrait accepter un titre de 1 caractère', async () => {
    // Étant donné
    const user = await prisma.user.create({
      data: {
        email: 'alice@example.com',
        password: 'hashedPassword',
      },
    });

    const conversation = await prisma.conversation.create({
      data: {
        title: 'Ancien titre',
        authorId: user.id,
      },
    });

    const command = {
      conversationId: conversation.id,
      newTitle: 'A',
      userId: user.id,
    };

    // Quand
    const result = await useCase.execute(command);

    // Alors
    expect(result.success).toBe(true);

    const updatedConversation = await prisma.conversation.findUnique({
      where: { id: conversation.id },
    });

    expect(updatedConversation).not.toBeNull();
    expect(updatedConversation!.title).toBe('A');
  });

  it('devrait accepter un titre de 200 caractères', async () => {
    // Étant donné
    const user = await prisma.user.create({
      data: {
        email: 'alice@example.com',
        password: 'hashedPassword',
      },
    });

    const conversation = await prisma.conversation.create({
      data: {
        title: 'Ancien titre',
        authorId: user.id,
      },
    });

    const newTitle = 'a'.repeat(200);
    const command = {
      conversationId: conversation.id,
      newTitle,
      userId: user.id,
    };

    // Quand
    const result = await useCase.execute(command);

    // Alors
    expect(result.success).toBe(true);

    const updatedConversation = await prisma.conversation.findUnique({
      where: { id: conversation.id },
    });

    expect(updatedConversation).not.toBeNull();
    expect(updatedConversation!.title).toHaveLength(200);
  });
});
