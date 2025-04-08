import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import * as Linking from 'expo-linking';
import api from '@/utils/api';
import { useSignUp } from '@/contexts/SignUpContext';
import * as WebBrowser from 'expo-web-browser';

WebBrowser.maybeCompleteAuthSession(); // garante fechamento do navegador no retorno

export default function CallbackScreen() {
  const { updateData, reset } = useSignUp();
  const router = useRouter();

  const handleAuthFromUrl = async (url: string | null) => {
    console.log(`URL recebida: ${url}`);

    if (!url || !url.includes('#')) {
      console.error('URL inválida ou sem fragmento');
      return;
    }

    const fragment = url.split('#')[1];
    const accessToken = new URLSearchParams(fragment).get('access_token');

    if (!accessToken) {
      console.error('access_token não encontrado na URL');
      return;
    }

    try {
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
      reset();
      updateData({
        name: user.user_metadata.full_name,
        email: user.email,
      });
      console.log('Usuário autenticado:', user);
      // Redireciona para a tela de cadastro de aniversário

      // router.replace('/(auth)/signup-birthday');
    } catch (err) {
      console.error('Erro ao autenticar com backend:', err);
    }
  };

  useEffect(() => {
    // Caso o app tenha sido iniciado com o link
    Linking.getInitialURL().then(handleAuthFromUrl);

    // Caso o app já estivesse aberto e receba o deep link
    const sub = Linking.addEventListener('url', (event) => {
      handleAuthFromUrl(event.url);
    });

    return () => sub.remove();
  }, []);

  return null;
}
