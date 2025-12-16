jest.mock('@/lib/auth/auth-helpers');

import {
  setupE2EDatabase,
  cleanDatabase,
  teardownE2EDatabase,
  E2ETestContext,
} from '@/../test/e2e-setup';
import { createTestUser } from '@/../test/auth-helpers';
import { createTestConversation, createTestMessage } from '@/../test/factories';
import { DELETE } from '@/app/api/messages/[id]/route';
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

describe('DELETE /api/messages/[id] (E2E - US-8)', () => {
  it('devrait supprimer un message (soft delete) (200)', async () => {
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
        method: 'DELETE',
      }
    );

    // Quand
    const response = await DELETE(request, {
      params: Promise.resolve({ id: message.id }),
    });
    const data = await response.json();

    // Alors
    expect(response.status).toBe(200);
    expect(data.success).toBe(true);

    const deleted = await context.prisma.message.findUnique({
      where: { id: message.id },
    });
    expect(deleted?.deletedAt).not.toBeNull();
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
        method: 'DELETE',
      }
    );

    // Quand
    const response = await DELETE(request, {
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
        method: 'DELETE',
      }
    );

    // Quand
    const response = await DELETE(request, {
      params: Promise.resolve({ id: message.id }),
    });
    const data = await response.json();

    // Alors
    expect(response.status).toBe(403);
    expect(data).toHaveProperty('error');
    expect(data.error).toMatch(/autorisé/i);
  });

  it('devrait retourner 404 si message inexistant', async () => {
    // Étant donné
    const user = await createTestUser(context.prisma);

    const { getSession } = require('@/lib/auth/auth-helpers');
    getSession.mockResolvedValue({ user: { id: user.id } });

    const request = new NextRequest(
      'http://localhost:3000/api/messages/fake-id',
      {
        method: 'DELETE',
      }
    );

    // Quand
    const response = await DELETE(request, {
      params: Promise.resolve({ id: 'fake-id' }),
    });
    const data = await response.json();

    // Alors
    expect(response.status).toBe(404);
    expect(data).toHaveProperty('error');
  });
});
