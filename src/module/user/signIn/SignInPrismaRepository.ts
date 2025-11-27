import { prisma } from '@/lib/prisma';
import { SignInRepository } from './SignInRepository';
import { User } from '@/domain/user/User';
import { PrismaClient } from '@/generated/prisma';

export class SignInPrismaRepository implements SignInRepository {
  private prismaClient: PrismaClient;

  constructor(prismaClient?: PrismaClient) {
    this.prismaClient = prismaClient || prisma;
  }

  async findByEmail(email: string): Promise<User | null> {
    const userData = await this.prismaClient.user.findUnique({
      where: { email },
    });

    if (!userData) {
      return null;
    }

    return new User({
      id: userData.id,
      email: userData.email,
      password: userData.password,
      name: userData.name ?? undefined,
    });
  }
}
