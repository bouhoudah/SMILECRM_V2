import React, { useState, useEffect } from 'react';
import { Upload, X } from 'lucide-react';
import Button from './Button';

interface DocumentUploadProps {
  onUpload: (file: File, metadata?: any) => void;
  type: string;
  label: string;
  accept?: string;
  metadata?: {
    side?: 'front' | 'back';
    [key: string]: any;
  };
}

const DocumentUpload: React.FC<DocumentUploadProps> = ({
  onUpload,
  type,
  label,
  accept = "image/*,.pdf",
  metadata
}) => {
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const validateFile = (file: File): boolean => {
    setError(null);

    const acceptedTypes = accept.split(',').map(type => type.trim());
    const isValidType = acceptedTypes.some(type => {
      if (type === 'image/*') return file.type.startsWith('image/');
      if (type === '.pdf') return file.type === 'application/pdf';
      return file.type === type;
    });

    if (!isValidType) {
      setError('Format de fichier non supporté');
      return false;
    }

    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      setError('Le fichier est trop volumineux (max 5MB)');
      return false;
    }

    return true;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && validateFile(file)) {
      setSelectedFile(file);
      setPreviewUrl(file.type.startsWith('image/') ? URL.createObjectURL(file) : null);
      onUpload(file, metadata);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && validateFile(file)) {
      setSelectedFile(file);
      setPreviewUrl(file.type.startsWith('image/') ? URL.createObjectURL(file) : null);
      onUpload(file, metadata);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleClear = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
  };

  return (
    <div className="relative">
      <input
        type="file"
        id={`file-${type}`}
        className="hidden"
        accept={accept}
        onChange={handleFileChange}
      />

      <div
        className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-indigo-500 transition-colors duration-200"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        {selectedFile ? (
          <div className="flex flex-col items-center space-y-2">
            {previewUrl && (
              <img
                src={previewUrl}
                alt="Prévisualisation"
                className="max-h-40 object-contain rounded shadow"
              />
            )}
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center space-x-3">
                <div className="bg-indigo-100 rounded-full p-2">
                  <Upload className="h-5 w-5 text-indigo-600" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-medium text-gray-900">{selectedFile.name}</p>
                  <p className="text-xs text-gray-500">
                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
              <button
                onClick={handleClear}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
        ) : (
          <div>
            <Upload className="mx-auto h-12 w-12 text-gray-400" />
            <div className="mt-4">
              <Button
                variant="secondary"
                onClick={() => document.getElementById(`file-${type}`)?.click()}
              >
                {label}
              </Button>
            </div>
            <p className="mt-2 text-xs text-gray-500">
              ou glissez-déposez un fichier ici
            </p>
          </div>
        )}
      </div>

      {error && (
        <p className="mt-2 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};

export default DocumentUpload;
