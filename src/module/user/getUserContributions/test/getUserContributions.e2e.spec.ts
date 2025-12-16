jest.mock('@/lib/auth/auth-helpers');

import {
  setupE2EDatabase,
  cleanDatabase,
  teardownE2EDatabase,
  E2ETestContext,
} from '@/../test/e2e-setup';
import { createTestUser } from '@/../test/auth-helpers';
import { createTestConversation } from '@/../test/factories';
import { GET } from '@/app/api/users/[id]/contributions/route';

let context: E2ETestContext;

beforeAll(async () => {
  context = await setupE2EDatabase();
}, 60000);

afterAll(async () => {
  await teardownE2EDatabase(context);
});

beforeEach(async () => {
  await cleanDatabase(context.prisma);
});

describe('GET /api/users/:id/contributions (E2E - US-14)', () => {
  it("devrait retourner les contributions d'un utilisateur (200)", async () => {
    // Étant donné
    const user = await createTestUser(context.prisma, {
      name: 'Alice Dupont',
    });

    const conv1 = await createTestConversation(context.prisma, user.id, {
      title: 'Conversation 1',
    });

    await createTestConversation(context.prisma, user.id, {
      title: 'Conversation 2',
    });

    await context.prisma.message.create({
      data: {
        content: 'Message dans conversation 1',
        authorId: user.id,
        conversationId: conv1.id,
      },
    });

    const otherUser = await createTestUser(context.prisma, {
      email: 'bob@example.com',
      name: 'Bob Martin',
    });

    const conv3 = await createTestConversation(context.prisma, otherUser.id, {
      title: 'Conversation de Bob',
    });

    await context.prisma.message.create({
      data: {
        content: "Message d'Alice dans conversation de Bob",
        authorId: user.id,
        conversationId: conv3.id,
      },
    });

    // Quand
    const response = await GET(new Request('http://localhost:3000'), {
      params: Promise.resolve({ id: user.id }),
    });
    const data = await response.json();

    // Alors
    expect(response.status).toBe(200);
    expect(data.user.id).toBe(user.id);
    expect(data.user.name).toBe('Alice Dupont');
    expect(data.user).not.toHaveProperty('email');
    expect(data.user).not.toHaveProperty('password');
    expect(data.conversations).toHaveLength(2);
    // 4 messages : 2 créés automatiquement par createTestConversation + 2 ajoutés manuellement
    expect(data.messages).toHaveLength(4);
  });

  it("devrait retourner 404 si l'utilisateur n'existe pas", async () => {
    // Quand
    const response = await GET(new Request('http://localhost:3000'), {
      params: Promise.resolve({ id: 'user-999' }),
    });
    const data = await response.json();

    // Alors
    expect(response.status).toBe(404);
    expect(data.error).toBe('Utilisateur non trouvé');
  });

  it('ne devrait pas inclure les conversations supprimées', async () => {
    // Étant donné
    const user = await createTestUser(context.prisma);

    await createTestConversation(context.prisma, user.id, {
      title: 'Conversation active',
    });

    const deletedConv = await createTestConversation(context.prisma, user.id, {
      title: 'Conversation supprimée',
    });

    await context.prisma.conversation.update({
      where: { id: deletedConv.id },
      data: { deletedAt: new Date() },
    });

    // Quand
    const response = await GET(new Request('http://localhost:3000'), {
      params: Promise.resolve({ id: user.id }),
    });
    const data = await response.json();

    // Alors
    expect(response.status).toBe(200);
    expect(data.conversations).toHaveLength(1);
    expect(data.conversations[0].title).toBe('Conversation active');
  });

  it('ne devrait pas inclure les messages supprimés', async () => {
    // Étant donné
    const user = await createTestUser(context.prisma);

    const conv = await createTestConversation(context.prisma, user.id, {
      title: 'Conversation test',
    });

    await context.prisma.message.create({
      data: {
        content: 'Message actif',
        authorId: user.id,
        conversationId: conv.id,
      },
    });

    const deletedMessage = await context.prisma.message.create({
      data: {
        content: 'Message supprimé',
        authorId: user.id,
        conversationId: conv.id,
      },
    });

    await context.prisma.message.update({
      where: { id: deletedMessage.id },
      data: { deletedAt: new Date() },
    });

    // Quand
    const response = await GET(new Request('http://localhost:3000'), {
      params: Promise.resolve({ id: user.id }),
    });
    const data = await response.json();

    // Alors
    expect(response.status).toBe(200);
    // 2 messages : 1 créé automatiquement par createTestConversation + 1 "Message actif"
    expect(data.messages).toHaveLength(2);
    const messageActif = data.messages.find(
      (m: any) => m.content === 'Message actif'
    );
    expect(messageActif).toBeDefined();
  });
});
