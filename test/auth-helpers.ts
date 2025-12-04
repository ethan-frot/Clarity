import { PrismaClient } from '@/generated/prisma';
import { hashPassword } from '@/lib/auth/password';

export interface TestUser {
  id: string;
  email: string;
  name: string | null;
  sessionToken?: string;
}

export async function createTestUser(
  prisma: PrismaClient,
  overrides?: {
    email?: string;
    name?: string;
    password?: string;
  }
): Promise<TestUser> {
  const email = overrides?.email || `test-${Date.now()}@example.com`;
  const name = overrides?.name || 'Test User';
  const password = overrides?.password || 'SecurePass123!';

  const hashedPassword = await hashPassword(password);

  const user = await prisma.user.create({
    data: {
      email,
      name,
      emailVerified: true, // Considéré comme vérifié pour éviter la vérification email dans les tests
    },
  });

  // Better Auth stocke les credentials dans la table Account avec providerId "credential"
  await prisma.account.create({
    data: {
      userId: user.id,
      accountId: user.id, // Pour credential provider, accountId = userId
      providerId: 'credential',
      password: hashedPassword,
    },
  });

  return {
    id: user.id,
    email: user.email,
    name: user.name,
  };
}

// Authentifie via l'API Better Auth pour les tests E2E HTTP
export async function authenticateUser(
  email: string,
  password: string,
  baseUrl: string = 'http://localhost:3000'
): Promise<string> {
  const response = await fetch(`${baseUrl}/api/auth/sign-in`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    throw new Error(`Authentication failed: ${response.statusText}`);
  }

  const setCookie = response.headers.get('set-cookie');
  if (!setCookie) {
    throw new Error('No session cookie returned');
  }

  return setCookie;
}
