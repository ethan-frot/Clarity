import { put } from '@vercel/blob';
import { AvatarUploadService } from './avatar-upload.service';

export class VercelBlobAvatarUploadService implements AvatarUploadService {
  async upload(file: Buffer, fileName: string): Promise<string> {
    const blob = await put(`avatars/${fileName}`, file, {
      access: 'public',
    });

    return blob.url;
  }
}
