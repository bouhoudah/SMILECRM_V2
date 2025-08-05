import React, { useState, useCallback } from 'react';
import { Upload } from 'lucide-react';

interface ImageUploadProps {
  currentImage?: string;
  onImageChange: (imageUrl: string) => void;
  label?: string;
  className?: string;
  id?: string;
}

const ImageUpload: React.FC<ImageUploadProps> = ({ 
  currentImage, 
  onImageChange, 
  label = "Photo",
  className = "",
  id = "image-upload"
}) => {
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | undefined>(currentImage);

  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          resolve(reader.result);
        } else {
          reject(new Error('Conversion échouée'));
        }
      };
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(file);
    });
  };

  const validateAndProcessImage = useCallback(async (file: File) => {
    setError(null);

    // Vérifier le type de fichier
    const acceptedTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/svg+xml',
      'image/webp',
      'image/bmp'
    ];

    if (!acceptedTypes.includes(file.type)) {
      setError('Format d\'image non supporté. Utilisez JPG, PNG, GIF, SVG, WebP ou BMP.');
      return;
    }

    // Vérifier la taille (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      setError('L\'image est trop volumineuse. Taille maximum: 5MB');
      return;
    }

    try {
      const base64 = await convertToBase64(file);
      setPreview(base64);
      onImageChange(base64);
    } catch (err) {
      console.error('Erreur lors de la conversion de l\'image:', err);
      setError('Erreur lors du traitement de l\'image');
    }
  }, [onImageChange]);

  const handleImageChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      validateAndProcessImage(file);
    }
  }, [validateAndProcessImage]);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      validateAndProcessImage(file);
    }
  }, [validateAndProcessImage]);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  // Reset preview when currentImage changes
  React.useEffect(() => {
    setPreview(currentImage);
  }, [currentImage]);

  return (
    <div className={className}>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>
      <div 
        className="flex items-center space-x-4"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        <div className="flex-shrink-0">
          {preview ? (
            <img
              src={preview}
              alt="Preview"
              className="h-16 w-16 rounded-lg object-contain border-2 border-indigo-200 hover:border-indigo-400 transition-colors"
            />
          ) : (
            <div className="h-16 w-16 rounded-lg bg-gray-100 flex items-center justify-center border-2 border-dashed border-gray-300 hover:border-indigo-400 transition-colors">
              <Upload className="h-6 w-6 text-gray-400" />
            </div>
          )}
        </div>
        <div className="flex-1">
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="hidden"
            id={id}
          />
          <label
            htmlFor={id}
            className="cursor-pointer inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            {preview ? `Changer ${label.toLowerCase()}` : `Ajouter ${label.toLowerCase()}`}
          </label>
          <p className="mt-1 text-xs text-gray-500">
            Formats acceptés: JPG, PNG, GIF, SVG, WebP, BMP (max 5MB)
          </p>
          {error && (
            <p className="mt-1 text-xs text-red-500">
              {error}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImageUpload;