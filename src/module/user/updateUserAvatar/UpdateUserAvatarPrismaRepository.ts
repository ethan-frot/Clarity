import { prisma } from '@/lib/prisma';
import { PrismaClient } from '@/generated/prisma';
import { UpdateUserAvatarRepository } from './UpdateUserAvatarRepository';

export class UpdateUserAvatarPrismaRepository implements UpdateUserAvatarRepository {
  private prismaClient: PrismaClient;

  constructor(prismaClient?: PrismaClient) {
    this.prismaClient = prismaClient || prisma;
  }

  async findById(
    userId: string
  ): Promise<{ id: string; email: string } | null> {
    const user = await this.prismaClient.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true },
    });

    return user;
  }

  async updateAvatar(userId: string, avatarUrl: string): Promise<void> {
    await this.prismaClient.user.update({
      where: { id: userId },
      data: { avatar: avatarUrl },
    });
  }
}
