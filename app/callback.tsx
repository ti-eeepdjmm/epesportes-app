// app/callback.tsx
import { useEffect } from 'react';
import { router } from 'expo-router';
import { useSignUp } from '@/contexts/SignUpContext';
import api from '@/utils/api';
import { AppLoader } from '@/components/AppLoader';

export default function Callback() {
  const { updateData } = useSignUp();

  useEffect(() => {
    async function handleCallback() {
      // Pega a hash completa da URL
      const hash = window?.location?.hash;

      if (!hash) return;

      const params = new URLSearchParams(hash.replace('#', ''));

      const access_token = params.get('access_token');
      const id_token = params.get('id_token');
      const provider = 'google';

      if (!id_token) {
        console.error('ID token não encontrado no callback');
        return;
      }

      try {
        // Envia para o backend fazer login com Supabase
        const { data } = await api.post(`/auth/login/token`, {
          id_token,
          provider,
        });

        const { user } = data;

        updateData({
          name: user.user_metadata?.full_name,
          email: user.email,
        });

        // Redireciona para a próxima etapa do cadastro
        router.replace('/(auth)/signup-birthday');
      } catch (error) {
        console.error('Erro ao processar callback:', error);
      }
    }

    handleCallback();
  }, []);

  return <AppLoader />; // Ou <ActivityIndicator />
}
