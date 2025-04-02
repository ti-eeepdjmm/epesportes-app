import { Button } from '@/components/forms/Button';
import { useSignUp } from '@/contexts/SignUpContext';
import api from '@/utils/api';
import { router } from 'expo-router';
import GoogleIcon from './icons/GoogleIcon';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import { useEffect } from 'react';

WebBrowser.maybeCompleteAuthSession(); // Finaliza a sessão do navegador

export function GoogleOAuthButton() {
  const { updateData } = useSignUp();

  const [request, response, promptAsync] = Google.useAuthRequest({
    clientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
    iosClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
    androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
  });

  useEffect(() => {
    const handleGoogleAuth = async () => {
      if (response?.type === 'success') {
        const id_token = response.authentication?.idToken;

        if (!id_token) {
          console.error('ID Token não encontrado');
          return;
        }

        try {
          // Envia o ID Token para o backend
          const res = await api.post('/auth/login/token', {
            id_token,
            provider: 'google',
          });

          const { user } = res.data;

          // Atualiza o contexto de cadastro
          updateData({
            name: user.user_metadata.full_name,
            email: user.email,
          });

          // Redireciona para próxima etapa
          router.push('/(auth)/signup-birthday');
        } catch (err) {
          console.error('Erro ao autenticar com backend:', err);
        }
      }
    };

    handleGoogleAuth();
  }, [response]);

  return (
    <Button
      title="Cadastrar com Google"
      onPress={() => promptAsync()}
      icon={<GoogleIcon />}
    />
  );
}
