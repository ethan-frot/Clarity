import {
  setupE2EDatabase,
  cleanDatabase,
  teardownE2EDatabase,
  E2ETestContext,
} from '@/../test/e2e-setup';
import { createTestUser } from '@/../test/auth-helpers';
import { createTestConversation, createTestMessage } from '@/../test/factories';
import { PATCH } from '@/app/api/messages/[id]/route';
import { NextRequest } from 'next/server';

jest.mock('@/lib/auth/auth-helpers');

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

describe('PATCH /api/messages/[id] (E2E - US-7)', () => {
  it("devrait modifier le contenu d'un message (200)", async () => {
    // Étant donné
    const user = await createTestUser(context.prisma);
    const conversation = await createTestConversation(context.prisma, user.id);
    const message = await createTestMessage(
      context.prisma,
      conversation.id,
      user.id,
      {
        content: 'Contenu original',
      }
    );

    const { getSession } = require('@/lib/auth/auth-helpers');
    getSession.mockResolvedValue({ user: { id: user.id } });

    const request = new NextRequest(
      'http://localhost:3000/api/messages/' + message.id,
      {
        method: 'PATCH',
        body: JSON.stringify({ content: 'Contenu modifié' }),
      }
    );

    // Quand
    const response = await PATCH(request, {
      params: Promise.resolve({ id: message.id }),
    });
    const data = await response.json();

    // Alors
    expect(response.status).toBe(200);
    expect(data.success).toBe(true);

    const updated = await context.prisma.message.findUnique({
      where: { id: message.id },
    });
    expect(updated?.content).toBe('Contenu modifié');
  });

  it('devrait retourner 401 si non authentifié', async () => {
    // Étant donné
    const user = await createTestUser(context.prisma);
    const conversation = await createTestConversation(context.prisma, user.id);
    const message = await createTestMessage(
      context.prisma,
      conversation.id,
      user.id
    );

    const { getSession } = require('@/lib/auth/auth-helpers');
    getSession.mockResolvedValue(null);

    const request = new NextRequest(
      'http://localhost:3000/api/messages/' + message.id,
      {
        method: 'PATCH',
        body: JSON.stringify({ content: 'Test' }),
      }
    );

    // Quand
    const response = await PATCH(request, {
      params: Promise.resolve({ id: message.id }),
    });
    const data = await response.json();

    // Alors
    expect(response.status).toBe(401);
    expect(data).toHaveProperty('error');
  });

  it('devrait retourner 403 si pas le propriétaire', async () => {
    // Étant donné
    const owner = await createTestUser(context.prisma);
    const other = await createTestUser(context.prisma);
    const conversation = await createTestConversation(context.prisma, owner.id);
    const message = await createTestMessage(
      context.prisma,
      conversation.id,
      owner.id
    );

    const { getSession } = require('@/lib/auth/auth-helpers');
    getSession.mockResolvedValue({ user: { id: other.id } });

    const request = new NextRequest(
      'http://localhost:3000/api/messages/' + message.id,
      {
        method: 'PATCH',
        body: JSON.stringify({ content: 'Test' }),
      }
    );

    // Quand
    const response = await PATCH(request, {
      params: Promise.resolve({ id: message.id }),
    });
    const data = await response.json();

    // Alors
    expect(response.status).toBe(403);
    expect(data).toHaveProperty('error');
    expect(data.error).toMatch(/autorisé/i);
  });

  it('devrait retourner 400 si contenu vide', async () => {
    // Étant donné
    const user = await createTestUser(context.prisma);
    const conversation = await createTestConversation(context.prisma, user.id);
    const message = await createTestMessage(
      context.prisma,
      conversation.id,
      user.id
    );

    const { getSession } = require('@/lib/auth/auth-helpers');
    getSession.mockResolvedValue({ user: { id: user.id } });

    const request = new NextRequest(
      'http://localhost:3000/api/messages/' + message.id,
      {
        method: 'PATCH',
        body: JSON.stringify({ content: '' }),
      }
    );

    // Quand
    const response = await PATCH(request, {
      params: Promise.resolve({ id: message.id }),
    });
    const data = await response.json();

    // Alors
    expect(response.status).toBe(400);
    expect(data).toHaveProperty('error');
    expect(data.error).toMatch(/contenu/i);
  });
});
