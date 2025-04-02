import { Button } from '@/components/forms/Button';
import { useSignUp } from '@/contexts/SignUpContext';
import api from '@/utils/api';
import { router } from 'expo-router';
import GoogleIcon from './icons/GoogleIcon';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import { useEffect, useState } from 'react';

export function GoogleOAuthButton() {
  const { updateData, reset } = useSignUp();
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const handleDeepLink = async (event: { url: string }) => {
      const url = event.url;
      const fragment = url.split('#')[1]; // após #
      const params = new URLSearchParams(fragment);
      const accessToken = params.get('access_token');

      if (!accessToken) {
        console.error('Token de acesso não encontrado na URL de callback');
        return;
      }

      try {
        setIsProcessing(true);
        const res = await api.post(
          '/auth/me',
          {},
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          },
        );

        const { user } = res.data;
        console.log(user);
        reset();
        updateData({
          name: user.user_metadata.full_name,
          email: user.email,
        });

        router.push('/(auth)/signup-birthday');
      } catch (err) {
        console.error('Erro ao autenticar com backend:', err);
      } finally {
        setIsProcessing(false);
      }
    };

    const subscription = Linking.addEventListener('url', handleDeepLink);
    return () => {
      subscription.remove();
    };
  }, []);

  const handleLogin = async () => {
    try {
      setIsProcessing(true);
      const { data } = await api.get('/auth/login/google'); // endpoint do backend
      const loginUrl = data.url;

      if (!loginUrl) {
        throw new Error('URL de login não encontrada');
      }

      await WebBrowser.openBrowserAsync(loginUrl);
    } catch (err) {
      console.error('Erro ao iniciar login com Google:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Button
      title="Cadastrar com Google"
      onPress={handleLogin}
      icon={<GoogleIcon />}
      disabled={isProcessing}
    />
  );
}
