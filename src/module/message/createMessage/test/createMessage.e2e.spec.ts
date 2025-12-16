jest.mock('@/lib/auth/auth-helpers');

import {
  setupE2EDatabase,
  cleanDatabase,
  teardownE2EDatabase,
  E2ETestContext,
} from '@/../test/e2e-setup';
import { createTestUser } from '@/../test/auth-helpers';
import { createTestConversation } from '@/../test/factories';
import { POST } from '@/app/api/messages/route';
import { NextRequest } from 'next/server';

let context: E2ETestContext;

beforeAll(async () => {
  context = await setupE2EDatabase();
}, 60000);

afterAll(async () => {
  await teardownE2EDatabase(context);
});

beforeEach(async () => {
  await cleanDatabase(context.prisma);
  jest.clearAllMocks();
});

describe('POST /api/messages (E2E - US-6)', () => {
  it('devrait créer un message dans une conversation (201)', async () => {
    // Étant donné
    const user = await createTestUser(context.prisma);
    const conversation = await createTestConversation(context.prisma, user.id);

    const { getSession } = require('@/lib/auth/auth-helpers');
    getSession.mockResolvedValue({ user: { id: user.id } });

    const request = new NextRequest('http://localhost:3000/api/messages', {
      method: 'POST',
      body: JSON.stringify({
        content: 'Super discussion !',
        conversationId: conversation.id,
      }),
    });

    // Quand
    const response = await POST(request);
    const data = await response.json();

    // Alors
    expect(response.status).toBe(201);
    expect(data).toHaveProperty('messageId');

    const message = await context.prisma.message.findUnique({
      where: { id: data.messageId },
    });
    expect(message?.content).toBe('Super discussion !');
    expect(message?.conversationId).toBe(conversation.id);
  });

  it('devrait retourner 401 si non authentifié', async () => {
    // Étant donné
    const user = await createTestUser(context.prisma);
    const conversation = await createTestConversation(context.prisma, user.id);

    const { getSession } = require('@/lib/auth/auth-helpers');
    getSession.mockResolvedValue(null);

    const request = new NextRequest('http://localhost:3000/api/messages', {
      method: 'POST',
      body: JSON.stringify({
        content: 'Test',
        conversationId: conversation.id,
      }),
    });

    // Quand
    const response = await POST(request);
    const data = await response.json();

    // Alors
    expect(response.status).toBe(401);
    expect(data).toHaveProperty('error');
  });

  it('devrait retourner 404 si conversation inexistante', async () => {
    // Étant donné
    const user = await createTestUser(context.prisma);

    const { getSession } = require('@/lib/auth/auth-helpers');
    getSession.mockResolvedValue({ user: { id: user.id } });

    const request = new NextRequest('http://localhost:3000/api/messages', {
      method: 'POST',
      body: JSON.stringify({
        content: 'Test',
        conversationId: 'fake-id',
      }),
    });

    // Quand
    const response = await POST(request);
    const data = await response.json();

    // Alors
    expect(response.status).toBe(404);
    expect(data).toHaveProperty('error');
    expect(data.error).toMatch(/conversation/i);
  });
});
