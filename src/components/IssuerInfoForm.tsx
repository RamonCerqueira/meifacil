"use client";

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Save, User, MapPin, FileText } from 'lucide-react';

const issuerInfoSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  document: z.string().min(11, 'CPF/CNPJ é obrigatório'),
  address: z.string().min(1, 'Endereço é obrigatório'),
});

type IssuerInfoData = z.infer<typeof issuerInfoSchema>;

export function IssuerInfoForm() {
  const { data: session, update } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<IssuerInfoData>({
    resolver: zodResolver(issuerInfoSchema),
  });

  // Carregar dados existentes quando o componente montar
  useEffect(() => {
    if (session?.user) {
      const user = session.user as any;
      setValue('name', user.issuerName || user.name || '');
      setValue('document', user.issuerDocument || user.cpfCnpj || '');
      setValue('address', user.issuerAddress || '');
    }
  }, [session, setValue]);

  const onSubmit = async (data: IssuerInfoData) => {
    setIsLoading(true);
    setSaveStatus('idle');

    try {
      const response = await fetch('/api/user/issuer-info', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Erro ao salvar informações');
      }

      setSaveStatus('success');
      
      // Atualizar sessão
      await update({
        ...session,
        user: {
          ...session?.user,
          issuerName: data.name,
          issuerDocument: data.document,
          issuerAddress: data.address,
        },
      });

      setTimeout(() => setSaveStatus('idle'), 3000);

    } catch (error) {
      setSaveStatus('error');
      console.error('Erro ao salvar informações do emissor:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Informações do Emissor</h3>
        {saveStatus === 'success' && (
          <div className="flex items-center text-green-600 text-sm">
            <Save className="w-4 h-4 mr-1" />
            Informações salvas com sucesso
          </div>
        )}
      </div>

      <p className="text-sm text-gray-600">
        Essas informações aparecerão nos recibos como dados do emissor
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
            <User className="w-4 h-4 mr-2" />
            Nome do Emissor
          </label>
          <input
            {...register('name')}
            type="text"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Nome completo ou razão social"
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
          )}
        </div>

        <div>
          <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
            <FileText className="w-4 h-4 mr-2" />
            CPF/CNPJ do Emissor
          </label>
          <input
            {...register('document')}
            type="text"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="000.000.000-00 ou 00.000.000/0001-00"
          />
          {errors.document && (
            <p className="mt-1 text-sm text-red-600">{errors.document.message}</p>
          )}
        </div>

        <div>
          <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
            <MapPin className="w-4 h-4 mr-2" />
            Endereço do Emissor
          </label>
          <textarea
            {...register('address')}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Endereço completo com CEP"
          />
          {errors.address && (
            <p className="mt-1 text-sm text-red-600">{errors.address.message}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
          ) : (
            <Save className="w-4 h-4 mr-2" />
          )}
          {isLoading ? 'Salvando...' : 'Salvar Informações'}
        </button>

        {saveStatus === 'error' && (
          <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
            Erro ao salvar informações. Tente novamente.
          </div>
        )}
      </form>
    </div>
  );
}

