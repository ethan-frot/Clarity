import {
  setupE2EDatabase,
  cleanDatabase,
  teardownE2EDatabase,
  E2ETestContext,
} from '@/../test/e2e-setup';
import { createTestUser } from '@/../test/auth-helpers';
import { POST } from '@/app/api/conversations/route';
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

describe('POST /api/conversations (E2E - US-1)', () => {
  it('devrait créer une conversation avec succès (201)', async () => {
    // Étant donné
    const user = await createTestUser(context.prisma);

    const { getSession } = require('@/lib/auth/auth-helpers');
    getSession.mockResolvedValue({ user: { id: user.id, email: user.email } });

    const request = new NextRequest('http://localhost:3000/api/conversations', {
      method: 'POST',
      body: JSON.stringify({
        title: 'Ma première conversation',
        content: 'Bonjour tout le monde !',
      }),
    });

    // Quand
    const response = await POST(request);
    const data = await response.json();

    // Alors
    expect(response.status).toBe(201);
    expect(data).toHaveProperty('conversationId');
    expect(typeof data.conversationId).toBe('string');

    const conversation = await context.prisma.conversation.findUnique({
      where: { id: data.conversationId },
      include: { messages: true },
    });

    expect(conversation).toBeDefined();
    expect(conversation?.title).toBe('Ma première conversation');
    expect(conversation?.authorId).toBe(user.id);
    expect(conversation?.messages).toHaveLength(1);
    expect(conversation?.messages[0].content).toBe('Bonjour tout le monde !');
  });

  it('devrait retourner 401 si non authentifié', async () => {
    // Étant donné
    const { getSession } = require('@/lib/auth/auth-helpers');
    getSession.mockResolvedValue(null);

    const request = new NextRequest('http://localhost:3000/api/conversations', {
      method: 'POST',
      body: JSON.stringify({
        title: 'Test',
        content: 'Contenu',
      }),
    });

    // Quand
    const response = await POST(request);
    const data = await response.json();

    // Alors
    expect(response.status).toBe(401);
    expect(data).toHaveProperty('error');
    expect(data.error).toMatch(/authentifi/i);
  });

  it('devrait retourner 400 si contenu vide', async () => {
    // Étant donné
    const user = await createTestUser(context.prisma);

    const { getSession } = require('@/lib/auth/auth-helpers');
    getSession.mockResolvedValue({ user: { id: user.id, email: user.email } });

    const request = new NextRequest('http://localhost:3000/api/conversations', {
      method: 'POST',
      body: JSON.stringify({
        title: 'Titre valide',
        content: '',
      }),
    });

    // Quand
    const response = await POST(request);
    const data = await response.json();

    // Alors
    expect(response.status).toBe(400);
    expect(data).toHaveProperty('error');
    expect(data.error).toMatch(/contenu/i);
  });
});
