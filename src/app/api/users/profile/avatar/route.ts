import { NextRequest } from 'next/server';
import { getSession } from '@/lib/auth/auth-helpers';
import { UpdateUserAvatarUseCase } from '@/module/user/updateUserAvatar/UpdateUserAvatarUseCase';
import { UpdateUserAvatarPrismaRepository } from '@/module/user/updateUserAvatar/UpdateUserAvatarPrismaRepository';
import { VercelBlobAvatarUploadService } from '@/services/vercel-blob-avatar-upload.service';

export async function PATCH(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return Response.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return Response.json({ error: 'Fichier manquant' }, { status: 400 });
    }

    const fileBuffer = Buffer.from(await file.arrayBuffer());

    const repository = new UpdateUserAvatarPrismaRepository();
    const uploadService = new VercelBlobAvatarUploadService();
    const useCase = new UpdateUserAvatarUseCase(repository, uploadService);

    await useCase.execute({
      userId: session.user.id,
      file: fileBuffer,
      fileName: file.name,
      fileType: file.type,
      fileSize: file.size,
    });

    return Response.json(
      { message: 'Avatar mis à jour avec succès' },
      { status: 200 }
    );
  } catch (error) {
    console.error("Erreur lors de la mise à jour de l'avatar:", error);

    if (error instanceof Error) {
      return Response.json({ error: error.message }, { status: 400 });
    }

    return Response.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
