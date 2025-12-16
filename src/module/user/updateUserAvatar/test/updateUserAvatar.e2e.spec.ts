jest.mock('@/lib/auth/auth-helpers');
jest.mock('@/services/vercel-blob-avatar-upload.service');

import {
  setupE2EDatabase,
  cleanDatabase,
  teardownE2EDatabase,
  E2ETestContext,
} from '@/../test/e2e-setup';
import { createTestUser } from '@/../test/auth-helpers';
import { PATCH } from '@/app/api/users/profile/avatar/route';
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

describe('PATCH /api/users/profile/avatar (E2E - US-15b)', () => {
  it('devrait uploader un avatar JPEG avec succès (Scénario 1)', async () => {
    const user = await createTestUser(context.prisma);

    const { getSession } = require('@/lib/auth/auth-helpers');
    getSession.mockResolvedValue({ user: { id: user.id, email: user.email } });

    const {
      VercelBlobAvatarUploadService,
    } = require('@/services/vercel-blob-avatar-upload.service');
    VercelBlobAvatarUploadService.prototype.upload = jest
      .fn()
      .mockResolvedValue(
        'https://cdn.vercel-storage.com/avatars/test-avatar.jpg'
      );

    const formData = new FormData();
    const fakeFile = new Blob(['fake-jpeg-data'], { type: 'image/jpeg' });
    formData.append('file', fakeFile, 'avatar.jpg');

    const request = new NextRequest(
      'http://localhost:3000/api/users/profile/avatar',
      {
        method: 'PATCH',
        body: formData,
      }
    );

    const response = await PATCH(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toHaveProperty('message');

    const updatedUser = await context.prisma.user.findUnique({
      where: { id: user.id },
    });

    expect(updatedUser?.avatar).toBe(
      'https://cdn.vercel-storage.com/avatars/test-avatar.jpg'
    );
  });

  it('devrait uploader un avatar PNG avec succès (Scénario 2)', async () => {
    const user = await createTestUser(context.prisma);

    const { getSession } = require('@/lib/auth/auth-helpers');
    getSession.mockResolvedValue({ user: { id: user.id, email: user.email } });

    const {
      VercelBlobAvatarUploadService,
    } = require('@/services/vercel-blob-avatar-upload.service');
    VercelBlobAvatarUploadService.prototype.upload = jest
      .fn()
      .mockResolvedValue(
        'https://cdn.vercel-storage.com/avatars/test-avatar.png'
      );

    const formData = new FormData();
    const fakeFile = new Blob(['fake-png-data'], { type: 'image/png' });
    formData.append('file', fakeFile, 'avatar.png');

    const request = new NextRequest(
      'http://localhost:3000/api/users/profile/avatar',
      {
        method: 'PATCH',
        body: formData,
      }
    );

    const response = await PATCH(request);

    expect(response.status).toBe(200);

    const updatedUser = await context.prisma.user.findUnique({
      where: { id: user.id },
    });

    expect(updatedUser?.avatar).toBe(
      'https://cdn.vercel-storage.com/avatars/test-avatar.png'
    );
  });

  it('devrait retourner 401 si non authentifié (Scénario 6)', async () => {
    const { getSession } = require('@/lib/auth/auth-helpers');
    getSession.mockResolvedValue(null);

    const formData = new FormData();
    const fakeFile = new Blob(['fake-data'], { type: 'image/jpeg' });
    formData.append('file', fakeFile, 'avatar.jpg');

    const request = new NextRequest(
      'http://localhost:3000/api/users/profile/avatar',
      {
        method: 'PATCH',
        body: formData,
      }
    );

    const response = await PATCH(request);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toMatch(/authentifi/i);
  });

  it('devrait retourner 400 si fichier trop volumineux (Scénario 4)', async () => {
    const user = await createTestUser(context.prisma);

    const { getSession } = require('@/lib/auth/auth-helpers');
    getSession.mockResolvedValue({ user: { id: user.id, email: user.email } });

    const formData = new FormData();
    const largeFile = new Blob(
      [new Array(3 * 1024 * 1024).fill('x').join('')],
      {
        type: 'image/jpeg',
      }
    );
    formData.append('file', largeFile, 'avatar.jpg');

    const request = new NextRequest(
      'http://localhost:3000/api/users/profile/avatar',
      {
        method: 'PATCH',
        body: formData,
      }
    );

    const response = await PATCH(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toMatch(/2 MB/i);
  });

  it('devrait retourner 400 si format non supporté (Scénario 5)', async () => {
    const user = await createTestUser(context.prisma);

    const { getSession } = require('@/lib/auth/auth-helpers');
    getSession.mockResolvedValue({ user: { id: user.id, email: user.email } });

    const formData = new FormData();
    const gifFile = new Blob(['fake-gif-data'], { type: 'image/gif' });
    formData.append('file', gifFile, 'avatar.gif');

    const request = new NextRequest(
      'http://localhost:3000/api/users/profile/avatar',
      {
        method: 'PATCH',
        body: formData,
      }
    );

    const response = await PATCH(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toMatch(/Format non supporté/i);
  });
});
