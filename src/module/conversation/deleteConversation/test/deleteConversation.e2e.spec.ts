import {
  PostgreSqlContainer,
  StartedPostgreSqlContainer,
} from '@testcontainers/postgresql';
import { PrismaClient } from '@/generated/prisma';
import { DeleteConversationUseCase } from '../DeleteConversationUseCase';
import { DeleteConversationPrismaRepository } from '../DeleteConversationPrismaRepository';

let container: StartedPostgreSqlContainer;
let prisma: PrismaClient;
let useCase: DeleteConversationUseCase;
let repository: DeleteConversationPrismaRepository;

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

  repository = new DeleteConversationPrismaRepository(prisma);
  useCase = new DeleteConversationUseCase(repository);
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

describe('DeleteConversation Integration (E2E - US-5)', () => {
  it('devrait supprimer une conversation en base de données', async () => {
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
        title: 'Conversation à supprimer',
        authorId: user.id,
      },
    });

    // Quand
    await useCase.execute({
      conversationId: conversation.id,
      userId: user.id,
    });

    // Alors
    const deletedConversation = await prisma.conversation.findUnique({
      where: { id: conversation.id },
    });

    expect(deletedConversation).not.toBeNull();
    expect(deletedConversation!.deletedAt).not.toBeNull();
  });

  it("devrait rejeter si la conversation n'existe pas", async () => {
    // Étant donné
    const user = await prisma.user.create({
      data: {
        email: 'alice@example.com',
        password: 'hashedPassword',
      },
    });

    // Quand / Alors
    await expect(
      useCase.execute({
        conversationId: 'non-existent-id',
        userId: user.id,
      })
    ).rejects.toThrow('non trouvée');
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
        title: 'Conversation du propriétaire',
        authorId: owner.id,
      },
    });

    // Quand / Alors
    await expect(
      useCase.execute({
        conversationId: conversation.id,
        userId: otherUser.id,
      })
    ).rejects.toThrow('autorisé');
  });

  it('devrait rejeter si la conversation est déjà supprimée', async () => {
    // Étant donné
    const user = await prisma.user.create({
      data: {
        email: 'alice@example.com',
        password: 'hashedPassword',
      },
    });

    const conversation = await prisma.conversation.create({
      data: {
        title: 'Conversation déjà supprimée',
        authorId: user.id,
        deletedAt: new Date(),
      },
    });

    // Quand / Alors
    await expect(
      useCase.execute({
        conversationId: conversation.id,
        userId: user.id,
      })
    ).rejects.toThrow('non trouvée');
  });

  it("devrait ne pas supprimer les autres conversations de l'utilisateur", async () => {
    // Étant donné
    const user = await prisma.user.create({
      data: {
        email: 'alice@example.com',
        password: 'hashedPassword',
      },
    });

    const conversation1 = await prisma.conversation.create({
      data: {
        title: 'Conversation 1',
        authorId: user.id,
      },
    });

    const conversation2 = await prisma.conversation.create({
      data: {
        title: 'Conversation 2',
        authorId: user.id,
      },
    });

    // Quand
    await useCase.execute({
      conversationId: conversation1.id,
      userId: user.id,
    });

    // Alors
    const conv1 = await prisma.conversation.findUnique({
      where: { id: conversation1.id },
    });
    const conv2 = await prisma.conversation.findUnique({
      where: { id: conversation2.id },
    });

    expect(conv1!.deletedAt).not.toBeNull();
    expect(conv2!.deletedAt).toBeNull();
  });
});
