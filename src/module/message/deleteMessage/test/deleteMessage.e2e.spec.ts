import {
  PostgreSqlContainer,
  StartedPostgreSqlContainer,
} from '@testcontainers/postgresql';
import { PrismaClient } from '@/generated/prisma';
import { DeleteMessageUseCase } from '../DeleteMessageUseCase';
import { DeleteMessagePrismaRepository } from '../DeleteMessagePrismaRepository';

let container: StartedPostgreSqlContainer;
let prisma: PrismaClient;
let useCase: DeleteMessageUseCase;
let repository: DeleteMessagePrismaRepository;

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

  repository = new DeleteMessagePrismaRepository(prisma);
  useCase = new DeleteMessageUseCase(repository);
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

describe('DeleteMessage Integration (E2E - US-8)', () => {
  it('devrait supprimer un message en base de données', async () => {
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

    const message = await prisma.message.create({
      data: {
        content: 'Message à supprimer',
        authorId: user.id,
        conversationId: conversation.id,
      },
    });

    const command = {
      messageId: message.id,
      userId: user.id,
    };

    // Quand
    await useCase.execute(command);

    // Alors
    const deletedMessage = await prisma.message.findUnique({
      where: { id: message.id },
    });

    expect(deletedMessage).toBeDefined();
    expect(deletedMessage?.deletedAt).toBeDefined();
    expect(deletedMessage?.deletedAt).toBeInstanceOf(Date);
  });

  it("devrait rejeter si le message n'existe pas", async () => {
    // Étant donné
    const user = await prisma.user.create({
      data: {
        email: 'test@example.com',
        password: 'hashedPassword',
        name: 'Test User',
      },
    });

    // Quand / Alors
    await expect(
      useCase.execute({
        messageId: 'message-999',
        userId: user.id,
      })
    ).rejects.toThrow('Message non trouvé');
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
        name: 'Other User',
      },
    });

    const conversation = await prisma.conversation.create({
      data: {
        title: 'Test Conversation',
        authorId: owner.id,
      },
    });

    const message = await prisma.message.create({
      data: {
        content: "Message de l'owner",
        authorId: owner.id,
        conversationId: conversation.id,
      },
    });

    // Quand / Alors
    await expect(
      useCase.execute({
        messageId: message.id,
        userId: otherUser.id,
      })
    ).rejects.toThrow('autorisé');
  });

  it('devrait rejeter si le message est déjà supprimé', async () => {
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

    const message = await prisma.message.create({
      data: {
        content: 'Message déjà supprimé',
        authorId: user.id,
        conversationId: conversation.id,
        deletedAt: new Date(),
      },
    });

    // Quand / Alors
    await expect(
      useCase.execute({
        messageId: message.id,
        userId: user.id,
      })
    ).rejects.toThrow('Message non trouvé');
  });
});
