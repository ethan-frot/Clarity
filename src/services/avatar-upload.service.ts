export interface AvatarUploadService {
  upload(file: Buffer, fileName: string): Promise<string>;
}
