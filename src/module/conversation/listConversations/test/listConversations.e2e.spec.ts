jest.mock('@/lib/auth/auth-helpers');

import {
  setupE2EDatabase,
  cleanDatabase,
  teardownE2EDatabase,
  E2ETestContext,
} from '@/../test/e2e-setup';
import { createTestUser } from '@/../test/auth-helpers';
import { createTestConversation } from '@/../test/factories';
import { GET } from '@/app/api/conversations/route';

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

describe('GET /api/conversations (E2E - US-2)', () => {
  it('devrait récupérer toutes les conversations triées par date (200)', async () => {
    // Étant donné
    const user = await createTestUser(context.prisma);

    const conv1 = await createTestConversation(context.prisma, user.id, {
      title: 'Première conversation',
    });
    await context.prisma.conversation.update({
      where: { id: conv1.id },
      data: { createdAt: new Date('2025-01-01') },
    });

    const conv2 = await createTestConversation(context.prisma, user.id, {
      title: 'Deuxième conversation',
    });
    await context.prisma.conversation.update({
      where: { id: conv2.id },
      data: { createdAt: new Date('2025-01-02') },
    });

    const conv3 = await createTestConversation(context.prisma, user.id, {
      title: 'Troisième conversation',
    });
    await context.prisma.conversation.update({
      where: { id: conv3.id },
      data: { createdAt: new Date('2025-01-03') },
    });

    // Quand
    const response = await GET();
    const data = await response.json();

    // Alors
    expect(response.status).toBe(200);
    expect(data.conversations).toHaveLength(3);
    expect(data.conversations[0].id).toBe(conv3.id);
    expect(data.conversations[1].id).toBe(conv2.id);
    expect(data.conversations[2].id).toBe(conv1.id);
  });

  it('devrait exclure les conversations supprimées (soft delete)', async () => {
    // Étant donné
    const user = await createTestUser(context.prisma);

    const conv1 = await createTestConversation(context.prisma, user.id, {
      title: 'Conversation active',
    });

    await createTestConversation(context.prisma, user.id, {
      title: 'Conversation supprimée',
    });
    await context.prisma.conversation.updateMany({
      where: { title: 'Conversation supprimée' },
      data: { deletedAt: new Date() },
    });

    // Quand
    const response = await GET();
    const data = await response.json();

    // Alors
    expect(response.status).toBe(200);
    expect(data.conversations).toHaveLength(1);
    expect(data.conversations[0].id).toBe(conv1.id);
  });

  it('devrait retourner un tableau vide si aucune conversation', async () => {
    // Étant donné (aucune conversation en base)

    // Quand
    const response = await GET();
    const data = await response.json();

    // Alors
    expect(response.status).toBe(200);
    expect(data.conversations).toHaveLength(0);
    expect(data.conversations).toEqual([]);
  });
});
