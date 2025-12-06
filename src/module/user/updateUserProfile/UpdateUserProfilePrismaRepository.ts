import { prisma } from '@/lib/prisma';
import { PrismaClient } from '@/generated/prisma';
import { UpdateUserProfileRepository } from './UpdateUserProfileRepository';
import { User } from '@/domain/user/User';

export class UpdateUserProfilePrismaRepository implements UpdateUserProfileRepository {
  private prismaClient: PrismaClient;

  constructor(prismaClient?: PrismaClient) {
    this.prismaClient = prismaClient || prisma;
  }

  async findById(userId: string): Promise<User | null> {
    const user = await this.prismaClient.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return null;
    }

    return new User({
      id: user.id,
      email: user.email,
      name: user.name ?? undefined,
      bio: user.bio ?? undefined,
      avatar: user.avatar ?? undefined,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt ?? undefined,
    });
  }

  async update(
    userId: string,
    data: { name?: string | null; bio?: string | null }
  ): Promise<void> {
    const updateData: { name?: string | null; bio?: string | null } = {};

    if (data.name !== undefined) {
      updateData.name = data.name;
    }

    if (data.bio !== undefined) {
      updateData.bio = data.bio;
    }

    await this.prismaClient.user.update({
      where: { id: userId },
      data: updateData,
    });
  }
}
