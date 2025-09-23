"use client";

import { useState, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { Upload, X, Check } from 'lucide-react';
import Image from 'next/image';

interface LogoUploadProps {
  onLogoUpdate?: (logoUrl: string) => void;
}

export function LogoUpload({ onLogoUpdate }: LogoUploadProps) {
  const { data: session, update } = useSession();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validações no frontend
    if (!file.type.startsWith('image/')) {
      setErrorMessage('Apenas imagens são permitidas');
      setUploadStatus('error');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage('Arquivo muito grande. Máximo 5MB');
      setUploadStatus('error');
      return;
    }

    setIsUploading(true);
    setUploadStatus('idle');
    setErrorMessage('');

    try {
      const formData = new FormData();
      formData.append('logo', file);

      const response = await fetch('/api/upload-logo', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Erro no upload');
      }

      setUploadStatus('success');
      
      // Atualizar sessão com novo logo
      await update({
        ...session,
        user: {
          ...session?.user,
          logoUrl: result.logoUrl,
        },
      });

      // Callback para componente pai
      if (onLogoUpdate) {
        onLogoUpdate(result.logoUrl);
      }

    } catch (error) {
      setUploadStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'Erro no upload');
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveLogo = async () => {
    // Implementar remoção do logo se necessário
    setUploadStatus('idle');
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Logo da Empresa</h3>
        {uploadStatus === 'success' && (
          <div className="flex items-center text-green-600 text-sm">
            <Check className="w-4 h-4 mr-1" />
            Logo atualizado com sucesso
          </div>
        )}
      </div>

      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
        {session?.user?.logoUrl ? (
          <div className="flex items-center justify-center space-x-4">
            <div className="relative w-24 h-24">
              <Image
                src={session.user.logoUrl}
                alt="Logo da empresa"
                fill
                className="object-contain rounded"
              />
            </div>
            <div className="flex flex-col space-y-2">
              <button
                onClick={triggerFileInput}
                disabled={isUploading}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
              >
                {isUploading ? 'Enviando...' : 'Alterar Logo'}
              </button>
              <button
                onClick={handleRemoveLogo}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50"
              >
                Remover Logo
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center">
            <Upload className="mx-auto h-12 w-12 text-gray-400" />
            <div className="mt-4">
              <button
                onClick={triggerFileInput}
                disabled={isUploading}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
              >
                {isUploading ? 'Enviando...' : 'Enviar Logo'}
              </button>
            </div>
            <p className="mt-2 text-sm text-gray-500">
              PNG, JPG até 5MB
            </p>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      {uploadStatus === 'error' && (
        <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
          {errorMessage}
        </div>
      )}
    </div>
  );
}

