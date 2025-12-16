import {
  setupE2EDatabase,
  cleanDatabase,
  teardownE2EDatabase,
  E2ETestContext,
} from '@/../test/e2e-setup';
import { createTestUser } from '@/../test/auth-helpers';
import { GET } from '@/app/api/users/profile/route';
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

describe('GET /api/users/profile (E2E - US-15a)', () => {
  it('devrait récupérer le profil utilisateur avec succès (200)', async () => {
    const user = await createTestUser(context.prisma, {
      name: 'John Doe',
      bio: 'Software Developer',
    });

    const { getSession } = require('@/lib/auth/auth-helpers');
    getSession.mockResolvedValue({
      user: { id: user.id, email: user.email },
    });

    const request = new NextRequest('http://localhost:3000/api/users/profile', {
      method: 'GET',
    });

    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual({
      id: user.id,
      email: user.email,
      name: 'John Doe',
      bio: 'Software Developer',
      avatar: null,
    });
  });

  it('devrait récupérer le profil avec name et bio null (200)', async () => {
    const user = await createTestUser(context.prisma, {
      name: null,
      bio: null,
    });

    const { getSession } = require('@/lib/auth/auth-helpers');
    getSession.mockResolvedValue({
      user: { id: user.id, email: user.email },
    });

    const request = new NextRequest('http://localhost:3000/api/users/profile', {
      method: 'GET',
    });

    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.name).toBeNull();
    expect(data.bio).toBeNull();
  });

  it('devrait retourner 401 si non authentifié', async () => {
    const { getSession } = require('@/lib/auth/auth-helpers');
    getSession.mockResolvedValue(null);

    const request = new NextRequest('http://localhost:3000/api/users/profile', {
      method: 'GET',
    });

    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toMatch(/authentifi/i);
  });
});
