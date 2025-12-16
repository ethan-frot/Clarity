'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, ImageIcon } from 'lucide-react';
import Cropper from 'react-easy-crop';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { GradientButton } from '@/components/app/common/GradientButton';
import { RedButton } from '@/components/app/common/RedButton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { CustomModal } from '@/components/app/common/CustomModal';
import { AVATAR_VALIDATION } from '../types/updateUserAvatar.types';

interface AvatarUploadProps {
  currentAvatar?: string | null;
  userName?: string | null;
  onUpload: (file: File) => Promise<void>;
  isLoading?: boolean;
}

interface CropData {
  x: number;
  y: number;
}

const createImage = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', (error) => reject(error));
    image.src = url;
  });

const getCroppedImg = async (
  imageSrc: string,
  pixelCrop: { x: number; y: number; width: number; height: number }
): Promise<Blob> => {
  const image = await createImage(imageSrc);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('Canvas context non disponible');
  }

  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height
  );

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) {
        resolve(blob);
      } else {
        reject(new Error('Erreur lors de la création du crop'));
      }
    }, 'image/jpeg');
  });
};

export function AvatarUpload({
  currentAvatar,
  userName,
  onUpload,
  isLoading = false,
}: AvatarUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [showCropModal, setShowCropModal] = useState(false);
  const [crop, setCrop] = useState<CropData>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<{
    x: number;
    y: number;
    width: number;
    height: number;
  } | null>(null);

  const { getRootProps, getInputProps, isDragActive, fileRejections } =
    useDropzone({
      accept: {
        'image/jpeg': AVATAR_VALIDATION.acceptedExtensions.filter((ext) =>
          ext.includes('jpg')
        ),
        'image/png': ['.png'],
        'image/webp': ['.webp'],
      },
      maxSize: AVATAR_VALIDATION.maxSize,
      maxFiles: 1,
      disabled: isLoading,
      onDrop: (acceptedFiles) => {
        const file = acceptedFiles[0];
        if (file) {
          const preview = URL.createObjectURL(file);
          setPreviewUrl(preview);
          setSelectedFile(file);
          setShowCropModal(true);
        }
      },
    });

  const onCropComplete = useCallback(
    (
      _croppedArea: { x: number; y: number; width: number; height: number },
      croppedAreaPixels: { x: number; y: number; width: number; height: number }
    ) => {
      setCroppedAreaPixels(croppedAreaPixels);
    },
    []
  );

  const handleCropConfirm = async () => {
    if (!previewUrl || !croppedAreaPixels || !selectedFile) return;

    try {
      const croppedBlob = await getCroppedImg(previewUrl, croppedAreaPixels);
      const croppedFile = new File([croppedBlob], selectedFile.name, {
        type: 'image/jpeg',
      });

      setSelectedFile(croppedFile);
      URL.revokeObjectURL(previewUrl);
      const newPreview = URL.createObjectURL(croppedFile);
      setPreviewUrl(newPreview);
      setShowCropModal(false);
    } catch (error) {
      console.error('Erreur crop:', error);
    }
  };

  const handleCropCancel = () => {
    setShowCropModal(false);
    setSelectedFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
  };

  const handleUpload = async () => {
    if (selectedFile) {
      await onUpload(selectedFile);
      setSelectedFile(null);
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
        setPreviewUrl(null);
      }
    }
  };

  const handleCancel = () => {
    setSelectedFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
  };

  const displayAvatar = previewUrl || currentAvatar;
  const initials = userName?.[0]?.toUpperCase() || '?';

  return (
    <>
      <Card className="bg-white/5 backdrop-blur-sm border-white/10">
        <CardHeader>
          <div className="space-y-3">
            <h3 className="text-xl font-semibold text-white flex items-center gap-3">
              <ImageIcon className="h-5 w-5 text-blue-400" />
              Photo de profil
            </h3>
            <p className="text-white/70 text-sm">
              Modifiez votre avatar (JPEG, PNG, WebP - Max 2 MB)
            </p>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-6">
            <Avatar className="h-32 w-32 shrink-0">
              <AvatarImage src={displayAvatar || undefined} />
              <AvatarFallback className="text-4xl bg-linear-to-br from-blue-500 to-purple-600">
                {initials}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1">
              <div
                {...getRootProps()}
                className={`
                  border-2 border-dashed rounded-lg p-6 text-center cursor-pointer
                  transition-all duration-300
                  ${
                    isDragActive
                      ? 'border-blue-500 bg-blue-500/10'
                      : 'border-white/20 bg-white/5'
                  }
                  ${isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:border-blue-400 hover:bg-white/10'}
                `}
              >
                <input {...getInputProps()} />
                <Upload className="w-10 h-10 mx-auto mb-3 text-gray-400" />
                <p className="text-white text-sm mb-1">
                  {isDragActive
                    ? "Déposez l'image ici..."
                    : 'Glissez une image ou cliquez'}
                </p>
                <p className="text-xs text-gray-400">Max 2 MB</p>
              </div>
            </div>
          </div>

          {fileRejections.length > 0 && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
              <p className="text-red-400 text-sm">
                {fileRejections[0].errors[0].code === 'file-too-large'
                  ? "L'image ne peut pas dépasser 2 MB"
                  : 'Format non supporté (JPEG, PNG, WebP uniquement)'}
              </p>
            </div>
          )}

          {selectedFile && !showCropModal && (
            <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
              <p className="text-green-400 text-sm">
                Image sélectionnée : {selectedFile.name} (
                {(selectedFile.size / 1024).toFixed(1)} KB)
              </p>
            </div>
          )}

          {selectedFile && (
            <div className="flex gap-4">
              <RedButton onClick={handleCancel} disabled={isLoading}>
                Annuler
              </RedButton>
              <GradientButton
                onClick={handleUpload}
                disabled={isLoading}
                isLoading={isLoading}
                loadingText="Upload en cours..."
                className="flex-1"
              >
                Enregistrer
              </GradientButton>
            </div>
          )}
        </CardContent>
      </Card>

      <CustomModal isOpen={showCropModal} onClose={handleCropCancel}>
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-white mb-4">
            Recadrer l&apos;image
          </h2>
          <div className="relative h-96 bg-black/50 rounded-lg overflow-hidden">
            {previewUrl && (
              <Cropper
                image={previewUrl}
                crop={crop}
                zoom={zoom}
                aspect={1}
                cropShape="round"
                showGrid={false}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onCropComplete}
              />
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm text-white/70">Zoom</label>
            <input
              type="range"
              min={1}
              max={3}
              step={0.1}
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              className="w-full"
            />
          </div>

          <div className="flex gap-4">
            <RedButton onClick={handleCropCancel}>Annuler</RedButton>
            <GradientButton onClick={handleCropConfirm} className="flex-1">
              Valider
            </GradientButton>
          </div>
        </div>
      </CustomModal>
    </>
  );
}
