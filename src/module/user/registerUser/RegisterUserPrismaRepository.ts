import { prisma } from '@/lib/prisma';
import { RegisterUserRepository } from './RegisterUserRepository';
import { User } from '@/domain/user/User';
import { PrismaClient, Prisma } from '@/generated/prisma';

export class RegisterUserPrismaRepository implements RegisterUserRepository {
  private prismaClient: PrismaClient;

  constructor(prismaClient?: PrismaClient) {
    this.prismaClient = prismaClient || prisma;
  }

  async save(user: User): Promise<string> {
    try {
      const result = await this.prismaClient.user.create({
        data: {
          email: user.email,
          password: user.password,
          name: user.name || null,
        },
      });

      return result.id;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new Error('Cet email est déjà utilisé');
        }
      }

      throw error;
    }
  }

  async emailExists(email: string): Promise<boolean> {
    const existingUser = await this.prismaClient.user.findUnique({
      where: { email },
      select: { id: true },
    });

    return existingUser !== null;
  }
}
