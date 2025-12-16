import { prisma } from '@/lib/prisma';
import { PrismaClient } from '@/generated/prisma';
import { GetMyProfileRepository } from './GetMyProfileRepository';
import { UserProfileDTO } from './types/getMyProfile.types';

export class GetMyProfilePrismaRepository implements GetMyProfileRepository {
  private prismaClient: PrismaClient;

  constructor(prismaClient?: PrismaClient) {
    this.prismaClient = prismaClient || prisma;
  }

  async findByIdForProfile(userId: string): Promise<UserProfileDTO> {
    const user = await this.prismaClient.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        bio: true,
        avatar: true,
      },
    });

    if (!user) {
      throw new Error('Utilisateur non trouvé');
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      bio: user.bio,
      avatar: user.avatar,
    };
  }
}
