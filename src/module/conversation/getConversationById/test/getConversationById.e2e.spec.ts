jest.mock('@/lib/auth/auth-helpers');

import {
  setupE2EDatabase,
  cleanDatabase,
  teardownE2EDatabase,
  E2ETestContext,
} from '@/../test/e2e-setup';
import { createTestUser } from '@/../test/auth-helpers';
import { createTestConversation, createTestMessage } from '@/../test/factories';
import { GET } from '@/app/api/conversations/[id]/route';

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

describe('GET /api/conversations/[id] (E2E - US-3)', () => {
  it('devrait récupérer une conversation avec ses messages triés chronologiquement (200)', async () => {
    // Étant donné
    const user1 = await createTestUser(context.prisma, { name: 'Alice' });
    const user2 = await createTestUser(context.prisma, { name: 'Bob' });

    const conversation = await createTestConversation(
      context.prisma,
      user1.id,
      {
        title: 'Ma conversation',
      }
    );

    await createTestMessage(context.prisma, conversation.id, user1.id, {
      content: 'Premier message',
    });
    await createTestMessage(context.prisma, conversation.id, user2.id, {
      content: 'Deuxième message',
    });
    await createTestMessage(context.prisma, conversation.id, user1.id, {
      content: 'Troisième message',
    });

    // Quand
    const response = await GET(new Request('http://localhost:3000'), {
      params: Promise.resolve({ id: conversation.id }),
    });
    const data = await response.json();

    // Alors
    expect(response.status).toBe(200);
    expect(data.id).toBe(conversation.id);
    expect(data.title).toBe('Ma conversation');
    // 4 messages : 1 initial créé par createTestConversation + 3 ajoutés manuellement
    expect(data.messages).toHaveLength(4);
    expect(data.messages[0].content).toBe('Premier message de test'); // Message initial
    expect(data.messages[1].content).toBe('Premier message');
    expect(data.messages[2].content).toBe('Deuxième message');
    expect(data.messages[3].content).toBe('Troisième message');
  });

  it('devrait retourner 404 si conversation inexistante', async () => {
    // Étant donné
    const fakeId = 'conv-999';

    // Quand
    const response = await GET(new Request('http://localhost:3000'), {
      params: Promise.resolve({ id: fakeId }),
    });
    const data = await response.json();

    // Alors
    expect(response.status).toBe(404);
    expect(data).toHaveProperty('error');
    expect(data.error).toMatch(/non trouvée/i);
  });

  it('devrait retourner 404 si conversation supprimée (soft delete)', async () => {
    // Étant donné
    const user = await createTestUser(context.prisma);
    const conversation = await createTestConversation(context.prisma, user.id);

    await context.prisma.conversation.update({
      where: { id: conversation.id },
      data: { deletedAt: new Date() },
    });

    // Quand
    const response = await GET(new Request('http://localhost:3000'), {
      params: Promise.resolve({ id: conversation.id }),
    });
    const data = await response.json();

    // Alors
    expect(response.status).toBe(404);
    expect(data).toHaveProperty('error');
  });
});
