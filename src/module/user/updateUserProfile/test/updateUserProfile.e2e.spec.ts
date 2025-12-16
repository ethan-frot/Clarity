jest.mock('@/lib/auth/auth-helpers');

import {
  setupE2EDatabase,
  cleanDatabase,
  teardownE2EDatabase,
  E2ETestContext,
} from '@/../test/e2e-setup';
import { createTestUser } from '@/../test/auth-helpers';
import { PATCH } from '@/app/api/users/profile/route';
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

describe('PATCH /api/users/profile (E2E - US-15a)', () => {
  it('devrait modifier le nom et la bio avec succès (200)', async () => {
    // Étant donné
    const user = await createTestUser(context.prisma, {
      name: 'Alice',
    });

    await context.prisma.user.update({
      where: { id: user.id },
      data: { bio: 'Dev' },
    });

    const { getSession } = require('@/lib/auth/auth-helpers');
    getSession.mockResolvedValue({ user: { id: user.id, email: user.email } });

    const request = new NextRequest('http://localhost:3000/api/users/profile', {
      method: 'PATCH',
      body: JSON.stringify({
        name: 'Alice Dupont',
        bio: 'Développeuse passionnée par Next.js',
      }),
    });

    // Quand
    const response = await PATCH(request);
    const data = await response.json();

    // Alors
    expect(response.status).toBe(200);
    expect(data).toHaveProperty('message');

    const updatedUser = await context.prisma.user.findUnique({
      where: { id: user.id },
    });

    expect(updatedUser?.name).toBe('Alice Dupont');
    expect(updatedUser?.bio).toBe('Développeuse passionnée par Next.js');
  });

  it('devrait supprimer le nom (null) avec succès (200)', async () => {
    // Étant donné
    const user = await createTestUser(context.prisma, {
      name: 'Bob',
    });

    await context.prisma.user.update({
      where: { id: user.id },
      data: { bio: 'Designer' },
    });

    const { getSession } = require('@/lib/auth/auth-helpers');
    getSession.mockResolvedValue({ user: { id: user.id, email: user.email } });

    const request = new NextRequest('http://localhost:3000/api/users/profile', {
      method: 'PATCH',
      body: JSON.stringify({
        name: null,
      }),
    });

    // Quand
    const response = await PATCH(request);

    // Alors
    expect(response.status).toBe(200);

    const updatedUser = await context.prisma.user.findUnique({
      where: { id: user.id },
    });

    expect(updatedUser?.name).toBeNull();
    expect(updatedUser?.bio).toBe('Designer'); // Inchangée
  });

  it('devrait retourner 400 si bio trop longue', async () => {
    // Étant donné
    const user = await createTestUser(context.prisma);

    const { getSession } = require('@/lib/auth/auth-helpers');
    getSession.mockResolvedValue({ user: { id: user.id, email: user.email } });

    const request = new NextRequest('http://localhost:3000/api/users/profile', {
      method: 'PATCH',
      body: JSON.stringify({
        bio: 'a'.repeat(501), // > 500 caractères
      }),
    });

    // Quand
    const response = await PATCH(request);
    const data = await response.json();

    // Alors
    expect(response.status).toBe(400);
    expect(data).toHaveProperty('error');
    expect(data.error).toMatch(/bio/i);
  });

  it('devrait retourner 400 si nom trop long', async () => {
    // Étant donné
    const user = await createTestUser(context.prisma);

    const { getSession } = require('@/lib/auth/auth-helpers');
    getSession.mockResolvedValue({ user: { id: user.id, email: user.email } });

    const request = new NextRequest('http://localhost:3000/api/users/profile', {
      method: 'PATCH',
      body: JSON.stringify({
        name: 'a'.repeat(101), // > 100 caractères
      }),
    });

    // Quand
    const response = await PATCH(request);
    const data = await response.json();

    // Alors
    expect(response.status).toBe(400);
    expect(data).toHaveProperty('error');
    expect(data.error).toMatch(/nom/i);
  });

  it('devrait retourner 401 si non authentifié', async () => {
    // Étant donné
    const { getSession } = require('@/lib/auth/auth-helpers');
    getSession.mockResolvedValue(null);

    const request = new NextRequest('http://localhost:3000/api/users/profile', {
      method: 'PATCH',
      body: JSON.stringify({
        name: 'Test',
      }),
    });

    // Quand
    const response = await PATCH(request);
    const data = await response.json();

    // Alors
    expect(response.status).toBe(401);
    expect(data).toHaveProperty('error');
    expect(data.error).toMatch(/authentifi/i);
  });
});
